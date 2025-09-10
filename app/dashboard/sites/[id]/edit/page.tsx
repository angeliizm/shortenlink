'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/stores/auth-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { PresetSelector } from '@/components/ui/preset-selector'
import { defaultPresetId } from '@/lib/button-presets'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Save, Plus, Trash2, Globe, GripVertical, Palette, Type } from 'lucide-react'
import { BackgroundPreviewChip } from '@/components/dashboard/BackgroundPreviewChip'
import { BackgroundSelector } from '@/components/dashboard/BackgroundSelector'
import { backgroundPresets, applyPresetControls } from '@/lib/background-presets'
import { TitleStyleSelector } from '@/components/title-style-selector'

interface PageProps {
  params: { id: string }
}

interface Action {
  id?: string
  label: string
  href: string
  variant: 'primary' | 'outline' | 'ghost'
  preset: string
  sort_order: number
  is_enabled: boolean
}

export default function EditSitePage({ params }: PageProps) {
  const router = useRouter()
  const { user } = useAuth()
  const supabase = createClient()
  
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const [formData, setFormData] = useState({
    title: '',
    site_slug: '',
    target_url: '',
    brand_color: '#3B82F6',
    accent_color: '#EFF6FF',
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
  
  // Title style preset state
  const [titleStylePresetId, setTitleStylePresetId] = useState<string | undefined>(undefined)

  useEffect(() => {
    fetchSiteData()
  }, [params.id])

  const fetchSiteData = async () => {
    if (!user) return
    
    try {
      // Fetch page data
      const { data: page, error: pageError } = await supabase
        .from('pages')
        .select('*')
        .eq('id', params.id)
        .eq('owner_id', user.id)
        .single() as { data: any, error: any }
      
      if (pageError || !page) {
        setError('Site not found or you do not have permission to edit it')
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
        brand_color: page.brand_color,
        accent_color: page.accent_color || '#EFF6FF',
        is_enabled: page.is_enabled,
        description: page.meta?.description || ''
      })
      
      // Fetch actions
      const { data: actionsData, error: actionsError } = await supabase
        .from('page_actions')
        .select('*')
        .eq('page_id', params.id)
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
        .eq('site_id', params.id)
        .single() as { data: any, error: any }
      
      if (!bgError && bgPrefs) {
        setBackgroundPreferences({ [params.id]: bgPrefs })
      }

      // Fetch title style preference (optional table)
      let titlePref: any = null
      try {
        const { data } = await supabase
          .from('title_style_preferences')
          .select('preset_id')
          .eq('site_id', params.id)
          .single()
        titlePref = data
      } catch (e) {
        titlePref = null
      }
      if (titlePref?.preset_id) {
        setTitleStylePresetId(titlePref.preset_id)
      } else {
        setTitleStylePresetId(undefined)
      }
    } catch (err) {
      setError('Failed to load site data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    
    if (!user) return
    
    // Validate slug
    if (!/^[a-z0-9-]+$/.test(formData.site_slug)) {
      setError('Slug can only contain lowercase letters, numbers, and hyphens')
      return
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
          brand_color: formData.brand_color,
          accent_color: formData.accent_color,
          is_enabled: formData.is_enabled,
          meta: { description: formData.description },
          updated_at: new Date().toISOString()
        })
        .eq('id', params.id)
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
              page_id: params.id,
              label: action.label,
              href: action.href,
              variant: action.variant,
              preset: action.preset,
              sort_order: index,
              is_enabled: action.is_enabled
            })
          
          if (insertError) throw insertError
        }
      }
      
      setSuccess('Site updated successfully!')
      setDeletedActionIds([])
      fetchSiteData() // Refresh data
    } catch (err: any) {
      setError(err.message || 'Failed to update site')
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
      sort_order: actions.length,
      is_enabled: true
    }])
  }
  
  const updateAction = (index: number, field: keyof Action, value: any) => {
    const newActions = [...actions]
    newActions[index] = { ...newActions[index], [field]: value }
    setActions(newActions)
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
          .eq('site_id', params.id)
        
        if (error) throw error
        setBackgroundPreferences({})
      } else {
        // Upsert background preference
        const { error } = await (supabase as any)
          .from('background_preferences')
          .upsert({
            site_id: params.id,
            preset_id: presetId,
            control_values: controls
          }, {
            onConflict: 'site_id'
          })
        
        if (error) throw error
        setBackgroundPreferences({
          [params.id]: {
            site_id: params.id,
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
    const response = await fetch('/api/title-style-preferences', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        siteId: params.id,
        presetId,
      })
    })
    
    if (!response.ok) {
      throw new Error('Failed to save title style')
    }
    
    setTitleStylePresetId(presetId)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-neutral-50 to-neutral-100">
        <div className="text-center">
          <svg className="animate-spin h-8 w-8 text-blue-600 mx-auto" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="mt-2 text-gray-600">Loading site...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-neutral-100">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/dashboard')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div className="flex items-center space-x-2">
                <Globe className="h-5 w-5 text-blue-600" />
                <h1 className="text-lg font-semibold">Edit Site</h1>
              </div>
            </div>
            
            <Button
              onClick={() => window.open(`/${formData.site_slug}`, '_blank')}
              variant="outline"
            >
              Preview Site
            </Button>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit}>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Site Configuration</CardTitle>
              <CardDescription>
                Update your site settings and appearance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Site Title*</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="My Awesome Site"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="slug">URL Slug*</Label>
                  <Input
                    id="slug"
                    value={formData.site_slug}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      site_slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')
                    })}
                    placeholder="my-site"
                    pattern="[a-z0-9-]+"
                    required
                  />
                  <p className="text-xs text-gray-500">/{formData.site_slug}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="target_url">Content Title (Optional)</Label>
                <Input
                  id="target_url"
                  type="text"
                  value={formData.target_url}
                  onChange={(e) => setFormData({ ...formData, target_url: e.target.value })}
                  placeholder="Enter any title or text (optional)"
                />
                <p className="text-xs text-gray-500">This can be any text you want to display, or leave empty</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="brand_color">Brand Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="brand_color"
                      type="color"
                      value={formData.brand_color}
                      onChange={(e) => setFormData({ ...formData, brand_color: e.target.value })}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={formData.brand_color}
                      onChange={(e) => setFormData({ ...formData, brand_color: e.target.value })}
                      placeholder="#3B82F6"
                      pattern="#[0-9A-Fa-f]{6}"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="accent_color">Accent Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="accent_color"
                      type="color"
                      value={formData.accent_color}
                      onChange={(e) => setFormData({ ...formData, accent_color: e.target.value })}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={formData.accent_color}
                      onChange={(e) => setFormData({ ...formData, accent_color: e.target.value })}
                      placeholder="#EFF6FF"
                      pattern="#[0-9A-Fa-f]{6}"
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description (SEO)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description for search engines..."
                  rows={2}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="enabled" className="flex items-center cursor-pointer">
                  <Switch
                    id="enabled"
                    checked={formData.is_enabled}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_enabled: checked })}
                  />
                  <span className="ml-2">Site is {formData.is_enabled ? 'enabled' : 'disabled'}</span>
                </Label>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Action Buttons</CardTitle>
                  <CardDescription>
                    Configure buttons that appear on your site
                  </CardDescription>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addAction}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Action
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {actions.length === 0 ? (
                <p className="text-center text-gray-500 py-4">
                  No actions configured. Add action buttons to provide quick links for your visitors.
                </p>
              ) : (
                <div className="space-y-3">
                  {actions.map((action, index) => (
                    <div
                      key={action.id ?? index}
                      draggable
                      onDragStart={() => setDraggedIndex(index)}
                      onDragOver={(e) => { e.preventDefault(); setDragOverIndex(index) }}
                      onDragLeave={() => setDragOverIndex(null)}
                      onDrop={(e) => { e.preventDefault(); if (draggedIndex !== null) moveAction(draggedIndex, index); setDraggedIndex(null); setDragOverIndex(null) }}
                      className={`flex gap-2 p-3 bg-gray-50 rounded-lg ${dragOverIndex === index ? 'ring-2 ring-blue-300' : ''}`}
                    >
                      <span className="flex items-center pr-1 cursor-grab select-none">
                        <GripVertical className="h-4 w-4 text-gray-400" />
                      </span>
                      <Input
                        placeholder="Label"
                        value={action.label}
                        onChange={(e) => updateAction(index, 'label', e.target.value)}
                        className="flex-1"
                      />
                      <Input
                        placeholder="https://..."
                        value={action.href}
                        onChange={(e) => updateAction(index, 'href', e.target.value)}
                        className="flex-1"
                      />
                      <PresetSelector
                        value={action.preset}
                        onChange={(value) => updateAction(index, 'preset', value)}
                        className="w-40"
                      />
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
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Background Settings
              </CardTitle>
              <CardDescription>
                Customize the background appearance of your site
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <BackgroundPreviewChip
                    presetId={backgroundPreferences[params.id]?.preset_id}
                    controlValues={backgroundPreferences[params.id]?.control_values}
                  />
                  <div>
                    <p className="text-sm font-medium">
                      {backgroundPreferences[params.id]?.preset_id 
                        ? `Custom background applied` 
                        : 'Using default background'
                      }
                    </p>
                    <p className="text-xs text-gray-500">
                      Click to change background style
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setBackgroundSelectorOpen(true)}
                >
                  <Palette className="h-4 w-4 mr-2" />
                  Change Background
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardContent className="pt-6">
              <TitleStyleSelector
                siteId={params.id}
                currentTitle={formData.title}
                currentDescription={formData.description}
                currentPresetId={titleStylePresetId}
                backgroundStyle={backgroundPreferences[params.id]
                  ? applyPresetControls(
                      backgroundPresets.find(p => p.id === backgroundPreferences[params.id].preset_id) || backgroundPresets[0],
                      backgroundPreferences[params.id]?.control_values || {}
                    )
                  : undefined}
                onSave={handleTitleStyleSave}
              />
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
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>

        {/* Background Selector Dialog */}
        {backgroundSelectorOpen && (
          <BackgroundSelector
            siteId={params.id}
            currentPresetId={backgroundPreferences[params.id]?.preset_id}
            currentControls={backgroundPreferences[params.id]?.control_values}
            onSave={async (presetId, controls) => {
              await handleBackgroundSave(presetId, controls)
              setBackgroundSelectorOpen(false)
            }}
            onClose={() => setBackgroundSelectorOpen(false)}
          />
        )}
      </main>
    </div>
  )
}