import { NextRequest } from 'next/server'

export type AdminRole = 'SUPER_ADMIN' | 'ADMIN' | 'BILLING_ADMIN' | 'SUPPORT_ADMIN' | 'SECURITY_ADMIN' | 'ANALYTICS_ADMIN' | 'READ_ONLY_ADMIN'
export type Permission = string

// Permission definitions
export const PERMISSIONS = {
  // User management permissions
  USER_VIEW: 'user:view',
  USER_EDIT: 'user:edit',
  USER_DELETE: 'user:delete',
  USER_SUSPEND: 'user:suspend',
  USER_EXPORT: 'user:export',
  
  // Payment management permissions
  PAYMENT_VIEW: 'payment:view',
  PAYMENT_REFUND: 'payment:refund',
  PAYMENT_DISPUTE: 'payment:dispute',
  PAYMENT_EXPORT: 'payment:export',
  
  // System management permissions
  SYSTEM_CONFIG: 'system:config',
  SYSTEM_MAINTENANCE: 'system:maintenance',
  SYSTEM_LOGS: 'system:logs',
  SYSTEM_ALERTS: 'system:alerts',
  SYSTEM_BACKUP: 'system:backup',
  
  // Analytics permissions
  ANALYTICS_VIEW: 'analytics:view',
  ANALYTICS_EXPORT: 'analytics:export',
  ANALYTICS_DELETE: 'analytics:delete',
  
  // Admin management permissions
  ADMIN_CREATE: 'admin:create',
  ADMIN_EDIT: 'admin:edit',
  ADMIN_DELETE: 'admin:delete',
  ADMIN_PERMISSIONS: 'admin:permissions',
  
  // Security permissions
  SECURITY_AUDIT: 'security:audit',
  SECURITY_CONFIG: 'security:config',
  SECURITY_MONITOR: 'security:monitor',
  
  // Feature flag permissions
  FEATURE_VIEW: 'feature:view',
  FEATURE_TOGGLE: 'feature:toggle',
  FEATURE_CREATE: 'feature:create',
  FEATURE_DELETE: 'feature:delete',
} as const

// Role definitions with their permissions
export const ROLE_PERMISSIONS = {
  SUPER_ADMIN: [
    // Has all permissions
    ...Object.values(PERMISSIONS)
  ],
  
  ADMIN: [
    PERMISSIONS.USER_VIEW,
    PERMISSIONS.USER_EDIT,
    PERMISSIONS.USER_SUSPEND,
    PERMISSIONS.PAYMENT_VIEW,
    PERMISSIONS.PAYMENT_REFUND,
    PERMISSIONS.ANALYTICS_VIEW,
    PERMISSIONS.ANALYTICS_EXPORT,
    PERMISSIONS.SYSTEM_LOGS,
    PERMISSIONS.SYSTEM_ALERTS,
    PERMISSIONS.FEATURE_VIEW,
    PERMISSIONS.SECURITY_MONITOR,
  ],
  
  BILLING_ADMIN: [
    PERMISSIONS.USER_VIEW,
    PERMISSIONS.PAYMENT_VIEW,
    PERMISSIONS.PAYMENT_REFUND,
    PERMISSIONS.PAYMENT_DISPUTE,
    PERMISSIONS.PAYMENT_EXPORT,
    PERMISSIONS.ANALYTICS_VIEW,
  ],
  
  SUPPORT_ADMIN: [
    PERMISSIONS.USER_VIEW,
    PERMISSIONS.USER_EDIT,
    PERMISSIONS.USER_SUSPEND,
    PERMISSIONS.PAYMENT_VIEW,
    PERMISSIONS.SYSTEM_LOGS,
    PERMISSIONS.ANALYTICS_VIEW,
  ],
  
  SECURITY_ADMIN: [
    PERMISSIONS.USER_VIEW,
    PERMISSIONS.SYSTEM_LOGS,
    PERMISSIONS.SYSTEM_ALERTS,
    PERMISSIONS.SECURITY_AUDIT,
    PERMISSIONS.SECURITY_CONFIG,
    PERMISSIONS.SECURITY_MONITOR,
    PERMISSIONS.ANALYTICS_VIEW,
  ],
  
  ANALYTICS_ADMIN: [
    PERMISSIONS.USER_VIEW,
    PERMISSIONS.ANALYTICS_VIEW,
    PERMISSIONS.ANALYTICS_EXPORT,
    PERMISSIONS.ANALYTICS_DELETE,
    PERMISSIONS.SYSTEM_LOGS,
  ],
  
  READ_ONLY_ADMIN: [
    PERMISSIONS.USER_VIEW,
    PERMISSIONS.PAYMENT_VIEW,
    PERMISSIONS.ANALYTICS_VIEW,
    PERMISSIONS.SYSTEM_LOGS,
    PERMISSIONS.FEATURE_VIEW,
  ]
} as const

// RBAC Manager
export class RBACManager {
  private static rolePermissions = new Map(Object.entries(ROLE_PERMISSIONS))

  static hasPermission(userRoles: AdminRole[], requiredPermission: string): boolean {
    for (const role of userRoles) {
      const permissions = this.rolePermissions.get(role) || []
      if (permissions.includes(requiredPermission)) {
        return true
      }
    }
    return false
  }

  static hasAnyPermission(userRoles: AdminRole[], requiredPermissions: string[]): boolean {
    return requiredPermissions.some(permission => 
      this.hasPermission(userRoles, permission)
    )
  }

  static hasAllPermissions(userRoles: AdminRole[], requiredPermissions: string[]): boolean {
    return requiredPermissions.every(permission => 
      this.hasPermission(userRoles, permission)
    )
  }

  static getRolePermissions(role: AdminRole): string[] {
    return this.rolePermissions.get(role) || []
  }

  static getAllUserPermissions(userRoles: AdminRole[]): string[] {
    const permissions = new Set<string>()
    
    userRoles.forEach(role => {
      this.getRolePermissions(role).forEach(permission => {
        permissions.add(permission)
      })
    })
    
    return Array.from(permissions)
  }

  static canAccessResource(
    userRoles: AdminRole[], 
    resourceType: string, 
    action: string
  ): boolean {
    const permission = `${resourceType}:${action}`
    return this.hasPermission(userRoles, permission)
  }

  static getHighestRole(userRoles: AdminRole[]): AdminRole {
    const roleHierarchy = [
      'READ_ONLY_ADMIN',
      'SUPPORT_ADMIN', 
      'ANALYTICS_ADMIN',
      'BILLING_ADMIN',
      'SECURITY_ADMIN',
      'ADMIN',
      'SUPER_ADMIN'
    ]

    for (let i = roleHierarchy.length - 1; i >= 0; i--) {
      if (userRoles.includes(roleHierarchy[i] as AdminRole)) {
        return roleHierarchy[i] as AdminRole
      }
    }

    return 'READ_ONLY_ADMIN'
  }
}

// Permission decorators and middleware
export class PermissionMiddleware {
  static requirePermission(permission: string) {
    return async (request: NextRequest, context: { params: any }) => {
      const user = await this.getCurrentUser(request)
      
      if (!user || !user.isAdmin) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized' }), 
          { status: 401 }
        )
      }

      if (!RBACManager.hasPermission(user.roles, permission)) {
        return new Response(
          JSON.stringify({ 
            error: 'Insufficient permissions',
            required: permission,
            current: RBACManager.getAllUserPermissions(user.roles)
          }), 
          { status: 403 }
        )
      }

      return null // Permission granted, continue
    }
  }

  static requireAnyPermission(permissions: string[]) {
    return async (request: NextRequest, context: { params: any }) => {
      const user = await this.getCurrentUser(request)
      
      if (!user || !user.isAdmin) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized' }), 
          { status: 401 }
        )
      }

      if (!RBACManager.hasAnyPermission(user.roles, permissions)) {
        return new Response(
          JSON.stringify({ 
            error: 'Insufficient permissions',
            required: permissions,
            current: RBACManager.getAllUserPermissions(user.roles)
          }), 
          { status: 403 }
        )
      }

      return null // Permission granted, continue
    }
  }

  static requireRole(role: AdminRole) {
    return async (request: NextRequest, context: { params: any }) => {
      const user = await this.getCurrentUser(request)
      
      if (!user || !user.isAdmin) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized' }), 
          { status: 401 }
        )
      }

      if (!user.roles.includes(role)) {
        return new Response(
          JSON.stringify({ 
            error: 'Insufficient role',
            required: role,
            current: user.roles
          }), 
          { status: 403 }
        )
      }

      return null // Permission granted, continue
    }
  }

  private static async getCurrentUser(request: NextRequest): Promise<{
    id: string
    isAdmin: boolean
    roles: AdminRole[]
  } | null> {
    // This would integrate with your authentication system
    // For Clerk, you might extract the user from the session
    
    // Placeholder implementation
    const authHeader = request.headers.get('Authorization')
    if (!authHeader) return null

    // In production, decode JWT or validate session
    return {
      id: 'user-id',
      isAdmin: true,
      roles: ['ADMIN'] as AdminRole[]
    }
  }
}

// Resource-level access control
export class ResourceAccessControl {
  static canAccessUser(
    adminRoles: AdminRole[], 
    targetUserId: string, 
    adminUserId: string
  ): boolean {
    // Super admins can access anyone
    if (adminRoles.includes('SUPER_ADMIN')) {
      return true
    }

    // Can't modify themselves through admin interface
    if (targetUserId === adminUserId) {
      return false
    }

    // Other admins can access regular users
    return RBACManager.hasPermission(adminRoles, PERMISSIONS.USER_VIEW)
  }

  static canModifyPayment(
    adminRoles: AdminRole[], 
    paymentUserId: string, 
    adminUserId: string,
    action: 'view' | 'refund' | 'dispute'
  ): boolean {
    const permissionMap = {
      view: PERMISSIONS.PAYMENT_VIEW,
      refund: PERMISSIONS.PAYMENT_REFUND,
      dispute: PERMISSIONS.PAYMENT_DISPUTE
    }

    // Can't modify their own payments
    if (paymentUserId === adminUserId) {
      return false
    }

    return RBACManager.hasPermission(adminRoles, permissionMap[action])
  }

  static canAccessSystemConfig(
    adminRoles: AdminRole[],
    configCategory: string
  ): boolean {
    // Security configs require special permission
    if (configCategory === 'security') {
      return RBACManager.hasPermission(adminRoles, PERMISSIONS.SECURITY_CONFIG)
    }

    // System configs require system permission
    return RBACManager.hasPermission(adminRoles, PERMISSIONS.SYSTEM_CONFIG)
  }

  static canToggleFeatureFlag(
    adminRoles: AdminRole[],
    flagCategory: string,
    environment: string
  ): boolean {
    // Production flags require higher permissions
    if (environment === 'PRODUCTION') {
      return adminRoles.includes('SUPER_ADMIN') || 
             adminRoles.includes('ADMIN')
    }

    // Security flags require security permissions
    if (flagCategory === 'SECURITY') {
      return RBACManager.hasPermission(adminRoles, PERMISSIONS.SECURITY_CONFIG)
    }

    return RBACManager.hasPermission(adminRoles, PERMISSIONS.FEATURE_TOGGLE)
  }
}

// Audit trail for RBAC operations
export class RBACSecurityLogger {
  static async logPermissionCheck(event: {
    adminId: string
    requiredPermission: string
    userRoles: AdminRole[]
    granted: boolean
    resource: string
    resourceId?: string
    ipAddress: string
    userAgent: string
  }): Promise<void> {
    console.log('Permission Check:', {
      ...event,
      timestamp: new Date().toISOString()
    })

    // In production, store in security audit log
    // await prisma.securityEvent.create({
    //   data: {
    //     type: 'PERMISSION_CHECK',
    //     userId: event.adminId,
    //     severity: event.granted ? 'LOW' : 'MEDIUM',
    //     details: JSON.stringify(event),
    //     ipAddress: event.ipAddress,
    //     userAgent: event.userAgent
    //   }
    // })
  }

  static async logRoleAssignment(event: {
    adminId: string
    targetUserId: string
    oldRoles: AdminRole[]
    newRoles: AdminRole[]
    ipAddress: string
    userAgent: string
  }): Promise<void> {
    console.log('Role Assignment:', {
      ...event,
      timestamp: new Date().toISOString()
    })

    // Log critical role changes
    // await prisma.adminAudit.create({
    //   data: {
    //     adminId: event.adminId,
    //     action: 'ROLE_ASSIGNMENT',
    //     resource: 'USER',
    //     resourceId: event.targetUserId,
    //     oldValues: JSON.stringify({ roles: event.oldRoles }),
    //     newValues: JSON.stringify({ roles: event.newRoles }),
    //     ipAddress: event.ipAddress,
    //     userAgent: event.userAgent
    //   }
    // })
  }

  static async logSensitiveAction(event: {
    adminId: string
    action: string
    resource: string
    resourceId?: string
    reason?: string
    ipAddress: string
    userAgent: string
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  }): Promise<void> {
    console.log('Sensitive Action:', {
      ...event,
      timestamp: new Date().toISOString()
    })

    // Alert for high-risk actions
    if (event.riskLevel === 'CRITICAL' || event.riskLevel === 'HIGH') {
      // Send immediate alert to security team
      console.warn('HIGH RISK ADMIN ACTION DETECTED:', event)
    }

    // Store in security event log
    // await prisma.securityEvent.create({
    //   data: {
    //     type: 'SENSITIVE_ADMIN_ACTION',
    //     userId: event.adminId,
    //     severity: event.riskLevel,
    //     details: JSON.stringify(event),
    //     ipAddress: event.ipAddress,
    //     userAgent: event.userAgent
    //   }
    // })
  }
}

// Context-aware permission checking
export class ContextualPermissions {
  static async checkUserModificationPermission(
    adminId: string,
    adminRoles: AdminRole[],
    targetUserId: string,
    modification: any
  ): Promise<{ allowed: boolean; reason?: string }> {
    // Basic permission check
    if (!RBACManager.hasPermission(adminRoles, PERMISSIONS.USER_EDIT)) {
      return { allowed: false, reason: 'Missing user edit permission' }
    }

    // Can't modify other admins unless super admin
    const targetUser = await this.getUser(targetUserId)
    if (targetUser?.isAdmin && !adminRoles.includes('SUPER_ADMIN')) {
      return { allowed: false, reason: 'Cannot modify admin users' }
    }

    // Can't modify sensitive fields without proper permissions
    const sensitiveFields = ['email', 'subscription', 'status']
    const modifyingSensitive = sensitiveFields.some(field => 
      modification.hasOwnProperty(field)
    )

    if (modifyingSensitive && !adminRoles.includes('ADMIN') && !adminRoles.includes('SUPER_ADMIN')) {
      return { allowed: false, reason: 'Cannot modify sensitive user fields' }
    }

    return { allowed: true }
  }

  static async checkPaymentActionPermission(
    adminId: string,
    adminRoles: AdminRole[],
    paymentId: string,
    action: 'view' | 'refund' | 'dispute'
  ): Promise<{ allowed: boolean; reason?: string }> {
    const permissionMap = {
      view: PERMISSIONS.PAYMENT_VIEW,
      refund: PERMISSIONS.PAYMENT_REFUND,
      dispute: PERMISSIONS.PAYMENT_DISPUTE
    }

    // Basic permission check
    if (!RBACManager.hasPermission(adminRoles, permissionMap[action])) {
      return { allowed: false, reason: `Missing ${action} permission` }
    }

    // Check payment amount limits for refunds
    if (action === 'refund') {
      const payment = await this.getPayment(paymentId)
      if (!payment) {
        return { allowed: false, reason: 'Payment not found' }
      }

      // High-value refunds require super admin
      if (payment.amount > 5000 && !adminRoles.includes('SUPER_ADMIN')) {
        return { allowed: false, reason: 'High-value refunds require super admin' }
      }
    }

    return { allowed: true }
  }

  static async checkSystemConfigPermission(
    adminId: string,
    adminRoles: AdminRole[],
    configKey: string,
    configCategory: string
  ): Promise<{ allowed: boolean; reason?: string }> {
    // Security configurations
    if (configCategory === 'security') {
      if (!RBACManager.hasPermission(adminRoles, PERMISSIONS.SECURITY_CONFIG)) {
        return { allowed: false, reason: 'Missing security config permission' }
      }

      // Critical security settings require super admin
      const criticalSettings = [
        'encryption_key',
        'jwt_secret',
        'admin_session_timeout',
        'two_factor_enforcement'
      ]

      if (criticalSettings.includes(configKey) && !adminRoles.includes('SUPER_ADMIN')) {
        return { allowed: false, reason: 'Critical security settings require super admin' }
      }
    }

    // System configurations
    if (!RBACManager.hasPermission(adminRoles, PERMISSIONS.SYSTEM_CONFIG)) {
      return { allowed: false, reason: 'Missing system config permission' }
    }

    return { allowed: true }
  }

  private static async getUser(userId: string): Promise<{ isAdmin: boolean } | null> {
    // Placeholder - implement actual user lookup
    return { isAdmin: false }
  }

  private static async getPayment(paymentId: string): Promise<{ amount: number } | null> {
    // Placeholder - implement actual payment lookup
    return { amount: 1000 }
  }
}

// Permission enforcement decorator
export function RequirePermission(permission: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value

    descriptor.value = async function (request: NextRequest, ...args: any[]) {
      const user = await PermissionMiddleware['getCurrentUser'](request)
      
      if (!user || !RBACManager.hasPermission(user.roles, permission)) {
        return new Response(
          JSON.stringify({ 
            error: 'Permission denied',
            required: permission 
          }),
          { status: 403 }
        )
      }

      return originalMethod.apply(this, [request, ...args])
    }
  }
}

// Resource isolation
export class ResourceIsolation {
  static filterUsersByPermission(
    users: any[],
    adminRoles: AdminRole[],
    adminUserId: string
  ): any[] {
    return users.filter(user => {
      // Super admins see everyone
      if (adminRoles.includes('SUPER_ADMIN')) return true

      // Can't see other admins unless super admin
      if (user.isAdmin) return false

      // Can't see themselves in user management
      if (user.id === adminUserId) return false

      return true
    })
  }

  static filterPaymentsByPermission(
    payments: any[],
    adminRoles: AdminRole[],
    adminUserId: string
  ): any[] {
    return payments.filter(payment => {
      // Can't see their own payments
      if (payment.userId === adminUserId) return false

      // Filter by permission level
      if (adminRoles.includes('BILLING_ADMIN') || 
          adminRoles.includes('ADMIN') || 
          adminRoles.includes('SUPER_ADMIN')) {
        return true
      }

      return false
    })
  }

  static redactSensitiveData(
    data: any,
    adminRoles: AdminRole[],
    fieldType: 'user' | 'payment' | 'system'
  ): any {
    if (!data) return data

    const redacted = { ...data }

    // Define sensitive fields by type
    const sensitiveFields = {
      user: ['email', 'phone', 'ipAddress', 'lastLoginIp'],
      payment: ['stripeCustomerId', 'paymentMethodId'],
      system: ['apiKeys', 'secrets', 'tokens']
    }

    // Super admins see everything
    if (adminRoles.includes('SUPER_ADMIN')) {
      return redacted
    }

    // Redact based on role permissions
    const fieldsToRedact = sensitiveFields[fieldType] || []
    fieldsToRedact.forEach(field => {
      if (redacted[field]) {
        redacted[field] = '***REDACTED***'
      }
    })

    return redacted
  }
}

// Time-based access control
export class TimeBasedAccess {
  static isWithinBusinessHours(): boolean {
    const now = new Date()
    const hour = now.getHours()
    const day = now.getDay()

    // Monday-Friday, 8 AM - 6 PM
    return day >= 1 && day <= 5 && hour >= 8 && hour <= 18
  }

  static requireBusinessHours(adminRoles: AdminRole[]): boolean {
    // Super admins can work anytime
    if (adminRoles.includes('SUPER_ADMIN')) {
      return true
    }

    // Other roles restricted to business hours for sensitive operations
    return this.isWithinBusinessHours()
  }

  static async logAfterHoursAccess(event: {
    adminId: string
    action: string
    timestamp: Date
    ipAddress: string
    userAgent: string
  }): Promise<void> {
    console.log('After Hours Access:', event)

    // Alert security team for after-hours admin access
    // await sendSecurityAlert({
    //   type: 'AFTER_HOURS_ADMIN_ACCESS',
    //   severity: 'MEDIUM',
    //   details: event
    // })
  }
}

// Emergency access controls
export class EmergencyAccess {
  private static emergencyMode = false

  static enableEmergencyMode(adminId: string, reason: string): void {
    this.emergencyMode = true
    console.log('EMERGENCY MODE ACTIVATED:', { adminId, reason, timestamp: new Date() })
    
    // Log emergency activation
    // await prisma.securityEvent.create({
    //   data: {
    //     type: 'EMERGENCY_MODE_ACTIVATED',
    //     userId: adminId,
    //     severity: 'CRITICAL',
    //     details: JSON.stringify({ reason })
    //   }
    // })
  }

  static disableEmergencyMode(adminId: string): void {
    this.emergencyMode = false
    console.log('EMERGENCY MODE DEACTIVATED:', { adminId, timestamp: new Date() })
  }

  static isEmergencyMode(): boolean {
    return this.emergencyMode
  }

  static hasEmergencyAccess(adminRoles: AdminRole[]): boolean {
    return this.emergencyMode && (
      adminRoles.includes('SUPER_ADMIN') || 
      adminRoles.includes('SECURITY_ADMIN')
    )
  }
}

// Permission validation helpers
export const PermissionHelpers = {
  validateUserAccess: (adminRoles: AdminRole[]) => 
    RBACManager.hasPermission(adminRoles, PERMISSIONS.USER_VIEW),
    
  validatePaymentAccess: (adminRoles: AdminRole[]) => 
    RBACManager.hasPermission(adminRoles, PERMISSIONS.PAYMENT_VIEW),
    
  validateSystemAccess: (adminRoles: AdminRole[]) => 
    RBACManager.hasPermission(adminRoles, PERMISSIONS.SYSTEM_CONFIG),
    
  validateAnalyticsAccess: (adminRoles: AdminRole[]) => 
    RBACManager.hasPermission(adminRoles, PERMISSIONS.ANALYTICS_VIEW),
    
  validateSecurityAccess: (adminRoles: AdminRole[]) => 
    RBACManager.hasPermission(adminRoles, PERMISSIONS.SECURITY_MONITOR),

  // Permission level helpers
  isReadOnly: (adminRoles: AdminRole[]) => 
    adminRoles.includes('READ_ONLY_ADMIN') && adminRoles.length === 1,
    
  isHighPrivilege: (adminRoles: AdminRole[]) => 
    adminRoles.includes('SUPER_ADMIN') || adminRoles.includes('ADMIN'),
    
  isSecurityRole: (adminRoles: AdminRole[]) => 
    adminRoles.includes('SECURITY_ADMIN') || adminRoles.includes('SUPER_ADMIN'),
    
  isBillingRole: (adminRoles: AdminRole[]) => 
    adminRoles.includes('BILLING_ADMIN') || 
    adminRoles.includes('ADMIN') || 
    adminRoles.includes('SUPER_ADMIN')
}

