/**
 * Format utilities for dates, numbers, currencies, and other common formatting needs
 */

// Date formatting
export function formatDate(date: Date | string | null, options?: Intl.DateTimeFormatOptions): string {
  if (!date) return ''
  
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  if (isNaN(dateObj.getTime())) return ''
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }
  
  return dateObj.toLocaleDateString('en-US', options || defaultOptions)
}

export function formatDateTime(date: Date | string | null, options?: Intl.DateTimeFormatOptions): string {
  if (!date) return ''
  
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  if (isNaN(dateObj.getTime())) return ''
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }
  
  return dateObj.toLocaleDateString('en-US', options || defaultOptions)
}

export function formatTime(date: Date | string | null, options?: Intl.DateTimeFormatOptions): string {
  if (!date) return ''
  
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  if (isNaN(dateObj.getTime())) return ''
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
  }
  
  return dateObj.toLocaleTimeString('en-US', options || defaultOptions)
}

export function formatRelativeTime(date: Date | string | null): string {
  if (!date) return ''
  
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  if (isNaN(dateObj.getTime())) return ''
  
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000)
  
  if (diffInSeconds < 60) return 'Just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)}mo ago`
  return `${Math.floor(diffInSeconds / 31536000)}y ago`
}

export function formatDateRange(startDate: Date | string | null, endDate: Date | string | null): string {
  if (!startDate && !endDate) return ''
  if (!startDate) return `Until ${formatDate(endDate)}`
  if (!endDate) return `From ${formatDate(startDate)}`
  
  const start = formatDate(startDate)
  const end = formatDate(endDate)
  
  return `${start} - ${end}`
}

// Number formatting
export function formatNumber(num: number | null | undefined, options?: Intl.NumberFormatOptions): string {
  if (num == null || isNaN(num)) return '0'
  
  return num.toLocaleString('en-US', options)
}

export function formatPercent(num: number | null | undefined, decimals: number = 1): string {
  if (num == null || isNaN(num)) return '0%'
  
  return `${num.toFixed(decimals)}%`
}

export function formatBytes(bytes: number | null | undefined, decimals: number = 2): string {
  if (!bytes || bytes === 0) return '0 B'
  
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB']
  
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

export function formatFileSize(size: number | null | undefined): string {
  return formatBytes(size)
}

// Currency formatting
export function formatCurrency(
  amount: number | null | undefined, 
  currency: string = 'USD',
  options?: Intl.NumberFormatOptions
): string {
  if (amount == null || isNaN(amount)) return formatCurrency(0, currency, options)
  
  const defaultOptions: Intl.NumberFormatOptions = {
    style: 'currency',
    currency,
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }
  
  return amount.toLocaleString('en-US', { ...defaultOptions, ...options })
}

export function formatPrice(price: number | null | undefined, currency: string = 'USD'): string {
  return formatCurrency(price, currency)
}

// Duration formatting
export function formatDuration(minutes: number | null | undefined): string {
  if (!minutes || minutes === 0) return '0m'
  
  if (minutes < 60) return `${minutes}m`
  
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  
  if (remainingMinutes === 0) return `${hours}h`
  
  return `${hours}h ${remainingMinutes}m`
}

export function formatHours(hours: number | null | undefined, decimals: number = 1): string {
  if (!hours || hours === 0) return '0h'
  
  return `${hours.toFixed(decimals)}h`
}

// Text formatting
export function formatInitials(name: string | null | undefined): string {
  if (!name) return '??'
  
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('')
}

export function formatName(firstName?: string | null, lastName?: string | null): string {
  if (!firstName && !lastName) return 'Anonymous'
  if (!firstName) return lastName || 'Anonymous'
  if (!lastName) return firstName
  
  return `${firstName} ${lastName}`
}

export function formatPhoneNumber(phone: string | null | undefined): string {
  if (!phone) return ''
  
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '')
  
  // Format as (XXX) XXX-XXXX for US phone numbers
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
  }
  
  // For international numbers, just return the original
  return phone
}

export function truncateText(text: string | null | undefined, maxLength: number = 50): string {
  if (!text) return ''
  
  if (text.length <= maxLength) return text
  
  return text.slice(0, maxLength) + '...'
}

export function formatList(items: string[], maxItems: number = 3): string {
  if (items.length === 0) return ''
  if (items.length === 1) return items[0]
  if (items.length <= maxItems) {
    return items.slice(0, -1).join(', ') + ' and ' + items[items.length - 1]
  }
  
  const visibleItems = items.slice(0, maxItems)
  const remainingCount = items.length - maxItems
  
  return visibleItems.join(', ') + ` and ${remainingCount} more`
}

// Status formatting
export function formatStatus(status: string | null | undefined): string {
  if (!status) return ''
  
  return status
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

export function formatPriority(priority: string | null | undefined): string {
  if (!priority) return 'Normal'
  
  const priorityMap: Record<string, string> = {
    low: 'Low',
    medium: 'Medium', 
    high: 'High',
    urgent: 'Urgent',
    critical: 'Critical'
  }
  
  return priorityMap[priority.toLowerCase()] || priority
}

// URL formatting
export function formatUrl(url: string | null | undefined): string {
  if (!url) return ''
  
  // Add protocol if missing
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `https://${url}`
  }
  
  return url
}

export function formatDomain(url: string | null | undefined): string {
  if (!url) return ''
  
  try {
    const urlObj = new URL(formatUrl(url))
    return urlObj.hostname.replace('www.', '')
  } catch {
    return url
  }
}
