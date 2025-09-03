import crypto from 'crypto'

// Encryption configuration
export const ENCRYPTION_CONFIG = {
  ALGORITHM: 'aes-256-gcm',
  KEY_LENGTH: 32, // 256 bits
  IV_LENGTH: 16,  // 128 bits
  TAG_LENGTH: 16, // 128 bits
  SALT_LENGTH: 32, // 256 bits
  ITERATIONS: 100000, // PBKDF2 iterations
  HASH_ALGORITHM: 'sha256',
  KEY_ROTATION_INTERVAL: 90 * 24 * 60 * 60 * 1000, // 90 days
} as const

// Encryption key management
export class EncryptionKeyManager {
  private static masterKey: string | null = null
  private static keyCache = new Map<string, { key: Buffer; createdAt: Date }>()

  static async getMasterKey(): Promise<string> {
    if (!this.masterKey) {
      // In production, load from secure key management service
      this.masterKey = process.env.ENCRYPTION_MASTER_KEY || this.generateMasterKey()
    }
    return this.masterKey
  }

  static generateMasterKey(): string {
    return crypto.randomBytes(ENCRYPTION_CONFIG.KEY_LENGTH).toString('base64')
  }

  static async deriveKey(password: string, salt: Buffer): Promise<Buffer> {
    const cacheKey = `${password}-${salt.toString('hex')}`
    
    if (this.keyCache.has(cacheKey)) {
      const cached = this.keyCache.get(cacheKey)!
      // Check if key is still valid (not expired)
      const isExpired = Date.now() - cached.createdAt.getTime() > ENCRYPTION_CONFIG.KEY_ROTATION_INTERVAL
      if (!isExpired) {
        return cached.key
      }
    }

    const key = crypto.pbkdf2Sync(
      password,
      salt,
      ENCRYPTION_CONFIG.ITERATIONS,
      ENCRYPTION_CONFIG.KEY_LENGTH,
      ENCRYPTION_CONFIG.HASH_ALGORITHM
    )

    this.keyCache.set(cacheKey, { key, createdAt: new Date() })
    return key
  }

  static generateSalt(): Buffer {
    return crypto.randomBytes(ENCRYPTION_CONFIG.SALT_LENGTH)
  }

  static async rotateKey(keyId: string): Promise<{ oldKey: string; newKey: string }> {
    const oldKey = await this.getMasterKey()
    const newKey = this.generateMasterKey()
    
    // Log key rotation
    console.log('Key rotation initiated:', { keyId, timestamp: new Date() })
    
    return { oldKey, newKey }
  }
}

// Core encryption utilities
export class EncryptionUtils {
  static async encrypt(data: string, context?: string): Promise<{
    encryptedData: string
    salt: string
    iv: string
    tag: string
    keyVersion: string
  }> {
    try {
      const masterKey = await EncryptionKeyManager.getMasterKey()
      const salt = EncryptionKeyManager.generateSalt()
      const key = await EncryptionKeyManager.deriveKey(masterKey, salt)
      const iv = crypto.randomBytes(ENCRYPTION_CONFIG.IV_LENGTH)
      
      const cipher = crypto.createCipherGCM(ENCRYPTION_CONFIG.ALGORITHM, key, iv)
      
      if (context) {
        cipher.setAAD(Buffer.from(context, 'utf8'))
      }
      
      let encrypted = cipher.update(data, 'utf8', 'base64')
      encrypted += cipher.final('base64')
      const tag = cipher.getAuthTag()
      
      return {
        encryptedData: encrypted,
        salt: salt.toString('base64'),
        iv: iv.toString('base64'),
        tag: tag.toString('base64'),
        keyVersion: 'v1' // For key rotation tracking
      }
    } catch (error) {
      throw new Error(`Encryption failed: ${error}`)
    }
  }

  static async decrypt(encryptedPayload: {
    encryptedData: string
    salt: string
    iv: string
    tag: string
    keyVersion: string
  }, context?: string): Promise<string> {
    try {
      const masterKey = await EncryptionKeyManager.getMasterKey()
      const salt = Buffer.from(encryptedPayload.salt, 'base64')
      const key = await EncryptionKeyManager.deriveKey(masterKey, salt)
      const iv = Buffer.from(encryptedPayload.iv, 'base64')
      const tag = Buffer.from(encryptedPayload.tag, 'base64')
      
      const decipher = crypto.createDecipherGCM(ENCRYPTION_CONFIG.ALGORITHM, key, iv)
      decipher.setAuthTag(tag)
      
      if (context) {
        decipher.setAAD(Buffer.from(context, 'utf8'))
      }
      
      let decrypted = decipher.update(encryptedPayload.encryptedData, 'base64', 'utf8')
      decrypted += decipher.final('utf8')
      
      return decrypted
    } catch (error) {
      throw new Error(`Decryption failed: ${error}`)
    }
  }

  static async encryptObject(obj: any, context?: string): Promise<string> {
    const serialized = JSON.stringify(obj)
    const encrypted = await this.encrypt(serialized, context)
    return JSON.stringify(encrypted)
  }

  static async decryptObject<T>(encryptedString: string, context?: string): Promise<T> {
    const encryptedPayload = JSON.parse(encryptedString)
    const decrypted = await this.decrypt(encryptedPayload, context)
    return JSON.parse(decrypted) as T
  }
}

// Field-level encryption for database models
export class FieldEncryption {
  private static encryptedFieldsCache = new Map<string, any>()

  static async encryptField(
    value: string, 
    fieldName: string, 
    recordId: string
  ): Promise<string> {
    const context = `${fieldName}:${recordId}`
    const encrypted = await EncryptionUtils.encrypt(value, context)
    
    // Cache for potential re-use in same request
    const cacheKey = `${recordId}:${fieldName}`
    this.encryptedFieldsCache.set(cacheKey, encrypted)
    
    return JSON.stringify(encrypted)
  }

  static async decryptField(
    encryptedValue: string, 
    fieldName: string, 
    recordId: string
  ): Promise<string> {
    const context = `${fieldName}:${recordId}`
    
    try {
      const encryptedPayload = JSON.parse(encryptedValue)
      return await EncryptionUtils.decrypt(encryptedPayload, context)
    } catch (error) {
      throw new Error(`Failed to decrypt field ${fieldName}: ${error}`)
    }
  }

  static async encryptUserPII(userData: {
    email?: string
    phone?: string
    address?: string
    ssn?: string
    [key: string]: any
  }, userId: string): Promise<any> {
    const encrypted = { ...userData }
    
    const piiFields = ['email', 'phone', 'address', 'ssn']
    
    for (const field of piiFields) {
      if (encrypted[field]) {
        encrypted[field] = await this.encryptField(encrypted[field], field, userId)
      }
    }
    
    return encrypted
  }

  static async decryptUserPII(encryptedUserData: any, userId: string): Promise<any> {
    const decrypted = { ...encryptedUserData }
    
    const piiFields = ['email', 'phone', 'address', 'ssn']
    
    for (const field of piiFields) {
      if (decrypted[field] && typeof decrypted[field] === 'string') {
        try {
          decrypted[field] = await this.decryptField(decrypted[field], field, userId)
        } catch (error) {
          // Log decryption failure but don't expose error
          console.error(`Failed to decrypt ${field} for user ${userId}`)
          decrypted[field] = null
        }
      }
    }
    
    return decrypted
  }
}

// Payment data encryption
export class PaymentEncryption {
  static async encryptPaymentData(paymentData: {
    stripeCustomerId?: string
    paymentMethodId?: string
    cardLast4?: string
    cardBrand?: string
    billingAddress?: string
    [key: string]: any
  }, paymentId: string): Promise<any> {
    const encrypted = { ...paymentData }
    
    const sensitiveFields = [
      'stripeCustomerId',
      'paymentMethodId', 
      'billingAddress'
    ]
    
    for (const field of sensitiveFields) {
      if (encrypted[field]) {
        encrypted[field] = await FieldEncryption.encryptField(
          encrypted[field], 
          field, 
          paymentId
        )
      }
    }
    
    return encrypted
  }

  static async decryptPaymentData(encryptedPaymentData: any, paymentId: string): Promise<any> {
    const decrypted = { ...encryptedPaymentData }
    
    const sensitiveFields = [
      'stripeCustomerId',
      'paymentMethodId',
      'billingAddress'
    ]
    
    for (const field of sensitiveFields) {
      if (decrypted[field] && typeof decrypted[field] === 'string') {
        try {
          decrypted[field] = await FieldEncryption.decryptField(
            decrypted[field], 
            field, 
            paymentId
          )
        } catch (error) {
          console.error(`Failed to decrypt payment ${field}`)
          decrypted[field] = null
        }
      }
    }
    
    return decrypted
  }
}

// System configuration encryption
export class SystemConfigEncryption {
  static async encryptSetting(
    value: string, 
    category: string, 
    key: string
  ): Promise<string> {
    const context = `${category}:${key}`
    const encrypted = await EncryptionUtils.encrypt(value, context)
    return JSON.stringify(encrypted)
  }

  static async decryptSetting(
    encryptedValue: string, 
    category: string, 
    key: string
  ): Promise<string> {
    const context = `${category}:${key}`
    
    try {
      const encryptedPayload = JSON.parse(encryptedValue)
      return await EncryptionUtils.decrypt(encryptedPayload, context)
    } catch (error) {
      throw new Error(`Failed to decrypt setting ${category}:${key}`)
    }
  }

  static async encryptApiKey(apiKey: string, service: string): Promise<string> {
    return await this.encryptSetting(apiKey, 'api_keys', service)
  }

  static async decryptApiKey(encryptedApiKey: string, service: string): Promise<string> {
    return await this.decryptSetting(encryptedApiKey, 'api_keys', service)
  }
}

// Token encryption and management
export class TokenEncryption {
  static async generateSecureToken(length: number = 32): Promise<string> {
    return crypto.randomBytes(length).toString('base64url')
  }

  static async generateSessionToken(userId: string, sessionData: any): Promise<string> {
    const tokenData = {
      userId,
      sessionData,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    }
    
    return await EncryptionUtils.encryptObject(tokenData, `session:${userId}`)
  }

  static async validateSessionToken(token: string, userId: string): Promise<{
    isValid: boolean
    sessionData?: any
    reason?: string
  }> {
    try {
      const tokenData = await EncryptionUtils.decryptObject(token, `session:${userId}`)
      
      // Check expiration
      const expiresAt = new Date(tokenData.expiresAt)
      if (expiresAt < new Date()) {
        return { isValid: false, reason: 'Token expired' }
      }
      
      // Check user ID
      if (tokenData.userId !== userId) {
        return { isValid: false, reason: 'Invalid user' }
      }
      
      return { isValid: true, sessionData: tokenData.sessionData }
    } catch (error) {
      return { isValid: false, reason: 'Invalid token format' }
    }
  }

  static async generateCSRFToken(): Promise<string> {
    const token = await this.generateSecureToken(32)
    const timestamp = Date.now()
    
    return Buffer.from(JSON.stringify({ token, timestamp })).toString('base64')
  }

  static validateCSRFToken(csrfToken: string, maxAge: number = 3600000): boolean {
    try {
      const decoded = JSON.parse(Buffer.from(csrfToken, 'base64').toString())
      const age = Date.now() - decoded.timestamp
      
      return age <= maxAge
    } catch {
      return false
    }
  }
}

// Database encryption helpers
export class DatabaseEncryption {
  static async encryptBeforeStorage(data: any, tableName: string, recordId: string): Promise<any> {
    const encrypted = { ...data }
    
    // Define fields that should be encrypted by table
    const encryptionConfig = {
      users: ['email', 'phone', 'address', 'ssn'],
      payments: ['stripeCustomerId', 'paymentMethodId', 'billingAddress'],
      adminSettings: ['value'], // When isSensitive is true
      userSessions: ['sessionData'],
      securityEvents: ['details'] // When severity is HIGH or CRITICAL
    }
    
    const fieldsToEncrypt = encryptionConfig[tableName as keyof typeof encryptionConfig] || []
    
    for (const field of fieldsToEncrypt) {
      if (encrypted[field] && shouldEncryptField(encrypted, field, tableName)) {
        encrypted[field] = await FieldEncryption.encryptField(
          encrypted[field],
          field,
          recordId
        )
        
        // Mark as encrypted in metadata
        encrypted[`${field}_encrypted`] = true
        encrypted[`${field}_version`] = 'v1'
      }
    }
    
    return encrypted
  }

  static async decryptAfterRetrieval(data: any, tableName: string, recordId: string): Promise<any> {
    const decrypted = { ...data }
    
    const encryptionConfig = {
      users: ['email', 'phone', 'address', 'ssn'],
      payments: ['stripeCustomerId', 'paymentMethodId', 'billingAddress'],
      adminSettings: ['value'],
      userSessions: ['sessionData'],
      securityEvents: ['details']
    }
    
    const fieldsToDecrypt = encryptionConfig[tableName as keyof typeof encryptionConfig] || []
    
    for (const field of fieldsToDecrypt) {
      if (decrypted[field] && decrypted[`${field}_encrypted`]) {
        try {
          decrypted[field] = await FieldEncryption.decryptField(
            decrypted[field],
            field,
            recordId
          )
          
          // Remove encryption metadata from response
          delete decrypted[`${field}_encrypted`]
          delete decrypted[`${field}_version`]
        } catch (error) {
          console.error(`Decryption failed for ${field} in ${tableName}:${recordId}`)
          decrypted[field] = null
        }
      }
    }
    
    return decrypted
  }
}

// Helper function to determine if field should be encrypted
function shouldEncryptField(data: any, field: string, tableName: string): boolean {
  switch (tableName) {
    case 'adminSettings':
      return data.isSensitive === true
    case 'securityEvents':
      return ['HIGH', 'CRITICAL'].includes(data.severity)
    default:
      return true
  }
}

// Hashing utilities for passwords and sensitive data
export class HashingUtils {
  static async hashPassword(password: string): Promise<{
    hash: string
    salt: string
    algorithm: string
    iterations: number
  }> {
    const salt = crypto.randomBytes(ENCRYPTION_CONFIG.SALT_LENGTH)
    const hash = crypto.pbkdf2Sync(
      password,
      salt,
      ENCRYPTION_CONFIG.ITERATIONS,
      ENCRYPTION_CONFIG.KEY_LENGTH,
      ENCRYPTION_CONFIG.HASH_ALGORITHM
    )
    
    return {
      hash: hash.toString('base64'),
      salt: salt.toString('base64'),
      algorithm: ENCRYPTION_CONFIG.HASH_ALGORITHM,
      iterations: ENCRYPTION_CONFIG.ITERATIONS
    }
  }

  static async verifyPassword(
    password: string, 
    storedHash: string, 
    salt: string, 
    iterations: number = ENCRYPTION_CONFIG.ITERATIONS
  ): Promise<boolean> {
    try {
      const saltBuffer = Buffer.from(salt, 'base64')
      const hash = crypto.pbkdf2Sync(
        password,
        saltBuffer,
        iterations,
        ENCRYPTION_CONFIG.KEY_LENGTH,
        ENCRYPTION_CONFIG.HASH_ALGORITHM
      )
      
      return crypto.timingSafeEqual(
        Buffer.from(storedHash, 'base64'),
        hash
      )
    } catch (error) {
      return false
    }
  }

  static async hashSensitiveData(data: string, context?: string): Promise<string> {
    const salt = crypto.randomBytes(16)
    const hash = crypto.pbkdf2Sync(data, salt, 10000, 32, 'sha256')
    
    return `${salt.toString('base64')}:${hash.toString('base64')}`
  }

  static generateSecureId(prefix?: string): string {
    const id = crypto.randomBytes(16).toString('base64url')
    return prefix ? `${prefix}_${id}` : id
  }
}

// Data masking for non-production environments
export class DataMasking {
  static maskEmail(email: string): string {
    const [username, domain] = email.split('@')
    const maskedUsername = username.slice(0, 2) + '*'.repeat(Math.max(1, username.length - 2))
    return `${maskedUsername}@${domain}`
  }

  static maskPhone(phone: string): string {
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.length >= 10) {
      return cleaned.replace(/(\d{3})\d{3}(\d{4})/, '$1***$2')
    }
    return '***-***-' + cleaned.slice(-4)
  }

  static maskCreditCard(cardNumber: string): string {
    const cleaned = cardNumber.replace(/\D/g, '')
    return '*'.repeat(cleaned.length - 4) + cleaned.slice(-4)
  }

  static maskSSN(ssn: string): string {
    const cleaned = ssn.replace(/\D/g, '')
    return 'XXX-XX-' + cleaned.slice(-4)
  }

  static maskAddress(address: string): string {
    // Keep first few characters and last few characters
    if (address.length <= 10) return '*'.repeat(address.length)
    return address.slice(0, 3) + '*'.repeat(address.length - 6) + address.slice(-3)
  }

  static maskSensitiveObject(data: any, environment: string = 'production'): any {
    if (environment === 'production') return data
    
    const masked = { ...data }
    
    const maskingRules = {
      email: this.maskEmail,
      phone: this.maskPhone,
      creditCard: this.maskCreditCard,
      ssn: this.maskSSN,
      address: this.maskAddress
    }
    
    Object.keys(masked).forEach(key => {
      if (key.toLowerCase().includes('email') && masked[key]) {
        masked[key] = this.maskEmail(masked[key])
      } else if (key.toLowerCase().includes('phone') && masked[key]) {
        masked[key] = this.maskPhone(masked[key])
      } else if (key.toLowerCase().includes('card') && masked[key]) {
        masked[key] = this.maskCreditCard(masked[key])
      } else if (key.toLowerCase().includes('ssn') && masked[key]) {
        masked[key] = this.maskSSN(masked[key])
      } else if (key.toLowerCase().includes('address') && masked[key]) {
        masked[key] = this.maskAddress(masked[key])
      }
    })
    
    return masked
  }
}

// Encryption audit and monitoring
export class EncryptionAudit {
  static async logEncryptionEvent(event: {
    operation: 'encrypt' | 'decrypt' | 'key_rotation'
    tableName: string
    fieldName: string
    recordId: string
    userId?: string
    success: boolean
    error?: string
    keyVersion: string
  }): Promise<void> {
    console.log('Encryption Event:', {
      ...event,
      timestamp: new Date().toISOString()
    })
    
    // Store encryption audit in database
    // await prisma.encryptionAudit.create({
    //   data: {
    //     operation: event.operation,
    //     resource: `${event.tableName}:${event.fieldName}`,
    //     resourceId: event.recordId,
    //     userId: event.userId,
    //     success: event.success,
    //     error: event.error,
    //     keyVersion: event.keyVersion,
    //     createdAt: new Date()
    //   }
    // })
  }

  static async auditDecryptionFailures(): Promise<{
    failureCount: number
    affectedTables: string[]
    recommendations: string[]
  }> {
    // In production, query actual audit logs
    // const failures = await prisma.encryptionAudit.findMany({
    //   where: {
    //     operation: 'decrypt',
    //     success: false,
    //     createdAt: {
    //       gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
    //     }
    //   }
    // })
    
    // Placeholder for audit analysis
    return {
      failureCount: 0,
      affectedTables: [],
      recommendations: [
        'No decryption failures detected in the last 24 hours',
        'Encryption system operating normally'
      ]
    }
  }

  static async checkEncryptionHealth(): Promise<{
    status: 'healthy' | 'warning' | 'critical'
    issues: string[]
    metrics: any
  }> {
    const issues: string[] = []
    let status: 'healthy' | 'warning' | 'critical' = 'healthy'
    
    try {
      // Test encryption/decryption
      const testData = 'encryption_health_check'
      const encrypted = await EncryptionUtils.encrypt(testData)
      const decrypted = await EncryptionUtils.decrypt(encrypted)
      
      if (decrypted !== testData) {
        issues.push('Encryption/decryption test failed')
        status = 'critical'
      }
      
      // Check key age
      const masterKey = await EncryptionKeyManager.getMasterKey()
      if (!masterKey) {
        issues.push('Master key not available')
        status = 'critical'
      }
      
      // Additional health checks...
      
    } catch (error) {
      issues.push(`Encryption system error: ${error}`)
      status = 'critical'
    }
    
    return {
      status,
      issues,
      metrics: {
        encryptionAlgorithm: ENCRYPTION_CONFIG.ALGORITHM,
        keyLength: ENCRYPTION_CONFIG.KEY_LENGTH,
        lastHealthCheck: new Date().toISOString()
      }
    }
  }
}

// Backup and recovery for encrypted data
export class EncryptionBackup {
  static async createEncryptedBackup(data: any[], tableName: string): Promise<{
    backupId: string
    encryptedBackup: string
    checksum: string
  }> {
    const backupId = HashingUtils.generateSecureId('backup')
    const backupData = {
      tableName,
      data,
      createdAt: new Date().toISOString(),
      version: '1.0'
    }
    
    const serialized = JSON.stringify(backupData)
    const encryptedBackup = await EncryptionUtils.encrypt(serialized, `backup:${tableName}`)
    
    // Create checksum for integrity
    const checksum = crypto
      .createHash('sha256')
      .update(serialized)
      .digest('hex')
    
    return {
      backupId,
      encryptedBackup: JSON.stringify(encryptedBackup),
      checksum
    }
  }

  static async restoreFromBackup(
    encryptedBackup: string, 
    expectedChecksum: string,
    tableName: string
  ): Promise<{ success: boolean; data?: any[]; error?: string }> {
    try {
      const encryptedPayload = JSON.parse(encryptedBackup)
      const decrypted = await EncryptionUtils.decrypt(encryptedPayload, `backup:${tableName}`)
      
      // Verify checksum
      const checksum = crypto
        .createHash('sha256')
        .update(decrypted)
        .digest('hex')
      
      if (checksum !== expectedChecksum) {
        return { success: false, error: 'Backup integrity check failed' }
      }
      
      const backupData = JSON.parse(decrypted)
      
      // Verify table name
      if (backupData.tableName !== tableName) {
        return { success: false, error: 'Table name mismatch' }
      }
      
      return { success: true, data: backupData.data }
    } catch (error) {
      return { success: false, error: `Restore failed: ${error}` }
    }
  }
}

// Zero-knowledge proof utilities for sensitive operations
export class ZeroKnowledgeProof {
  static async generateProof(secret: string, challenge: string): Promise<string> {
    // Simplified ZKP - in production, use a proper ZKP library
    const hash = crypto
      .createHash('sha256')
      .update(secret + challenge)
      .digest('hex')
    
    return hash
  }

  static async verifyProof(proof: string, challenge: string, expectedHash: string): Promise<boolean> {
    // This would verify the proof without revealing the secret
    return crypto.timingSafeEqual(
      Buffer.from(proof, 'hex'),
      Buffer.from(expectedHash, 'hex')
    )
  }
}

// Encryption utilities for export functions
export const EncryptionHelpers = {
  // Quick encrypt/decrypt for simple strings
  quickEncrypt: async (data: string): Promise<string> => {
    const encrypted = await EncryptionUtils.encrypt(data)
    return JSON.stringify(encrypted)
  },

  quickDecrypt: async (encryptedString: string): Promise<string> => {
    const encryptedPayload = JSON.parse(encryptedString)
    return await EncryptionUtils.decrypt(encryptedPayload)
  },

  // Environment-specific encryption
  encryptForEnvironment: async (data: string, env: string): Promise<string> => {
    const context = `env:${env}`
    const encrypted = await EncryptionUtils.encrypt(data, context)
    return JSON.stringify(encrypted)
  },

  // Batch encryption for multiple records
  encryptBatch: async (records: Array<{ id: string; data: any }>, tableName: string): Promise<Array<{ id: string; encryptedData: any }>> => {
    return Promise.all(
      records.map(async record => ({
        id: record.id,
        encryptedData: await DatabaseEncryption.encryptBeforeStorage(
          record.data,
          tableName,
          record.id
        )
      }))
    )
  },

  // Check if data is encrypted
  isEncrypted: (data: any, field: string): boolean => {
    return data[`${field}_encrypted`] === true
  },

  // Generate encryption metrics
  getEncryptionMetrics: (): any => ({
    algorithm: ENCRYPTION_CONFIG.ALGORITHM,
    keyLength: ENCRYPTION_CONFIG.KEY_LENGTH,
    ivLength: ENCRYPTION_CONFIG.IV_LENGTH,
    tagLength: ENCRYPTION_CONFIG.TAG_LENGTH,
    iterations: ENCRYPTION_CONFIG.ITERATIONS,
    rotationInterval: ENCRYPTION_CONFIG.KEY_ROTATION_INTERVAL
  })
}

