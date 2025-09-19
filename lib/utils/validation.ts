/**
 * Validation utilities for form validation and data validation
 */

// Email validation
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validateEmail(email: string): string | null {
  if (!email) return 'Email is required'
  if (!isValidEmail(email)) return 'Please enter a valid email address'
  return null
}

// Password validation
export function validatePassword(password: string): string | null {
  if (!password) return 'Password is required'
  if (password.length < 8) return 'Password must be at least 8 characters long'
  if (!/(?=.*[a-z])/.test(password)) return 'Password must contain at least one lowercase letter'
  if (!/(?=.*[A-Z])/.test(password)) return 'Password must contain at least one uppercase letter'
  if (!/(?=.*\d)/.test(password)) return 'Password must contain at least one number'
  if (!/(?=.*[@$!%*?&])/.test(password)) return 'Password must contain at least one special character (@$!%*?&)'
  return null
}

export function validateConfirmPassword(password: string, confirmPassword: string): string | null {
  if (!confirmPassword) return 'Please confirm your password'
  if (password !== confirmPassword) return 'Passwords do not match'
  return null
}

// Name validation
export function validateName(name: string, fieldName: string = 'Name'): string | null {
  if (!name?.trim()) return `${fieldName} is required`
  if (name.trim().length < 2) return `${fieldName} must be at least 2 characters long`
  if (name.trim().length > 50) return `${fieldName} must be less than 50 characters long`
  return null
}

export function validateFullName(fullName: string): string | null {
  return validateName(fullName, 'Full name')
}

// Phone validation
export function isValidPhoneNumber(phone: string): boolean {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '')
  // Accept 10-digit US numbers or international numbers with country code
  return digits.length >= 10 && digits.length <= 15
}

export function validatePhoneNumber(phone: string): string | null {
  if (!phone) return null // Phone is optional in most cases
  if (!isValidPhoneNumber(phone)) return 'Please enter a valid phone number'
  return null
}

// URL validation
export function isValidUrl(url: string): boolean {
  try {
    new URL(url.startsWith('http') ? url : `https://${url}`)
    return true
  } catch {
    return false
  }
}

export function validateUrl(url: string, fieldName: string = 'URL'): string | null {
  if (!url) return null // URL is optional in most cases
  if (!isValidUrl(url)) return `Please enter a valid ${fieldName}`
  return null
}

export function validateWebsite(url: string): string | null {
  return validateUrl(url, 'website URL')
}

// Required field validation
export function validateRequired(value: any, fieldName: string): string | null {
  if (value === null || value === undefined || value === '') {
    return `${fieldName} is required`
  }
  if (typeof value === 'string' && !value.trim()) {
    return `${fieldName} is required`
  }
  if (Array.isArray(value) && value.length === 0) {
    return `${fieldName} is required`
  }
  return null
}

// Length validation
export function validateLength(
  value: string, 
  min: number, 
  max: number, 
  fieldName: string
): string | null {
  if (!value) return null
  
  if (value.length < min) {
    return `${fieldName} must be at least ${min} characters long`
  }
  if (value.length > max) {
    return `${fieldName} must be less than ${max} characters long`
  }
  return null
}

export function validateMinLength(value: string, min: number, fieldName: string): string | null {
  if (!value) return null
  if (value.length < min) {
    return `${fieldName} must be at least ${min} characters long`
  }
  return null
}

export function validateMaxLength(value: string, max: number, fieldName: string): string | null {
  if (!value) return null
  if (value.length > max) {
    return `${fieldName} must be less than ${max} characters long`
  }
  return null
}

// Number validation
export function validateNumber(value: any, fieldName: string): string | null {
  if (value === null || value === undefined || value === '') return null
  
  const num = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(num)) {
    return `${fieldName} must be a valid number`
  }
  return null
}

export function validatePositiveNumber(value: any, fieldName: string): string | null {
  const numberError = validateNumber(value, fieldName)
  if (numberError) return numberError
  
  if (value !== null && value !== undefined && value !== '') {
    const num = typeof value === 'string' ? parseFloat(value) : value
    if (num <= 0) {
      return `${fieldName} must be a positive number`
    }
  }
  return null
}

export function validateRange(
  value: any, 
  min: number, 
  max: number, 
  fieldName: string
): string | null {
  const numberError = validateNumber(value, fieldName)
  if (numberError) return numberError
  
  if (value !== null && value !== undefined && value !== '') {
    const num = typeof value === 'string' ? parseFloat(value) : value
    if (num < min || num > max) {
      return `${fieldName} must be between ${min} and ${max}`
    }
  }
  return null
}

// Date validation
export function validateDate(dateString: string, fieldName: string): string | null {
  if (!dateString) return null
  
  const date = new Date(dateString)
  if (isNaN(date.getTime())) {
    return `${fieldName} must be a valid date`
  }
  return null
}

export function validateFutureDate(dateString: string, fieldName: string): string | null {
  const dateError = validateDate(dateString, fieldName)
  if (dateError) return dateError
  
  if (dateString) {
    const date = new Date(dateString)
    const today = new Date()
    today.setHours(0, 0, 0, 0) // Reset time to beginning of day
    
    if (date < today) {
      return `${fieldName} must be in the future`
    }
  }
  return null
}

export function validateDateRange(
  startDate: string, 
  endDate: string,
  startFieldName: string = 'Start date',
  endFieldName: string = 'End date'
): { startDate: string | null; endDate: string | null } {
  const startError = validateDate(startDate, startFieldName)
  const endError = validateDate(endDate, endFieldName)
  
  if (startError || endError) {
    return { startDate: startError, endDate: endError }
  }
  
  if (startDate && endDate) {
    const start = new Date(startDate)
    const end = new Date(endDate)
    
    if (start >= end) {
      return {
        startDate: `${startFieldName} must be before ${endFieldName.toLowerCase()}`,
        endDate: null
      }
    }
  }
  
  return { startDate: null, endDate: null }
}

// Array validation
export function validateArrayNotEmpty(arr: any[], fieldName: string): string | null {
  if (!Array.isArray(arr) || arr.length === 0) {
    return `At least one ${fieldName} is required`
  }
  return null
}

export function validateArrayLength(
  arr: any[], 
  min: number, 
  max: number, 
  fieldName: string
): string | null {
  if (!Array.isArray(arr)) return `${fieldName} must be a list`
  
  if (arr.length < min) {
    return `At least ${min} ${fieldName}${min > 1 ? 's' : ''} required`
  }
  if (arr.length > max) {
    return `Maximum ${max} ${fieldName}${max > 1 ? 's' : ''} allowed`
  }
  return null
}

// Composite validation functions
export function validateContactForm(data: {
  name?: string
  email?: string
  phone?: string
  company?: string
  message?: string
}) {
  const errors: Record<string, string> = {}
  
  const nameError = validateRequired(data.name, 'Name')
  if (nameError) errors.name = nameError
  
  if (data.email) {
    const emailError = validateEmail(data.email)
    if (emailError) errors.email = emailError
  }
  
  if (data.phone) {
    const phoneError = validatePhoneNumber(data.phone)
    if (phoneError) errors.phone = phoneError
  }
  
  return Object.keys(errors).length > 0 ? errors : null
}

export function validateProjectForm(data: {
  name?: string
  description?: string
  startDate?: string
  endDate?: string
  budget?: number
}) {
  const errors: Record<string, string> = {}
  
  const nameError = validateRequired(data.name, 'Project name')
  if (nameError) errors.name = nameError
  
  if (data.description) {
    const descError = validateMaxLength(data.description, 500, 'Description')
    if (descError) errors.description = descError
  }
  
  if (data.startDate || data.endDate) {
    const dateErrors = validateDateRange(data.startDate || '', data.endDate || '')
    if (dateErrors.startDate) errors.startDate = dateErrors.startDate
    if (dateErrors.endDate) errors.endDate = dateErrors.endDate
  }
  
  if (data.budget !== undefined && data.budget !== null) {
    const budgetError = validatePositiveNumber(data.budget, 'Budget')
    if (budgetError) errors.budget = budgetError
  }
  
  return Object.keys(errors).length > 0 ? errors : null
}

export function validateTaskForm(data: {
  title?: string
  description?: string
  dueDate?: string
  estimatedHours?: number
}) {
  const errors: Record<string, string> = {}
  
  const titleError = validateRequired(data.title, 'Task title')
  if (titleError) errors.title = titleError
  
  if (data.description) {
    const descError = validateMaxLength(data.description, 1000, 'Description')
    if (descError) errors.description = descError
  }
  
  if (data.dueDate) {
    const dueDateError = validateDate(data.dueDate, 'Due date')
    if (dueDateError) errors.dueDate = dueDateError
  }
  
  if (data.estimatedHours !== undefined && data.estimatedHours !== null) {
    const hoursError = validatePositiveNumber(data.estimatedHours, 'Estimated hours')
    if (hoursError) errors.estimatedHours = hoursError
  }
  
  return Object.keys(errors).length > 0 ? errors : null
}

// Utility function to check if form has errors
export function hasValidationErrors(errors: Record<string, string> | null): boolean {
  return errors !== null && Object.keys(errors).length > 0
}

// Utility function to get first error message
export function getFirstError(errors: Record<string, string> | null): string | null {
  if (!errors || Object.keys(errors).length === 0) return null
  return Object.values(errors)[0]
}
