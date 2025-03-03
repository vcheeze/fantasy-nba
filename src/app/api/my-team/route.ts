import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const teamId = searchParams.get('teamId')

  const cookieStore = await cookies()
  const allCookies = cookieStore.getAll()

  // Join all cookies into proper Cookie header format
  const cookieHeader = allCookies
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join('; ')

  const res = await fetch(`https://nbafantasy.nba.com/api/my-team/${teamId}`, {
    credentials: 'include',
    headers: {
      Cookie: cookieHeader,
    },
  })
  const data = await res.json()

  return NextResponse.json(data)
}
