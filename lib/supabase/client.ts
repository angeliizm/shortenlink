import { createBrowserClient } from '@supabase/ssr'
import { Database } from './database.types'

export function createClient() {
  return createBrowserClient<Database>(
    'https://coufslfrsxvlzbwitzct.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNvdWZzbGZyc3h2bHpid2l0emN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxOTI5NTcsImV4cCI6MjA3Mjc2ODk1N30.EUvRiVahwgdHIckEkUvhWBwBxvoQhHL0Qh1OLbjF-3A'
  )
}