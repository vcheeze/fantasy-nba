import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface CookieDetails {
  name: string
  value: string
  options?: {
    expires?: Date
    maxAge?: number
    path?: string
    sameSite?: boolean | 'lax' | 'strict' | 'none' | undefined
    httpOnly?: boolean
  }
}

/**
 * Parses a cookie string and extracts individual cookies with their values and options
 */
export function parseCookieString(cookieString: string): CookieDetails[] {
  return cookieString
    .split(';')
    .reduce((cookies: CookieDetails[], part: string, index) => {
      part = part.trim()

      // First part contains the name=value pair
      if (index === 0) {
        const [name, value] = part.split('=')
        cookies.push({ name, value, options: {} })
        return cookies
      }

      // Handle cookie options
      const [optionName, optionValue] = part.split('=').map((s) => s.trim())
      const currentCookie = cookies[cookies.length - 1]

      switch (optionName.toLowerCase()) {
        case 'expires':
          currentCookie.options!.expires = new Date(optionValue)
          break
        case 'max-age':
          currentCookie.options!.maxAge = parseInt(optionValue)
          break
        case 'path':
          currentCookie.options!.path = optionValue
          break
        case 'samesite':
          currentCookie.options!.sameSite = optionValue as
            | 'Strict'
            | 'Lax'
            | 'None'
          break
        case 'httponly':
          currentCookie.options!.httpOnly = true
          break
      }

      return cookies
    }, [])
}
