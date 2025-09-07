'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getMe } from '@/lib/api'

interface User {
  user_id: string
  email: string
  role: string
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const userData = await getMe()
      if (userData) {
        setUser(userData)
      } else {
        router.push('/')
      }
    } catch (error) {
      router.push('/')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      router.push('/')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-neutral-600">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-neutral-50 p-4">
      <Card className="w-full max-w-md rounded-2xl shadow-sm border bg-white">
        <CardHeader>
          <CardTitle>Dashboard</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-neutral-600 text-sm">Welcome,</p>
            <p className="font-medium text-lg">{user.email}</p>
          </div>
          <div className="pt-4 border-t">
            <p className="text-sm text-neutral-600 mb-1">User ID</p>
            <p className="font-mono text-xs text-neutral-500">{user.user_id}</p>
          </div>
          <div>
            <p className="text-sm text-neutral-600 mb-1">Role</p>
            <p className="text-sm">{user.role}</p>
          </div>
          <Button 
            onClick={handleLogout}
            variant="outline"
            className="w-full"
          >
            Logout
          </Button>
        </CardContent>
      </Card>
    </main>
  )
}