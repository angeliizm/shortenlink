import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'Kullanıcı ID gerekli' },
        { status: 400 }
      )
    }

    const supabase = createServiceRoleClient()

    // Önce kullanıcının rolünü kontrol et
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single()

    if (roleError) {
      console.error('Error fetching user role:', roleError)
      return NextResponse.json(
        { error: 'Kullanıcı rolü alınamadı' },
        { status: 500 }
      )
    }

    // Admin hesapları silinemez
    if ((roleData as any)?.role === 'admin') {
      return NextResponse.json(
        { error: 'Admin hesapları silinemez' },
        { status: 403 }
      )
    }

    // Kullanıcının sahip olduğu siteleri sil
    const { error: sitesError } = await supabase
      .from('pages')
      .delete()
      .eq('owner_id', userId)

    if (sitesError) {
      console.warn('Error deleting user sites:', sitesError)
    }

    // Kullanıcının izinlerini sil
    const { error: permissionsError } = await supabase
      .from('site_permissions')
      .delete()
      .eq('user_id', userId)

    if (permissionsError) {
      console.warn('Error deleting user permissions:', permissionsError)
    }

    // Kullanıcının rolünü sil
    const { error: roleDeleteError } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId)

    if (roleDeleteError) {
      console.warn('Error deleting user role:', roleDeleteError)
    }

    // Kullanıcıyı auth.users tablosundan sil
    const { error: authError } = await supabase.auth.admin.deleteUser(userId)

    if (authError) {
      console.error('Error deleting user from auth:', authError)
      return NextResponse.json(
        { error: 'Kullanıcı silinirken hata oluştu: ' + authError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Kullanıcı başarıyla silindi' 
    })

  } catch (error: any) {
    console.error('Error in delete user API:', error)
    return NextResponse.json(
      { error: 'Sunucu hatası: ' + error.message },
      { status: 500 }
    )
  }
}
