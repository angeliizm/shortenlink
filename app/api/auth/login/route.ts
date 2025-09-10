import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

// Mock user database
const MOCK_USERS = [
  {
    id: '1',
    email: 'test@example.com',
    password: 'password123', // In production, this would be hashed
    name: 'Test User'
  }
]

// Generate mock JWT token (in production, use proper JWT library)
function generateAccessToken(userId: string): string {
  const payload = {
    sub: userId,
    iat: Date.now(),
    exp: Date.now() + 5 * 60 * 1000, // 5 minutes
  }
  return Buffer.from(JSON.stringify(payload)).toString('base64')
}

function generateRefreshToken(userId: string): string {
  const payload = {
    sub: userId,
    iat: Date.now(),
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  }
  return Buffer.from(JSON.stringify(payload)).toString('base64')
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Find user (mock authentication)
    const user = MOCK_USERS.find(
      u => u.email === email && u.password === password
    )

    if (!user) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Generate tokens
    const accessToken = generateAccessToken(user.id)
    const refreshToken = generateRefreshToken(user.id)

    // Set refresh token as httpOnly cookie
    const cookieStore = cookies()
    cookieStore.set('refresh_token', refreshToken, {
      httpOnly: true,
      // secure: process.env.NODE_ENV === 'production',
      secure: false, // For testing
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/'
    })

    // Return user data and access token
    return NextResponse.json({
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}