import { cookies } from 'next/headers'
import { type NextRequest, NextResponse } from 'next/server'

const BAD_REQUEST = 400
const UNAUTHORIZED = 401
const FORBIDDEN = 403
const BAD_GATEWAY = 502
const REQUEST_TIMEOUT_MS = 10_000

const APP_COOKIES = new Set(['fingerprint', 'teamId'])
const COOKIE_NAME = /^[\w.-]+$/
const TEAM_ID = /^\d{1,12}$/
const UNSAFE_COOKIE_VALUE = /[\r\n;]/

function isForwardableCookie(cookie: { name: string; value: string }) {
  return (
    !APP_COOKIES.has(cookie.name) &&
    COOKIE_NAME.test(cookie.name) &&
    !UNSAFE_COOKIE_VALUE.test(cookie.value)
  )
}

export async function GET(request: NextRequest) {
  const teamId = request.nextUrl.searchParams.get('teamId')
  if (!(teamId && TEAM_ID.test(teamId))) {
    return NextResponse.json(
      { error: 'Invalid team id' },
      { status: BAD_REQUEST }
    )
  }

  const cookieStore = await cookies()
  if (!cookieStore.get('sessionid')?.value) {
    return NextResponse.json(
      { error: 'Not authenticated' },
      { status: UNAUTHORIZED }
    )
  }

  const cookieHeader = cookieStore
    .getAll()
    .filter(isForwardableCookie)
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join('; ')

  try {
    const res = await fetch(
      `https://nbafantasy.nba.com/api/my-team/${teamId}`,
      {
        headers: {
          Accept: 'application/json',
          Cookie: cookieHeader,
        },
        cache: 'no-store',
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      }
    )

    if (res.status === UNAUTHORIZED || res.status === FORBIDDEN) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: UNAUTHORIZED }
      )
    }
    if (!res.ok) {
      return NextResponse.json(
        { error: 'Failed to load team' },
        { status: BAD_GATEWAY }
      )
    }

    return NextResponse.json(await res.json())
  } catch {
    return NextResponse.json(
      { error: 'Failed to load team' },
      { status: BAD_GATEWAY }
    )
  }
}
