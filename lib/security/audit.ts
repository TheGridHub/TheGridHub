import { PrivacyCompliance } from './validation'
import { createHash } from 'node:crypto'

export type AdminRole = 'SUPER_ADMIN' | 'ADMIN' | 'BILLING_ADMIN' | 'SUPPORT_ADMIN' | 'SECURITY_ADMIN' | 'ANALYTICS_ADMIN' | 'READ_ONLY_ADMIN'

// Audit event types and categories
export const AUDIT_CATEGORIES = {
  AUTHENTICATION: 'AUTHENTICATION',
  USER_MANAGEMENT: 'USER_MANAGEMENT',
  PAYMENT_MANAGEMENT: 'PAYMENT_MANAGEMENT',
  SYSTEM_CONFIG: 'SYSTEM_CONFIG',
  SECURITY: 'SECURITY',
  DATA_ACCESS: 'DATA_ACCESS',
  ADMIN_ACTIONS: 'ADMIN_ACTIONS',
  FEATURE_FLAGS: 'FEATURE_FLAGS',
  MAINTENANCE: 'MAINTENANCE',
  COMPLIANCE: 'COMPLIANCE'
} as const

export const AUDIT_ACTIONS = {
  // Authentication actions
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  FAILED_LOGIN: 'FAILED_LOGIN',
  PASSWORD_CHANGE: 'PASSWORD_CHANGE',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  
  // User management actions
  USER_VIEW: 'USER_VIEW',
  USER_CREATE: 'USER_CREATE',
  USER_UPDATE: 'USER_UPDATE',
  USER_DELETE: 'USER_DELETE',
  USER_SUSPEND: 'USER_SUSPEND',
  USER_ACTIVATE: 'USER_ACTIVATE',
  USER_EXPORT: 'USER_EXPORT',
  
  // Payment actions
  PAYMENT_VIEW: 'PAYMENT_VIEW',
  PAYMENT_REFUND: 'PAYMENT_REFUND',
  PAYMENT_DISPUTE: 'PAYMENT_DISPUTE',
  SUBSCRIPTION_MODIFY: 'SUBSCRIPTION_MODIFY',
  BILLING_EXPORT: 'BILLING_EXPORT',
  
  // System actions
  CONFIG_UPDATE: 'CONFIG_UPDATE',
  FEATURE_TOGGLE: 'FEATURE_TOGGLE',
  MAINTENANCE_MODE: 'MAINTENANCE_MODE',
  SYSTEM_BACKUP: 'SYSTEM_BACKUP',
  SYSTEM_RESTORE: 'SYSTEM_RESTORE',
  
  // Security actions
  ROLE_ASSIGNMENT: 'ROLE_ASSIGNMENT',
  PERMISSION_GRANT: 'PERMISSION_GRANT',
  SECURITY_ALERT: 'SECURITY_ALERT',
  ENCRYPTION_KEY_ROTATION: 'ENCRYPTION_KEY_ROTATION',
  
  // Data actions
  DATA_EXPORT: 'DATA_EXPORT',
  DATA_DELETE: 'DATA_DELETE',
  DATA_ANONYMIZE: 'DATA_ANONYMIZE',
  GDPR_REQUEST: 'GDPR_REQUEST',
  DATA_ACCESS: 'DATA_ACCESS',
  API_ACCESS: 'API_ACCESS'
} as const

export const AUDIT_SEVERITY = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM', 
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL'
} as const

export type AuditCategory = keyof typeof AUDIT_CATEGORIES
export type AuditAction = keyof typeof AUDIT_ACTIONS
export type AuditSeverity = keyof typeof AUDIT_SEVERITY

// Audit event structure
export interface AuditEvent {
  id?: string
  category: AuditCategory
  action: AuditAction
  severity: AuditSeverity
  adminId: string
  adminRoles: AdminRole[]
  resource: string
  resourceId?: string
  oldValues?: any
  newValues?: any
  metadata?: {
    ipAddress: string
    userAgent: string
    sessionId?: string
    requestId?: string
    duration?: number
    affectedRecords?: number
    reason?: string
  }
  timestamp: Date
  success: boolean
  error?: string
}

// Main audit trail manager
export class AuditTrailManager {
  private static eventQueue: AuditEvent[] = []
  private static isProcessing = false

  static async logEvent(event: Omit<AuditEvent, 'id' | 'timestamp'>): Promise<void> {
    const auditEvent: AuditEvent = {
      ...event,
      id: this.generateEventId(),
      timestamp: new Date()
    }

    // Add to queue for batch processing
    this.eventQueue.push(auditEvent)

    // Process queue if not already processing
    if (!this.isProcessing) {
      await this.processQueue()
    }

    // Log immediately to console for debugging
    console.log('Audit Event:', {
      ...auditEvent,
      oldValues: event.oldValues ? PrivacyCompliance.redactPII(event.oldValues) : undefined,
      newValues: event.newValues ? PrivacyCompliance.redactPII(event.newValues) : undefined
    })
  }

  private static async processQueue(): Promise<void> {
    if (this.isProcessing || this.eventQueue.length === 0) return

    this.isProcessing = true

    try {
      const events = [...this.eventQueue]
      this.eventQueue = []

      // Batch insert to database
      await this.batchInsertEvents(events)

      // Check for critical events that need immediate alerts
      const criticalEvents = events.filter(event => 
        event.severity === 'CRITICAL' || 
        (event.severity === 'HIGH' && !event.success)
      )

      if (criticalEvents.length > 0) {
        await this.sendSecurityAlerts(criticalEvents)
      }

    } catch (error) {
      console.error('Audit queue processing failed:', error)
      
      // Re-add events back to queue for retry
      this.eventQueue.unshift(...this.eventQueue)
    } finally {
      this.isProcessing = false
    }
  }

  private static async batchInsertEvents(events: AuditEvent[]): Promise<void> {
    // In production, batch insert to database
    // await prisma.adminAudit.createMany({
    //   data: events.map(event => ({
    //     id: event.id,
    //     category: event.category,
    //     action: event.action,
    //     severity: event.severity,
    //     adminId: event.adminId,
    //     adminRoles: event.adminRoles,
    //     resource: event.resource,
    //     resourceId: event.resourceId,
    //     oldValues: event.oldValues ? JSON.stringify(event.oldValues) : null,
    //     newValues: event.newValues ? JSON.stringify(event.newValues) : null,
    //     metadata: event.metadata ? JSON.stringify(event.metadata) : null,
    //     success: event.success,
    //     error: event.error,
    //     createdAt: event.timestamp
    //   }))
    // })
    
    console.log(`Batch inserted ${events.length} audit events`)
  }

  private static async sendSecurityAlerts(events: AuditEvent[]): Promise<void> {
    console.warn('CRITICAL SECURITY EVENTS DETECTED:', events.length)
    
    // Send alerts to security team
    for (const event of events) {
      console.warn('Critical Event:', {
        category: event.category,
        action: event.action,
        severity: event.severity,
        adminId: event.adminId,
        resource: event.resource,
        success: event.success,
        error: event.error
      })
    }
    
    // In production, integrate with alerting system
    // await sendSlackAlert(events)
    // await sendEmailAlert(events)
  }

  private static generateEventId(): string {
    const bytes = new Uint8Array(8)
    globalThis.crypto.getRandomValues(bytes)
    const hex = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')
    return `audit_${Date.now()}_${hex}`
  }
}

// Specific audit loggers for different operations
export class UserManagementAudit {
  static async logUserView(adminId: string, adminRoles: AdminRole[], userId: string, metadata: any): Promise<void> {
    await AuditTrailManager.logEvent({
      category: 'USER_MANAGEMENT',
      action: 'USER_VIEW',
      severity: 'LOW',
      adminId,
      adminRoles,
      resource: 'user',
      resourceId: userId,
      success: true,
      metadata
    })
  }

  static async logUserUpdate(
    adminId: string, 
    adminRoles: AdminRole[], 
    userId: string, 
    oldValues: any, 
    newValues: any, 
    metadata: any
  ): Promise<void> {
    // Determine severity based on what changed
    const sensitiveFields = ['email', 'status', 'subscription', 'roles']
    const changedSensitiveFields = sensitiveFields.filter(field => 
      oldValues[field] !== newValues[field]
    )
    
    const severity = changedSensitiveFields.length > 0 ? 'HIGH' : 'MEDIUM'

    await AuditTrailManager.logEvent({
      category: 'USER_MANAGEMENT',
      action: 'USER_UPDATE',
      severity: severity as AuditSeverity,
      adminId,
      adminRoles,
      resource: 'user',
      resourceId: userId,
      oldValues,
      newValues,
      success: true,
      metadata: {
        ...metadata,
        changedFields: Object.keys(newValues).filter(key => oldValues[key] !== newValues[key])
      }
    })
  }

  static async logUserSuspension(
    adminId: string, 
    adminRoles: AdminRole[], 
    userId: string, 
    reason: string,
    metadata: any
  ): Promise<void> {
    await AuditTrailManager.logEvent({
      category: 'USER_MANAGEMENT',
      action: 'USER_SUSPEND',
      severity: 'HIGH',
      adminId,
      adminRoles,
      resource: 'user',
      resourceId: userId,
      newValues: { status: 'SUSPENDED', reason },
      success: true,
      metadata: { ...metadata, reason }
    })
  }

  static async logUserExport(
    adminId: string, 
    adminRoles: AdminRole[], 
    userIds: string[], 
    exportType: string,
    metadata: any
  ): Promise<void> {
    await AuditTrailManager.logEvent({
      category: 'COMPLIANCE',
      action: 'USER_EXPORT',
      severity: 'MEDIUM',
      adminId,
      adminRoles,
      resource: 'user_export',
      resourceId: exportType,
      newValues: { exportedUserIds: userIds, exportType },
      success: true,
      metadata: { ...metadata, affectedRecords: userIds.length }
    })
  }
}

export class PaymentManagementAudit {
  static async logPaymentRefund(
    adminId: string,
    adminRoles: AdminRole[],
    paymentId: string,
    refundAmount: number,
    reason: string,
    metadata: any
  ): Promise<void> {
    const severity = refundAmount > 1000 ? 'HIGH' : 'MEDIUM'

    await AuditTrailManager.logEvent({
      category: 'PAYMENT_MANAGEMENT',
      action: 'PAYMENT_REFUND',
      severity: severity as AuditSeverity,
      adminId,
      adminRoles,
      resource: 'payment',
      resourceId: paymentId,
      newValues: { refundAmount, reason },
      success: true,
      metadata: { ...metadata, reason }
    })
  }

  static async logSubscriptionChange(
    adminId: string,
    adminRoles: AdminRole[],
    userId: string,
    oldSubscription: string,
    newSubscription: string,
    metadata: any
  ): Promise<void> {
    await AuditTrailManager.logEvent({
      category: 'PAYMENT_MANAGEMENT',
      action: 'SUBSCRIPTION_MODIFY',
      severity: 'MEDIUM',
      adminId,
      adminRoles,
      resource: 'subscription',
      resourceId: userId,
      oldValues: { subscription: oldSubscription },
      newValues: { subscription: newSubscription },
      success: true,
      metadata
    })
  }

  static async logPaymentDataAccess(
    adminId: string,
    adminRoles: AdminRole[],
    paymentId: string,
    accessType: 'view' | 'export',
    metadata: any
  ): Promise<void> {
    await AuditTrailManager.logEvent({
      category: 'DATA_ACCESS',
      action: 'PAYMENT_VIEW',
      severity: 'LOW',
      adminId,
      adminRoles,
      resource: 'payment',
      resourceId: paymentId,
      newValues: { accessType },
      success: true,
      metadata
    })
  }
}

export class SystemConfigAudit {
  static async logConfigUpdate(
    adminId: string,
    adminRoles: AdminRole[],
    category: string,
    key: string,
    oldValue: any,
    newValue: any,
    metadata: any
  ): Promise<void> {
    // Critical configs get high severity
    const criticalConfigs = [
      'security.encryption_key',
      'security.jwt_secret',
      'security.two_factor_enforcement',
      'system.maintenance_mode'
    ]
    
    const configKey = `${category}.${key}`
    const severity = criticalConfigs.includes(configKey) ? 'CRITICAL' : 'MEDIUM'

    await AuditTrailManager.logEvent({
      category: 'SYSTEM_CONFIG',
      action: 'CONFIG_UPDATE',
      severity: severity as AuditSeverity,
      adminId,
      adminRoles,
      resource: 'system_config',
      resourceId: configKey,
      oldValues: { value: oldValue },
      newValues: { value: newValue },
      success: true,
      metadata
    })
  }

  static async logFeatureFlagToggle(
    adminId: string,
    adminRoles: AdminRole[],
    flagName: string,
    oldState: boolean,
    newState: boolean,
    environment: string,
    metadata: any
  ): Promise<void> {
    const severity = environment === 'PRODUCTION' ? 'HIGH' : 'MEDIUM'

    await AuditTrailManager.logEvent({
      category: 'FEATURE_FLAGS',
      action: 'FEATURE_TOGGLE',
      severity: severity as AuditSeverity,
      adminId,
      adminRoles,
      resource: 'feature_flag',
      resourceId: flagName,
      oldValues: { enabled: oldState, environment },
      newValues: { enabled: newState, environment },
      success: true,
      metadata
    })
  }

  static async logMaintenanceModeToggle(
    adminId: string,
    adminRoles: AdminRole[],
    enabled: boolean,
    reason: string,
    metadata: any
  ): Promise<void> {
    await AuditTrailManager.logEvent({
      category: 'MAINTENANCE',
      action: 'MAINTENANCE_MODE',
      severity: 'CRITICAL',
      adminId,
      adminRoles,
      resource: 'system',
      resourceId: 'maintenance_mode',
      newValues: { enabled, reason },
      success: true,
      metadata: { ...metadata, reason }
    })
  }
}

export class SecurityAudit {
  static async logRoleAssignment(
    adminId: string,
    adminRoles: AdminRole[],
    targetUserId: string,
    oldRoles: AdminRole[],
    newRoles: AdminRole[],
    metadata: any
  ): Promise<void> {
    await AuditTrailManager.logEvent({
      category: 'SECURITY',
      action: 'ROLE_ASSIGNMENT',
      severity: 'CRITICAL',
      adminId,
      adminRoles,
      resource: 'user_roles',
      resourceId: targetUserId,
      oldValues: { roles: oldRoles },
      newValues: { roles: newRoles },
      success: true,
      metadata
    })
  }

  static async logFailedAuthentication(
    userId: string,
    reason: string,
    metadata: any
  ): Promise<void> {
    await AuditTrailManager.logEvent({
      category: 'AUTHENTICATION',
      action: 'FAILED_LOGIN',
      severity: 'MEDIUM',
      adminId: userId,
      adminRoles: [],
      resource: 'authentication',
      resourceId: userId,
      success: false,
      error: reason,
      metadata
    })
  }

  static async logSecurityThreat(
    adminId: string,
    threatType: string,
    description: string,
    riskScore: number,
    metadata: any
  ): Promise<void> {
    const severity = riskScore >= 70 ? 'CRITICAL' : 
                    riskScore >= 40 ? 'HIGH' : 'MEDIUM'

    await AuditTrailManager.logEvent({
      category: 'SECURITY',
      action: 'SECURITY_ALERT',
      severity: severity as AuditSeverity,
      adminId,
      adminRoles: [],
      resource: 'security_threat',
      resourceId: threatType,
      newValues: { description, riskScore },
      success: true,
      metadata
    })
  }

  static async logDataAccess(
    adminId: string,
    adminRoles: AdminRole[],
    resourceType: string,
    resourceId: string,
    accessType: 'view' | 'export' | 'modify' | 'delete',
    metadata: any
  ): Promise<void> {
    const severityMap = {
      view: 'LOW',
      export: 'MEDIUM',
      modify: 'HIGH',
      delete: 'CRITICAL'
    }

    await AuditTrailManager.logEvent({
      category: 'DATA_ACCESS',
      action: 'DATA_ACCESS',
      severity: severityMap[accessType] as AuditSeverity,
      adminId,
      adminRoles,
      resource: resourceType,
      resourceId,
      newValues: { accessType },
      success: true,
      metadata
    })
  }
}

// Compliance-specific audit functions
export class ComplianceAudit {
  static async logGDPRRequest(
    adminId: string,
    adminRoles: AdminRole[],
    userId: string,
    requestType: 'export' | 'delete' | 'anonymize',
    metadata: any
  ): Promise<void> {
    await AuditTrailManager.logEvent({
      category: 'COMPLIANCE',
      action: 'GDPR_REQUEST',
      severity: 'HIGH',
      adminId,
      adminRoles,
      resource: 'gdpr_request',
      resourceId: `${userId}_${requestType}`,
      newValues: { userId, requestType },
      success: true,
      metadata
    })
  }

  static async logDataRetention(
    adminId: string,
    adminRoles: AdminRole[],
    dataType: string,
    retentionAction: 'archive' | 'delete' | 'anonymize',
    recordCount: number,
    metadata: any
  ): Promise<void> {
    await AuditTrailManager.logEvent({
      category: 'COMPLIANCE',
      action: 'DATA_DELETE',
      severity: 'HIGH',
      adminId,
      adminRoles,
      resource: 'data_retention',
      resourceId: dataType,
      newValues: { retentionAction, recordCount },
      success: true,
      metadata: { ...metadata, affectedRecords: recordCount }
    })
  }

  static async logConsentUpdate(
    adminId: string,
    adminRoles: AdminRole[],
    userId: string,
    consentType: string,
    granted: boolean,
    metadata: any
  ): Promise<void> {
    await AuditTrailManager.logEvent({
      category: 'COMPLIANCE',
      action: 'USER_UPDATE',
      severity: 'MEDIUM',
      adminId,
      adminRoles,
      resource: 'user_consent',
      resourceId: `${userId}_${consentType}`,
      newValues: { consentType, granted },
      success: true,
      metadata
    })
  }
}

// Audit query and analysis
export class AuditAnalytics {
  static async getAuditSummary(
    startDate: Date,
    endDate: Date,
    filters?: {
      adminId?: string
      category?: AuditCategory
      severity?: AuditSeverity
    }
  ): Promise<{
    totalEvents: number
    byCategory: Record<AuditCategory, number>
    bySeverity: Record<AuditSeverity, number>
    byAdmin: Array<{ adminId: string; count: number }>
    failureRate: number
    criticalEvents: number
  }> {
    // In production, query actual audit data
    // const events = await prisma.adminAudit.findMany({
    //   where: {
    //     createdAt: { gte: startDate, lte: endDate },
    //     ...(filters?.adminId && { adminId: filters.adminId }),
    //     ...(filters?.category && { category: filters.category }),
    //     ...(filters?.severity && { severity: filters.severity })
    //   }
    // })

    // Placeholder analytics
    return {
      totalEvents: 0,
      byCategory: {
        AUTHENTICATION: 0,
        USER_MANAGEMENT: 0,
        PAYMENT_MANAGEMENT: 0,
        SYSTEM_CONFIG: 0,
        SECURITY: 0,
        DATA_ACCESS: 0,
        ADMIN_ACTIONS: 0,
        FEATURE_FLAGS: 0,
        MAINTENANCE: 0,
        COMPLIANCE: 0
      },
      bySeverity: {
        LOW: 0,
        MEDIUM: 0,
        HIGH: 0,
        CRITICAL: 0
      },
      byAdmin: [],
      failureRate: 0,
      criticalEvents: 0
    }
  }

  static async detectAnomalies(adminId: string, timeWindow: number = 24): Promise<{
    anomalies: Array<{
      type: string
      description: string
      severity: AuditSeverity
      count: number
      timeframe: string
    }>
    riskScore: number
  }> {
    const anomalies: any[] = []
    let riskScore = 0

    // In production, analyze actual audit data for patterns
    
    // Example anomaly detection rules:
    // 1. Too many user modifications in short time
    // 2. After-hours critical operations
    // 3. Unusual access patterns
    // 4. Failed operations spike
    // 5. Multiple high-risk actions

    return { anomalies, riskScore }
  }

  static async generateComplianceReport(
    startDate: Date,
    endDate: Date,
    reportType: 'gdpr' | 'sox' | 'hipaa' | 'pci'
  ): Promise<{
    reportId: string
    summary: any
    events: any[]
    violations: any[]
    recommendations: string[]
  }> {
    const reportId = `compliance_${reportType}_${Date.now()}`

    // Generate compliance-specific report
    const complianceRules = {
      gdpr: {
        requiredEvents: ['USER_EXPORT', 'DATA_DELETE', 'GDPR_REQUEST'],
        violations: ['unauthorized_data_access', 'missing_consent']
      },
      sox: {
        requiredEvents: ['CONFIG_UPDATE', 'ROLE_ASSIGNMENT', 'SYSTEM_BACKUP'],
        violations: ['inadequate_controls', 'missing_approvals']
      },
      hipaa: {
        requiredEvents: ['DATA_ACCESS', 'USER_EXPORT', 'SECURITY_ALERT'],
        violations: ['unauthorized_phi_access', 'missing_encryption']
      },
      pci: {
        requiredEvents: ['PAYMENT_VIEW', 'PAYMENT_REFUND', 'SECURITY_ALERT'],
        violations: ['unencrypted_card_data', 'unauthorized_payment_access']
      }
    }

    return {
      reportId,
      summary: {
        reportType,
        period: { startDate, endDate },
        generatedAt: new Date(),
        complianceScore: 95 // Placeholder
      },
      events: [], // Filtered events for compliance
      violations: [], // Any compliance violations found
      recommendations: [
        'Maintain current security practices',
        'Review access patterns monthly',
        'Ensure all sensitive operations are logged'
      ]
    }
  }
}

// Audit retention and cleanup
export class AuditRetention {
  static readonly RETENTION_PERIODS = {
    LOW: 90 * 24 * 60 * 60 * 1000,      // 90 days
    MEDIUM: 365 * 24 * 60 * 60 * 1000,  // 1 year
    HIGH: 7 * 365 * 24 * 60 * 60 * 1000, // 7 years
    CRITICAL: 10 * 365 * 24 * 60 * 60 * 1000 // 10 years
  }

  static async cleanupExpiredAudits(): Promise<{
    deletedCount: number
    archivedCount: number
  }> {
    let deletedCount = 0
    let archivedCount = 0

    for (const [severity, retentionPeriod] of Object.entries(this.RETENTION_PERIODS)) {
      const cutoffDate = new Date(Date.now() - retentionPeriod)

      // Archive before deletion for high/critical severity
      if (severity === 'HIGH' || severity === 'CRITICAL') {
        // Archive to cold storage
        archivedCount += await this.archiveAudits(severity as AuditSeverity, cutoffDate)
      }

      // Delete expired audits
      // const deleted = await prisma.adminAudit.deleteMany({
      //   where: {
      //     severity: severity as AuditSeverity,
      //     createdAt: { lt: cutoffDate }
      //   }
      // })
      // deletedCount += deleted.count
    }

    return { deletedCount, archivedCount }
  }

  private static async archiveAudits(severity: AuditSeverity, cutoffDate: Date): Promise<number> {
    // In production, archive to cold storage
    // const auditEvents = await prisma.adminAudit.findMany({
    //   where: {
    //     severity,
    //     createdAt: { lt: cutoffDate }
    //   }
    // })

    // Archive to cloud storage, compressed and encrypted
    // await cloudStorage.upload(
    //   `audit-archive/${severity}/${cutoffDate.getFullYear()}/`,
    //   JSON.stringify(auditEvents)
    // )

    console.log(`Archived ${0} ${severity} audit events older than ${cutoffDate}`)
    return 0
  }
}

// Real-time audit monitoring
export class AuditMonitoring {
  private static alertThresholds = {
    failedLogins: { count: 10, window: 5 * 60 * 1000 }, // 10 in 5 minutes
    userModifications: { count: 50, window: 60 * 60 * 1000 }, // 50 in 1 hour
    criticalActions: { count: 5, window: 15 * 60 * 1000 }, // 5 in 15 minutes
    afterHoursActivity: { count: 5, window: 60 * 60 * 1000 } // 5 in 1 hour
  }

  static async monitorRealTimeEvents(event: AuditEvent): Promise<void> {
    // Check for immediate alert conditions
    const alerts = await this.checkAlertConditions(event)
    
    for (const alert of alerts) {
      await this.sendRealTimeAlert(alert)
    }

    // Update monitoring metrics
    await this.updateMetrics(event)
  }

  private static async checkAlertConditions(event: AuditEvent): Promise<Array<{
    type: string
    severity: AuditSeverity
    description: string
    event: AuditEvent
  }>> {
    const alerts: any[] = []

    // Failed login detection
    if (event.action === 'FAILED_LOGIN') {
      const recentFailures = await this.countRecentEvents(
        'FAILED_LOGIN',
        event.adminId,
        this.alertThresholds.failedLogins.window
      )
      
      if (recentFailures >= this.alertThresholds.failedLogins.count) {
        alerts.push({
          type: 'SUSPICIOUS_LOGIN_ACTIVITY',
          severity: 'HIGH',
          description: `${recentFailures} failed login attempts in ${this.alertThresholds.failedLogins.window / 60000} minutes`,
          event
        })
      }
    }

    // Critical action during off hours
    if (event.severity === 'CRITICAL' && !this.isBusinessHours()) {
      alerts.push({
        type: 'AFTER_HOURS_CRITICAL_ACTION',
        severity: 'HIGH',
        description: `Critical action performed outside business hours: ${event.action}`,
        event
      })
    }

    // High volume of user modifications
    if (event.category === 'USER_MANAGEMENT' && event.action === 'USER_UPDATE') {
      const recentModifications = await this.countRecentEvents(
        'USER_UPDATE',
        event.adminId,
        this.alertThresholds.userModifications.window
      )
      
      if (recentModifications >= this.alertThresholds.userModifications.count) {
        alerts.push({
          type: 'HIGH_VOLUME_USER_MODIFICATIONS',
          severity: 'MEDIUM',
          description: `${recentModifications} user modifications in the last hour`,
          event
        })
      }
    }

    return alerts
  }

  private static async countRecentEvents(
    action: string,
    adminId: string,
    timeWindow: number
  ): Promise<number> {
    const cutoffDate = new Date(Date.now() - timeWindow)
    
    // In production, query actual database
    // const count = await prisma.adminAudit.count({
    //   where: {
    //     action,
    //     adminId,
    //     createdAt: { gte: cutoffDate }
    //   }
    // })
    
    return 0 // Placeholder
  }

  private static async sendRealTimeAlert(alert: any): Promise<void> {
    console.warn('REAL-TIME SECURITY ALERT:', alert)
    
    // In production, send to monitoring system
    // await securityMonitoring.sendAlert(alert)
    // await slack.sendMessage(securityChannel, alert)
    // await email.sendSecurityAlert(securityTeam, alert)
  }

  private static async updateMetrics(event: AuditEvent): Promise<void> {
    // Update real-time metrics for dashboards
    // await metrics.increment(`audit.${event.category}.${event.action}`)
    // await metrics.increment(`audit.severity.${event.severity}`)
    
    if (!event.success) {
      // await metrics.increment(`audit.failures.${event.action}`)
    }
  }

  private static isBusinessHours(): boolean {
    const now = new Date()
    const hour = now.getHours()
    const day = now.getDay()

    // Monday-Friday, 8 AM - 6 PM
    return day >= 1 && day <= 5 && hour >= 8 && hour <= 18
  }
}

// Audit search and filtering
export class AuditSearch {
  static async searchAudits(query: {
    adminId?: string
    category?: AuditCategory
    action?: AuditAction
    severity?: AuditSeverity
    resource?: string
    startDate?: Date
    endDate?: Date
    search?: string
    page?: number
    limit?: number
  }): Promise<{
    events: AuditEvent[]
    totalCount: number
    page: number
    pageSize: number
    hasNext: boolean
  }> {
    const page = query.page || 1
    const limit = query.limit || 50

    // In production, build database query
    // const where = {
    //   ...(query.adminId && { adminId: query.adminId }),
    //   ...(query.category && { category: query.category }),
    //   ...(query.action && { action: query.action }),
    //   ...(query.severity && { severity: query.severity }),
    //   ...(query.resource && { resource: { contains: query.resource } }),
    //   ...(query.startDate && query.endDate && {
    //     createdAt: { gte: query.startDate, lte: query.endDate }
    //   }),
    //   ...(query.search && {
    //     OR: [
    //       { resource: { contains: query.search } },
    //       { error: { contains: query.search } },
    //       { metadata: { contains: query.search } }
    //     ]
    //   })
    // }

    // const [events, totalCount] = await Promise.all([
    //   prisma.adminAudit.findMany({
    //     where,
    //     orderBy: { createdAt: 'desc' },
    //     skip: (page - 1) * limit,
    //     take: limit
    //   }),
    //   prisma.adminAudit.count({ where })
    // ])

    // Placeholder response
    return {
      events: [],
      totalCount: 0,
      page,
      pageSize: limit,
      hasNext: false
    }
  }

  static async getAuditTrail(
    resourceType: string,
    resourceId: string
  ): Promise<AuditEvent[]> {
    // Get chronological audit trail for specific resource
    // const events = await prisma.adminAudit.findMany({
    //   where: {
    //     resource: resourceType,
    //     resourceId
    //   },
    //   orderBy: { createdAt: 'asc' }
    // })

    return [] // Placeholder
  }

  static async exportAudits(
    query: any,
    format: 'json' | 'csv' | 'xlsx'
  ): Promise<{
    exportId: string
    fileUrl: string
    recordCount: number
  }> {
    const exportId = `audit_export_${Date.now()}`
    
    // In production, generate actual export
    console.log('Audit export requested:', { query, format, exportId })
    
    return {
      exportId,
      fileUrl: `/api/admin/audits/export/${exportId}`,
      recordCount: 0
    }
  }
}

// Audit integrity verification
export class AuditIntegrity {
  static async verifyAuditIntegrity(eventId: string): Promise<{
    isValid: boolean
    issues: string[]
    verificationHash: string
  }> {
    // In production, verify audit record hasn't been tampered with
    // const event = await prisma.adminAudit.findUnique({ where: { id: eventId } })
    
    const issues: string[] = []
    
    // Check digital signature/hash
    // const computedHash = this.computeEventHash(event)
    // if (computedHash !== event.verificationHash) {
    //   issues.push('Hash verification failed')
    // }

    // Check timestamp consistency
    // Check for missing required fields
    // Check for suspicious modifications

    return {
      isValid: issues.length === 0,
      issues,
      verificationHash: 'placeholder_hash'
    }
  }

  static computeEventHash(event: Partial<AuditEvent>): string {
    // Create hash of critical fields
    const criticalFields = [
      event.category,
      event.action,
      event.adminId,
      event.resource,
      event.resourceId,
      event.timestamp?.toISOString()
    ].join('|')

    return createHash('sha256')
      .update(criticalFields)
      .digest('hex')
  }

  static async validateAuditChain(
    startDate: Date,
    endDate: Date
  ): Promise<{
    isValid: boolean
    brokenChains: Array<{
      startEvent: string
      endEvent: string
      issue: string
    }>
  }> {
    // Verify chronological integrity of audit chain
    const brokenChains: any[] = []

    // In production, check for:
    // - Missing sequential events
    // - Timestamp inconsistencies
    // - Hash chain breaks
    // - Unauthorized modifications

    return {
      isValid: brokenChains.length === 0,
      brokenChains
    }
  }
}

// Export utilities for audit functions
export const AuditHelpers = {
  // Simplified logging for common operations
  logUserAction: async (adminId: string, action: string, userId: string, metadata: any) => {
    await AuditTrailManager.logEvent({
      category: 'USER_MANAGEMENT',
      action: action as AuditAction,
      severity: 'MEDIUM',
      adminId,
      adminRoles: [], // Would be populated from context
      resource: 'user',
      resourceId: userId,
      success: true,
      metadata
    })
  },

  logSystemAction: async (adminId: string, action: string, details: any, metadata: any) => {
    await AuditTrailManager.logEvent({
      category: 'SYSTEM_CONFIG',
      action: action as AuditAction,
      severity: 'HIGH',
      adminId,
      adminRoles: [],
      resource: 'system',
      newValues: details,
      success: true,
      metadata
    })
  },

  // Get audit summary for dashboard
  getRecentActivity: async (limit: number = 20) => {
    return await AuditSearch.searchAudits({
      page: 1,
      limit,
      endDate: new Date(),
      startDate: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
    })
  },

  // Check if action should be audited
  shouldAudit: (action: string, severity: string): boolean => {
    // Always audit high and critical severity actions
    if (['HIGH', 'CRITICAL'].includes(severity)) return true
    
    // Always audit certain actions regardless of severity
    const alwaysAudit = [
      'USER_DELETE',
      'PAYMENT_REFUND',
      'CONFIG_UPDATE',
      'ROLE_ASSIGNMENT',
      'MAINTENANCE_MODE'
    ]
    
    return alwaysAudit.includes(action)
  },

  // Generate audit context from request
  extractAuditMetadata: (request: any): any => ({
    ipAddress: request.ip || request.headers['x-forwarded-for'] || 'unknown',
    userAgent: request.headers['user-agent'] || 'unknown',
    requestId: request.id || (() => { const a=new Uint8Array(8); globalThis.crypto.getRandomValues(a); return Array.from(a).map(b=>b.toString(16).padStart(2,'0')).join('') })(),
    sessionId: request.session?.id,
    timestamp: new Date()
  })
}

