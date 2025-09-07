'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function LoginCard() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      })

      if (response.ok) {
        router.push('/dashboard')
      } else {
        const data = await response.json().catch(() => ({}))
        setError(data.error || 'Invalid email or password')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-sm rounded-2xl shadow-sm border bg-white">
      <CardHeader className="space-y-1">
        <div className="text-2xl font-semibold text-center mb-2">ShortenLink</div>
        <CardTitle className="text-xl">Sign in</CardTitle>
        <CardDescription>Access your dashboard</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              className="h-10"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              className="h-10"
            />
          </div>
          {error && (
            <div 
              className="text-red-600 text-sm"
              role="alert"
              aria-live="polite"
            >
              {error}
            </div>
          )}
          <Button 
            type="submit" 
            className="w-full h-10"
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Login'}
          </Button>
        </form>
        <div className="mt-4 text-center text-sm text-neutral-600">
          Don't have an account?{' '}
          <Link href="/register" className="text-neutral-900 hover:underline">
            Sign up
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}