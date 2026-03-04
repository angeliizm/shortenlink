import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

async function getAdminUser() {
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return null

  const { data: roleData } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  const role = (roleData as { role: string } | null)?.role || 'pending'
  if (role !== 'admin') return null

  return user
}

// GET /api/admin/bulk-actions
// Returns all sites with their page_actions
export async function GET() {
  try {
    const user = await getAdminUser()
    if (!user) {
      return NextResponse.json({ error: 'Admin yetkisi gerekli' }, { status: 403 })
    }

    const serviceClient = createServiceRoleClient()

    const { data: sites, error: sitesError } = await serviceClient
      .from('pages')
      .select('id, site_slug, title, is_enabled, owner_id')
      .order('site_slug', { ascending: true }) as { data: any[] | null, error: any }

    if (sitesError) {
      return NextResponse.json({ error: sitesError.message }, { status: 500 })
    }

    if (!sites || sites.length === 0) {
      return NextResponse.json({ sites: [] })
    }

    const siteIds = sites.map(s => s.id)

    const { data: actions, error: actionsError } = await serviceClient
      .from('page_actions')
      .select('id, page_id, label, href, variant, preset, sort_order, is_enabled')
      .in('page_id', siteIds)
      .order('sort_order', { ascending: true }) as { data: any[] | null, error: any }

    if (actionsError) {
      return NextResponse.json({ error: actionsError.message }, { status: 500 })
    }

    const actionsByPageId: Record<string, any[]> = {}
    for (const action of actions || []) {
      if (!actionsByPageId[action.page_id]) {
        actionsByPageId[action.page_id] = []
      }
      actionsByPageId[action.page_id].push(action)
    }

    const result = sites.map(site => ({
      ...site,
      actions: actionsByPageId[site.id] || [],
    }))

    return NextResponse.json({ sites: result })
  } catch (error: any) {
    return NextResponse.json({ error: 'Sunucu hatası: ' + error.message }, { status: 500 })
  }
}

// POST /api/admin/bulk-actions
// Applies bulk operation to selected sites
export async function POST(request: NextRequest) {
  try {
    const user = await getAdminUser()
    if (!user) {
      return NextResponse.json({ error: 'Admin yetkisi gerekli' }, { status: 403 })
    }

    const body = await request.json()
    const { operation, site_ids, button, preserve_href, label_order } = body

    if (!operation || !site_ids || !Array.isArray(site_ids) || site_ids.length === 0) {
      return NextResponse.json({ error: 'Geçersiz istek parametreleri' }, { status: 400 })
    }

    const serviceClient = createServiceRoleClient()

    // Fetch current actions for selected sites
    const { data: currentActions, error: fetchError } = await serviceClient
      .from('page_actions')
      .select('id, page_id, label, href, variant, preset, sort_order, is_enabled')
      .in('page_id', site_ids)
      .order('sort_order', { ascending: true }) as { data: any[] | null, error: any }

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }

    const actionsByPageId: Record<string, any[]> = {}
    for (const action of currentActions || []) {
      if (!actionsByPageId[action.page_id]) {
        actionsByPageId[action.page_id] = []
      }
      actionsByPageId[action.page_id].push(action)
    }

    const results = { updated: 0, failed: 0, errors: [] as string[] }

    if (operation === 'add_button') {
      if (!button?.label || !button?.href) {
        return NextResponse.json({ error: 'Buton label ve href zorunludur' }, { status: 400 })
      }

      for (const siteId of site_ids) {
        try {
          const existingActions = actionsByPageId[siteId] || []
          const nextSortOrder = existingActions.length > 0
            ? Math.max(...existingActions.map((a: any) => a.sort_order)) + 1
            : 0

          const { error: insertError } = await serviceClient
            .from('page_actions')
            .insert({
              page_id: siteId,
              label: button.label,
              href: button.href,
              variant: button.variant || 'outline',
              preset: button.preset || 'default',
              sort_order: nextSortOrder,
              is_enabled: button.is_enabled !== false,
            } as never) as { error: any }

          if (insertError) {
            results.failed++
            results.errors.push(`Site ${siteId}: ${insertError.message}`)
          } else {
            results.updated++
          }
        } catch (e: any) {
          results.failed++
          results.errors.push(`Site ${siteId}: ${e.message}`)
        }
      }
    } else if (operation === 'update_button') {
      if (!button?.label) {
        return NextResponse.json({ error: 'Güncellenecek buton label\'ı zorunludur' }, { status: 400 })
      }

      for (const siteId of site_ids) {
        try {
          const existingActions = actionsByPageId[siteId] || []
          const matchingAction = existingActions.find(
            (a: any) => a.label === button.label
          )

          if (!matchingAction) continue

          const updateData: Record<string, any> = {
            variant: button.variant || matchingAction.variant,
            preset: button.preset || matchingAction.preset,
            is_enabled: button.is_enabled !== undefined ? button.is_enabled : matchingAction.is_enabled,
          }

          // Only update href if: no preserve_href OR site's current href matches the "reference" href
          if (button.href) {
            if (!preserve_href || matchingAction.href === button.href) {
              updateData.href = button.href
            }
            // If preserve_href=true and site has different href → keep existing href
          }

          // Only update label if new_label provided
          if (button.new_label) {
            updateData.label = button.new_label
          }

          const { error: updateError } = await serviceClient
            .from('page_actions')
            .update(updateData as never)
            .eq('id', matchingAction.id) as { error: any }

          if (updateError) {
            results.failed++
            results.errors.push(`Site ${siteId}: ${updateError.message}`)
          } else {
            results.updated++
          }
        } catch (e: any) {
          results.failed++
          results.errors.push(`Site ${siteId}: ${e.message}`)
        }
      }
    } else if (operation === 'reorder') {
      if (!label_order || !Array.isArray(label_order) || label_order.length === 0) {
        return NextResponse.json({ error: 'Sıralama listesi (label_order) zorunludur' }, { status: 400 })
      }

      for (const siteId of site_ids) {
        try {
          const existingActions = actionsByPageId[siteId] || []
          if (existingActions.length === 0) continue

          // Build new order: first the ones in label_order, then the rest
          const inOrderActions = label_order
            .map((lbl: string) => existingActions.find((a: any) => a.label === lbl))
            .filter(Boolean)

          const notInOrderActions = existingActions.filter(
            (a: any) => !label_order.includes(a.label)
          )

          const reordered = [...inOrderActions, ...notInOrderActions]

          let hasFailed = false
          for (let i = 0; i < reordered.length; i++) {
            const action = reordered[i]
            const { error: updateError } = await serviceClient
              .from('page_actions')
              .update({ sort_order: i } as never)
              .eq('id', action.id) as { error: any }

            if (updateError) {
              hasFailed = true
              results.errors.push(`Site ${siteId}: ${updateError.message}`)
            }
          }

          if (hasFailed) {
            results.failed++
          } else {
            results.updated++
          }
        } catch (e: any) {
          results.failed++
          results.errors.push(`Site ${siteId}: ${e.message}`)
        }
      }
    } else if (operation === 'remove_button') {
      if (!button?.label) {
        return NextResponse.json({ error: 'Kaldırılacak buton label\'ı zorunludur' }, { status: 400 })
      }

      for (const siteId of site_ids) {
        try {
          const existingActions = actionsByPageId[siteId] || []
          const matchingAction = existingActions.find((a: any) => a.label === button.label)

          if (!matchingAction) continue

          const { error: deleteError } = await serviceClient
            .from('page_actions')
            .delete()
            .eq('id', matchingAction.id) as { error: any }

          if (deleteError) {
            results.failed++
            results.errors.push(`Site ${siteId}: ${deleteError.message}`)
          } else {
            results.updated++
          }
        } catch (e: any) {
          results.failed++
          results.errors.push(`Site ${siteId}: ${e.message}`)
        }
      }
    } else {
      return NextResponse.json({ error: 'Geçersiz işlem türü' }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      updated: results.updated,
      failed: results.failed,
      errors: results.errors.slice(0, 10),
    })
  } catch (error: any) {
    return NextResponse.json({ error: 'Sunucu hatası: ' + error.message }, { status: 500 })
  }
}
