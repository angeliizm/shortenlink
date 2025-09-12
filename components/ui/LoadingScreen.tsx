'use client'

interface LoadingScreenProps {
  message?: string
  className?: string
}

export default function LoadingScreen({ 
  message = "Yükleniyor...", 
  className = "" 
}: LoadingScreenProps) {
  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center ${className}`}>
      <div className="flex flex-col items-center justify-center text-center">
        <div className="relative mb-4">
          <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent rounded-full animate-ping border-t-blue-400"></div>
        </div>
        <p className="text-gray-600 font-medium text-center">{message}</p>
      </div>
    </div>
  )
}
