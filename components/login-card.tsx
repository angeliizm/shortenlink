'use client'

import { useState, FormEvent } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'

export default function LoginCard() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Simulate API call
    setTimeout(() => {
      console.log('Login:', { email, password, rememberMe })
      setIsLoading(false)
    }, 1000)
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-white/95 backdrop-blur-sm border border-gray-100 rounded-xl shadow-xl shadow-blue-100/20 p-10">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
              disabled={isLoading}
              aria-label="Email address"
              aria-required="true"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              disabled={isLoading}
              aria-label="Password"
              aria-required="true"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="remember"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              disabled={isLoading}
              aria-label="Remember me"
            />
            <label 
              htmlFor="remember" 
              className="text-sm text-gray-600 cursor-pointer select-none hover:text-gray-800 transition-colors duration-200"
            >
              Remember me
            </label>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </Button>

          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600">
              Don't have an account?
            </p>
            <a 
              href="/register" 
              className="inline-block text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors duration-200"
              tabIndex={isLoading ? -1 : 0}
            >
              Sign Up
            </a>
          </div>
        </form>
      </div>
    </div>
  )
}