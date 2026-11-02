import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export type CookieDetails = {
  name: string
  value: string
  expires?: Date
  maxAge?: number
}

function readCookieExpiry(attributes: string[]) {
  let expires: Date | undefined
  let maxAge: number | undefined

  for (const attribute of attributes) {
    const separator = attribute.indexOf('=')
    if (separator === -1) {
      continue
    }

    const name = attribute.slice(0, separator).trim().toLowerCase()
    const value = attribute.slice(separator + 1).trim()

    if (name === 'expires') {
      const date = new Date(value)
      if (!Number.isNaN(date.getTime())) {
        expires = date
      }
    }

    if (name === 'max-age') {
      const parsed = Number.parseInt(value, 10)
      if (Number.isFinite(parsed) && parsed >= 0) {
        maxAge = parsed
      }
    }
  }

  return { expires, maxAge }
}

/** Parses one Set-Cookie header into a name, value, and expiry. */
export function parseCookieString(cookieString: string): CookieDetails[] {
  const parts = cookieString
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean)
  const first = parts[0]
  if (!first) {
    return []
  }

  const separator = first.indexOf('=')
  if (separator <= 0) {
    return []
  }

  const { expires, maxAge } = readCookieExpiry(parts.slice(1))
  return [
    {
      name: first.slice(0, separator).trim(),
      value: first.slice(separator + 1).trim(),
      expires,
      maxAge,
    },
  ]
}
