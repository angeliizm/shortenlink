import { NextRequest, NextResponse } from 'next/server'
import { del } from '@vercel/blob'

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const avatarUrl = searchParams.get('url')

    if (!avatarUrl) {
      return NextResponse.json(
        { error: 'Avatar URL is required' },
        { status: 400 }
      )
    }

    // Extract filename from URL for deletion
    // Vercel Blob URLs are in format: https://[hash].public.blob.vercel-storage.com/[filename]
    const urlParts = avatarUrl.split('/')
    const filename = urlParts[urlParts.length - 1]
    
    if (!filename || !filename.includes('avatars/')) {
      return NextResponse.json(
        { error: 'Invalid avatar URL format' },
        { status: 400 }
      )
    }

    // Delete from Vercel Blob
    await del(avatarUrl)

    return NextResponse.json({
      success: true,
      message: 'Avatar deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting avatar:', error)
    return NextResponse.json(
      { error: 'Failed to delete avatar' },
      { status: 500 }
    )
  }
}
