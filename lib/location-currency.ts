// Free location and currency utilities
// Uses ip-api.com (free, no API key required) for location
// Uses exchangerate.host (free, no API key required) for currency

export interface LocationData {
  country: string
  countryCode: string
  currency: string
  timezone: string
  city: string
  region: string
}

export interface CurrencyRate {
  code: string
  rate: number
  symbol: string
}

export interface CurrencyData {
  [key: string]: number
}

// Get user location based on IP (completely free)
export async function getUserLocation(): Promise<LocationData | null> {
  try {
    // Using ipapi.co which is free and supports HTTPS
    const response = await fetch('https://ipapi.co/json/', {
      method: 'GET',
    })
    
    if (response.ok) {
      const data = await response.json()
      return {
        country: data.country_name,
        countryCode: data.country_code,
        currency: data.currency,
        timezone: data.timezone,
        city: data.city,
        region: data.region
      }
    }
  } catch (error) {
    console.error('Error fetching location:', error)
  }
  
  // Fallback to US if location detection fails
  return {
    country: 'United States',
    countryCode: 'US',
    currency: 'USD',
    timezone: 'America/New_York',
    city: 'New York',
    region: 'New York'
  }
}

// Get currency exchange rates (completely free)
export async function getCurrencyRates(baseCurrency = 'USD'): Promise<CurrencyData | null> {
  try {
    const response = await fetch(`https://api.exchangerate.host/latest?base=${baseCurrency}`)
    
    if (response.ok) {
      const data = await response.json()
      return data.rates
    }
  } catch (error) {
    console.error('Error fetching currency rates:', error)
  }
  
  return null
}

// Convert price to user's local currency
export async function convertPrice(
  amount: number, 
  fromCurrency: string, 
  toCurrency: string
): Promise<{ amount: number; currency: string; symbol: string } | null> {
  try {
    const response = await fetch(
      `/api/currency?from=${fromCurrency}&to=${toCurrency}&amount=${amount}`
    )
    
    if (response.ok) {
      const data = await response.json()
      return {
        amount: data.result,
        currency: toCurrency,
        symbol: getCurrencySymbol(toCurrency)
      }
    }
  } catch (error) {
    console.error('Error converting currency:', error)
  }
  
  return null
}

// Get currency symbol for display
export function getCurrencySymbol(currency: string): string {
  const symbols: { [key: string]: string } = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    AUD: 'A$',
    CAD: 'C$',
    CHF: 'Fr',
    CNY: '¥',
    SEK: 'kr',
    NZD: 'NZ$',
    MXN: '$',
    SGD: 'S$',
    HKD: 'HK$',
    NOK: 'kr',
    ZAR: 'R',
    TRY: '₺',
    RUB: '₽',
    INR: '₹',
    BRL: 'R$',
    KRW: '₩'
  }
  
  return symbols[currency] || currency
}

// Format price with currency symbol
export function formatPrice(amount: number, currency: string): string {
  const symbol = getCurrencySymbol(currency)
  
  // Some currencies display symbol after amount
  const symbolAfter = ['SEK', 'NOK', 'TRY']
  
  if (symbolAfter.includes(currency)) {
    return `${amount} ${symbol}`
  }
  
  return `${symbol}${amount}`
}

// Get supported currencies list
export function getSupportedCurrencies(): Array<{ code: string; name: string; symbol: string }> {
  return [
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
    { code: 'CHF', name: 'Swiss Franc', symbol: 'Fr' },
    { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
    { code: 'SEK', name: 'Swedish Krona', symbol: 'kr' },
    { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$' },
    { code: 'MXN', name: 'Mexican Peso', symbol: '$' },
    { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
    { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$' },
    { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr' },
    { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
    { code: 'TRY', name: 'Turkish Lira', symbol: '₺' },
    { code: 'RUB', name: 'Russian Ruble', symbol: '₽' },
    { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
    { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
    { code: 'KRW', name: 'South Korean Won', symbol: '₩' }
  ]
}
