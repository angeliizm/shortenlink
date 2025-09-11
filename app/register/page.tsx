'use client'

import { Suspense } from 'react'
import dynamic from 'next/dynamic'

// Dynamically import SignUpForm with no SSR
const SignUpForm = dynamic(() => import('@/components/auth/sign-up-form'), {
  ssr: false,
  loading: () => <div>Yükleniyor...</div>
})

export default function RegisterPage() {
  return (
    <div className="relative min-h-screen bg-gradient-radial overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-[-200px] left-[-200px] w-[600px] h-[600px] bg-blob-1 rounded-full opacity-60" />
      <div className="absolute bottom-[-150px] right-[-150px] w-[500px] h-[500px] bg-blob-2 rounded-full opacity-50" />
      
      {/* Subtle noise overlay */}
      <div className="absolute inset-0 bg-noise opacity-50" />
      
      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <Suspense fallback={<div>Yükleniyor...</div>}>
          <SignUpForm />
        </Suspense>
      </div>
    </div>
  )
}