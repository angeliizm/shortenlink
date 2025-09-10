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
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Plus, Trash2 } from 'lucide-react'
import { PresetSelector } from '@/components/ui/preset-selector'
import { defaultPresetId } from '@/lib/button-presets'

interface CreateSiteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

interface Action {
  label: string
  href: string
  variant: 'primary' | 'outline' | 'ghost'
  preset: string
}

export default function CreateSiteDialog({ open, onOpenChange, onSuccess }: CreateSiteDialogProps) {
  const { user } = useAuth()
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [canCreate, setCanCreate] = useState(false)
  
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
      setError('Slug can only contain lowercase letters, numbers, and hyphens')
      return
    }
    
    setIsLoading(true)
    
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

      // Create the page
      const { data: page, error: pageError } = await supabase
        .from('pages')
        .insert({
          title: formData.title,
          site_slug: formData.site_slug,
          target_url: formattedTargetUrl,
          brand_color: formData.brand_color,
          accent_color: formData.accent_color,
          is_enabled: formData.is_enabled,
          owner_id: user.id,
          meta: formData.description ? { description: formData.description } : {}
        } as any)
        .select()
        .single() as { data: { id: string } | null; error: any }
      
      if (pageError) throw pageError
      
      if (!page) throw new Error('Failed to create page')
      
      // Create actions if any
      if (actions.length > 0 && page) {
        const actionsToInsert = actions.map((action, index) => ({
          page_id: page.id,
          label: action.label,
          href: action.href,
          variant: action.variant,
          preset: action.preset,
          sort_order: index,
          is_enabled: true
        }))
        
        const { error: actionsError } = await supabase
          .from('page_actions')
          .insert(actionsToInsert as any)
        
        if (actionsError) throw actionsError
      }
      
      onSuccess()
      resetForm()
      onOpenChange(false)
    } catch (err: any) {
      setError(err.message || 'Failed to create site')
    } finally {
      setIsLoading(false)
    }
  }
  
  const resetForm = () => {
    setFormData({
      title: '',
      site_slug: '',
      target_url: '',
      brand_color: '#3B82F6',
      accent_color: '#EFF6FF',
      is_enabled: true,
      description: ''
    })
    setActions([])
    setError('')
  }
  
  const addAction = () => {
    setActions([...actions, { label: '', href: '', variant: 'outline', preset: defaultPresetId }])
  }
  
  const updateAction = (index: number, field: keyof Action, value: string) => {
    const newActions = [...actions]
    newActions[index] = { ...newActions[index], [field]: value }
    setActions(newActions)
  }
  
  const removeAction = (index: number) => {
    setActions(actions.filter((_, i) => i !== index))
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Site</DialogTitle>
            <DialogDescription>
              Configure your new dynamic site with custom branding and actions
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Site Title*</Label>
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
                  pattern="^[a-z0-9-]+$"
                  required
                />
                <p className="text-xs text-gray-500">/{formData.site_slug || 'your-slug'}</p>
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
                    pattern="^#[0-9A-Fa-f]{6}$"
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
                    pattern="^#[0-9A-Fa-f]{6}$"
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
                <span className="ml-2">Enable site immediately</span>
              </Label>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Action Buttons</Label>
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
              
              {actions.length > 0 && (
                <div className="space-y-2">
                  {actions.map((action, index) => (
                    <div key={index} className="flex gap-2 p-3 bg-gray-50 rounded-lg">
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
            </div>
            
            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">
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
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Site'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}