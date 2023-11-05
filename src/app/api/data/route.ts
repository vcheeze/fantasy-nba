import { NextRequest, NextResponse } from "next/server"

export async function GET() {
  const res = await fetch("https://nbafantasy.nba.com/api/bootstrap-static")
  const data = await res.json()

  return NextResponse.json(data)
}
