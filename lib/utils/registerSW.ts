'use client'

// Service Worker registration utility
export async function registerServiceWorker() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return false
  }

  try {
    // Register the service worker
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/'
    })

    console.log('[SW] Service Worker registered successfully:', registration.scope)

    // Handle updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New service worker is available, show update notification
            if (window.confirm('A new version is available. Refresh to update?')) {
              window.location.reload()
            }
          }
        })
      }
    })

    // Listen for messages from service worker
    navigator.serviceWorker.addEventListener('message', (event) => {
      console.log('[SW] Message from SW:', event.data)
    })

    return true
  } catch (error) {
    console.error('[SW] Service Worker registration failed:', error)
    return false
  }
}

// Unregister service worker (for debugging)
export async function unregisterServiceWorker() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return false
  }

  try {
    const registrations = await navigator.serviceWorker.getRegistrations()
    for (const registration of registrations) {
      await registration.unregister()
    }
    console.log('[SW] Service Worker unregistered')
    return true
  } catch (error) {
    console.error('[SW] Service Worker unregistration failed:', error)
    return false
  }
}

// Send message to service worker
export function sendMessageToSW(message: any) {
  if (typeof window === 'undefined' || !navigator.serviceWorker.controller) {
    return
  }

  navigator.serviceWorker.controller.postMessage(message)
}

// Check if app is running in standalone mode (PWA)
export function isStandalone(): boolean {
  if (typeof window === 'undefined') return false
  
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true ||
    document.referrer.includes('android-app://')
  )
}
