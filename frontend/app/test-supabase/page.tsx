'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function TestSupabase() {
  const [status, setStatus] = useState<string>('Checking connection...')
  const [error, setError] = useState<string | null>(null)

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
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
        setStatus('Connection failed ❌')
      }
    }

    checkConnection()
  }, [])

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
          <h2 className="font-semibold mb-2">Connection Details:</h2>
          <ul className="text-sm space-y-1">
            <li>
              <span className="font-medium">URL:</span>{' '}
              <span className="text-gray-600">
                {process.env.NEXT_PUBLIC_SUPABASE_URL?.replace('https://', '').substring(0, 20)}...
              </span>
            </li>
            <li>
              <span className="font-medium">Anon Key:</span>{' '}
              <span className="text-gray-600">
                {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20)}...
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