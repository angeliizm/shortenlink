'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/stores/auth-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { PresetSelector } from '@/components/ui/preset-selector'
import ButtonPresetSelector from '@/components/dashboard/ButtonPresetSelector'
import { defaultPresetId } from '@/lib/button-presets'
import { profilePresets, defaultProfilePresetId } from '@/lib/profile-presets'
import { titleFontPresets, defaultTitleFontPresetId } from '@/lib/title-font-presets'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import PageHeader from '@/components/ui/PageHeader'
import { ArrowLeft, Save, Plus, Trash2, Globe, GripVertical, Palette, Type, User, Edit } from 'lucide-react'
import { BackgroundPreviewChip } from '@/components/dashboard/BackgroundPreviewChip'
import { BackgroundSelector } from '@/components/dashboard/BackgroundSelector'
import { TitleFontSelector } from '@/components/dashboard/TitleFontSelector'
import { ProfileCardSelector } from '@/components/dashboard/ProfileCardSelector'
import { AvatarUploader } from '@/components/dashboard/AvatarUploader'
import { backgroundPresets, applyPresetControls } from '@/lib/background-presets'
import LoadingScreen from '@/components/ui/LoadingScreen'

interface PageProps {
  params: Promise<{ id: string }>
}

interface Action {
  id?: string
  label: string
  href: string
  variant: 'primary' | 'outline' | 'ghost'
  preset: string
  description?: string
  sort_order: number
  is_enabled: boolean
}

export default function EditSitePage({ params }: PageProps) {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const supabase = createClient()
  const urlParams = useParams()
  
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [siteId, setSiteId] = useState<string>('')
  
  const [formData, setFormData] = useState({
    title: '',
    site_slug: '',
    target_url: '',
    is_enabled: true,
    description: ''
  })
  
  const [actions, setActions] = useState<Action[]>([])
  const [deletedActionIds, setDeletedActionIds] = useState<string[]>([])
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  
  // Background preferences state
  const [backgroundPreferences, setBackgroundPreferences] = useState<Record<string, any>>({})
  const [backgroundSelectorOpen, setBackgroundSelectorOpen] = useState(false)
  
  // Modal states
  const [titleFontSelectorOpen, setTitleFontSelectorOpen] = useState(false)
  const [profileCardSelectorOpen, setProfileCardSelectorOpen] = useState(false)
  const [buttonPresetSelectorOpen, setButtonPresetSelectorOpen] = useState(false)
  const [currentActionIndex, setCurrentActionIndex] = useState<number>(0)
  
  // URL unique kontrolü için state
  const [urlError, setUrlError] = useState<string>('')
  const [isCheckingUrl, setIsCheckingUrl] = useState<boolean>(false)
  
  // Hata mesajlarını Türkçe'ye çeviren fonksiyon
  const translateError = (error: string): string => {
    const errorLower = error.toLowerCase()
    
    if (errorLower.includes('valid_href')) {
      return 'Sayfa eylemlerinde URL yazılmadığı için kaydedilmiyor. Lütfen tüm eylemler için geçerli URL girin.'
    }
    if (errorLower.includes('duplicate key') && errorLower.includes('site_slug')) {
      return 'Bu URL adresi zaten kullanılıyor. Lütfen farklı bir URL adresi girin.'
    }
    if (errorLower.includes('duplicate key') && errorLower.includes('href')) {
      return 'Bu URL adresi zaten kullanılıyor. Lütfen farklı bir URL adresi girin.'
    }
    if (errorLower.includes('unique constraint')) {
      return 'Bu URL adresi zaten kullanılıyor. Lütfen farklı bir URL adresi girin.'
    }
    if (errorLower.includes('check constraint')) {
      return 'Girilen veriler geçersiz. Lütfen tüm alanları doğru şekilde doldurun.'
    }
    if (errorLower.includes('foreign key')) {
      return 'Bağlantı hatası. Lütfen sayfayı yenileyin ve tekrar deneyin.'
    }
    if (errorLower.includes('not null')) {
      return 'Zorunlu alanlar boş bırakılamaz. Lütfen tüm gerekli alanları doldurun.'
    }
    if (errorLower.includes('invalid input')) {
      return 'Geçersiz veri girişi. Lütfen verileri kontrol edin.'
    }
    if (errorLower.includes('permission denied')) {
      return 'Bu işlem için yetkiniz bulunmuyor.'
    }
    if (errorLower.includes('connection')) {
      return 'Bağlantı hatası. Lütfen internet bağlantınızı kontrol edin.'
    }
    
    return error // Eğer tanınmayan bir hata ise orijinal mesajı döndür
  }
  
  // URL unique kontrolü fonksiyonu
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
        .neq('id', siteId) // Mevcut site hariç
      
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
  
  // Title font preset state
  const [titleStylePresetId, setTitleStylePresetId] = useState<string>(defaultTitleFontPresetId)
  const [titleColor, setTitleColor] = useState<string>('#111827')
  const [titleFontSize, setTitleFontSize] = useState<number>(32)
  
  // Profile preset state
  const [profilePresetId, setProfilePresetId] = useState<string>(defaultProfilePresetId)
  const [avatarUrl, setAvatarUrl] = useState<string>('')

  useEffect(() => {
    const initializeParams = async () => {
      try {
        const resolvedParams = await params
        setSiteId(resolvedParams.id)
      } catch (error) {
        console.error('Failed to resolve params:', error)
        setError('Sayfa parametreleri yüklenemedi')
        setIsLoading(false)
      }
    }
    initializeParams()
  }, [params])

  useEffect(() => {
    if (siteId && user) {
    fetchSiteData()
    }
  }, [siteId, user])

  const fetchSiteData = async () => {
    if (!user || !siteId) {
      setIsLoading(false)
      return
    }
    
    try {
      // Check user role first
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single() as { data: any, error: any }
      
      const userRole = roleData?.role || 'pending'
      
      // Fetch page data - admin and moderator can edit any site
      let pageQuery = supabase
        .from('pages')
        .select('*')
        .eq('id', siteId)
      
      if (userRole !== 'admin' && userRole !== 'moderator') {
        pageQuery = pageQuery.eq('owner_id', user.id)
      }
      
      const { data: page, error: pageError } = await pageQuery.single() as { data: any, error: any }
      
      if (pageError || !page) {
        setError('Site bulunamadı veya düzenleme izniniz yok')
        return
      }
      
      // Decode target_url if it's in our special format
      let decodedTargetUrl = ''
      if (page.target_url === 'https://placeholder.empty') {
        decodedTargetUrl = ''
      } else if (page.target_url.startsWith('https://text/')) {
        decodedTargetUrl = decodeURIComponent(page.target_url.replace('https://text/', ''))
      } else {
        decodedTargetUrl = page.target_url
      }

      setFormData({
        title: page.title,
        site_slug: page.site_slug,
        target_url: decodedTargetUrl,
        is_enabled: page.is_enabled,
        description: page.meta?.description || ''
      })
      
      // Fetch actions
      const { data: actionsData, error: actionsError } = await supabase
        .from('page_actions')
        .select('*')
        .eq('page_id', siteId)
        .order('sort_order') as { data: any[], error: any }
      
      if (!actionsError && actionsData) {
        setActions(actionsData.map(action => ({
          ...action,
          preset: action.preset || defaultPresetId
        })))
      }
      
      // Fetch background preferences
      const { data: bgPrefs, error: bgError } = await supabase
        .from('background_preferences')
        .select('*')
        .eq('site_id', siteId)
        .single() as { data: any, error: any }
      
      if (!bgError && bgPrefs) {
        setBackgroundPreferences({ [siteId]: bgPrefs })
      }

      // Load title font preset from database first, then localStorage
      if (page.title_font_preset_id) {
        setTitleStylePresetId(page.title_font_preset_id)
        localStorage.setItem(`title-font-preset-${siteId}`, page.title_font_preset_id)
      } else {
        const savedTitlePreset = localStorage.getItem(`title-font-preset-${siteId}`)
        if (savedTitlePreset && titleFontPresets.find(p => p.id === savedTitlePreset)) {
          setTitleStylePresetId(savedTitlePreset)
        }
      }

      // Load title color from database first, then localStorage
      if (page.title_color) {
        setTitleColor(page.title_color)
        localStorage.setItem(`title-color-${siteId}`, page.title_color)
      } else {
        const savedTitleColor = localStorage.getItem(`title-color-${siteId}`)
        if (savedTitleColor) {
          setTitleColor(savedTitleColor)
        }
      }

      // Load title font size from database first, then localStorage
      if (page.title_font_size) {
        setTitleFontSize(page.title_font_size)
        localStorage.setItem(`title-font-size-${siteId}`, page.title_font_size.toString())
      } else {
        const savedTitleFontSize = localStorage.getItem(`title-font-size-${siteId}`)
        if (savedTitleFontSize) {
          setTitleFontSize(parseInt(savedTitleFontSize) || 28)
        }
      }


      // Load avatar URL from database first, then localStorage as fallback
      if (page.avatar_url) {
        setAvatarUrl(page.avatar_url)
        // Sync with localStorage
        localStorage.setItem(`avatar-url-${siteId}`, page.avatar_url)
      } else {
        const savedAvatarUrl = localStorage.getItem(`avatar-url-${siteId}`)
        if (savedAvatarUrl) {
          setAvatarUrl(savedAvatarUrl)
        }
      }
      
      // Load profile preset from database first, then localStorage
      if (page.profile_preset_id) {
        setProfilePresetId(page.profile_preset_id)
        localStorage.setItem(`profile-preset-${siteId}`, page.profile_preset_id)
      } else {
        const savedProfilePreset = localStorage.getItem(`profile-preset-${siteId}`)
        if (savedProfilePreset && profilePresets.find(p => p.id === savedProfilePreset)) {
          setProfilePresetId(savedProfilePreset)
        } else {
          setProfilePresetId(defaultProfilePresetId)
        }
      }
    } catch (err) {
      setError('Site verileri yüklenemedi')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAutoSave = async () => {
    if (!user || !siteId) return
    
    try {
      // Sadece eylem butonlarını kaydet
      for (let index = 0; index < actions.length; index++) {
        const action = actions[index]
        if (action.id) {
          // Update existing action
          const { error: updateError } = await (supabase as any)
            .from('page_actions')
            .update({
              label: action.label,
              href: action.href,
              variant: action.variant,
              preset: action.preset,
              description: action.description,
              sort_order: index,
              is_enabled: action.is_enabled,
              updated_at: new Date().toISOString()
            })
            .eq('id', action.id)
        
          if (updateError) throw updateError
        } else {
          // Create new action
          const { error: insertError } = await (supabase as any)
            .from('page_actions')
            .insert({
              page_id: siteId,
              label: action.label,
              href: action.href,
              variant: action.variant,
              preset: action.preset,
              description: action.description,
              sort_order: index,
              is_enabled: action.is_enabled
            })
          
          if (insertError) throw insertError
        }
      }
    } catch (err: any) {
      console.error('Auto-save error:', err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    
    if (!user) return
    
    // Validate slug
    if (!/^[a-z0-9\-]+$/.test(formData.site_slug)) {
      setError('URL adresi sadece küçük harfler, rakamlar ve tire içerebilir')
      return
    }
    
    // URL unique kontrolü
    if (urlError) {
      setError('Lütfen URL adresi hatasını düzeltin')
      return
    }
    
    // Son kontrol için URL unique kontrolü
    const isUrlUnique = await checkUrlUnique(formData.site_slug)
    if (!isUrlUnique) {
      setError('Bu URL adresi zaten kullanılıyor. Lütfen farklı bir URL adresi girin.')
      return
    }
    
    // Eylem butonları için URL kontrolü
    for (const action of actions) {
      if (action.is_enabled && (!action.href || action.href.trim() === '')) {
        setError('Aktif eylem butonları için URL adresi zorunludur. Lütfen tüm aktif butonlar için URL girin.')
        return
      }
    }
    
    setIsSaving(true)
    
    try {
      // Format target_url - if empty, use a placeholder URL, otherwise encode as text
      let formattedTargetUrl = ''
      if (!formData.target_url || formData.target_url.trim() === '') {
        // Use a placeholder URL for empty content
        formattedTargetUrl = 'https://placeholder.empty'
      } else if (!formData.target_url.startsWith('http://') && !formData.target_url.startsWith('https://')) {
        // Convert text to a data URL to satisfy the constraint
        formattedTargetUrl = `https://text/${encodeURIComponent(formData.target_url)}`
      } else {
        formattedTargetUrl = formData.target_url
      }

      // Update page
      const { error: pageError } = await (supabase as any)
        .from('pages')
        .update({
          title: formData.title,
          site_slug: formData.site_slug,
          target_url: formattedTargetUrl,
          is_enabled: formData.is_enabled,
          meta: { description: formData.description },
          avatar_url: avatarUrl,
          profile_preset_id: profilePresetId,
          title_font_preset_id: titleStylePresetId,
          title_color: titleColor,
          title_font_size: titleFontSize,
          updated_at: new Date().toISOString()
        })
        .eq('id', siteId)
        .eq('owner_id', user.id)
      
      if (pageError) throw pageError
      
      // Delete removed actions
      if (deletedActionIds.length > 0) {
        const { error: deleteError } = await supabase
          .from('page_actions')
          .delete()
          .in('id', deletedActionIds)
        
        if (deleteError) throw deleteError
      }
      
      // Update/create actions
      for (let index = 0; index < actions.length; index++) {
        const action = actions[index]
        if (action.id) {
          // Update existing action
          const { error: updateError } = await (supabase as any)
            .from('page_actions')
            .update({
              label: action.label,
              href: action.href,
              variant: action.variant,
              preset: action.preset,
              description: action.description,
              sort_order: index,
              is_enabled: action.is_enabled,
              updated_at: new Date().toISOString()
            })
            .eq('id', action.id)
        
          if (updateError) throw updateError
        } else {
          // Create new action
          const { error: insertError } = await (supabase as any)
            .from('page_actions')
            .insert({
              page_id: siteId,
              label: action.label,
              href: action.href,
              variant: action.variant,
              preset: action.preset,
              description: action.description,
              sort_order: index,
              is_enabled: action.is_enabled
            })
          
          if (insertError) throw insertError
        }
      }
      
      setSuccess('Site başarıyla güncellendi!')
      setDeletedActionIds([])
      fetchSiteData() // Refresh data
    } catch (err: any) {
      const translatedError = translateError(err.message || 'Site güncellenemedi')
      setError(translatedError)
    } finally {
      setIsSaving(false)
    }
  }
  
  const addAction = () => {
    setActions([...actions, {
      label: '',
      href: '',
      variant: 'outline',
      preset: defaultPresetId,
      description: '',
      sort_order: actions.length,
      is_enabled: true
    }])
  }
  
  const updateAction = (index: number, field: keyof Action, value: any) => {
    const newActions = [...actions]
    newActions[index] = { ...newActions[index], [field]: value }
    setActions(newActions)
    
    // Otomatik kaydetme - eylem butonları değiştiğinde
    if (field === 'label' || field === 'href' || field === 'is_enabled') {
      setTimeout(() => {
        handleAutoSave()
      }, 1000) // 1 saniye bekle
    }
  }
  
  const removeAction = (index: number) => {
    const action = actions[index]
    if (action.id) {
      setDeletedActionIds([...deletedActionIds, action.id])
    }
    setActions(actions.filter((_, i) => i !== index))
  }

  const moveAction = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return
    setActions(prev => {
      const updated = [...prev]
      const [moved] = updated.splice(fromIndex, 1)
      updated.splice(toIndex, 0, moved)
      return updated.map((a, idx) => ({ ...a, sort_order: idx }))
    })
  }

  const handleBackgroundSave = async (presetId: string, controls: Record<string, string | number>) => {
    try {
      if (presetId === '') {
        // Remove background preference
        const { error } = await supabase
          .from('background_preferences')
          .delete()
          .eq('site_id', siteId)
        
        if (error) throw error
        setBackgroundPreferences({})
      } else {
        // Upsert background preference
        const { error } = await (supabase as any)
          .from('background_preferences')
          .upsert({
            site_id: siteId,
            preset_id: presetId,
            control_values: controls
          }, {
            onConflict: 'site_id'
          })
        
        if (error) throw error
        setBackgroundPreferences({
          [siteId]: {
            site_id: siteId,
            preset_id: presetId,
            control_values: controls
          }
        })
      }
    } catch (err: any) {
      throw new Error(err.message || 'Failed to save background preference')
    }
  }
  
  const handleTitleStyleSave = async (presetId: string) => {
    // Save to state and localStorage for immediate preview
    setTitleStylePresetId(presetId)
    
    if (siteId) {
      localStorage.setItem(`title-font-preset-${siteId}`, presetId)
      
      // Save to database
      if (user?.id) {
        try {
          const { error } = await (supabase as any)
            .from('pages')
            .update({ 
              title_font_preset_id: presetId
            })
            .eq('id', siteId)
            .eq('owner_id', user.id)
        
          if (error) {
            console.error('Failed to save title style to database:', error)
          }
        } catch (err) {
          console.error('Error saving title style:', err)
        }
      }
    }
  }

  const handleProfileStyleSave = async (presetId: string) => {
    // Save to state and localStorage for immediate preview
    setProfilePresetId(presetId)
    
    if (siteId) {
      localStorage.setItem(`profile-preset-${siteId}`, presetId)
      
      // Save to database
      if (user?.id) {
        try {
          const { error } = await (supabase as any)
            .from('pages')
            .update({ profile_preset_id: presetId })
            .eq('id', siteId)
            .eq('owner_id', user.id)
        
          if (error) {
            console.error('Failed to save profile preset to database:', error)
          }
        } catch (err) {
          console.error('Error saving profile preset:', err)
        }
      }
    }
  }

  const handleAvatarChange = async (url: string) => {
    // If URL is empty (avatar removed), also clear from localStorage
    if (!url && siteId) {
      localStorage.removeItem(`avatar-url-${siteId}`)
    } else if (siteId) {
      // Save to localStorage for immediate effect
      localStorage.setItem(`avatar-url-${siteId}`, url)
    }
    
    setAvatarUrl(url)
    
    // Also save to database (temporarily disabled due to type issues)
    // try {
    //   const { error } = await supabase
    //     .from('pages')
    //     .update({ avatar_url: url })
    //     .eq('id', siteId)
    //     .eq('owner_id', user?.id)
    //   
    //   if (error) {
    //     console.error('Failed to save avatar URL to database:', error)
    //   }
    // } catch (err) {
    //   console.error('Error saving avatar URL:', err)
    // }
  }

  if (isLoading || authLoading) {
    return <LoadingScreen message="Site yükleniyor..." />
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-neutral-100">
      <PageHeader
        title="linkfy."
        subtitle="Site Düzenle"
        icon={<Edit className="w-6 h-6 text-white" />}
        showBackButton={true}
        backUrl="/dashboard"
        backLabel="Dashboard"
      />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit}>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Site Yapılandırması</CardTitle>
              <CardDescription>
                Site ayarlarınızı ve görünümünü güncelleyin
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Site Başlığı*</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Harika Sitem"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="slug">URL Adresi*</Label>
                  <div className="relative">
                    <Input
                      id="slug"
                      value={formData.site_slug}
                      onChange={async (e) => {
                        const newSlug = e.target.value.toLowerCase().replace(/[^a-z0-9\-]/g, '')
                        setFormData({ 
                          ...formData, 
                          site_slug: newSlug
                        })
                        
                        // URL unique kontrolü (debounce ile)
                        if (newSlug && newSlug !== formData.site_slug) {
                          setTimeout(() => {
                            checkUrlUnique(newSlug)
                          }, 500)
                        }
                      }}
                      placeholder="my-site"
                      pattern="[a-z0-9\-]+"
                      required
                      className={urlError ? 'border-red-500 focus:border-red-500' : ''}
                    />
                    {isCheckingUrl && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>
                  {urlError ? (
                    <p className="text-xs text-red-600 mt-1">{urlError}</p>
                  ) : (
                    <p className="text-xs text-gray-500">/{formData.site_slug}</p>
                  )}
                </div>
              </div>
              
              
              
              <div className="flex items-center justify-between">
                <Label htmlFor="enabled" className="flex items-center cursor-pointer">
                  <Switch
                    id="enabled"
                    checked={formData.is_enabled}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_enabled: checked })}
                  />
                  <span className="ml-2">Site {formData.is_enabled ? 'aktif' : 'pasif'}</span>
                </Label>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Eylem Butonları</CardTitle>
                  <CardDescription>
                    Sitenizde görünecek butonları yapılandırın
                  </CardDescription>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addAction}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Eylem Ekle
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {actions.length === 0 ? (
                <p className="text-center text-gray-500 py-4">
                  Henüz eylem yapılandırılmamış. Ziyaretçileriniz için hızlı bağlantılar sağlamak üzere eylem butonları ekleyin.
                </p>
              ) : (
                <div className="space-y-4">
                  {actions.map((action, index) => (
                    <div
                      key={action.id ?? index}
                      draggable
                      onDragStart={() => setDraggedIndex(index)}
                      onDragOver={(e) => { e.preventDefault(); setDragOverIndex(index) }}
                      onDragLeave={() => setDragOverIndex(null)}
                      onDrop={(e) => { e.preventDefault(); if (draggedIndex !== null) moveAction(draggedIndex, index); setDraggedIndex(null); setDragOverIndex(null) }}
                      className={`p-4 bg-gray-50 rounded-lg border ${dragOverIndex === index ? 'ring-2 ring-blue-300' : ''}`}
                    >
                      {/* Header row with drag handle and delete button */}
                      <div className="flex items-center gap-2 mb-3">
                        <span className="flex items-center cursor-grab select-none">
                          <GripVertical className="h-4 w-4 text-gray-400" />
                        </span>
                        <div className="flex-1 text-sm font-medium text-gray-700">
                          Eylem {index + 1}
                        </div>
                        <Switch
                          checked={action.is_enabled}
                          onCheckedChange={(checked) => updateAction(index, 'is_enabled', checked)}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAction(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      {/* Form fields */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor={`label-${index}`} className="text-sm font-medium">
                            Etiket
                          </Label>
                          <Input
                            id={`label-${index}`}
                            placeholder="Buton metni"
                            value={action.label}
                            onChange={(e) => updateAction(index, 'label', e.target.value)}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`href-${index}`} className="text-sm font-medium">
                            URL
                          </Label>
                          <Input
                            id={`href-${index}`}
                            placeholder="https://..."
                            value={action.href}
                            onChange={(e) => updateAction(index, 'href', e.target.value)}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`preset-${index}`} className="text-sm font-medium">
                            Stil
                          </Label>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setCurrentActionIndex(index)
                              setButtonPresetSelectorOpen(true)
                            }}
                            className="mt-1 w-full justify-start"
                          >
                            <Palette className="h-4 w-4 mr-2" />
                            Stil Seç
                          </Button>
                        </div>
                        <div>
                          <Label htmlFor={`description-${index}`} className="text-sm font-medium">
                            Açıklama (isteğe bağlı)
                          </Label>
                          <Textarea
                            id={`description-${index}`}
                            placeholder="Bu eylem hakkında kısa açıklama..."
                            value={action.description || ''}
                            onChange={(e) => updateAction(index, 'description', e.target.value)}
                            className="mt-1 min-h-[60px]"
                            rows={2}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Arka Plan Ayarları
              </CardTitle>
              <CardDescription>
                Sitenizin arka plan görünümünü özelleştirin
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <BackgroundPreviewChip
                    presetId={backgroundPreferences[siteId]?.preset_id}
                    controlValues={backgroundPreferences[siteId]?.control_values}
                  />
                  <div>
                    <p className="text-sm font-medium">
                      {backgroundPreferences[siteId]?.preset_id 
                        ? `Özel arka plan uygulandı` 
                        : 'Varsayılan arka plan kullanılıyor'
                      }
                    </p>
                    <p className="text-xs text-gray-500">
                      Arka plan stilini değiştirmek için tıklayın
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setBackgroundSelectorOpen(true)}
                >
                  <Palette className="h-4 w-4 mr-2" />
                  Arka Planı Değiştir
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Title Font & Color Card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Type className="h-5 w-5" />
                Başlık Fontu & Rengi
              </CardTitle>
              <CardDescription>
                Başlığınız için font stili ve rengi seçin
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Font Style Section */}
                <div>
                  <Label className="text-sm font-medium mb-3 block">Font Stili</Label>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 rounded-lg border border-gray-200 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                        <span
                          style={{
                            fontFamily: titleFontPresets.find(p => p.id === titleStylePresetId)?.fontFamily || 'Helvetica',
                            fontSize: '10px',
                            fontWeight: titleFontPresets.find(p => p.id === titleStylePresetId)?.fontWeight || '600',
                            color: titleColor,
                            letterSpacing: titleFontPresets.find(p => p.id === titleStylePresetId)?.letterSpacing || '-0.02em'
                          }}
                        >
                          Aa
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {titleFontPresets.find(p => p.id === titleStylePresetId)?.name || 'Modern Sans'}
                        </p>
                        <p className="text-xs text-gray-500">
                          Font stilini değiştirmek için tıklayın
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setTitleFontSelectorOpen(true)}
                    >
                      <Type className="h-4 w-4 mr-2" />
                      Fontu Değiştir
                    </Button>
                  </div>
                </div>

                {/* Color and Font Size Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Color Section */}
                  <div>
                    <Label className="text-sm font-medium mb-3 block">Metin Rengi</Label>
                    <div className="flex items-center gap-4">
                      <div 
                        className="w-12 h-12 rounded-lg border-2 border-gray-200 flex items-center justify-center"
                        style={{ backgroundColor: titleColor }}
                      >
                        <span 
                          className="font-bold"
                          style={{ 
                            color: titleColor,
                            fontFamily: titleFontPresets.find(p => p.id === titleStylePresetId)?.fontFamily || 'Helvetica',
                            fontWeight: titleFontPresets.find(p => p.id === titleStylePresetId)?.fontWeight || '600'
                          }}
                        >
                          Aa
                        </span>
                      </div>
                      <div className="flex-1">
                        <Input
                          id="titleColor"
                          type="color"
                          value={titleColor}
                          onChange={(e) => {
                            setTitleColor(e.target.value)
                            if (siteId) {
                              localStorage.setItem(`title-color-${siteId}`, e.target.value)
                            }
                          }}
                          className="w-20 h-8 p-1 border rounded cursor-pointer"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          {titleColor}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Font Size Section */}
                  <div>
                    <Label className="text-sm font-medium mb-3 block">Font Boyutu</Label>
                    <div className="flex items-center gap-4">
                      <div 
                        className="w-12 h-12 rounded-lg border-2 border-gray-200 flex items-center justify-center bg-gray-50"
                      >
                        <span 
                          className="font-bold"
                          style={{ 
                            color: titleColor,
                            fontFamily: titleFontPresets.find(p => p.id === titleStylePresetId)?.fontFamily || 'Helvetica',
                            fontWeight: titleFontPresets.find(p => p.id === titleStylePresetId)?.fontWeight || '600',
                            fontSize: `${Math.min(Math.max(titleFontSize, 12), 72)}px`
                          }}
                        >
                          Aa
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Input
                            id="titleFontSize"
                            type="number"
                            min="12"
                            max="72"
                            value={titleFontSize}
                            onChange={(e) => {
                              const newSize = parseInt(e.target.value) || 28
                              setTitleFontSize(Math.min(Math.max(newSize, 12), 72))
                              if (siteId) {
                                localStorage.setItem(`title-font-size-${siteId}`, newSize.toString())
                              }
                            }}
                            className="w-20 h-8 text-center"
                          />
                          <span className="text-sm text-gray-500">px</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {titleFontSize}px
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profil Kartı Stili
              </CardTitle>
              <CardDescription>
                Profil kartınızın tasarım stilini ve avatarını özelleştirin
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar Upload Section */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Profil Avatarı</h4>
                <AvatarUploader
                  siteId={siteId}
                  currentAvatarUrl={avatarUrl}
                  onAvatarChange={handleAvatarChange}
                />
              </div>

              {/* Style Selection Section */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Kart Stili</h4>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-16 h-16 rounded-lg border border-gray-200 relative overflow-hidden"
                      style={{
                        background: profilePresets.find(p => p.id === profilePresetId)?.styles.containerBackground || 'rgba(255, 255, 255, 0.95)',
                        borderRadius: '8px',
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                      }}
                    >
                      {/* Mini avatar preview */}
                      <div
                        className="absolute top-1 left-1/2 transform -translate-x-1/2"
                        style={{
                          width: '12px',
                          height: '12px',
                          borderRadius: profilePresets.find(p => p.id === profilePresetId)?.styles.avatarBorderRadius || '50%',
                          background: profilePresets.find(p => p.id === profilePresetId)?.styles.avatarBackground || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                        }}
                      />
                      {/* Mini title preview */}
                      <div
                        className="absolute bottom-1 left-1 right-1 h-1 rounded"
                        style={{
                          background: titleColor || '#1f2937',
                          opacity: 0.7
                        }}
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {profilePresets.find(p => p.id === profilePresetId)?.name || 'Minimal Clean'}
                      </p>
                      <p className="text-xs text-gray-500">
                        Kart stilini değiştirmek için tıklayın
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setProfileCardSelectorOpen(true)}
                  >
                    <User className="h-4 w-4 mr-2" />
                    Stili Değiştir
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">
              {error}
            </div>
          )}
          
          {success && (
            <div className="bg-green-50 text-green-600 text-sm p-3 rounded-lg mb-4">
              {success}
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/dashboard')}
            >
              İptal
            </Button>
            <Button type="submit" disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
            </Button>
          </div>
        </form>

        {/* Background Selector Dialog */}
        {backgroundSelectorOpen && (
          <BackgroundSelector
            siteId={siteId}
            currentPresetId={backgroundPreferences[siteId]?.preset_id}
            currentControls={backgroundPreferences[siteId]?.control_values}
            onSave={async (presetId, controls) => {
              await handleBackgroundSave(presetId, controls)
              setBackgroundSelectorOpen(false)
            }}
            onClose={() => setBackgroundSelectorOpen(false)}
          />
        )}

        {/* Title Font Selector Dialog */}
        {titleFontSelectorOpen && (
          <TitleFontSelector
            siteId={siteId}
            currentPresetId={titleStylePresetId}
            currentTitle={formData.title}
            onSave={handleTitleStyleSave}
            onClose={() => setTitleFontSelectorOpen(false)}
          />
        )}

        {/* Profile Card Selector Dialog */}
        {profileCardSelectorOpen && (
          <ProfileCardSelector
            siteId={siteId}
            currentPresetId={profilePresetId}
            onSave={handleProfileStyleSave}
            onClose={() => setProfileCardSelectorOpen(false)}
          />
        )}

        {/* Button Preset Selector Dialog */}
        {buttonPresetSelectorOpen && (
          <ButtonPresetSelector
            currentPresetId={actions[currentActionIndex]?.preset || defaultPresetId}
            onSave={(presetId) => {
              updateAction(currentActionIndex, 'preset', presetId)
              setButtonPresetSelectorOpen(false)
            }}
            onClose={() => setButtonPresetSelectorOpen(false)}
          />
        )}
      </main>
    </div>
  )
}