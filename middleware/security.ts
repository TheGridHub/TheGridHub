import { NextRequest, NextResponse } from 'next/server'
import { 
  SecurityValidator, 
  ThreatIntelligence, 
  SecurityLogger,
  SECURITY_CONFIG 
} from '@/lib/security/validation'
import { RBACManager, PermissionMiddleware } from '@/lib/security/rbac'
import { AuditTrailManager } from '@/lib/security/audit'

// Security middleware configuration
const SECURITY_MIDDLEWARE_CONFIG = {
  ENABLE_RATE_LIMITING: true,
  ENABLE_CSRF_PROTECTION: true,
  ENABLE_THREAT_DETECTION: true,
  ENABLE_AUDIT_LOGGING: true,
  ENABLE_IP_FILTERING: true,
  BLOCK_SUSPICIOUS_REQUESTS: true,
  LOG_ALL_REQUESTS: false, // Set to true for debugging
} as const

// Request context for security checks
interface SecurityContext {
  requestId: string
  ipAddress: string
  userAgent: string
  userId?: string
  adminRoles?: string[]
  isAdmin: boolean
  riskScore: number
  threats: string[]
  startTime: number
}

// Main security middleware
export async function securityMiddleware(request: NextRequest): Promise<NextResponse | null> {
  const startTime = Date.now()
  const context = await createSecurityContext(request, startTime)

  try {
    // 1. Basic request validation
    const basicValidation = await validateBasicSecurity(request, context)
    if (!basicValidation.passed) {
      return createSecurityResponse(basicValidation.reason, 400, context)
    }

    // 2. Rate limiting check
    if (SECURITY_MIDDLEWARE_CONFIG.ENABLE_RATE_LIMITING) {
      const rateLimitCheck = await checkRateLimit(request, context)
      if (!rateLimitCheck.passed) {
        return createSecurityResponse('Rate limit exceeded', 429, context)
      }
    }

    // 3. CSRF protection for admin routes
    if (SECURITY_MIDDLEWARE_CONFIG.ENABLE_CSRF_PROTECTION && isAdminRoute(request)) {
      const csrfCheck = SecurityValidator.validateCSRF(request)
      if (!csrfCheck) {
        return createSecurityResponse('CSRF token validation failed', 403, context)
      }
    }

    // 4. Threat intelligence analysis
    if (SECURITY_MIDDLEWARE_CONFIG.ENABLE_THREAT_DETECTION) {
      const threatAnalysis = await ThreatIntelligence.analyzeRequest(
        context.ipAddress,
        context.userAgent,
        context.userId
      )
      
      context.riskScore = threatAnalysis.riskScore
      context.threats = threatAnalysis.threats

      if (SECURITY_MIDDLEWARE_CONFIG.BLOCK_SUSPICIOUS_REQUESTS && threatAnalysis.shouldBlock) {
        await logSecurityEvent(context, 'BLOCKED_SUSPICIOUS_REQUEST', threatAnalysis)
        return createSecurityResponse('Request blocked due to security concerns', 403, context)
      }
    }

    // 5. Admin access validation for admin routes
    if (isAdminRoute(request)) {
      const adminCheck = await validateAdminAccess(request, context)
      if (!adminCheck.passed) {
        return createSecurityResponse(adminCheck.reason, 401, context)
      }
    }

    // 6. Log request for audit trail
    if (SECURITY_MIDDLEWARE_CONFIG.ENABLE_AUDIT_LOGGING) {
      await logRequestForAudit(request, context)
    }

    // 7. Add security headers to response
    const response = NextResponse.next()
    addSecurityHeaders(response)

    return response

  } catch (error) {
    console.error('Security middleware error:', error)
    await logSecurityEvent(context, 'MIDDLEWARE_ERROR', { error: error.toString() })
    return createSecurityResponse('Security check failed', 500, context)
  }
}

// Create security context for request
async function createSecurityContext(request: NextRequest, startTime: number): Promise<SecurityContext> {
  const ipAddress = getClientIP(request)
  const userAgent = request.headers.get('user-agent') || 'unknown'
  const requestId = generateRequestId()

  // Extract user information (placeholder - integrate with your auth system)
  const userId = await extractUserId(request)
  const adminRoles = await extractAdminRoles(request, userId)

  return {
    requestId,
    ipAddress,
    userAgent,
    userId,
    adminRoles: adminRoles || undefined,
    isAdmin: adminRoles ? adminRoles.length > 0 : false,
    riskScore: 0,
    threats: [],
    startTime
  }
}

// Basic security validation
async function validateBasicSecurity(request: NextRequest, context: SecurityContext): Promise<{
  passed: boolean
  reason?: string
}> {
  // Check Content-Length to prevent large payload attacks
  const contentLength = request.headers.get('content-length')
  if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) { // 10MB limit
    return { passed: false, reason: 'Request payload too large' }
  }

  // Validate request method
  const allowedMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
  if (!allowedMethods.includes(request.method)) {
    return { passed: false, reason: 'Method not allowed' }
  }

  // Validate origin for admin routes
  if (isAdminRoute(request)) {
    const originCheck = SecurityValidator.validateOrigin(request)
    if (!originCheck) {
      return { passed: false, reason: 'Invalid origin' }
    }
  }

  // Validate user agent
  if (!SecurityValidator.validateUserAgent(context.userAgent)) {
    await logSecurityEvent(context, 'SUSPICIOUS_USER_AGENT', { userAgent: context.userAgent })
    return { passed: false, reason: 'Suspicious user agent detected' }
  }

  return { passed: true }
}

// Rate limiting check
async function checkRateLimit(request: NextRequest, context: SecurityContext): Promise<{
  passed: boolean
  retryAfter?: number
}> {
  // Implement rate limiting based on IP and user
  const limits = {
    general: { requests: 100, window: 15 * 60 * 1000 },
    admin: { requests: 50, window: 15 * 60 * 1000 },
    sensitive: { requests: 10, window: 15 * 60 * 1000 }
  }

  const routeType = isAdminRoute(request) ? 'admin' : 'general'
  const isSensitive = isSensitiveRoute(request)
  
  const limit = isSensitive ? limits.sensitive : limits[routeType]
  
  // In production, check actual rate limit store (Redis, etc.)
  const currentCount = await getCurrentRequestCount(context.ipAddress, context.userId, limit.window)
  
  if (currentCount >= limit.requests) {
    await logSecurityEvent(context, 'RATE_LIMIT_EXCEEDED', { 
      currentCount, 
      limit: limit.requests,
      window: limit.window
    })
    
    return { 
      passed: false, 
      retryAfter: Math.ceil(limit.window / 1000) 
    }
  }

  return { passed: true }
}

// Admin access validation
async function validateAdminAccess(request: NextRequest, context: SecurityContext): Promise<{
  passed: boolean
  reason?: string
}> {
  if (!context.isAdmin) {
    return { passed: false, reason: 'Admin access required' }
  }

  if (!context.adminRoles || context.adminRoles.length === 0) {
    return { passed: false, reason: 'No admin roles assigned' }
  }

  // Check if admin has permission for this route
  const requiredPermission = getRequiredPermission(request)
  if (requiredPermission) {
    const hasPermission = RBACManager.hasPermission(
      context.adminRoles as any[], 
      requiredPermission
    )
    
    if (!hasPermission) {
      await logSecurityEvent(context, 'INSUFFICIENT_PERMISSIONS', {
        required: requiredPermission,
        current: context.adminRoles
      })
      return { passed: false, reason: 'Insufficient permissions' }
    }
  }

  return { passed: true }
}

// Utility functions
function isAdminRoute(request: NextRequest): boolean {
  return request.nextUrl.pathname.startsWith('/api/admin') ||
         request.nextUrl.pathname.startsWith('/admin')
}

function isSensitiveRoute(request: NextRequest): boolean {
  const sensitivePaths = [
    '/api/admin/users',
    '/api/admin/payments',
    '/api/admin/settings',
    '/api/admin/roles'
  ]
  
  return sensitivePaths.some(path => request.nextUrl.pathname.startsWith(path))
}

function getRequiredPermission(request: NextRequest): string | null {
  const path = request.nextUrl.pathname
  const method = request.method

  // Map routes to required permissions
  const routePermissions: Record<string, string> = {
    'GET /api/admin/users': 'user:view',
    'PUT /api/admin/users': 'user:edit',
    'DELETE /api/admin/users': 'user:delete',
    'GET /api/admin/payments': 'payment:view',
    'POST /api/admin/payments/refund': 'payment:refund',
    'GET /api/admin/settings': 'system:config',
    'PUT /api/admin/settings': 'system:config',
    'POST /api/admin/features': 'feature:toggle'
  }

  return routePermissions[`${method} ${path}`] || null
}

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  if (realIP) {
    return realIP
  }

  // Fallback to connection remote address
  return request.ip || '127.0.0.1'
}

function generateRequestId(): string {
  return `req_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`
}

async function extractUserId(request: NextRequest): Promise<string | null> {
  // Extract user ID from your authentication system
  // For Clerk: const { userId } = auth()
  // For JWT: decode and verify token
  
  // Placeholder implementation
  const authHeader = request.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    // Extract user ID from token
    return 'user_123' // Placeholder
  }
  
  return null
}

async function extractAdminRoles(request: NextRequest, userId: string | null): Promise<string[] | null> {
  if (!userId) return null

  // Query database for admin roles
  // const user = await prisma.user.findUnique({
  //   where: { id: userId },
  //   select: { isAdmin: true, adminRoles: true }
  // })
  
  // Placeholder implementation
  return userId === 'user_123' ? ['ADMIN'] : null
}

async function getCurrentRequestCount(ipAddress: string, userId: string | null, window: number): Promise<number> {
  // In production, check Redis or similar store
  // const key = userId ? `rate_limit:user:${userId}` : `rate_limit:ip:${ipAddress}`
  // const count = await redis.get(key)
  // return parseInt(count || '0')
  
  return 0 // Placeholder
}

// Security response creation
function createSecurityResponse(
  reason: string, 
  status: number, 
  context: SecurityContext
): NextResponse {
  const response = new NextResponse(
    JSON.stringify({
      error: reason,
      requestId: context.requestId,
      timestamp: new Date().toISOString()
    }),
    { status }
  )

  // Add security headers
  addSecurityHeaders(response)

  // Log security response
  logSecurityEvent(context, 'SECURITY_RESPONSE', { reason, status })

  return response
}

// Add security headers to response
function addSecurityHeaders(response: NextResponse): void {
  const headers = {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self'",
      "connect-src 'self' https://api.stripe.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'"
    ].join('; ')
  }

  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
}

// Security event logging
async function logSecurityEvent(
  context: SecurityContext, 
  eventType: string, 
  details: any
): Promise<void> {
  await SecurityLogger.logSecurityEvent({
    type: eventType,
    userId: context.userId,
    ipAddress: context.ipAddress,
    userAgent: context.userAgent,
    details: {
      requestId: context.requestId,
      ...details
    },
    severity: getSeverityForEvent(eventType),
    riskScore: context.riskScore
  })
}

// Request audit logging
async function logRequestForAudit(request: NextRequest, context: SecurityContext): Promise<void> {
  // Only log admin requests and sensitive operations
  if (!isAdminRoute(request) && !isSensitiveRoute(request)) {
    return
  }

  const action = `${request.method}_${request.nextUrl.pathname.replace('/api/admin/', '')}`
  
  await AuditTrailManager.logEvent({
    category: 'ADMIN_ACTIONS',
    action: 'API_ACCESS',
    severity: 'LOW',
    adminId: context.userId || 'anonymous',
    adminRoles: context.adminRoles || [],
    resource: 'api_endpoint',
    resourceId: request.nextUrl.pathname,
    success: true,
    metadata: {
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      requestId: context.requestId,
      method: request.method,
      duration: Date.now() - context.startTime
    }
  })
}

// Get severity level for security events
function getSeverityForEvent(eventType: string): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
  const severityMap: Record<string, 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'> = {
    'BLOCKED_SUSPICIOUS_REQUEST': 'HIGH',
    'RATE_LIMIT_EXCEEDED': 'MEDIUM',
    'SUSPICIOUS_USER_AGENT': 'MEDIUM',
    'INSUFFICIENT_PERMISSIONS': 'MEDIUM',
    'CSRF_TOKEN_INVALID': 'HIGH',
    'INVALID_ORIGIN': 'HIGH',
    'MIDDLEWARE_ERROR': 'CRITICAL',
    'SECURITY_RESPONSE': 'LOW'
  }

  return severityMap[eventType] || 'LOW'
}

// IP-based security checks
class IPSecurityManager {
  private static blockedIPs = new Set<string>()
  private static trustedIPs = new Set(['127.0.0.1', '::1'])

  static async checkIPReputation(ipAddress: string): Promise<{
    isBlocked: boolean
    isTrusted: boolean
    riskScore: number
    reason?: string
  }> {
    // Check if IP is explicitly blocked
    if (this.blockedIPs.has(ipAddress)) {
      return {
        isBlocked: true,
        isTrusted: false,
        riskScore: 100,
        reason: 'IP is in blocklist'
      }
    }

    // Check if IP is trusted
    if (this.trustedIPs.has(ipAddress)) {
      return {
        isBlocked: false,
        isTrusted: true,
        riskScore: 0
      }
    }

    // In production, check against threat intelligence APIs
    // const reputation = await threatIntelAPI.checkIP(ipAddress)
    
    return {
      isBlocked: false,
      isTrusted: false,
      riskScore: 0 // Placeholder
    }
  }

  static blockIP(ipAddress: string, reason: string): void {
    this.blockedIPs.add(ipAddress)
    console.log(`Blocked IP: ${ipAddress} - ${reason}`)
    
    // In production, update firewall rules or WAF
    // await firewall.blockIP(ipAddress, reason)
  }

  static unblockIP(ipAddress: string): void {
    this.blockedIPs.delete(ipAddress)
    console.log(`Unblocked IP: ${ipAddress}`)
  }

  static addTrustedIP(ipAddress: string): void {
    this.trustedIPs.add(ipAddress)
    console.log(`Added trusted IP: ${ipAddress}`)
  }

  static getThreatMetrics(): {
    blockedIPs: number
    trustedIPs: number
    recentBlocks: Array<{ ip: string; reason: string; timestamp: Date }>
  } {
    return {
      blockedIPs: this.blockedIPs.size,
      trustedIPs: this.trustedIPs.size,
      recentBlocks: [] // In production, get from audit logs
    }
  }
}

// Session security management
class SessionSecurityManager {
  private static activeSessions = new Map<string, {
    userId: string
    ipAddress: string
    userAgent: string
    createdAt: Date
    lastActivity: Date
    isAdmin: boolean
  }>()

  static async createSecureSession(
    sessionId: string,
    userId: string,
    ipAddress: string,
    userAgent: string,
    isAdmin: boolean
  ): Promise<void> {
    this.activeSessions.set(sessionId, {
      userId,
      ipAddress,
      userAgent,
      createdAt: new Date(),
      lastActivity: new Date(),
      isAdmin
    })

    // Set session timeout
    setTimeout(() => {
      this.expireSession(sessionId, 'timeout')
    }, SECURITY_CONFIG.SESSION_TIMEOUT)
  }

  static async validateSession(
    sessionId: string,
    currentIP: string,
    currentUserAgent: string
  ): Promise<{
    isValid: boolean
    reason?: string
    session?: any
  }> {
    const session = this.activeSessions.get(sessionId)
    
    if (!session) {
      return { isValid: false, reason: 'Session not found' }
    }

    // Check session timeout
    const age = Date.now() - session.lastActivity.getTime()
    if (age > SECURITY_CONFIG.SESSION_TIMEOUT) {
      this.expireSession(sessionId, 'timeout')
      return { isValid: false, reason: 'Session expired' }
    }

    // Check IP consistency for admin sessions
    if (session.isAdmin && session.ipAddress !== currentIP) {
      this.expireSession(sessionId, 'ip_change')
      return { isValid: false, reason: 'IP address changed' }
    }

    // Check user agent consistency
    if (session.userAgent !== currentUserAgent) {
      // Log suspicious activity but don't block (user agent can change)
      console.warn('User agent changed for session:', {
        sessionId,
        old: session.userAgent,
        new: currentUserAgent
      })
    }

    // Update last activity
    session.lastActivity = new Date()

    return { isValid: true, session }
  }

  static expireSession(sessionId: string, reason: string): void {
    const session = this.activeSessions.get(sessionId)
    if (session) {
      console.log(`Session expired: ${sessionId} - ${reason}`)
      this.activeSessions.delete(sessionId)
      
      // Log session expiration
      SecurityLogger.logSecurityEvent({
        type: 'SESSION_EXPIRED',
        userId: session.userId,
        ipAddress: session.ipAddress,
        userAgent: session.userAgent,
        details: { sessionId, reason },
        severity: 'LOW',
        riskScore: 0
      })
    }
  }

  static getActiveSessions(): Array<{
    sessionId: string
    userId: string
    ipAddress: string
    isAdmin: boolean
    createdAt: Date
    lastActivity: Date
  }> {
    return Array.from(this.activeSessions.entries()).map(([sessionId, session]) => ({
      sessionId,
      ...session
    }))
  }

  static forceLogoutUser(userId: string, reason: string): void {
    const userSessions = Array.from(this.activeSessions.entries())
      .filter(([_, session]) => session.userId === userId)

    for (const [sessionId] of userSessions) {
      this.expireSession(sessionId, `forced_logout: ${reason}`)
    }
  }
}

// Request validation for specific admin operations
class AdminOperationValidator {
  static async validateUserOperation(
    request: NextRequest,
    operation: 'create' | 'update' | 'delete' | 'suspend',
    targetUserId?: string
  ): Promise<{ isValid: boolean; reason?: string }> {
    const context = await createSecurityContext(request, Date.now())
    
    // Basic admin check
    if (!context.isAdmin) {
      return { isValid: false, reason: 'Admin access required' }
    }

    // Can't perform operations on other admins (except super admin)
    if (targetUserId && operation !== 'create') {
      const targetUser = await getUserById(targetUserId)
      if (targetUser?.isAdmin && !context.adminRoles?.includes('SUPER_ADMIN')) {
        return { isValid: false, reason: 'Cannot modify admin users' }
      }
    }

    // Additional operation-specific validations
    switch (operation) {
      case 'delete':
        if (!context.adminRoles?.includes('SUPER_ADMIN')) {
          return { isValid: false, reason: 'User deletion requires super admin' }
        }
        break
      
      case 'suspend':
        if (!RBACManager.hasPermission(context.adminRoles || [], 'user:suspend')) {
          return { isValid: false, reason: 'Missing suspend permission' }
        }
        break
    }

    return { isValid: true }
  }

  static async validatePaymentOperation(
    request: NextRequest,
    operation: 'refund' | 'dispute' | 'export',
    amount?: number
  ): Promise<{ isValid: boolean; reason?: string }> {
    const context = await createSecurityContext(request, Date.now())
    
    if (!context.isAdmin) {
      return { isValid: false, reason: 'Admin access required' }
    }

    // High-value operations require elevated permissions
    if (operation === 'refund' && amount && amount > 5000) {
      if (!context.adminRoles?.includes('SUPER_ADMIN')) {
        return { isValid: false, reason: 'High-value refunds require super admin' }
      }
    }

    return { isValid: true }
  }

  static async validateSystemOperation(
    request: NextRequest,
    operation: 'config_update' | 'maintenance_mode' | 'backup',
    category?: string
  ): Promise<{ isValid: boolean; reason?: string }> {
    const context = await createSecurityContext(request, Date.now())
    
    if (!context.isAdmin) {
      return { isValid: false, reason: 'Admin access required' }
    }

    // Critical system operations
    if (operation === 'maintenance_mode') {
      if (!context.adminRoles?.includes('SUPER_ADMIN')) {
        return { isValid: false, reason: 'Maintenance mode requires super admin' }
      }
    }

    // Security config requires special permission
    if (operation === 'config_update' && category === 'security') {
      if (!RBACManager.hasPermission(context.adminRoles || [], 'security:config')) {
        return { isValid: false, reason: 'Security config requires security permission' }
      }
    }

    return { isValid: true }
  }
}

// Placeholder functions (implement based on your system)
async function getUserById(userId: string): Promise<{ isAdmin: boolean } | null> {
  // Implement actual user lookup
  return { isAdmin: false }
}

// Security monitoring dashboard data
class SecurityDashboard {
  static async getSecurityMetrics(): Promise<{
    requests: {
      total: number
      blocked: number
      suspicious: number
    }
    threats: {
      ipBlocks: number
      userAgentBlocks: number
      rateLimit: number
    }
    sessions: {
      active: number
      adminSessions: number
      expiredToday: number
    }
    audit: {
      totalEvents: number
      criticalEvents: number
      failedActions: number
    }
  }> {
    const sessionMetrics = SessionSecurityManager.getActiveSessions()
    const threatMetrics = IPSecurityManager.getThreatMetrics()

    return {
      requests: {
        total: 0, // Get from logs
        blocked: threatMetrics.blockedIPs,
        suspicious: 0 // Get from threat detection logs
      },
      threats: {
        ipBlocks: threatMetrics.blockedIPs,
        userAgentBlocks: 0, // Get from security logs
        rateLimit: 0 // Get from rate limit logs
      },
      sessions: {
        active: sessionMetrics.length,
        adminSessions: sessionMetrics.filter(s => s.isAdmin).length,
        expiredToday: 0 // Get from audit logs
      },
      audit: {
        totalEvents: 0, // Get from audit logs
        criticalEvents: 0, // Get from audit logs
        failedActions: 0 // Get from audit logs
      }
    }
  }

  static async getRecentSecurityEvents(limit: number = 50): Promise<Array<{
    id: string
    type: string
    severity: string
    description: string
    timestamp: Date
    userId?: string
    ipAddress: string
  }>> {
    // In production, query security event logs
    return [] // Placeholder
  }

  static async getThreatIntelligence(): Promise<{
    activeTreats: number
    blockedIPs: string[]
    suspiciousPatterns: Array<{
      pattern: string
      count: number
      lastSeen: Date
    }>
    riskScore: number
  }> {
    return {
      activeTreats: 0,
      blockedIPs: Array.from(IPSecurityManager['blockedIPs']),
      suspiciousPatterns: [],
      riskScore: 0
    }
  }
}

// Export the main middleware function and utilities
export {
  securityMiddleware as default,
  IPSecurityManager,
  SessionSecurityManager,
  AdminOperationValidator,
  SecurityDashboard
}
