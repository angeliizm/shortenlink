import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

export const dynamic = 'force-dynamic';

const updateLinkSchema = z.object({
  target_url: z.string().url().optional(),
  slug: z.string().min(3).max(50).optional(),
  expires_at: z.string().datetime().optional().nullable(),
  password: z.string().min(1).optional().nullable(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: link, error } = await supabase
      .from('links')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error || !link) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 })
    }

    return NextResponse.json({ link })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validation = updateLinkSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    // Check if link exists and belongs to user
    const { data: existingLink } = await supabase
      .from('links')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (!existingLink) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 })
    }

    // If updating slug, check if it's already taken
    if (validation.data.slug) {
      const { data: slugCheck } = await supabase
        .from('links')
        .select('id')
        .eq('slug', validation.data.slug)
        .neq('id', id)
        .single()

      if (slugCheck) {
        return NextResponse.json(
          { error: 'Slug already exists' },
          { status: 409 }
        )
      }
    }

    // Build update object with only defined fields
    const updateObj: Record<string, any> = {
      updated_at: new Date().toISOString(),
    }
    
    if (validation.data.target_url !== undefined) {
      updateObj.target_url = validation.data.target_url
    }
    if (validation.data.slug !== undefined) {
      updateObj.slug = validation.data.slug
    }
    if (validation.data.expires_at !== undefined) {
      updateObj.expires_at = validation.data.expires_at
    }
    if (validation.data.password !== undefined) {
      updateObj.password = validation.data.password
    }

    const { data: link, error } = await (supabase
      .from('links') as any)
      .update(updateObj)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ link })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { error } = await supabase
      .from('links')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: 'Link deleted successfully' })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}