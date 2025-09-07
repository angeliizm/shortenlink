'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

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
    fetchUser()
  }, [])

  const fetchUser = async () => {
    try {
      const response = await fetch('http://localhost:8080/me', {
        credentials: 'include',
      })

      if (!response.ok) {
        // Try to refresh token
        const refreshResponse = await fetch('http://localhost:8080/auth/refresh', {
          method: 'POST',
          credentials: 'include',
        })

        if (!refreshResponse.ok) {
          throw new Error('Not authenticated')
        }

        // Retry fetching user
        const retryResponse = await fetch('http://localhost:8080/me', {
          credentials: 'include',
        })

        if (!retryResponse.ok) {
          throw new Error('Failed to fetch user')
        }

        const userData = await retryResponse.json()
        setUser(userData)
      } else {
        const userData = await response.json()
        setUser(userData)
      }
    } catch (error) {
      console.error('Auth error:', error)
      router.push('/')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:8080/auth/logout', {
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <button
              onClick={handleLogout}
              className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Logout
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-700">Welcome!</h2>
              <p className="text-gray-600">You are successfully logged in.</p>
            </div>
            
            <div className="border-t pt-4">
              <h3 className="text-md font-semibold text-gray-700 mb-2">User Information</h3>
              <dl className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Email</dt>
                  <dd className="text-sm text-gray-900">{user.email}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Role</dt>
                  <dd className="text-sm text-gray-900">{user.role}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">User ID</dt>
                  <dd className="text-sm text-gray-900 font-mono">{user.user_id}</dd>
                </div>
              </dl>
            </div>

            <div className="border-t pt-4">
              <h3 className="text-md font-semibold text-gray-700 mb-2">Protected Content</h3>
              <p className="text-gray-600">
                This dashboard is protected and can only be accessed by authenticated users.
                The authentication system uses:
              </p>
              <ul className="mt-2 list-disc list-inside text-sm text-gray-600">
                <li>JWT access tokens (15 minutes TTL)</li>
                <li>Refresh tokens with rotation</li>
                <li>Secure httpOnly cookies</li>
                <li>Automatic token refresh</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}