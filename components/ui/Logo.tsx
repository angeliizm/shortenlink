'use client'

import Image from 'next/image'
import { Globe } from 'lucide-react'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  avatarUrl?: string
  className?: string
}

export default function Logo({ 
  size = 'md', 
  showText = true, 
  avatarUrl,
  className = '' 
}: LogoProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10'
  }

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className={`${sizeClasses[size]} bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-sm`}>
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt="Logo"
            width={size === 'sm' ? 24 : size === 'md' ? 32 : 40}
            height={size === 'sm' ? 24 : size === 'md' ? 32 : 40}
            className="rounded-lg object-cover"
          />
        ) : (
          <Globe className={`${size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-5 h-5' : 'w-6 h-6'} text-white`} />
        )}
      </div>
      {showText && (
        <h1 className={`${textSizeClasses[size]} font-bold text-gray-900`}>
          Linkfy.
        </h1>
      )}
    </div>
  )
}

