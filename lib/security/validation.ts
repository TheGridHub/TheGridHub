import { z } from 'zod'
import DOMPurify from 'isomorphic-dompurify'
import rateLimit from 'express-rate-limit'
import { NextRequest } from 'next/server'

// Security constants
export const SECURITY_CONFIG = {
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes
  SESSION_TIMEOUT: 60 * 60 * 1000, // 1 hour
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 128,
  RATE_LIMIT_REQUESTS: 100,
  RATE_LIMIT_WINDOW: 15 * 60 * 1000, // 15 minutes
} as const

// Input sanitization utilities
export class InputSanitizer {
  static sanitizeHtml(input: string): string {
    return DOMPurify.sanitize(input, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
      ALLOWED_ATTR: [],
      RETURN_DOM: false,
      RETURN_DOM_FRAGMENT: false,
    })
  }

  static sanitizeString(input: string): string {
    // Remove null bytes, control characters, and normalize
    return input
      .replace(/\x00/g, '') // Remove null bytes
      .replace(/[\x01-\x1F\x7F]/g, '') // Remove control characters
      .trim()
      .normalize('NFC')
  }

  static sanitizeEmail(email: string): string {
    return email.toLowerCase().trim().normalize('NFC')
  }

  static sanitizeFileName(filename: string): string {
    return filename
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .replace(/\.{2,}/g, '.')
      .substring(0, 255)
  }

  static sanitizeIpAddress(ip: string): string {
    // Basic IP validation and sanitization
    const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/
    const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/
    
    if (ipv4Regex.test(ip) || ipv6Regex.test(ip)) {
      return ip
    }
    
    // Return sanitized version or localhost if invalid
    return '127.0.0.1'
  }
}

// Validation schemas
export const AdminValidationSchemas = {
  // User management schemas
  userUpdate: z.object({
    name: z.string()
      .min(1, 'Name is required')
      .max(100, 'Name too long')
      .regex(/^[a-zA-Z\s'-]+$/, 'Invalid name format'),
    email: z.string()
      .email('Invalid email format')
      .max(255, 'Email too long'),
    phone: z.string()
      .regex(/^\+?[\d\s-()]+$/, 'Invalid phone format')
      .optional(),
    country: z.string()
      .max(2, 'Invalid country code')
      .regex(/^[A-Z]{2}$/, 'Must be 2-letter country code')
      .optional(),
    timezone: z.string()
      .max(50, 'Invalid timezone')
      .optional(),
    status: z.enum(['ACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION', 'DEACTIVATED'])
      .optional(),
    subscription: z.enum(['PERSONAL', 'PRO', 'ENTERPRISE'])
      .optional()
  }),

  // Payment schemas
  paymentUpdate: z.object({
    amount: z.number()
      .positive('Amount must be positive')
      .max(999999.99, 'Amount too large'),
    currency: z.string()
      .length(3, 'Invalid currency code')
      .regex(/^[A-Z]{3}$/, 'Currency must be 3 uppercase letters'),
    status: z.enum(['PENDING', 'SUCCESSFUL', 'FAILED', 'REFUNDED', 'DISPUTED']),
    refundAmount: z.number()
      .positive('Refund amount must be positive')
      .optional(),
    refundReason: z.string()
      .max(500, 'Refund reason too long')
      .optional()
  }),

  // System settings schemas
  adminSetting: z.object({
    category: z.string()
      .min(1, 'Category is required')
      .max(50, 'Category too long')
      .regex(/^[a-zA-Z_]+$/, 'Invalid category format'),
    key: z.string()
      .min(1, 'Key is required')
      .max(100, 'Key too long')
      .regex(/^[a-zA-Z0-9_]+$/, 'Invalid key format'),
    value: z.string()
      .max(10000, 'Value too long'),
    type: z.enum(['STRING', 'NUMBER', 'BOOLEAN', 'JSON', 'ENCRYPTED']),
    isSensitive: z.boolean().default(false)
  }),

  // Feature flag schemas
  featureFlag: z.object({
    name: z.string()
      .min(1, 'Name is required')
      .max(100, 'Name too long')
      .regex(/^[a-zA-Z0-9_-]+$/, 'Invalid flag name format'),
    description: z.string()
      .max(500, 'Description too long'),
    enabled: z.boolean(),
    category: z.enum(['UI', 'API', 'EXPERIMENTAL', 'SECURITY', 'PERFORMANCE']),
    environment: z.enum(['DEVELOPMENT', 'STAGING', 'PRODUCTION', 'ALL']),
    rolloutPercentage: z.number()
      .min(0, 'Rollout percentage must be 0-100')
      .max(100, 'Rollout percentage must be 0-100')
  }),

  // Activity log query schemas
  activityLogQuery: z.object({
    page: z.number().min(1).default(1),
    limit: z.number().min(1).max(100).default(50),
    userId: z.string().optional(),
    category: z.enum(['AUTHENTICATION', 'PROFILE', 'SECURITY', 'DATA', 'PAYMENT', 'SYSTEM', 'ADMIN']).optional(),
    severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
    status: z.enum(['SUCCESS', 'FAILED', 'WARNING', 'INFO']).optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    ipAddress: z.string().ip().optional(),
    search: z.string().max(255).optional()
  }),

  // System health query schemas
  systemMetrics: z.object({
    startTime: z.string().datetime().optional(),
    endTime: z.string().datetime().optional(),
    interval: z.enum(['1m', '5m', '15m', '1h', '1d']).default('5m')
  })
}

// SQL injection prevention
export class SqlInjectionPrevention {
  private static dangerousPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/i,
    /(\b(UNION|OR|AND)\s+\d+\s*=\s*\d+)/i,
    /(--|\/\*|\*\/|;|\|)/,
    /(\b(xp_|sp_)\w+)/i,
    /(\b(INFORMATION_SCHEMA|SYSOBJECTS|SYSCOLUMNS)\b)/i
  ]

  static isSqlInjection(input: string): boolean {
    return this.dangerousPatterns.some(pattern => pattern.test(input))
  }

  static validateInput(input: string): { isValid: boolean; reason?: string } {
    if (this.isSqlInjection(input)) {
      return { isValid: false, reason: 'Potential SQL injection detected' }
    }
    return { isValid: true }
  }
}

// XSS prevention with safe, non-vulnerable patterns
export class XSSPrevention {
  // Use safer, more specific patterns that don't cause catastrophic backtracking
  private static dangerousPatterns = [
    // Script tags - safer pattern without nested quantifiers
    /<script[\s\S]*?<\/script>/gi,
    /<script[^>]*>/gi,
    /<\/script>/gi,
    // JavaScript protocols and event handlers
    /javascript:/gi,
    /vbscript:/gi,
    /data:/gi,
    // Event handlers - more specific pattern
    /\bon\w+\s*=/gi,
    // Dangerous HTML elements
    /<iframe[^>]*>/gi,
    /<object[^>]*>/gi,
    /<embed[^>]*>/gi,
    /<link[^>]*>/gi,
    /<meta[^>]*>/gi,
    /<form[^>]*>/gi,
    /<input[^>]*>/gi,
    // Additional XSS vectors
    /expression\s*\(/gi,
    /url\s*\(/gi,
    /@import/gi
  ]

  static containsXSS(input: string): boolean {
    // Limit input size to prevent DoS attacks
    if (input.length > 10000) {
      return true;
    }
    return this.dangerousPatterns.some(pattern => pattern.test(input))
  }

  static sanitizeInput(input: string): string {
    // Input length validation to prevent DoS
    if (input.length > 10000) {
      throw new Error('Input too long')
    }

    // First check for XSS patterns
    if (this.containsXSS(input)) {
      throw new Error('Potentially malicious content detected')
    }
    
    // Additional sanitization steps
    return this.performDeepSanitization(input)
  }

  // More thorough sanitization without vulnerable regex patterns
  private static performDeepSanitization(input: string): string {
    // Remove null bytes and control characters
    let sanitized = input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    
    // Encode HTML entities
    sanitized = sanitized
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')
    
    // Remove any remaining dangerous patterns
    // Remove dangerous protocol and attribute patterns until stable
    let previous;
    do {
      previous = sanitized;
      sanitized = sanitized
        .replace(/javascript:/gi, '')
        .replace(/vbscript:/gi, '')
        .replace(/data:/gi, '')
        .replace(/on\w+\s*=/gi, '');
    } while (sanitized !== previous);

    return sanitized
  }
}

// Rate limiting utilities
export const createRateLimit = (options: {
  requests: number
  window: number
  message?: string
}) => {
  return rateLimit({
    windowMs: options.window,
    max: options.requests,
    message: options.message || 'Too many requests, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        error: 'Rate limit exceeded',
        retryAfter: Math.ceil(options.window / 1000)
      })
    }
  })
}

// Admin-specific rate limits
export const adminRateLimits = {
  general: createRateLimit({
    requests: 100,
    window: 15 * 60 * 1000,
    message: 'Too many admin requests'
  }),
  
  sensitive: createRateLimit({
    requests: 20,
    window: 15 * 60 * 1000,
    message: 'Too many sensitive operations'
  }),
  
  auth: createRateLimit({
    requests: 5,
    window: 15 * 60 * 1000,
    message: 'Too many authentication attempts'
  })
}

// Input validation middleware
export class SecurityValidator {
  static validateAdminAccess(userId: string, requiredRole: string): Promise<boolean> {
    // This would check database for admin role
    // Implementation depends on your auth system
    return Promise.resolve(true) // Placeholder
  }

  static validateCSRF(request: NextRequest): boolean {
    const csrfHeader = request.headers.get('X-CSRF-Token')
    const csrfCookie = request.cookies.get('csrf-token')?.value
    
    return csrfHeader === csrfCookie && !!csrfHeader
  }

  static validateOrigin(request: NextRequest): boolean {
    const origin = request.headers.get('origin')
    const allowedOrigins = [
      'https://taskgrid.com',
      'https://www.taskgrid.com',
      'https://admin.taskgrid.com',
      process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : ''
    ].filter(Boolean)

    return allowedOrigins.includes(origin || '')
  }

  static validateUserAgent(userAgent: string): boolean {
    // Block known bot patterns and suspicious user agents
    const suspiciousPatterns = [
      /bot|crawler|spider|scraper/i,
      /curl|wget|python|php/i,
      /sqlmap|nikto|nmap/i
    ]

    return !suspiciousPatterns.some(pattern => pattern.test(userAgent))
  }

  static async validateRequestSecurity(request: NextRequest): Promise<{
    isValid: boolean
    reason?: string
  }> {
    // Validate CSRF token
    if (!this.validateCSRF(request)) {
      return { isValid: false, reason: 'Invalid CSRF token' }
    }

    // Validate origin
    if (!this.validateOrigin(request)) {
      return { isValid: false, reason: 'Invalid origin' }
    }

    // Validate user agent
    const userAgent = request.headers.get('user-agent') || ''
    if (!this.validateUserAgent(userAgent)) {
      return { isValid: false, reason: 'Suspicious user agent' }
    }

    return { isValid: true }
  }
}

// Data validation for admin operations
export class AdminDataValidator {
  static validateUserData(data: any): { isValid: boolean; errors?: string[] } {
    try {
      AdminValidationSchemas.userUpdate.parse(data)
      
      // Additional security checks
      const errors: string[] = []
      
      if (SqlInjectionPrevention.isSqlInjection(JSON.stringify(data))) {
        errors.push('Potential SQL injection detected')
      }
      
      if (XSSPrevention.containsXSS(JSON.stringify(data))) {
        errors.push('Potentially malicious content detected')
      }
      
      return errors.length > 0 
        ? { isValid: false, errors }
        : { isValid: true }
        
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          isValid: false,
          errors: error.errors.map(e => e.message)
        }
      }
      return { isValid: false, errors: ['Invalid data format'] }
    }
  }

  static validatePaymentData(data: any): { isValid: boolean; errors?: string[] } {
    try {
      AdminValidationSchemas.paymentUpdate.parse(data)
      
      // Additional payment-specific security checks
      const errors: string[] = []
      
      // Check for suspicious payment patterns
      if (data.amount && data.amount > 10000) {
        errors.push('Amount exceeds maximum limit')
      }
      
      if (data.refundReason && XSSPrevention.containsXSS(data.refundReason)) {
        errors.push('Invalid refund reason format')
      }
      
      return errors.length > 0 
        ? { isValid: false, errors }
        : { isValid: true }
        
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          isValid: false,
          errors: error.errors.map(e => e.message)
        }
      }
      return { isValid: false, errors: ['Invalid payment data'] }
    }
  }

  static validateSystemSettings(data: any): { isValid: boolean; errors?: string[] } {
    try {
      AdminValidationSchemas.adminSetting.parse(data)
      
      const errors: string[] = []
      
      // Additional validation for system settings
      if (data.type === 'NUMBER' && isNaN(Number(data.value))) {
        errors.push('Invalid number format')
      }
      
      if (data.type === 'JSON') {
        try {
          JSON.parse(data.value)
        } catch {
          errors.push('Invalid JSON format')
        }
      }
      
      // Check for dangerous configurations
      if (data.category === 'security' && data.key === 'session_timeout') {
        const timeout = Number(data.value)
        if (timeout < 5 || timeout > 480) {
          errors.push('Session timeout must be between 5 and 480 minutes')
        }
      }
      
      return errors.length > 0 
        ? { isValid: false, errors }
        : { isValid: true }
        
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          isValid: false,
          errors: error.errors.map(e => e.message)
        }
      }
      return { isValid: false, errors: ['Invalid settings data'] }
    }
  }
}

// Security headers utility
export const SecurityHeaders = {
  getSecurityHeaders(): Record<string, string> {
    return {
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
      'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Needed for Next.js
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: https:",
        "font-src 'self'",
        "connect-src 'self' https://api.stripe.com",
        "frame-ancestors 'none'",
        "base-uri 'self'",
        "form-action 'self'"
      ].join('; ')
    }
  }
}

// IP geolocation and threat intelligence
export class ThreatIntelligence {
  private static suspiciousIpRanges = [
    // Add known malicious IP ranges
    '10.0.0.0/8',    // Private range (shouldn't be external)
    '172.16.0.0/12', // Private range
    '192.168.0.0/16' // Private range
  ]

  static async analyzeRequest(
    ipAddress: string, 
    userAgent: string, 
    userId?: string
  ): Promise<{
    riskScore: number
    threats: string[]
    shouldBlock: boolean
  }> {
    let riskScore = 0
    const threats: string[] = []

    // Check IP reputation
    if (this.isPrivateIP(ipAddress)) {
      riskScore += 10
      threats.push('Private IP range detected')
    }

    // Check user agent
    if (!SecurityValidator.validateUserAgent(userAgent)) {
      riskScore += 20
      threats.push('Suspicious user agent')
    }

    // Check for automation tools
    if (this.isAutomationTool(userAgent)) {
      riskScore += 30
      threats.push('Automation tool detected')
    }

    // Check for known attack patterns
    if (this.containsAttackPattern(userAgent)) {
      riskScore += 50
      threats.push('Attack pattern detected')
    }

    return {
      riskScore,
      threats,
      shouldBlock: riskScore >= 40
    }
  }

  private static isPrivateIP(ip: string): boolean {
    return this.suspiciousIpRanges.some(range => {
      // Simple CIDR check (in production, use a proper CIDR library)
      return ip.startsWith(range.split('/')[0].split('.').slice(0, -1).join('.'))
    })
  }

  private static isAutomationTool(userAgent: string): boolean {
    const automationPatterns = [
      /headless/i,
      /phantom/i,
      /selenium/i,
      /webdriver/i,
      /playwright/i,
      /puppeteer/i
    ]
    return automationPatterns.some(pattern => pattern.test(userAgent))
  }

  private static containsAttackPattern(userAgent: string): boolean {
    const attackPatterns = [
      /sqlmap/i,
      /nikto/i,
      /nmap/i,
      /masscan/i,
      /zap/i,
      /burp/i
    ]
    return attackPatterns.some(pattern => pattern.test(userAgent))
  }
}

// File upload security
export class FileUploadSecurity {
  static validateFile(file: File): { isValid: boolean; reason?: string } {
    // Check file size
    if (file.size > SECURITY_CONFIG.MAX_FILE_SIZE) {
      return { isValid: false, reason: 'File too large' }
    }

    // Check file type
    if (!SECURITY_CONFIG.ALLOWED_FILE_TYPES.includes(file.type)) {
      return { isValid: false, reason: 'File type not allowed' }
    }

    // Check filename
    const sanitizedName = InputSanitizer.sanitizeFileName(file.name)
    if (sanitizedName !== file.name) {
      return { isValid: false, reason: 'Invalid filename' }
    }

    // Check for double extensions
    if (/\.(php|asp|jsp|exe|bat|cmd|scr|vbs|js|jar|com|pif|lnk)\./i.test(file.name)) {
      return { isValid: false, reason: 'Suspicious file extension' }
    }

    return { isValid: true }
  }

  static async scanFileContent(fileBuffer: ArrayBuffer): Promise<{
    isSafe: boolean
    threats: string[]
  }> {
    const threats: string[] = []
    const fileContent = new TextDecoder().decode(fileBuffer.slice(0, 1024)) // Check first 1KB

    // Check for embedded scripts
    if (XSSPrevention.containsXSS(fileContent)) {
      threats.push('Potential XSS content detected')
    }

    // Check for executable signatures
    const executableSignatures = [
      '\x4D\x5A', // PE header
      '\x7F\x45\x4C\x46', // ELF header
      '#!/bin/', // Shell script
      '<?php' // PHP code
    ]

    for (const signature of executableSignatures) {
      if (fileContent.includes(signature)) {
        threats.push('Executable content detected')
        break
      }
    }

    return {
      isSafe: threats.length === 0,
      threats
    }
  }
}

// Password security
export class PasswordSecurity {
  static validatePasswordStrength(password: string): {
    isStrong: boolean
    score: number
    suggestions: string[]
  } {
    let score = 0
    const suggestions: string[] = []

    // Length check
    if (password.length >= SECURITY_CONFIG.MIN_PASSWORD_LENGTH) {
      score += 20
    } else {
      suggestions.push(`Password must be at least ${SECURITY_CONFIG.MIN_PASSWORD_LENGTH} characters`)
    }

    // Uppercase letter
    if (/[A-Z]/.test(password)) {
      score += 20
    } else {
      suggestions.push('Add uppercase letters')
    }

    // Lowercase letter
    if (/[a-z]/.test(password)) {
      score += 20
    } else {
      suggestions.push('Add lowercase letters')
    }

    // Numbers
    if (/\d/.test(password)) {
      score += 20
    } else {
      suggestions.push('Add numbers')
    }

    // Special characters
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      score += 20
    } else {
      suggestions.push('Add special characters')
    }

    return {
      isStrong: score >= 80,
      score,
      suggestions
    }
  }

  static async hashPassword(password: string): Promise<{
    hash: string
    salt: string
  }> {
    // In production, use bcrypt or argon2
    const salt = crypto.getRandomValues(new Uint8Array(32))
    const saltString = Array.from(salt, byte => byte.toString(16).padStart(2, '0')).join('')
    
    // This is a simplified example - use proper hashing in production
    const hash = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(password + saltString)
    )
    
    const hashArray = Array.from(new Uint8Array(hash))
    const hashString = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('')
    
    return {
      hash: hashString,
      salt: saltString
    }
  }
}

// GDPR and privacy compliance
export class PrivacyCompliance {
  static readonly PII_FIELDS = [
    'email', 'name', 'phone', 'address', 'ssn', 'passport',
    'creditCard', 'bankAccount', 'ipAddress', 'location'
  ]

  static isPII(fieldName: string): boolean {
    return this.PII_FIELDS.some(pii => 
      fieldName.toLowerCase().includes(pii.toLowerCase())
    )
  }

  static redactPII(data: any): any {
    if (typeof data !== 'object' || data === null) {
      return data
    }

    const redacted = { ...data }
    
    Object.keys(redacted).forEach(key => {
      if (this.isPII(key)) {
        redacted[key] = '***REDACTED***'
      } else if (typeof redacted[key] === 'object') {
        redacted[key] = this.redactPII(redacted[key])
      }
    })

    return redacted
  }

  static generateDataExportToken(): string {
    // Generate secure token for data exports
    const array = new Uint8Array(32)
    crypto.getRandomValues(array)
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
  }
}

// Request logging for security monitoring
export class SecurityLogger {
  static async logSecurityEvent(event: {
    type: string
    userId?: string
    ipAddress: string
    userAgent: string
    details: any
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
    riskScore: number
  }): Promise<void> {
    // Log to your security monitoring system
    console.log('Security Event:', {
      ...event,
      timestamp: new Date().toISOString(),
      details: PrivacyCompliance.redactPII(event.details)
    })

    // In production, also send to your security monitoring service
    // await sendToSecurityMonitoring(event)
  }

  static async logAdminAction(action: {
    adminId: string
    action: string
    resource: string
    resourceId?: string
    oldValues?: any
    newValues?: any
    ipAddress: string
    userAgent: string
  }): Promise<void> {
    // Comprehensive admin action logging
    console.log('Admin Action:', {
      ...action,
      timestamp: new Date().toISOString(),
      oldValues: action.oldValues ? PrivacyCompliance.redactPII(action.oldValues) : undefined,
      newValues: action.newValues ? PrivacyCompliance.redactPII(action.newValues) : undefined
    })

    // Store in database for audit trail
    // await prisma.adminAudit.create({ data: action })
  }
}
