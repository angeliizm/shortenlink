import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    
    // Clear refresh token cookie
    cookieStore.set('refresh_token', '', {
      httpOnly: true,
      // secure: process.env.NODE_ENV === 'production',
      secure: false, // For testing
      sameSite: 'lax',
      maxAge: 0, // Expire immediately
      path: '/'
    })

    return NextResponse.json({ message: 'Logged out successfully' })
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}