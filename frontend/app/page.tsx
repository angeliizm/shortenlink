import { redirect } from 'next/navigation'
import LoginCard from '@/components/login-card'
import { cookies } from 'next/headers'

async function checkAuth() {
  try {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get('access')
    
    if (!accessToken) return false
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'}/me`, {
      headers: {
        'Authorization': `Bearer ${accessToken.value}`,
      },
      cache: 'no-store',
    })
    
    if (response.ok) return true
    
    // Try refresh
    const refreshResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Cookie': cookieStore.toString(),
      },
      cache: 'no-store',
    })
    
    return refreshResponse.ok
  } catch {
    return false
  }
}

export default async function HomePage() {
  const isAuthenticated = await checkAuth()
  
  if (isAuthenticated) {
    redirect('/dashboard')
  }
  
  return (
    <main className="min-h-screen flex items-center justify-center bg-neutral-50">
      <a 
        href="#" 
        className="absolute top-4 right-4 text-sm text-neutral-500 hover:text-neutral-700 transition-colors"
      >
        Privacy
      </a>
      <LoginCard />
    </main>
  )
}