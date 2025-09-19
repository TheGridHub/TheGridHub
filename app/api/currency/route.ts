import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const from = url.searchParams.get('from') || 'USD'
    const to = url.searchParams.get('to') || 'USD'
    const amount = Number(url.searchParams.get('amount') || '0')

    const apiUrl = `https://api.exchangerate.host/convert?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&amount=${encodeURIComponent(String(amount))}`
    const res = await fetch(apiUrl, { next: { revalidate: 60 * 60 } }) // cache 1h
    if (!res.ok) return NextResponse.json({ error: 'conversion_failed' }, { status: 502 })
    const data = await res.json()
    return NextResponse.json({
      success: true,
      query: { from, to, amount },
      result: data.result,
      info: data.info || null
    })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'conversion_failed' }, { status: 500 })
  }
}

