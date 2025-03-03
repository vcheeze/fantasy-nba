import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

import { parseCookieString } from '@/lib/utils'

export async function POST(req: NextRequest) {
  if (req.method !== 'POST')
    return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 })

  const { email, password } = await req.json()

  const authRes = await fetch('https://nbafantasy.nba.com/api/player/login/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: '*/*',
      Origin: 'https://nbafantasy.nba.com',
      Referer: 'https://nbafantasy.nba.com/my-team',
      'User-Agent': req.headers.get('user-agent') || 'Mozilla/5.0',
    },
    body: JSON.stringify({ email, password }),
    credentials: 'include',
  })

  if (!authRes.ok)
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })

  const setCookies = authRes.headers.getSetCookie()
  if (!setCookies || setCookies.length === 0) {
    return NextResponse.json(
      { error: 'Authentication failed: No token received' },
      { status: 500 },
    )
  }

  const response = NextResponse.json({ success: true })
  const cookiesStore = await cookies()
  setCookies.forEach((cookieString) => {
    const parsedCookies = parseCookieString(cookieString)
    parsedCookies.forEach(({ name, value, options }) => {
      cookiesStore.set(name, value, options)
    })
  })

  return response
}
