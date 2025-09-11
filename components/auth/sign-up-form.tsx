'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { createClient } from '@/lib/supabase/client'

interface FormErrors {
  email?: string
  password?: string
  confirmPassword?: string
  terms?: string
  form?: string
}

export default function SignUpForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}
    
    // Email validation
    if (!email) {
      newErrors.email = 'E-posta adresi gerekli'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Lütfen geçerli bir e-posta adresi girin'
    }
    
    // Password validation
    if (!password) {
      newErrors.password = 'Şifre gerekli'
    } else if (password.length < 8) {
      newErrors.password = 'Şifre en az 8 karakter olmalı'
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      newErrors.password = 'Şifre büyük harf, küçük harf ve rakam içermeli'
    }
    
    // Confirm password validation
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Lütfen şifrenizi onaylayın'
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Şifreler eşleşmiyor'
    }
    
    // Terms validation
    if (!acceptTerms) {
      newErrors.terms = 'Kullanım şartlarını kabul etmelisiniz'
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
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) {
        setErrors({ form: error.message })
        setIsLoading(false)
      } else if (data.user) {
        setIsSuccess(true)
        // User might need to confirm email depending on Supabase settings
        if (data.session) {
          setTimeout(() => {
            router.push('/dashboard')
            router.refresh()
          }, 500)
        }
      }
    } catch (err) {
      setErrors({ form: 'Bir hata oluştu. Lütfen tekrar deneyin.' })
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl border border-blue-100/50 shadow-xl shadow-blue-500/5 p-8 sm:p-10 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg 
              className="w-8 h-8 text-green-600" 
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
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Hesap başarıyla oluşturuldu</h1>
          <p className="text-gray-600 mb-6">Hesabınızı onaylamak için e-postanızı kontrol edin</p>
          <a
            href="/"
            className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
          >
            Giriş Sayfasına Dön
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-xl border border-blue-100/50 shadow-xl shadow-blue-500/5 p-8 sm:p-10">
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
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
            <label 
              htmlFor="signup-email" 
              className="block text-sm font-medium text-gray-700"
            >
              E-posta Adresi
            </label>
            <input
              id="signup-email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (errors.email) {
                  setErrors({ ...errors, email: undefined })
                }
              }}
              placeholder="ornek@email.com"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'signup-email-error' : undefined}
              disabled={isLoading}
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
              required
            />
            {errors.email && (
              <p id="signup-email-error" className="text-sm text-red-600 mt-1" role="alert">
                {errors.email}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <label 
              htmlFor="signup-password" 
              className="block text-sm font-medium text-gray-700"
            >
              Şifre
            </label>
            <input
              id="signup-password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                if (errors.password) {
                  setErrors({ ...errors, password: undefined })
                }
              }}
              placeholder="En az 8 karakter"
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? 'signup-password-error' : undefined}
              disabled={isLoading}
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
              required
            />
            {errors.password && (
              <p id="signup-password-error" className="text-sm text-red-600 mt-1" role="alert">
                {errors.password}
              </p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div className="space-y-2">
            <label 
              htmlFor="confirm-password" 
              className="block text-sm font-medium text-gray-700"
            >
              Şifre Onayı
            </label>
            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value)
                if (errors.confirmPassword) {
                  setErrors({ ...errors, confirmPassword: undefined })
                }
              }}
              placeholder="Şifrenizi tekrar girin"
              aria-invalid={!!errors.confirmPassword}
              aria-describedby={errors.confirmPassword ? 'confirm-password-error' : undefined}
              disabled={isLoading}
              className={`
                w-full px-4 py-2.5 
                bg-white border rounded-lg
                text-gray-900 placeholder-gray-400
                transition-all duration-200
                ${errors.confirmPassword 
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
                  : 'border-gray-200 hover:border-gray-300 focus:border-blue-500 focus:ring-blue-500/20'
                }
                focus:outline-none focus:ring-4
                disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50
              `}
              required
            />
            {errors.confirmPassword && (
              <p id="confirm-password-error" className="text-sm text-red-600 mt-1" role="alert">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {/* Terms and Conditions */}
          <div>
            <div className="flex items-start">
              <input
                id="terms"
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => {
                  setAcceptTerms(e.target.checked)
                  if (errors.terms) {
                    setErrors({ ...errors, terms: undefined })
                  }
                }}
                disabled={isLoading}
                aria-invalid={!!errors.terms}
                className="
                  w-4 h-4 mt-0.5
                  text-blue-600 bg-white border-gray-300 rounded
                  focus:ring-4 focus:ring-blue-500/20 focus:ring-offset-0
                  transition-all duration-200
                  disabled:opacity-50 disabled:cursor-not-allowed
                "
              />
              <label htmlFor="terms" className="ml-2 text-sm text-gray-600 select-none cursor-pointer hover:text-gray-800 transition-colors duration-200">
                {' '}
                <a href="/terms" className="text-blue-600 hover:text-blue-700 font-medium">
                  Kullanım Şartları
                </a>
                {' '}ve{' '}
                <a href="/privacy" className="text-blue-600 hover:text-blue-700 font-medium">
                  Gizlilik Politikası
                </a>
                {' '}nı kabul ediyorum
              </label>
            </div>
            {errors.terms && (
              <p className="mt-1 text-sm text-red-600" role="alert">
                {errors.terms}
              </p>
            )}
          </div>

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
                Hesap oluşturuluyor...
              </span>
            ) : (
              'Hesap Oluştur'
            )}
          </button>

          {/* Sign In Link */}
          <div className="text-center pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-600">
              Zaten hesabınız var mı?{' '}
              <a 
                href="/" 
                className="font-medium text-blue-600 hover:text-blue-700 transition-colors duration-200"
                tabIndex={isLoading ? -1 : 0}
              >
                Giriş Yap
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}