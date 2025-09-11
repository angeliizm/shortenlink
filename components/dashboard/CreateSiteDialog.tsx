'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/stores/auth-store'
import { canCreateSites } from '@/lib/auth/roles'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus } from 'lucide-react'

interface CreateSiteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export default function CreateSiteDialog({ open, onOpenChange, onSuccess }: CreateSiteDialogProps) {
  const { user } = useAuth()
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [canCreate, setCanCreate] = useState(false)
  
  const [formData, setFormData] = useState({
    title: '',
    site_slug: ''
  })

  useEffect(() => {
    if (user) {
      checkCreatePermission()
    }
  }, [user])

  const checkCreatePermission = async () => {
    if (user) {
      const canCreateSite = await canCreateSites(user.id)
      setCanCreate(canCreateSite)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!canCreate) {
      setError('Bu işlemi gerçekleştirmek için yeterli yetkiniz yok.')
      return
    }
    
    if (!user) return
    
    // Validate slug
    if (!/^[a-z0-9-]+$/.test(formData.site_slug)) {
      setError('URL adresi sadece küçük harfler, rakamlar ve tire içerebilir')
      return
    }
    
    setIsLoading(true)
    
    try {
      // Use placeholder URL for new sites
      const formattedTargetUrl = 'https://placeholder.empty'

      // Create the page
      const { data: page, error: pageError } = await supabase
        .from('pages')
        .insert({
          title: formData.title,
          site_slug: formData.site_slug,
          target_url: formattedTargetUrl,
          brand_color: '#3B82F6',
          accent_color: '#EFF6FF',
          is_enabled: true,
          owner_id: user.id,
          meta: {}
        } as any)
        .select()
        .single() as { data: { id: string } | null; error: any }
      
      if (pageError) throw pageError
      
      if (!page) throw new Error('Site oluşturulamadı')
      
      onSuccess()
      resetForm()
      onOpenChange(false)
    } catch (err: any) {
      setError(err.message || 'Site oluşturulurken hata oluştu')
    } finally {
      setIsLoading(false)
    }
  }
  
  const resetForm = () => {
    setFormData({
      title: '',
      site_slug: ''
    })
    setError('')
  }
  
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  return (
    <Dialog open={open} onOpenChange={(open) => {
      if (!open) resetForm()
      onOpenChange(open)
    }}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-600" />
              Yeni Site Oluştur
            </DialogTitle>
            <DialogDescription>
              Yeni dinamik sitenizi oluşturun. Diğer ayarları daha sonra düzenleyebilirsiniz.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Site Adı*</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => {
                  setFormData({ ...formData, title: e.target.value })
                  if (!formData.site_slug || formData.site_slug === generateSlug(formData.title)) {
                    setFormData(prev => ({ 
                      ...prev, 
                      title: e.target.value,
                      site_slug: generateSlug(e.target.value)
                    }))
                  }
                }}
                placeholder="Harika Sitem"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="slug">URL Adı*</Label>
              <Input
                id="slug"
                value={formData.site_slug}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  site_slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')
                })}
                placeholder="harika-sitem"
                pattern="^[a-z0-9-]+$"
                required
              />
              <p className="text-xs text-gray-500">/{formData.site_slug || 'url-adiniz'}</p>
            </div>
            
            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                {error}
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              İptal
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !formData.title.trim() || !formData.site_slug.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Oluşturuluyor...
                </div>
              ) : (
                'Site Oluştur'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}