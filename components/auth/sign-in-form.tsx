'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { createClient } from '@/lib/supabase/client'
import SSOButtons from './sso-buttons'

interface FormErrors {
  email?: string
  password?: string
  form?: string
}

export default function SignInForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}
    
    // Email validation
    if (!email) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email'
    }
    
    // Password validation
    if (!password) {
      newErrors.password = 'Password is required'
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
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
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setErrors({ form: error.message })
        setIsLoading(false)
      } else if (data.user) {
        setIsSuccess(true)
        // Small delay for success animation
        setTimeout(() => {
          router.push('/dashboard')
          router.refresh()
        }, 500)
      }
    } catch (err) {
      setErrors({ form: 'An error occurred. Please try again.' })
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="text-center py-8">
        <div className="mb-4">
          <svg 
            className="w-16 h-16 mx-auto" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M5 13l4 4L19 7" 
            />
          </svg>
        </div>
        <p className="text-lg font-medium">Successfully signed in</p>
        <p className="text-sm text-gray-600 mt-2">Redirecting...</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Form-level error */}
      {errors.form && (
        <div 
          role="alert" 
          aria-live="assertive"
          className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg"
        >
          {errors.form}
        </div>
      )}

      {/* Email Field */}
      <div className="space-y-2">
        <Label 
          htmlFor="email" 
          className="text-sm font-medium text-gray-700"
        >
          Email address
        </Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            if (errors.email) {
              setErrors({ ...errors, email: undefined })
            }
          }}
          placeholder="name@example.com"
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? 'email-error' : undefined}
          disabled={isLoading}
          className={`h-11 px-4 border-2 ${errors.email ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-violet-500'} rounded-lg focus:outline-none transition-colors bg-gray-50 focus:bg-white`}
        />
        {errors.email && (
          <p id="email-error" className="text-xs text-red-500 mt-1" role="alert">
            {errors.email}
          </p>
        )}
      </div>

      {/* Password Field */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label 
            htmlFor="password" 
            className="text-sm font-medium text-gray-700"
          >
            Password
          </Label>
          <a 
            href="/forgot-password" 
            className="text-xs text-violet-600 hover:text-violet-700 font-medium transition-colors"
            tabIndex={isLoading ? -1 : 0}
          >
            Forgot password?
          </a>
        </div>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value)
            if (errors.password) {
              setErrors({ ...errors, password: undefined })
            }
          }}
          placeholder="Enter your password"
          aria-invalid={!!errors.password}
          aria-describedby={errors.password ? 'password-error' : undefined}
          disabled={isLoading}
          className={`h-11 px-4 border-2 ${errors.password ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-violet-500'} rounded-lg focus:outline-none transition-colors bg-gray-50 focus:bg-white`}
        />
        {errors.password && (
          <p id="password-error" className="text-xs text-red-500 mt-1" role="alert">
            {errors.password}
          </p>
        )}
      </div>

      {/* Remember Me */}
      <div className="flex items-center">
        <input
          id="remember-me"
          type="checkbox"
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.target.checked)}
          disabled={isLoading}
          className="w-4 h-4 border-gray-300 rounded text-violet-600 focus:ring-violet-500"
          aria-label="Remember me"
        />
        <label htmlFor="remember-me" className="ml-2 text-sm text-gray-600">
          Keep me signed in
        </label>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full h-11 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold rounded-lg hover:from-violet-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] shadow-lg"
      >
        {isLoading ? (
          <span className="flex items-center justify-center">
            <svg 
              className="animate-spin -ml-1 mr-2 h-4 w-4" 
              fill="none" 
              viewBox="0 0 24 24"
            >
              <circle 
                className="opacity-25" 
                cx="12" 
                cy="12" 
                r="10" 
                stroke="currentColor" 
                strokeWidth="4"
              />
              <path 
                className="opacity-75" 
                fill="currentColor" 
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Signing in...
          </span>
        ) : (
          'Sign in'
        )}
      </button>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200"></div>
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="px-3 bg-white/80 text-gray-500 uppercase tracking-wider">Or continue with</span>
        </div>
      </div>

      {/* SSO Buttons */}
      <SSOButtons disabled={isLoading} />
    </form>
  )
}