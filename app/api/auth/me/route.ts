import { NextRequest, NextResponse } from 'next/server'

// Mock user database
const MOCK_USERS = [
  {
    id: '1',
    email: 'test@example.com',
    name: 'Test User'
  }
]

function validateAccessToken(token: string): string | null {
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

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'No token provided' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const userId = validateAccessToken(token)
    
    if (!userId) {
      return NextResponse.json(
        { message: 'Invalid or expired token' },
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

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name
    })
  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}