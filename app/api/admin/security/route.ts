import { NextRequest, NextResponse } from 'next/server'
import { 
  SecurityValidator, 
  AdminDataValidator, 
  InputSanitizer,
  XSSPrevention,
  SqlInjectionPrevention
} from '@/lib/security/validation'
import { RBACManager, PERMISSIONS } from '@/lib/security/rbac'
import { AuditTrailManager } from '@/lib/security/audit'
import { SecurityDashboard, IPSecurityManager } from '@/middleware/security'

// Rate limiting for security endpoints
const securityRateLimit = {
  maxRequests: 20,
  windowMs: 15 * 60 * 1000 // 15 minutes
}

// GET /api/admin/security - Get security dashboard data
export async function GET(request: NextRequest) {
  try {
    // Extract admin context
    const adminContext = await getAdminContext(request)
    if (!adminContext.success) {
      return NextResponse.json({ error: adminContext.error }, { status: 401 })
    }

    // Check permissions
    if (!RBACManager.hasPermission(adminContext.adminRoles, PERMISSIONS.SECURITY_MONITOR)) {
      return NextResponse.json({ 
        error: 'Insufficient permissions for security monitoring' 
      }, { status: 403 })
    }

    // Get security metrics and dashboard data
    const [securityMetrics, recentEvents, threatIntel] = await Promise.all([
      SecurityDashboard.getSecurityMetrics(),
      SecurityDashboard.getRecentSecurityEvents(50),
      SecurityDashboard.getThreatIntelligence()
    ])

    // Log access for audit
    await AuditTrailManager.logEvent({
      category: 'SECURITY',
      action: 'DATA_ACCESS',
      severity: 'LOW',
      adminId: adminContext.adminId!,
      adminRoles: (adminContext.adminRoles || []) as any,
      resource: 'security_dashboard',
      resourceId: 'overview',
      newValues: { action: 'view' },
      success: true,
      metadata: getRequestMetadata(request)
    })

    return NextResponse.json({
      metrics: securityMetrics,
      recentEvents,
      threatIntelligence: threatIntel,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Security dashboard error:', error)
    return NextResponse.json({ 
      error: 'Failed to load security dashboard' 
    }, { status: 500 })
  }
}

// POST /api/admin/security/ip-management - Manage IP blocklist
export async function POST(request: NextRequest) {
  try {
    const adminContext = await getAdminContext(request)
    if (!adminContext.success) {
      return NextResponse.json({ error: adminContext.error }, { status: 401 })
    }

    // Check permissions
    if (!RBACManager.hasPermission(adminContext.adminRoles, PERMISSIONS.SECURITY_CONFIG)) {
      return NextResponse.json({ 
        error: 'Insufficient permissions for security configuration' 
      }, { status: 403 })
    }

    const body = await request.json()
    
    // Validate input
    const validation = validateIPManagementRequest(body)
    if (!validation.isValid) {
      return NextResponse.json({ 
        error: 'Invalid request data',
        details: validation.errors 
      }, { status: 400 })
    }

    const { action, ipAddress, reason } = body

    // Perform IP management action
    let result
    switch (action) {
      case 'block':
        IPSecurityManager.blockIP(ipAddress, reason)
        result = { message: `IP ${ipAddress} has been blocked` }
        break

      case 'unblock':
        IPSecurityManager.unblockIP(ipAddress)
        result = { message: `IP ${ipAddress} has been unblocked` }
        break

      case 'trust':
        IPSecurityManager.addTrustedIP(ipAddress)
        result = { message: `IP ${ipAddress} has been added to trusted list` }
        break

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    // Log security action
    await AuditTrailManager.logEvent({
      category: 'SECURITY',
      action: 'CONFIG_UPDATE',
      severity: (action === 'block' ? 'HIGH' : 'MEDIUM'),
      adminId: adminContext.adminId,
      adminRoles: adminContext.adminRoles as any,
      resource: 'ip_management',
      resourceId: ipAddress,
      newValues: { action, reason },
      success: true,
      metadata: getRequestMetadata(request)
    })

    return NextResponse.json(result)

  } catch (error) {
    console.error('IP management error:', error)
    return NextResponse.json({ 
      error: 'Failed to process IP management request' 
    }, { status: 500 })
  }
}

// PUT /api/admin/security/settings - Update security settings
export async function PUT(request: NextRequest) {
  try {
    const adminContext = await getAdminContext(request)
    if (!adminContext.success) {
      return NextResponse.json({ error: adminContext.error }, { status: 401 })
    }

    // Check permissions - only security admins and super admins
    if (!adminContext.adminRoles.includes('SECURITY_ADMIN') && 
        !adminContext.adminRoles.includes('SUPER_ADMIN')) {
      return NextResponse.json({ 
        error: 'Security settings require security admin role' 
      }, { status: 403 })
    }

    const body = await request.json()
    
    // Validate security settings
    const validation = AdminDataValidator.validateSystemSettings(body)
    if (!validation.isValid) {
      return NextResponse.json({ 
        error: 'Invalid security settings',
        details: validation.errors 
      }, { status: 400 })
    }

    // Additional security-specific validation
    const securityValidation = validateSecuritySettings(body)
    if (!securityValidation.isValid) {
      return NextResponse.json({ 
        error: 'Security settings validation failed',
        details: securityValidation.errors 
      }, { status: 400 })
    }

    // Update security settings in database
    const updatedSettings = await updateSecuritySettings(body, adminContext.adminId)

    // Log critical security configuration change
    await AuditTrailManager.logEvent({
      category: 'SECURITY',
      action: 'CONFIG_UPDATE',
      severity: 'CRITICAL',
      adminId: adminContext.adminId,
      adminRoles: adminContext.adminRoles as any,
      resource: 'security_settings',
      resourceId: body.key,
      newValues: body,
      success: true,
      metadata: getRequestMetadata(request)
    })

    return NextResponse.json({
      message: 'Security settings updated successfully',
      settings: updatedSettings
    })

  } catch (error) {
    console.error('Security settings update error:', error)
    return NextResponse.json({ 
      error: 'Failed to update security settings' 
    }, { status: 500 })
  }
}

// Helper functions for API handlers

async function getAdminContext(request: NextRequest): Promise<{
  success: boolean
  error?: string
  adminId?: string
  adminRoles?: any[]
  isAdmin?: boolean
}> {
  // Extract user from authentication system (Clerk, JWT, etc.)
  const authHeader = request.headers.get('authorization')
  if (!authHeader) {
    return { success: false, error: 'Missing authentication' }
  }

  // Placeholder - implement actual auth verification
  const userId = 'admin_user_123' // Extract from token
  const isAdmin = true // Check from database
  const adminRoles = ['ADMIN'] // Get from database

  if (!isAdmin) {
    return { success: false, error: 'Admin access required' }
  }

  return {
    success: true,
    adminId: userId,
    adminRoles,
    isAdmin
  }
}

function getRequestMetadata(request: NextRequest) {
  return {
    ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
    userAgent: request.headers.get('user-agent') || 'unknown',
    requestId: crypto.randomUUID(),
    timestamp: new Date()
  }
}

function validateIPManagementRequest(data: any): {
  isValid: boolean
  errors?: string[]
} {
  const errors: string[] = []

  // Check required fields
  if (!data.action || !['block', 'unblock', 'trust'].includes(data.action)) {
    errors.push('Invalid or missing action')
  }

  if (!data.ipAddress || typeof data.ipAddress !== 'string') {
    errors.push('Invalid or missing IP address')
  } else {
    // Validate IP format
    const sanitizedIP = InputSanitizer.sanitizeIpAddress(data.ipAddress)
    if (sanitizedIP !== data.ipAddress) {
      errors.push('Invalid IP address format')
    }
  }

  if (data.action === 'block' && (!data.reason || data.reason.trim().length === 0)) {
    errors.push('Reason is required for blocking IPs')
  }

  // Check for XSS in reason field
  if (data.reason && XSSPrevention.containsXSS(data.reason)) {
    errors.push('Invalid reason format')
  }

  return {
    isValid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined
  }
}

function validateSecuritySettings(data: any): {
  isValid: boolean
  errors?: string[]
} {
  const errors: string[] = []

  // Validate category and key
  if (!data.category || data.category !== 'security') {
    errors.push('Invalid category - must be security')
  }

  if (!data.key || typeof data.key !== 'string') {
    errors.push('Invalid or missing key')
  }

  // Check for SQL injection in settings
  const stringData = JSON.stringify(data)
  if (SqlInjectionPrevention.isSqlInjection(stringData)) {
    errors.push('Potential security threat detected in settings')
  }

  // Validate specific security settings
  if (data.key && data.value) {
    const settingValidation = validateSpecificSecuritySetting(data.key, data.value)
    if (!settingValidation.isValid) {
      errors.push(...(settingValidation.errors || []))
    }
  }

  return {
    isValid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined
  }
}

function validateSpecificSecuritySetting(key: string, value: any): {
  isValid: boolean
  errors?: string[]
} {
  const errors: string[] = []

  switch (key) {
    case 'session_timeout':
      const timeout = Number(value)
      if (isNaN(timeout) || timeout < 5 || timeout > 480) {
        errors.push('Session timeout must be between 5 and 480 minutes')
      }
      break

    case 'max_login_attempts':
      const attempts = Number(value)
      if (isNaN(attempts) || attempts < 3 || attempts > 20) {
        errors.push('Max login attempts must be between 3 and 20')
      }
      break

    case 'password_min_length':
      const minLength = Number(value)
      if (isNaN(minLength) || minLength < 8 || minLength > 128) {
        errors.push('Password minimum length must be between 8 and 128')
      }
      break

    case 'two_factor_enforcement':
      if (typeof value !== 'boolean') {
        errors.push('Two factor enforcement must be boolean')
      }
      break

    case 'encryption_algorithm':
      const allowedAlgorithms = ['aes-256-gcm', 'aes-256-cbc', 'chacha20-poly1305']
      if (!allowedAlgorithms.includes(value)) {
        errors.push('Invalid encryption algorithm')
      }
      break

    default:
      // Generic validation for unknown settings
      if (typeof value === 'string' && value.length > 10000) {
        errors.push('Setting value too long')
      }
  }

  return {
    isValid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined
  }
}

async function updateSecuritySettings(settings: any, adminId: string): Promise<any> {
  // In production, update database
  // const updated = await prisma.adminSetting.upsert({
  //   where: {
  //     category_key: {
  //       category: settings.category,
  //       key: settings.key
  //     }
  //   },
  //   update: {
  //     value: settings.value,
  //     type: settings.type,
  //     isSensitive: true,
  //     updatedBy: adminId,
  //     updatedAt: new Date()
  //   },
  //   create: {
  //     category: settings.category,
  //     key: settings.key,
  //     value: settings.value,
  //     type: settings.type,
  //     isSensitive: true,
  //     createdBy: adminId
  //   }
  // })

  // Placeholder response
  return {
    id: crypto.randomUUID(),
    category: settings.category,
    key: settings.key,
    value: settings.value,
    updatedAt: new Date()
  }
}

