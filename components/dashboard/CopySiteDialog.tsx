'use client'

import { useState } from 'react'
import { useAuth } from '@/stores/auth-store'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Copy, Loader2 } from 'lucide-react'

interface CopySiteDialogProps {
  site: {
    id: string
    title: string
    site_slug: string
    target_url: string
    brand_color: string
    is_enabled: boolean
    meta?: any
    avatar_url?: string
    logo_url?: string
    profile_preset_id?: string
    title_font_preset_id?: string
    title_color?: string
    title_font_size?: number
    owner_name?: string
  } | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export default function CopySiteDialog({ site, open, onOpenChange, onSuccess }: CopySiteDialogProps) {
  const { user } = useAuth()
  const supabase = createClient()
  
  const [formData, setFormData] = useState({
    title: '',
    site_slug: '',
    owner_name: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [urlError, setUrlError] = useState('')
  const [isCheckingUrl, setIsCheckingUrl] = useState(false)

  // Reset form when dialog opens with new site
  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen && site) {
      setFormData({
        title: `${site.title} (Kopya)`,
        site_slug: '',
        owner_name: site.owner_name || ''
      })
      setError('')
      setUrlError('')
    } else if (!newOpen) {
      setFormData({ title: '', site_slug: '', owner_name: '' })
      setError('')
      setUrlError('')
    }
    onOpenChange(newOpen)
  }

  // URL unique kontrolü
  const checkUrlUnique = async (url: string) => {
    if (!url.trim()) {
      setUrlError('')
      return true
    }
    
    setIsCheckingUrl(true)
    setUrlError('')
    
    try {
      const { data, error } = await supabase
        .from('pages')
        .select('id')
        .eq('site_slug', url.trim())
      
      if (error) throw error
      
      if (data && data.length > 0) {
        setUrlError('Bu URL adresi zaten kullanılıyor. Lütfen farklı bir URL adresi girin.')
        return false
      }
      
      setUrlError('')
      return true
    } catch (error) {
      console.error('URL kontrol hatası:', error)
      setUrlError('URL kontrol edilirken hata oluştu')
      return false
    } finally {
      setIsCheckingUrl(false)
    }
  }

  const handleCopy = async () => {
    if (!site || !user) return

    // Validate
    if (!formData.title.trim() || !formData.site_slug.trim()) {
      setError('Site adı ve URL adresi zorunludur')
      return
    }

    if (!/^[a-z0-9\-]+$/.test(formData.site_slug)) {
      setError('URL adresi sadece küçük harfler, rakamlar ve tire içerebilir')
      return
    }

    if (urlError) {
      setError('Lütfen URL adresi hatasını düzeltin')
      return
    }

    // Final URL check
    const isUrlUnique = await checkUrlUnique(formData.site_slug)
    if (!isUrlUnique) {
      setError('Bu URL adresi zaten kullanılıyor. Lütfen farklı bir URL adresi girin.')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      // 1. Create new page with copied data
      const { data: newPage, error: pageError } = await (supabase as any)
        .from('pages')
        .insert({
          owner_id: user.id,
          title: formData.title,
          site_slug: formData.site_slug,
          target_url: site.target_url,
          brand_color: site.brand_color,
          is_enabled: site.is_enabled,
          meta: site.meta,
          avatar_url: site.avatar_url,
          logo_url: site.logo_url,
          profile_preset_id: site.profile_preset_id,
          title_font_preset_id: site.title_font_preset_id,
          title_color: site.title_color,
          title_font_size: site.title_font_size,
          owner_name: formData.owner_name
        })
        .select()
        .single()

      if (pageError) throw pageError

      // 2. Copy page actions
      const { data: actions, error: actionsError } = await (supabase as any)
        .from('page_actions')
        .select('*')
        .eq('page_id', site.id)

      if (actionsError) throw actionsError

      if (actions && actions.length > 0) {
        const newActions = actions.map((action: any) => ({
          page_id: newPage.id,
          label: action.label,
          href: action.href,
          variant: action.variant,
          preset: action.preset,
          description: action.description,
          image_url: action.image_url,
          sort_order: action.sort_order,
          is_enabled: action.is_enabled
        }))

        const { error: insertActionsError } = await (supabase as any)
          .from('page_actions')
          .insert(newActions)

        if (insertActionsError) throw insertActionsError
      }

      // 3. Copy background preferences
      const { data: bgPref, error: bgPrefError } = await (supabase as any)
        .from('background_preferences')
        .select('*')
        .eq('site_id', site.id)
        .single()

      if (!bgPrefError && bgPref) {
        const { error: insertBgError } = await (supabase as any)
          .from('background_preferences')
          .insert({
            site_id: newPage.id,
            preset_id: (bgPref as any).preset_id,
            control_values: (bgPref as any).control_values
          })

        if (insertBgError && insertBgError.code !== '23505') { // Ignore duplicate key errors
          console.error('Background preference copy error:', insertBgError)
        }
      }

      // Success!
      onSuccess()
      handleOpenChange(false)
    } catch (err: any) {
      console.error('Site kopyalama hatası:', err)
      setError(err.message || 'Site kopyalanırken bir hata oluştu')
    } finally {
      setIsLoading(false)
    }
  }

  if (!site) return null

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md bg-white border border-gray-200 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Copy className="w-5 h-5 text-blue-600" />
            Site Kopyala
          </DialogTitle>
          <DialogDescription>
            <span className="font-medium text-gray-900">{site.title}</span> sitesini kopyalayın. Tüm ayarlar ve eylem butonları kopyalanacak.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="copy-title">
              Yeni Site Adı <span className="text-red-500">*</span>
            </Label>
            <Input
              id="copy-title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Örn: Harika Sitem (Kopya)"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="copy-slug">
              Yeni URL Adresi <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="copy-slug"
                value={formData.site_slug}
                onChange={async (e) => {
                  const newSlug = e.target.value.toLowerCase().replace(/[^a-z0-9\-]/g, '')
                  setFormData({ ...formData, site_slug: newSlug })
                  
                  if (newSlug && newSlug !== formData.site_slug) {
                    setTimeout(() => {
                      checkUrlUnique(newSlug)
                    }, 500)
                  }
                }}
                placeholder="yeni-site-url"
                pattern="[a-z0-9\-]+"
                disabled={isLoading}
                className={urlError ? 'border-red-500 focus:border-red-500' : ''}
              />
              {isCheckingUrl && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>
            {urlError ? (
              <p className="text-xs text-red-600">{urlError}</p>
            ) : (
              <p className="text-xs text-gray-500">/{formData.site_slug || 'yeni-site-url'}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="copy-owner-name">Sahip Adı</Label>
            <Input
              id="copy-owner-name"
              value={formData.owner_name}
              onChange={(e) => setFormData({ ...formData, owner_name: e.target.value })}
              placeholder="Site sahibinin adı (raporlarda görünecek)"
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500">Bu isim raporlarda ve admin panelinde görünecektir</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-700">
              <strong>Not:</strong> Tüm tasarım ayarları, eylem butonları, arka plan tercihleri, logo ve avatar kopyalanacaktır.
            </p>
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isLoading}
            className="flex-1"
          >
            İptal
          </Button>
          <Button
            onClick={handleCopy}
            disabled={isLoading || !formData.title.trim() || !formData.site_slug.trim() || !!urlError}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Kopyalanıyor...
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" />
                Kopyala
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

