import { type NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const playerId = request.nextUrl.searchParams.get('playerId')

  if (!playerId) {
    return NextResponse.json({ error: 'missing playerId' }, { status: 400 })
  }

  const res = await fetch(
    `https://nbafantasy.nba.com/api/element-summary/${playerId}/`
  )
  const data = await res.json()

  return NextResponse.json(data)
}
