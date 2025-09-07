'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    
    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    
    // Stub - no actual registration
    setError('Registration is not implemented in this demo')
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-neutral-50">
      <a 
        href="#" 
        className="absolute top-4 right-4 text-sm text-neutral-500 hover:text-neutral-700 transition-colors"
      >
        Privacy
      </a>
      <Card className="w-full max-w-sm rounded-2xl shadow-sm border bg-white">
        <CardHeader className="space-y-1">
          <div className="text-2xl font-semibold text-center mb-2">ShortenLink</div>
          <CardTitle className="text-xl">Create account</CardTitle>
          <CardDescription>Enter your details to get started</CardDescription>
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
                minLength={8}
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
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
            <Button type="submit" className="w-full h-10">
              Sign up
            </Button>
          </form>
          <div className="mt-4 text-center text-sm text-neutral-600">
            Already have an account?{' '}
            <Link href="/" className="text-neutral-900 hover:underline">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}