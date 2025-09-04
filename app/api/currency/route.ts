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

    const response = await fetch(
      `https://api.exchangerate.host/convert?from=${from}&to=${to}&amount=${amount}`
    )
    
    if (!response.ok) {
      throw new Error('Failed to fetch exchange rate')
    }

    const data = await response.json()
    
    // Validate the response structure
    if (!data || typeof data.result === 'undefined') {
      console.error('Invalid response from currency API:', data)
      return NextResponse.json({
        result: amount,
        from,
        to,
        rate: 1
      })
    }
    
    return NextResponse.json({
      result: Math.round((data.result || amount) * 100) / 100,
      from: data.query?.from || from,
      to: data.query?.to || to,
      rate: data.info?.rate || 1
    })
  } catch (error) {
    console.error('Error fetching currency conversion:', error)
    return NextResponse.json(
      { error: 'Failed to convert currency' },
      { status: 500 }
    )
  }
}
