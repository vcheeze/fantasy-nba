import { createHash } from 'node:crypto'

import { cookies } from 'next/headers'
import { type NextRequest, NextResponse } from 'next/server'

import { consumeRateLimit } from '@/lib/rate-limit'
import { type CookieDetails, parseCookieString } from '@/lib/utils'

const BAD_REQUEST = 400
const UNAUTHORIZED = 401
const FORBIDDEN = 403
const TOO_MANY_REQUESTS = 429
const SERVER_ERROR = 500
const BAD_GATEWAY = 502

const EMAIL_MAX = 254
const PASSWORD_MAX = 256
const USER_AGENT_MAX = 512
const WINDOW_MINUTES = 15
const SECONDS_PER_MINUTE = 60
const MS_PER_SECOND = 1000
const WINDOW_MS = WINDOW_MINUTES * SECONDS_PER_MINUTE * MS_PER_SECOND
const IP_LIMIT = 20
const ACCOUNT_LIMIT = 8
const REQUEST_TIMEOUT_MS = 10_000
const COOKIE_NAME = /^[\w.-]+$/
const LINE_BREAK = /[\r\n]/

function clientIp(req: NextRequest) {
  const forwarded = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  return forwarded || req.headers.get('x-real-ip') || 'unknown'
}

function isCrossSite(req: NextRequest) {
  const fetchSite = req.headers.get('sec-fetch-site')
  if (fetchSite && fetchSite !== 'same-origin' && fetchSite !== 'none') {
    return true
  }

  const origin = req.headers.get('origin')
  return Boolean(origin && origin !== req.nextUrl.origin)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function readCredentials(body: unknown) {
  if (!isRecord(body)) {
    return null
  }

  const { email, password } = body
  if (typeof email !== 'string' || typeof password !== 'string') {
    return null
  }

  const trimmedEmail = email.trim()
  if (
    !trimmedEmail ||
    trimmedEmail.length > EMAIL_MAX ||
    LINE_BREAK.test(trimmedEmail)
  ) {
    return null
  }
  if (!password || password.length > PASSWORD_MAX) {
    return null
  }

  return { email: trimmedEmail, password }
}

function accountKey(email: string) {
  return createHash('sha256').update(email.toLowerCase()).digest('hex')
}

function errorResponse(error: string, status: number, retryAfterSec?: number) {
  if (retryAfterSec === undefined) {
    return NextResponse.json({ error }, { status })
  }

  return NextResponse.json(
    { error },
    {
      status,
      headers: { 'Retry-After': String(retryAfterSec) },
    }
  )
}

async function readJson(req: NextRequest) {
  try {
    return { ok: true as const, body: (await req.json()) as unknown }
  } catch {
    return { ok: false as const }
  }
}

function loginWithNba(
  credentials: { email: string; password: string },
  userAgent: string
) {
  return fetch('https://nbafantasy.nba.com/api/player/login/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Origin: 'https://nbafantasy.nba.com',
      Referer: 'https://nbafantasy.nba.com/my-team',
      'User-Agent': userAgent,
    },
    body: JSON.stringify(credentials),
    cache: 'no-store',
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  })
}

function sessionCookieOptions(cookie: CookieDetails) {
  const options: {
    httpOnly: true
    secure: boolean
    sameSite: 'lax'
    path: '/'
    expires?: Date
    maxAge?: number
  } = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  }

  if (cookie.expires) {
    options.expires = cookie.expires
  }
  if (typeof cookie.maxAge === 'number') {
    options.maxAge = cookie.maxAge
  }

  return options
}

async function storeSession(parsedCookies: CookieDetails[]) {
  const cookiesStore = await cookies()
  for (const cookie of parsedCookies) {
    cookiesStore.set(cookie.name, cookie.value, sessionCookieOptions(cookie))
  }
}

async function completeLogin(authRes: Response) {
  if (authRes.status === TOO_MANY_REQUESTS) {
    return errorResponse(
      'Too many attempts. Try again later.',
      TOO_MANY_REQUESTS
    )
  }

  if (
    authRes.status === BAD_REQUEST ||
    authRes.status === UNAUTHORIZED ||
    authRes.status === FORBIDDEN
  ) {
    return errorResponse('Invalid credentials', UNAUTHORIZED)
  }

  if (!authRes.ok) {
    return errorResponse('Login is unavailable. Try again.', BAD_GATEWAY)
  }

  const parsedCookies = authRes.headers
    .getSetCookie()
    .flatMap((cookieString) => parseCookieString(cookieString))
    .filter(({ name, value }) => COOKIE_NAME.test(name) && value.length > 0)

  if (!parsedCookies.some(({ name }) => name === 'sessionid')) {
    return errorResponse('Authentication failed', SERVER_ERROR)
  }

  await storeSession(parsedCookies)
  return NextResponse.json({ success: true })
}

export async function POST(req: NextRequest) {
  if (isCrossSite(req)) {
    return errorResponse('Forbidden', FORBIDDEN)
  }

  const ipLimit = consumeRateLimit(
    `login:ip:${clientIp(req)}`,
    IP_LIMIT,
    WINDOW_MS
  )
  if (!ipLimit.ok) {
    return errorResponse(
      'Too many attempts. Try again later.',
      TOO_MANY_REQUESTS,
      ipLimit.retryAfterSec
    )
  }

  const parsed = await readJson(req)
  if (!parsed.ok) {
    return errorResponse('Invalid request', BAD_REQUEST)
  }

  const credentials = readCredentials(parsed.body)
  if (!credentials) {
    return errorResponse('Invalid request', BAD_REQUEST)
  }

  const accountLimit = consumeRateLimit(
    `login:account:${accountKey(credentials.email)}`,
    ACCOUNT_LIMIT,
    WINDOW_MS
  )
  if (!accountLimit.ok) {
    return errorResponse(
      'Too many attempts. Try again later.',
      TOO_MANY_REQUESTS,
      accountLimit.retryAfterSec
    )
  }

  const userAgent =
    req.headers.get('user-agent')?.slice(0, USER_AGENT_MAX) || 'Mozilla/5.0'

  try {
    const authRes = await loginWithNba(credentials, userAgent)
    return await completeLogin(authRes)
  } catch {
    return errorResponse('Login is unavailable. Try again.', BAD_GATEWAY)
  }
}
