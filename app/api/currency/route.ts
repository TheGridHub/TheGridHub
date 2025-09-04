import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const from = searchParams.get('from') || 'USD'
    const to = searchParams.get('to') || 'USD'
    const amount = parseFloat(searchParams.get('amount') || '1')

    if (from === to) {
      return NextResponse.json({
        result: amount,
        from,
        to,
        rate: 1
      })
    }

    // Using exchangerate-api.com which provides free tier without API key
    const response = await fetch(
      `https://api.exchangerate-api.com/v4/latest/${from}`
    )
    
    if (!response.ok) {
      throw new Error('Failed to fetch exchange rate')
    }

    const data = await response.json()
    
    // Validate the response structure
    if (!data || !data.rates || !data.rates[to]) {
      console.error('Invalid response from currency API or currency not found:', data)
      return NextResponse.json({
        result: amount,
        from,
        to,
        rate: 1
      })
    }
    
    const rate = data.rates[to]
    const result = amount * rate
    
    return NextResponse.json({
      result: Math.round(result * 100) / 100,
      from,
      to,
      rate: Math.round(rate * 10000) / 10000
    })
  } catch (error) {
    console.error('Error fetching currency conversion:', error)
    return NextResponse.json(
      { error: 'Failed to convert currency' },
      { status: 500 }
    )
  }
}
