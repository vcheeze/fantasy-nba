import { NextResponse } from 'next/server'

export async function GET() {
  const res = await fetch('https://nbafantasy.nba.com/api/entry/1')
  const data = await res.json()

  return NextResponse.json(data)
}
