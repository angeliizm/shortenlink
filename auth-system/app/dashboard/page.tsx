'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '../../lib/api'

interface User {
  id: number
  email: string
  created_at: string
  updated_at: string
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    loadUser()
  }, [])

  const loadUser = async () => {
    try {
      setLoading(true)
      const result = await api.auth.me()
      if (result.success && result.data) {
        setUser(result.data)
      } else {
        setError('Failed to load user data')
        router.push('/login')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load user data')
      if (err.message?.includes('Unauthorized') || err.status === 401) {
        router.push('/login')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await api.auth.logout()
      localStorage.removeItem('access_token')
      router.push('/login')
    } catch (err) {
      // Even if logout fails on the server, we should still redirect
      localStorage.removeItem('access_token')
      router.push('/login')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex items-center space-x-2">
          <svg
            className="animate-spin h-5 w-5 text-indigo-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span className="text-gray-600">Loading...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
          <div className="flex items-center space-x-2 text-red-600 mb-4">
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <h3 className="font-medium">Error</h3>
          </div>
          <p className="text-gray-700 mb-4">{error}</p>
          <button
            onClick={() => router.push('/login')}
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <svg
                  className="-ml-1 mr-2 h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                Logout
              </button>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Profile Information</h2>
              
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-500">User ID:</span>
                  <span className="text-sm text-gray-900">{user?.id}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-500">Email:</span>
                  <span className="text-sm text-gray-900">{user?.email}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-500">Member since:</span>
                  <span className="text-sm text-gray-900">
                    {user?.created_at && formatDate(user.created_at)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-500">Last updated:</span>
                  <span className="text-sm text-gray-900">
                    {user?.updated_at && formatDate(user.updated_at)}
                  </span>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6 mt-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
              
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="bg-indigo-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-indigo-800 mb-2">API Access</h3>
                  <p className="text-xs text-indigo-600 mb-3">
                    Your authentication is working! You can now access protected resources.
                  </p>
                  <button
                    onClick={loadUser}
                    className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    Refresh Profile →
                  </button>
                </div>
                
                <div className="bg-green-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-green-800 mb-2">Security</h3>
                  <p className="text-xs text-green-600 mb-3">
                    Your session is secure with JWT tokens and httpOnly cookies.
                  </p>
                  <span className="text-xs text-green-600 font-medium">
                    ✓ Secured
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Welcome to your secure dashboard! This page is protected by authentication.
          </p>
        </div>
      </div>
    </div>
  )
}