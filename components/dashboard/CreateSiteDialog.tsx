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
      <DialogContent className="sm:max-w-lg bg-white border border-gray-200 shadow-2xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="text-center pb-6">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center mb-4">
              <Plus className="w-8 h-8 text-purple-600" />
            </div>
            <DialogTitle className="text-2xl font-bold text-gray-900">
              Yeni Site Oluştur
            </DialogTitle>
            <DialogDescription className="text-gray-600 mt-2">
              Yeni dinamik sitenizi oluşturun. Diğer ayarları daha sonra düzenleyebilirsiniz.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="space-y-3">
              <Label htmlFor="title" className="text-sm font-medium text-gray-700">
                Site Adı*
              </Label>
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
                className="h-12 text-lg border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                required
              />
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="slug" className="text-sm font-medium text-gray-700">
                URL Adı*
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 text-sm">linkfy.com/</span>
                </div>
                <Input
                  id="slug"
                  value={formData.site_slug}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    site_slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')
                  })}
                  placeholder="harika-sitem"
                  pattern="^[a-z0-9-]+$"
                  className="h-12 text-lg pl-24 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                  required
                />
              </div>
              <p className="text-xs text-gray-500">
                Sadece küçük harfler, rakamlar ve tire kullanabilirsiniz
              </p>
            </div>
            
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter className="pt-6 border-t border-gray-200">
            <div className="flex gap-3 w-full">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
                className="flex-1 h-12 border-gray-300 hover:bg-gray-50"
              >
                İptal
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !formData.title.trim() || !formData.site_slug.trim()}
                className="flex-1 h-12 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-medium"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Oluşturuluyor...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <Plus className="w-4 h-4 mr-2" />
                    Site Oluştur
                  </div>
                )}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}