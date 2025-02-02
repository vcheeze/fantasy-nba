import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const teamId = searchParams.get("teamId")
  const res = await fetch(`https://nbafantasy.nba.com/api/entry/${teamId}`)
  const data = await res.json()

  return NextResponse.json(data)
}
