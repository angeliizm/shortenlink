import { createClient, createServiceRoleClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Check if there's a pending invitation code in the URL
      const invitationCode = searchParams.get('invitation_code')
      
      if (invitationCode) {
        try {
          // Get the user after session exchange
          const { data: { user } } = await supabase.auth.getUser()
          
          if (user) {
            // Use the invitation code
            const serviceSupabase = createServiceRoleClient()
            const { data: result } = await (serviceSupabase as any)
              .rpc('use_invitation_code', {
                p_code: invitationCode.toUpperCase(),
                p_user_id: user.id,
                p_ip_address: null
              })
            
            if (result && result.success) {
              // Code used successfully, redirect to dashboard
              const forwardedHost = request.headers.get('x-forwarded-host')
              const isLocalEnv = process.env.NODE_ENV === 'development'
              if (isLocalEnv) {
                return NextResponse.redirect(`${origin}/dashboard`)
              } else if (forwardedHost) {
                return NextResponse.redirect(`https://${forwardedHost}/dashboard`)
              } else {
                return NextResponse.redirect(`${origin}/dashboard`)
              }
            }
          }
        } catch (codeError) {
          console.warn('Error using invitation code in callback:', codeError)
          // Continue with normal flow
        }
      }
      
      const forwardedHost = request.headers.get('x-forwarded-host') // original origin before load balancer
      const isLocalEnv = process.env.NODE_ENV === 'development'
      if (isLocalEnv) {
        // we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
        return NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        return NextResponse.redirect(`${origin}${next}`)
      }
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
