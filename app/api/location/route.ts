import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    // Get user's IP from headers (when deployed on Vercel)
    const response = await fetch('https://ipapi.co/json/', {
      headers: {
        'User-Agent': 'TaskVault/1.0'
      }
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch location data')
    }

    const data = await response.json()
    
    return NextResponse.json({
      country: data.country_name,
      countryCode: data.country_code,
      currency: data.currency,
      timezone: data.timezone,
      city: data.city,
      region: data.region
    })
  } catch (error) {
    console.error('Error fetching location:', error)
    
    // Return default US location on error
    return NextResponse.json({
      country: 'United States',
      countryCode: 'US',
      currency: 'USD',
      timezone: 'America/New_York',
      city: 'New York',
      region: 'New York'
    })
  }
}