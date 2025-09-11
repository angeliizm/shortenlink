'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Home } from 'lucide-react'

interface PageHeaderProps {
  title: string
  subtitle?: string
  icon: React.ReactNode
  showBackButton?: boolean
  backUrl?: string
  backLabel?: string
  rightContent?: React.ReactNode
}

export default function PageHeader({
  title,
  subtitle,
  icon,
  showBackButton = true,
  backUrl = '/dashboard',
  backLabel = 'Dashboard',
  rightContent
}: PageHeaderProps) {
  const router = useRouter()

  const handleBack = () => {
    router.push(backUrl)
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <div className="flex items-center space-x-4">
            {showBackButton && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleBack}
                className="flex items-center gap-2 bg-white/50 backdrop-blur-sm border-gray-200 hover:bg-white/70 hover:border-gray-300 transition-all duration-200"
              >
                <ArrowLeft className="w-4 h-4" />
                {backLabel}
              </Button>
            )}
            
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                {icon}
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  {title}
                </h1>
                {subtitle && (
                  <p className="text-xs text-gray-500">{subtitle}</p>
                )}
              </div>
            </div>
          </div>
          
          {rightContent && (
            <div className="flex items-center space-x-3">
              {rightContent}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
