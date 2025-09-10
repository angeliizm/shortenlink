import dynamic from 'next/dynamic'

// Dynamically import LoginForm to avoid SSR issues
const LoginForm = dynamic(() => import('@/components/login-form'), {
  ssr: false,
  loading: () => (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-xl border border-blue-100/50 shadow-xl shadow-blue-500/5 p-8 sm:p-10">
        <div className="animate-pulse space-y-6">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-10 bg-blue-200 rounded"></div>
        </div>
      </div>
    </div>
  )
})

export default function HomePage() {
  return (
    <div className="relative min-h-screen bg-gradient-radial overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-[-200px] left-[-200px] w-[600px] h-[600px] bg-blob-1 rounded-full opacity-60" />
      <div className="absolute bottom-[-150px] right-[-150px] w-[500px] h-[500px] bg-blob-2 rounded-full opacity-50" />
      
      {/* Subtle noise overlay */}
      <div className="absolute inset-0 bg-noise opacity-50" />
      
      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <LoginForm />
      </div>
    </div>
  )
}