import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

const ALLOWED_ROLES = ['admin', 'moderator', 'approved', 'pending'] as const

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
    }

    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    const currentRole = (roleData as { role: string } | null)?.role || 'pending'
    if (currentRole !== 'admin') {
      return NextResponse.json({ error: 'Bu işlem için admin yetkisi gerekli' }, { status: 403 })
    }

    const body = await request.json()
    const { userId, role, notes } = body as { userId?: string; role?: string; notes?: string }

    if (!userId || !role) {
      return NextResponse.json(
        { error: 'userId ve role zorunludur' },
        { status: 400 }
      )
    }

    if (!ALLOWED_ROLES.includes(role as (typeof ALLOWED_ROLES)[number])) {
      return NextResponse.json(
        { error: 'Geçersiz rol' },
        { status: 400 }
      )
    }

    const serviceClient = createServiceRoleClient()

    const row = {
      user_id: userId,
      role,
      notes: notes ?? null,
      assigned_by: user.id,
      assigned_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const { error: upsertError } = await serviceClient
      .from('user_roles')
      .upsert(row as never, { onConflict: 'user_id' })

    if (upsertError) {
      console.error('Error upserting role:', upsertError)
      return NextResponse.json(
        { error: 'Rol güncellenemedi: ' + upsertError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    console.error('Error in update-role API:', error)
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    )
  }
}
