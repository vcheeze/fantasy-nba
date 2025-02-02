import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const phase = request.nextUrl.searchParams.get('phase')

  const res = await fetch(
    `https://nbafantasy.nba.com/api/fixtures/${phase ? `?phase=${phase}` : ''}`,
  )
  const data = await res.json()

  return NextResponse.json(data)
}
