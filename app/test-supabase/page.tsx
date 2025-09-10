'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

export default function TestSupabase() {
  const [status, setStatus] = useState<string>('Checking connection...')
  const [error, setError] = useState<string | null>(null)
  const [apiStatus, setApiStatus] = useState<string>('')
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    async function checkConnection() {
      try {
        const supabase = createClient()
        
        // Test basic connection
        const { data, error } = await supabase.from('profiles').select('count').limit(1)
        
        if (error) {
          // This is expected if the table doesn't exist yet
          if (error.message.includes('relation') && error.message.includes('does not exist')) {
            setStatus('Connected to Supabase! ✅ (Tables not created yet - run migrations)')
          } else {
            setError(error.message)
            setStatus('Connection failed ❌')
          }
        } else {
          setStatus('Connected to Supabase and tables exist! ✅')
        }

        // Check auth status
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
        setStatus('Connection failed ❌')
      }
    }

    checkConnection()
  }, [])

  const testApiRoute = async () => {
    try {
      setApiStatus('Testing API route...')
      const response = await fetch('/api/links')
      
      if (response.status === 401) {
        setApiStatus('API route working! ✅ (Authentication required - as expected)')
      } else if (response.ok) {
        const data = await response.json()
        setApiStatus(`API route working! ✅ (Found ${data.links?.length || 0} links)`)
      } else {
        setApiStatus(`API returned status: ${response.status}`)
      }
    } catch (err) {
      setApiStatus(`API test failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-4 p-8 bg-white rounded-lg shadow">
        <h1 className="text-2xl font-bold text-center">Supabase Connection Test</h1>
        
        <div className="space-y-2">
          <p className="text-lg font-medium">{status}</p>
          {error && (
            <p className="text-red-600 text-sm">Error: {error}</p>
          )}
        </div>

        <div className="pt-4 border-t">
          <h2 className="font-semibold mb-2">Auth Status:</h2>
          <p className="text-sm">
            {user ? (
              <span className="text-green-600">Logged in as: {user.email}</span>
            ) : (
              <span className="text-gray-600">Not logged in</span>
            )}
          </p>
        </div>

        <div className="pt-4 border-t">
          <h2 className="font-semibold mb-2">API Route Test:</h2>
          <Button onClick={testApiRoute} className="mb-2">
            Test /api/links
          </Button>
          {apiStatus && (
            <p className="text-sm">{apiStatus}</p>
          )}
        </div>

        <div className="pt-4 border-t">
          <h2 className="font-semibold mb-2">Connection Details:</h2>
          <ul className="text-sm space-y-1">
            <li>
              <span className="font-medium">URL:</span>{' '}
              <span className="text-gray-600">
                {'https://coufslfrsxvlzbwitzct.supabase.co'.replace('https://', '').substring(0, 20)}...
              </span>
            </li>
            <li>
              <span className="font-medium">Anon Key:</span>{' '}
              <span className="text-gray-600">
                {'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNvdWZzbGZyc3h2bHpid2l0emN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxOTI5NTcsImV4cCI6MjA3Mjc2ODk1N30.EUvRiVahwgdHIckEkUvhWBwBxvoQhHL0Qh1OLbjF-3A'.substring(0, 20)}...
              </span>
            </li>
          </ul>
        </div>

        <div className="pt-4 border-t">
          <h2 className="font-semibold mb-2">Next Steps:</h2>
          <ol className="text-sm space-y-1 list-decimal list-inside">
            <li>Run database migrations in Supabase SQL Editor</li>
            <li>Get Service Role Key from Supabase dashboard</li>
            <li>Configure authentication providers</li>
            <li>Start building your app!</li>
          </ol>
        </div>
      </div>
    </div>
  )
}