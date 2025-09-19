// Service Worker for TheGridHub
// Provides offline functionality and intelligent caching

const CACHE_NAME = 'thegridhub-v1'
const STATIC_CACHE_NAME = 'thegridhub-static-v1'
const DYNAMIC_CACHE_NAME = 'thegridhub-dynamic-v1'

// Resources to cache immediately
const STATIC_RESOURCES = [
  '/',
  '/dashboard',
  '/signIn-signup',
  '/offline',
  '/_next/static/css/',
  '/_next/static/chunks/',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/manifest.json'
]

// API endpoints to cache
const API_CACHE_PATTERNS = [
  '/api/user',
  '/api/projects',
  '/api/tasks',
  '/api/teams'
]

// Cache strategies
const CACHE_STRATEGIES = {
  CACHE_FIRST: 'cache-first',
  NETWORK_FIRST: 'network-first',
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate',
  NETWORK_ONLY: 'network-only',
  CACHE_ONLY: 'cache-only'
}

// Install event - cache static resources
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...')
  
  event.waitUntil(
    Promise.all([
      // Cache static resources
      caches.open(STATIC_CACHE_NAME)
        .then(cache => {
          console.log('[SW] Caching static resources')
          return cache.addAll(STATIC_RESOURCES.filter(url => url.length > 0))
        }),
      // Skip waiting to activate immediately
      self.skipWaiting()
    ])
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...')
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== STATIC_CACHE_NAME && 
                cacheName !== DYNAMIC_CACHE_NAME &&
                cacheName !== CACHE_NAME) {
              console.log('[SW] Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      }),
      // Claim all clients
      self.clients.claim()
    ])
  )
})

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return
  }
  
  // Skip chrome-extension requests
  if (url.protocol === 'chrome-extension:') {
    return
  }
  
  event.respondWith(handleFetch(request))
})

async function handleFetch(request) {
  const url = new URL(request.url)
  const pathname = url.pathname
  
  try {
    // API requests - Network First strategy
    if (pathname.startsWith('/api/')) {
      return await networkFirst(request)
    }
    
    // Next.js static assets - Cache First strategy
    if (pathname.startsWith('/_next/static/')) {
      return await cacheFirst(request)
    }
    
    // Images and fonts - Cache First strategy
    if (request.destination === 'image' || request.destination === 'font') {
      return await cacheFirst(request)
    }
    
    // HTML pages - Stale While Revalidate strategy
    if (request.destination === 'document' || 
        pathname === '/' || 
        pathname.startsWith('/dashboard')) {
      return await staleWhileRevalidate(request)
    }
    
    // Default to Network First
    return await networkFirst(request)
    
  } catch (error) {
    console.error('[SW] Fetch failed:', error)
    return await handleOffline(request)
  }
}

// Cache First strategy - check cache first, fallback to network
async function cacheFirst(request) {
  const cache = await caches.open(STATIC_CACHE_NAME)
  const cached = await cache.match(request)
  
  if (cached) {
    return cached
  }
  
  try {
    const response = await fetch(request)
    if (response.ok) {
      cache.put(request, response.clone())
    }
    return response
  } catch (error) {
    return await handleOffline(request)
  }
}

// Network First strategy - try network first, fallback to cache
async function networkFirst(request) {
  const cache = await caches.open(DYNAMIC_CACHE_NAME)
  
  try {
    const response = await fetch(request)
    if (response.ok) {
      // Cache successful responses
      cache.put(request, response.clone())
    }
    return response
  } catch (error) {
    const cached = await cache.match(request)
    if (cached) {
      return cached
    }
    return await handleOffline(request)
  }
}

// Stale While Revalidate strategy - return cached immediately, update in background
async function staleWhileRevalidate(request) {
  const cache = await caches.open(DYNAMIC_CACHE_NAME)
  
  // Get cached version immediately
  const cached = await cache.match(request)
  
  // Fetch fresh version in background
  const fetchPromise = fetch(request).then(response => {
    if (response.ok) {
      cache.put(request, response.clone())
    }
    return response
  }).catch(() => cached)
  
  // Return cached immediately if available, otherwise wait for network
  return cached || await fetchPromise || await handleOffline(request)
}

// Handle offline scenarios
async function handleOffline(request) {
  const url = new URL(request.url)
  
  // For HTML pages, return offline page
  if (request.destination === 'document') {
    const offlineCache = await caches.open(STATIC_CACHE_NAME)
    const offlinePage = await offlineCache.match('/offline')
    if (offlinePage) {
      return offlinePage
    }
  }
  
  // For API requests, return cached data if available
  if (url.pathname.startsWith('/api/')) {
    const cache = await caches.open(DYNAMIC_CACHE_NAME)
    const cached = await cache.match(request)
    if (cached) {
      return cached
    }
  }
  
  // For images, return a placeholder if needed
  if (request.destination === 'image') {
    return new Response(
      '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="#f0f0f0"/><text x="100" y="100" text-anchor="middle" font-family="Arial" font-size="14" fill="#999">Image unavailable</text></svg>',
      { headers: { 'Content-Type': 'image/svg+xml' } }
    )
  }
  
  // Generic error response
  return new Response('Offline', { 
    status: 503, 
    statusText: 'Service Unavailable',
    headers: { 'Content-Type': 'text/plain' }
  })
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag)
  
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync())
  }
})

async function doBackgroundSync() {
  // Sync offline actions when connection is restored
  try {
    const cache = await caches.open(DYNAMIC_CACHE_NAME)
    // Implement sync logic here
    console.log('[SW] Background sync completed')
  } catch (error) {
    console.error('[SW] Background sync failed:', error)
  }
}

// Push notifications
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received')
  
  const options = {
    body: event.data ? event.data.text() : 'New notification',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    tag: 'notification',
    requireInteraction: true,
    actions: [
      {
        action: 'view',
        title: 'View',
        icon: '/icons/view.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/icons/dismiss.png'
      }
    ]
  }
  
  event.waitUntil(
    self.registration.showNotification('TheGridHub', options)
  )
})

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification click:', event.action)
  
  event.notification.close()
  
  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow('/dashboard')
    )
  }
})

// Message handler for client communication
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data)
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME })
  }
  
  if (event.data && event.data.type === 'CACHE_URLS') {
    event.waitUntil(cacheUrls(event.data.urls))
  }
})

// Cache specific URLs on demand
async function cacheUrls(urls) {
  const cache = await caches.open(DYNAMIC_CACHE_NAME)
  return Promise.all(
    urls.map(url => {
      return fetch(url).then(response => {
        if (response.ok) {
          return cache.put(url, response)
        }
      }).catch(console.error)
    })
  )
}

// Periodic cache cleanup
async function cleanupCache() {
  const caches = await caches.keys()
  const now = Date.now()
  const maxAge = 24 * 60 * 60 * 1000 // 24 hours
  
  for (const cacheName of caches) {
    if (cacheName.includes('dynamic')) {
      const cache = await caches.open(cacheName)
      const requests = await cache.keys()
      
      for (const request of requests) {
        const response = await cache.match(request)
        const date = new Date(response.headers.get('date'))
        
        if (now - date.getTime() > maxAge) {
          console.log('[SW] Removing expired cache entry:', request.url)
          await cache.delete(request)
        }
      }
    }
  }
}

// Run cleanup periodically
setInterval(cleanupCache, 60 * 60 * 1000) // Every hour
