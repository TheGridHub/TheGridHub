'use client'

import { useState, useEffect } from 'react'
import { Globe, ChevronDown } from 'lucide-react'
import { 
  getUserLocation, 
  convertPrice, 
  getSupportedCurrencies, 
  formatPrice,
  type LocationData 
} from '@/lib/location-currency'

interface CurrencyConverterProps {
  basePrices: {
    personal: number
    pro: number
    enterprise: number
  }
  onCurrencyChange?: (currency: string) => void
}

export default function CurrencyConverter({ basePrices, onCurrencyChange }: CurrencyConverterProps) {
  const [userLocation, setUserLocation] = useState<LocationData | null>(null)
  const [selectedCurrency, setSelectedCurrency] = useState('USD')
  const [convertedPrices, setConvertedPrices] = useState(basePrices)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const supportedCurrencies = getSupportedCurrencies()

  // Auto-detect user location and currency
  useEffect(() => {
    async function detectUserLocation() {
      setIsLoading(true)
      try {
        const location = await getUserLocation()
        if (location) {
          setUserLocation(location)
          setSelectedCurrency(location.currency)
        }
      } catch (error) {
        console.error('Failed to detect location:', error)
      } finally {
        setIsLoading(false)
      }
    }

    detectUserLocation()
  }, [])

  // Convert prices when currency changes
  useEffect(() => {
    async function convertPrices() {
      if (selectedCurrency === 'USD') {
        setConvertedPrices(basePrices)
        return
      }

      try {
        const [personalConverted, proConverted, enterpriseConverted] = await Promise.all([
          convertPrice(basePrices.personal, 'USD', selectedCurrency),
          convertPrice(basePrices.pro, 'USD', selectedCurrency),
          convertPrice(basePrices.enterprise, 'USD', selectedCurrency)
        ])

        setConvertedPrices({
          personal: personalConverted?.amount || basePrices.personal,
          pro: proConverted?.amount || basePrices.pro,
          enterprise: enterpriseConverted?.amount || basePrices.enterprise
        })
      } catch (error) {
        console.error('Failed to convert prices:', error)
        setConvertedPrices(basePrices)
      }
    }

    if (selectedCurrency) {
      convertPrices()
      onCurrencyChange?.(selectedCurrency)
    }
  }, [selectedCurrency, basePrices, onCurrencyChange])

  const handleCurrencyChange = (currencyCode: string) => {
    setSelectedCurrency(currencyCode)
    setIsDropdownOpen(false)
  }

  const selectedCurrencyData = supportedCurrencies.find(c => c.code === selectedCurrency)

  return (
    <div className="relative">
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        disabled={isLoading}
      >
        <Globe className="w-4 h-4 text-gray-500" />
        {isLoading ? (
          <span className="text-sm text-gray-500">Detecting...</span>
        ) : (
          <>
            <span className="text-sm font-medium">
              {selectedCurrencyData?.symbol} {selectedCurrency}
            </span>
            {userLocation && (
              <span className="text-xs text-gray-500">
                {userLocation.country}
              </span>
            )}
          </>
        )}
        <ChevronDown className="w-4 h-4 text-gray-400" />
      </button>

      {isDropdownOpen && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
          <div className="p-2">
            <div className="text-xs font-medium text-gray-500 mb-2 px-2">
              Select Currency
            </div>
            {supportedCurrencies.map((currency) => (
              <button
                key={currency.code}
                onClick={() => handleCurrencyChange(currency.code)}
                className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-md hover:bg-gray-100 transition-colors ${
                  selectedCurrency === currency.code ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="font-medium">{currency.symbol}</span>
                  <div>
                    <div className="font-medium">{currency.code}</div>
                    <div className="text-xs text-gray-500">{currency.name}</div>
                  </div>
                </div>
                {selectedCurrency === currency.code && (
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                )}
              </button>
            ))}
          </div>
          
          {userLocation && (
            <div className="border-t border-gray-200 p-2">
              <div className="text-xs text-gray-500 px-2">
                Auto-detected from {userLocation.city}, {userLocation.country}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Price Display Helper Component */}
      <PriceDisplay 
        prices={convertedPrices}
        currency={selectedCurrency}
      />
    </div>
  )
}

// Helper component to display converted prices
interface PriceDisplayProps {
  prices: {
    personal: number
    pro: number
    enterprise: number
  }
  currency: string
}

function PriceDisplay({ prices, currency }: PriceDisplayProps) {
  return (
    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
      <div className="text-sm font-medium text-gray-700 mb-2">
        Current Pricing in {currency}:
      </div>
      <div className="grid grid-cols-3 gap-2 text-sm">
        <div>
          <div className="text-gray-500">Personal</div>
          <div className="font-medium">
            {formatPrice(prices.personal, currency)}
          </div>
        </div>
        <div>
          <div className="text-gray-500">Pro</div>
          <div className="font-medium text-blue-600">
            {formatPrice(prices.pro, currency)}/mo
          </div>
        </div>
        <div>
          <div className="text-gray-500">Enterprise</div>
          <div className="font-medium">
            {formatPrice(prices.enterprise, currency)}/mo
          </div>
        </div>
      </div>
    </div>
  )
}