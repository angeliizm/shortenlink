import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { siteId, presetId } = await request.json()

    if (!siteId || !presetId) {
      return NextResponse.json(
        { error: 'Site ID and preset ID are required' },
        { status: 400 }
      )
    }

    // Temporarily disabled - using localStorage instead
    // TODO: Re-enable when database schema is properly set up
    console.log('Profile style preference saved to localStorage:', { siteId, presetId })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in profile style preferences API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const siteId = searchParams.get('siteId')

    if (!siteId) {
      return NextResponse.json(
        { error: 'Site ID is required' },
        { status: 400 }
      )
    }

    // Temporarily disabled - using localStorage instead
    // TODO: Re-enable when database schema is properly set up
    console.log('Profile style preference fetched from localStorage for site:', siteId)

    return NextResponse.json({ presetId: null })
  } catch (error) {
    console.error('Error in profile style preferences API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}