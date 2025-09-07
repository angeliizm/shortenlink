import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

// Mock user database
const MOCK_USERS = [
  {
    id: '1',
    email: 'test@example.com',
    name: 'Test User'
  }
]

function generateAccessToken(userId: string): string {
  const payload = {
    sub: userId,
    iat: Date.now(),
    exp: Date.now() + 5 * 60 * 1000, // 5 minutes
  }
  return Buffer.from(JSON.stringify(payload)).toString('base64')
}

function validateRefreshToken(token: string): string | null {
  try {
    const payload = JSON.parse(Buffer.from(token, 'base64').toString())
    
    // Check expiration
    if (payload.exp < Date.now()) {
      return null
    }
    
    return payload.sub
  } catch {
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const refreshToken = cookieStore.get('refresh_token')?.value

    if (!refreshToken) {
      return NextResponse.json(
        { message: 'No refresh token provided' },
        { status: 401 }
      )
    }

    // Validate refresh token
    const userId = validateRefreshToken(refreshToken)
    
    if (!userId) {
      return NextResponse.json(
        { message: 'Invalid or expired refresh token' },
        { status: 401 }
      )
    }

    // Find user
    const user = MOCK_USERS.find(u => u.id === userId)
    
    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      )
    }

    // Generate new access token
    const accessToken = generateAccessToken(user.id)

    return NextResponse.json({
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    })
  } catch (error) {
    console.error('Refresh token error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}