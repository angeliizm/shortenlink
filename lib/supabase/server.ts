import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from './database.types'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    'https://coufslfrsxvlzbwitzct.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNvdWZzbGZyc3h2bHpid2l0emN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxOTI5NTcsImV4cCI6MjA3Mjc2ODk1N30.EUvRiVahwgdHIckEkUvhWBwBxvoQhHL0Qh1OLbjF-3A',
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

export async function createServiceRoleClient() {
  const cookieStore = await cookies()
  
  return createServerClient<Database>(
    'https://coufslfrsxvlzbwitzct.supabase.co',
    // process.env.SUPABASE_SERVICE_ROLE_KEY!, // TODO: Add service role key
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNvdWZzbGZyc3h2bHpid2l0emN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxOTI5NTcsImV4cCI6MjA3Mjc2ODk1N30.EUvRiVahwgdHIckEkUvhWBwBxvoQhHL0Qh1OLbjF-3A', // Using anon key for now
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Ignore if called from Server Component
          }
        },
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}