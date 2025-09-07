'use client'

import { useState } from 'react'
import SignInForm from './sign-in-form'
import SignUpForm from './sign-up-form'

export default function AuthCard() {
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin')

  return (
    <div className="w-full">
      {/* Mobile App Name */}
      <div className="lg:hidden text-center mb-8">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-purple-600 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
            ShortenLink
          </h1>
        </div>
      </div>
      
      {/* Welcome Text */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {activeTab === 'signin' ? 'Welcome back' : 'Create your account'}
        </h2>
        <p className="text-gray-600 text-sm">
          {activeTab === 'signin' 
            ? 'Enter your credentials to access your dashboard' 
            : 'Start creating powerful short links in seconds'}
        </p>
      </div>
      
      {/* Tab Switcher */}
      <div className="flex p-1 bg-gradient-to-r from-violet-100 to-purple-100 rounded-xl mb-6">
        <button
          onClick={() => setActiveTab('signin')}
          className={cn(
            "flex-1 py-2.5 px-4 text-sm font-semibold rounded-lg transition-all duration-200",
            activeTab === 'signin'
              ? "bg-white text-violet-600 shadow-md"
              : "text-gray-600 hover:text-violet-600"
          )}
          aria-selected={activeTab === 'signin'}
          role="tab"
        >
          Sign in
        </button>
        <button
          onClick={() => setActiveTab('signup')}
          className={cn(
            "flex-1 py-2.5 px-4 text-sm font-semibold rounded-lg transition-all duration-200",
            activeTab === 'signup'
              ? "bg-white text-violet-600 shadow-md"
              : "text-gray-600 hover:text-violet-600"
          )}
          aria-selected={activeTab === 'signup'}
          role="tab"
        >
          Sign up
        </button>
      </div>

      {/* Form Content */}
      <div>
        {activeTab === 'signin' ? <SignInForm /> : <SignUpForm />}
      </div>
    </div>
  )
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}