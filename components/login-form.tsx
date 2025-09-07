'use client'

import { useState, FormEvent } from 'react'
import { useAuth } from '@/stores/auth-store'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string; api?: string }>({})
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()

  const validateForm = (): boolean => {
    const newErrors: { email?: string; password?: string } = {}
    
    if (!email) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email'
    }
    
    if (!password) {
      newErrors.password = 'Password is required'
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setIsLoading(true)
    setErrors({})
    
    try {
      await login(email, password)
      // Navigation is handled by the auth store
      // Keep loading state true as we're redirecting
    } catch (error) {
      setErrors({ 
        api: error instanceof Error ? error.message : 'Login failed. Please try again.' 
      })
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-xl border border-blue-100/50 shadow-xl shadow-blue-500/5 p-8 sm:p-10">
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          {/* Email Field */}
          <div className="space-y-2">
            <label 
              htmlFor="email" 
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (errors.email) setErrors({ ...errors, email: undefined })
              }}
              className={`
                w-full px-4 py-2.5 
                bg-white border rounded-lg
                text-gray-900 placeholder-gray-400
                transition-all duration-200
                ${errors.email 
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
                  : 'border-gray-200 hover:border-gray-300 focus:border-blue-500 focus:ring-blue-500/20'
                }
                focus:outline-none focus:ring-4
                disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50
              `}
              placeholder="name@example.com"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'email-error' : undefined}
              disabled={isLoading}
              required
            />
            {errors.email && (
              <p id="email-error" className="text-sm text-red-600 mt-1">
                {errors.email}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <label 
              htmlFor="password" 
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                if (errors.password) setErrors({ ...errors, password: undefined })
              }}
              className={`
                w-full px-4 py-2.5 
                bg-white border rounded-lg
                text-gray-900 placeholder-gray-400
                transition-all duration-200
                ${errors.password 
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
                  : 'border-gray-200 hover:border-gray-300 focus:border-blue-500 focus:ring-blue-500/20'
                }
                focus:outline-none focus:ring-4
                disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50
              `}
              placeholder="Enter your password"
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? 'password-error' : undefined}
              disabled={isLoading}
              required
            />
            {errors.password && (
              <p id="password-error" className="text-sm text-red-600 mt-1">
                {errors.password}
              </p>
            )}
          </div>

          {/* Remember Me */}
          <div className="flex items-center">
            <input
              id="remember"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="
                w-4 h-4 
                text-blue-600 bg-white border-gray-300 rounded
                focus:ring-4 focus:ring-blue-500/20 focus:ring-offset-0
                transition-all duration-200
                disabled:opacity-50 disabled:cursor-not-allowed
              "
              disabled={isLoading}
            />
            <label 
              htmlFor="remember" 
              className="ml-2 text-sm text-gray-600 select-none cursor-pointer hover:text-gray-800 transition-colors duration-200"
            >
              Remember me
            </label>
          </div>

          {/* API Error */}
          {errors.api && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{errors.api}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="
              w-full px-4 py-2.5
              bg-blue-600 hover:bg-blue-700 active:bg-blue-800
              text-white font-medium rounded-lg
              shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/30
              transform transition-all duration-200
              hover:-translate-y-0.5 active:translate-y-0
              focus:outline-none focus:ring-4 focus:ring-blue-500/20
              disabled:opacity-50 disabled:cursor-not-allowed 
              disabled:hover:bg-blue-600 disabled:hover:translate-y-0 disabled:shadow-lg
            "
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Signing in...
              </span>
            ) : (
              'Sign in'
            )}
          </button>

          {/* Sign Up Link */}
          <div className="text-center pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <a 
                href="/register" 
                className="font-medium text-blue-600 hover:text-blue-700 transition-colors duration-200"
                tabIndex={isLoading ? -1 : 0}
              >
                Sign Up
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}