'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

const UNAUTHORIZED = 401
const TOO_MANY_REQUESTS = 429

export default function Login() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (res.status === UNAUTHORIZED) {
        throw new Error('Invalid credentials')
      }
      if (res.status === TOO_MANY_REQUESTS) {
        throw new Error('Too many attempts. Try again later.')
      }
      if (!res.ok) {
        throw new Error('Login is unavailable. Try again.')
      }

      router.push('/optimize') // Next.js router navigation
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="mx-auto mt-4 w-full max-w-md animate-fade-in md:mt-10">
      <CardHeader>
        <span aria-hidden="true" className="mb-2 block h-1 w-12 bg-signal" />
        <CardTitle className="font-display font-extrabold text-4xl leading-none tracking-tight">
          <h1>Login</h1>
        </CardTitle>
        <CardDescription>
          Enter your credentials to access your account
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              autoCapitalize="none"
              autoComplete="username"
              autoCorrect="off"
              disabled={isLoading}
              id="email"
              maxLength={254}
              name="email"
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              spellCheck={false}
              type="email"
              value={email}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Input
              autoComplete="current-password"
              disabled={isLoading}
              id="password"
              maxLength={256}
              name="password"
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              type="password"
              value={password}
            />
          </Field>
          {error && <FieldError>{error}</FieldError>}
        </CardContent>
        <CardFooter>
          <Button className="mt-8 w-full" disabled={isLoading} type="submit">
            {isLoading ? 'Logging in...' : 'Login'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
