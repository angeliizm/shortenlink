'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import ButtonPresetSelector from '@/components/dashboard/ButtonPresetSelector'
import { getPresetById, defaultPresetId } from '@/lib/button-presets'
import {
  CheckSquare, Square, ExternalLink, GripVertical, Plus, RefreshCw,
  AlertTriangle, ChevronDown, ChevronRight, Search, Loader2, Palette, Trash2
} from 'lucide-react'

interface SiteAction {
  id: string
  page_id: string
  label: string
  href: string
  variant: 'primary' | 'outline' | 'ghost'
  preset: string
  sort_order: number
  is_enabled: boolean
}

interface Site {
  id: string
  site_slug: string
  title: string
  is_enabled: boolean
  actions: SiteAction[]
}

export default function BulkSiteManager() {
  const [sites, setSites] = useState<Site[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [searchTerm, setSearchTerm] = useState('')
  const [applying, setApplying] = useState(false)
  const [resultMsg, setResultMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Preset selector dialog state — keep mounted to avoid Radix cleanup bug
  const [presetSelectorOpenFor, setPresetSelectorOpenFor] = useState<'add' | 'update' | null>(null)
  const closePresetSelector = () => setPresetSelectorOpenFor(null)

  // Add button form
  const [addLabel, setAddLabel] = useState('')
  const [addHref, setAddHref] = useState('')
  const [addPreset, setAddPreset] = useState(defaultPresetId)
  const [addEnabled, setAddEnabled] = useState(true)

  // Update button form
  const [updateTargetLabel, setUpdateTargetLabel] = useState('')
  const [updateNewLabel, setUpdateNewLabel] = useState('')
  const [updateHref, setUpdateHref] = useState('')
  const [updatePreset, setUpdatePreset] = useState(defaultPresetId)
  const [updateEnabled, setUpdateEnabled] = useState(true)
  const [preserveHref, setPreserveHref] = useState(true)

  // Remove button form
  const [removeLabel, setRemoveLabel] = useState('')

  // Reorder form
  const [labelOrder, setLabelOrder] = useState<string[]>([])
  const [draggedOrderIdx, setDraggedOrderIdx] = useState<number | null>(null)
  const [dragOverOrderIdx, setDragOverOrderIdx] = useState<number | null>(null)

  useEffect(() => {
    fetchSites()
  }, [])

  async function fetchSites() {
    setLoading(true)
    setResultMsg(null)
    try {
      const res = await fetch('/api/admin/bulk-actions')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Yüklenemedi')
      setSites(data.sites || [])
    } catch (e: any) {
      setResultMsg({ type: 'error', text: e.message })
    } finally {
      setLoading(false)
    }
  }

  const filteredSites = sites.filter(s =>
    s.site_slug.includes(searchTerm.toLowerCase()) ||
    s.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  function toggleSelectAll() {
    if (selectedIds.size === filteredSites.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredSites.map(s => s.id)))
    }
  }

  function toggleSite(id: string) {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleExpand(id: string) {
    setExpandedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const allLabels = Array.from(new Set(sites.flatMap(s => s.actions.map(a => a.label)))).sort()

  async function applyOperation(operation: string, extraBody: Record<string, any>) {
    if (selectedIds.size === 0) {
      setResultMsg({ type: 'error', text: 'Lütfen en az bir site seçin.' })
      return
    }
    setApplying(true)
    setResultMsg(null)
    try {
      const res = await fetch('/api/admin/bulk-actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operation,
          site_ids: Array.from(selectedIds),
          ...extraBody,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'İşlem başarısız')

      const { updated, failed, errors } = data
      if (failed > 0) {
        setResultMsg({
          type: 'error',
          text: `${updated} sitede güncellendi, ${failed} sitede hata oluştu. ${errors.join('; ')}`,
        })
      } else {
        setResultMsg({ type: 'success', text: `${updated} sitede başarıyla uygulandı.` })
        await fetchSites()
      }
    } catch (e: any) {
      setResultMsg({ type: 'error', text: e.message })
    } finally {
      setApplying(false)
    }
  }

  function handleAddButton() {
    if (!addLabel.trim() || !addHref.trim()) {
      setResultMsg({ type: 'error', text: 'Buton başlığı ve URL zorunludur.' })
      return
    }
    applyOperation('add_button', {
      button: { label: addLabel.trim(), href: addHref.trim(), preset: addPreset, variant: 'outline', is_enabled: addEnabled },
    })
  }

  function handleUpdateButton() {
    if (!updateTargetLabel) {
      setResultMsg({ type: 'error', text: 'Güncellenecek buton seçilmelidir.' })
      return
    }
    const btn: Record<string, any> = {
      label: updateTargetLabel,
      preset: updatePreset,
      variant: 'outline',
      is_enabled: updateEnabled,
    }
    if (updateNewLabel.trim()) btn.new_label = updateNewLabel.trim()
    if (updateHref.trim()) btn.href = updateHref.trim()

    applyOperation('update_button', { button: btn, preserve_href: preserveHref })
  }

  function handleReorder() {
    if (labelOrder.length === 0) {
      setResultMsg({ type: 'error', text: 'Sıralama listesi boş.' })
      return
    }
    applyOperation('reorder', { label_order: labelOrder })
  }

  function handleRemoveButton() {
    if (!removeLabel) {
      setResultMsg({ type: 'error', text: 'Kaldırılacak buton seçilmelidir.' })
      return
    }
    applyOperation('remove_button', { button: { label: removeLabel } })
  }

  function handleOrderDragStart(idx: number) { setDraggedOrderIdx(idx) }
  function handleOrderDragOver(e: React.DragEvent, idx: number) { e.preventDefault(); setDragOverOrderIdx(idx) }
  function handleOrderDrop(idx: number) {
    if (draggedOrderIdx === null || draggedOrderIdx === idx) return
    setLabelOrder(prev => {
      const updated = [...prev]
      const [moved] = updated.splice(draggedOrderIdx, 1)
      updated.splice(idx, 0, moved)
      return updated
    })
    setDraggedOrderIdx(null)
    setDragOverOrderIdx(null)
  }

  function addLabelToOrder(label: string) {
    if (!labelOrder.includes(label)) setLabelOrder(prev => [...prev, label])
  }
  function removeLabelFromOrder(label: string) {
    setLabelOrder(prev => prev.filter(l => l !== label))
  }

  function onUpdateTargetChange(label: string) {
    setUpdateTargetLabel(label)
    setUpdateNewLabel('')
    setUpdateHref('')
    const firstMatch = sites.flatMap(s => s.actions).find(a => a.label === label)
    if (firstMatch) {
      setUpdatePreset(firstMatch.preset || defaultPresetId)
      setUpdateEnabled(firstMatch.is_enabled)
    }
  }

  const allSelected = filteredSites.length > 0 && selectedIds.size === filteredSites.length
  const addPresetInfo = getPresetById(addPreset)
  const updatePresetInfo = getPresetById(updatePreset)

  // Render the preset button preview inline
  function PresetButton({ presetId, onClick }: { presetId: string; onClick: () => void }) {
    const preset = getPresetById(presetId)
    if (!preset) return (
      <Button type="button" variant="outline" onClick={onClick} className="w-full justify-start">
        <Palette className="h-4 w-4 mr-2" />
        Stil Seç
      </Button>
    )

    const styles = preset.styles
    const bgStyle = styles.backgroundColor.includes('gradient')
      ? { backgroundImage: styles.backgroundColor }
      : { backgroundColor: styles.backgroundColor }

    return (
      <button
        type="button"
        onClick={onClick}
        className="w-full h-10 rounded-lg flex items-center justify-center text-sm font-semibold relative overflow-hidden border-0 hover:opacity-90 transition-opacity"
        style={{
          ...bgStyle,
          color: styles.color,
          borderColor: styles.borderColor || 'transparent',
          borderWidth: styles.borderWidth || '0px',
          borderStyle: styles.borderStyle || 'solid',
          borderRadius: styles.borderRadius || '8px',
          boxShadow: styles.shadow || undefined,
        }}
      >
        {preset.bannerImage ? (
          <img src={preset.bannerImage} alt={preset.name} className="w-full h-full object-cover" />
        ) : (
          <span className="flex items-center gap-2 z-10 relative">
            <Palette className="w-4 h-4" />
            {preset.name}
          </span>
        )}
      </button>
    )
  }

  return (
    <div className="space-y-6">
      {/* Single preset selector — open prop drives visibility, no Radix Dialog issues */}
      <ButtonPresetSelector
        open={presetSelectorOpenFor !== null}
        currentPresetId={presetSelectorOpenFor === 'update' ? updatePreset : addPreset}
        onSave={(id) => {
          if (presetSelectorOpenFor === 'add') setAddPreset(id)
          else if (presetSelectorOpenFor === 'update') setUpdatePreset(id)
        }}
        onClose={closePresetSelector}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Toplu Buton Yönetimi</h2>
          <p className="text-sm text-gray-500 mt-1">
            Tüm sitelere aynı anda buton ekle, güncelle veya sıralamayı düzenle
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchSites} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Yenile
        </Button>
      </div>

      {/* Result message */}
      {resultMsg && (
        <div className={`rounded-lg p-3 text-sm flex items-start gap-2 ${
          resultMsg.type === 'success'
            ? 'bg-green-50 text-green-800 border border-green-200'
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {resultMsg.type === 'error' && <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />}
          {resultMsg.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT: Operation Panel */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">İşlem Seç</CardTitle>
            <CardDescription>Seçili sitelere uygulanacak işlemi yapılandırın</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="add">
              <TabsList className="grid w-full grid-cols-4 mb-4">
                <TabsTrigger value="add" className="text-xs">
                  <Plus className="w-3 h-3 mr-1" />
                  Ekle
                </TabsTrigger>
                <TabsTrigger value="update" className="text-xs">
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Güncelle
                </TabsTrigger>
                <TabsTrigger value="reorder" className="text-xs">
                  <GripVertical className="w-3 h-3 mr-1" />
                  Sırala
                </TabsTrigger>
                <TabsTrigger value="remove" className="text-xs">
                  <Trash2 className="w-3 h-3 mr-1" />
                  Kaldır
                </TabsTrigger>
              </TabsList>

              {/* ADD BUTTON TAB */}
              <TabsContent value="add" className="space-y-4">
                <div className="space-y-2">
                  <Label>Buton Başlığı *</Label>
                  <Input
                    value={addLabel}
                    onChange={e => setAddLabel(e.target.value)}
                    placeholder="Kayıt Ol"
                  />
                </div>
                <div className="space-y-2">
                  <Label>URL *</Label>
                  <Input
                    value={addHref}
                    onChange={e => setAddHref(e.target.value)}
                    placeholder="https://ornek.com/kayit"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Stil</Label>
                  <PresetButton presetId={addPreset} onClick={() => setPresetSelectorOpenFor('add')} />
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={addEnabled} onCheckedChange={setAddEnabled} />
                  <Label>Aktif</Label>
                </div>
                <Button
                  onClick={handleAddButton}
                  disabled={applying || selectedIds.size === 0}
                  className="w-full"
                >
                  {applying ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                  {selectedIds.size > 0 ? `${selectedIds.size} Siteye Ekle` : 'Site Seçin'}
                </Button>
              </TabsContent>

              {/* UPDATE BUTTON TAB */}
              <TabsContent value="update" className="space-y-4">
                <div className="space-y-2">
                  <Label>Güncellenecek Buton *</Label>
                  <select
                    value={updateTargetLabel}
                    onChange={e => onUpdateTargetChange(e.target.value)}
                    className="w-full h-10 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1"
                  >
                    <option value="">Buton seçin...</option>
                    {allLabels.map(lbl => (
                      <option key={lbl} value={lbl}>{lbl}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Yeni Başlık <span className="text-gray-400">(opsiyonel)</span></Label>
                  <Input
                    value={updateNewLabel}
                    onChange={e => setUpdateNewLabel(e.target.value)}
                    placeholder={updateTargetLabel || 'Değiştirmek için girin'}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Yeni URL <span className="text-gray-400">(opsiyonel)</span></Label>
                  <Input
                    value={updateHref}
                    onChange={e => setUpdateHref(e.target.value)}
                    placeholder="https://yeni-link.com"
                  />
                </div>
                <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <Switch checked={preserveHref} onCheckedChange={setPreserveHref} />
                  <div>
                    <Label className="text-amber-800 text-sm">Site-özel linkleri koru</Label>
                    <p className="text-xs text-amber-600">
                      Açıksa, farklı URL'ye sahip sitelerde link güncellenmez
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Stil</Label>
                  <PresetButton presetId={updatePreset} onClick={() => setPresetSelectorOpenFor('update')} />
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={updateEnabled} onCheckedChange={setUpdateEnabled} />
                  <Label>Aktif</Label>
                </div>
                <Button
                  onClick={handleUpdateButton}
                  disabled={applying || selectedIds.size === 0 || !updateTargetLabel}
                  className="w-full"
                >
                  {applying ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                  {selectedIds.size > 0 ? `${selectedIds.size} Siteyi Güncelle` : 'Site Seçin'}
                </Button>
              </TabsContent>

              {/* REORDER TAB */}
              <TabsContent value="reorder" className="space-y-4">
                <p className="text-xs text-gray-500">
                  Sıralamak istediğiniz butonları aşağıya ekleyin ve sürükleyerek sıralayın.
                  Listede olmayan butonlar mevcut sırayı koruyarak sona alınır.
                </p>
                <div className="space-y-2">
                  <Label>Buton ekle</Label>
                  <div className="flex gap-2 flex-wrap">
                    {allLabels
                      .filter(lbl => !labelOrder.includes(lbl))
                      .map(lbl => (
                        <button
                          key={lbl}
                          onClick={() => addLabelToOrder(lbl)}
                          className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                        >
                          + {lbl}
                        </button>
                      ))
                    }
                    {allLabels.filter(lbl => !labelOrder.includes(lbl)).length === 0 && (
                      <span className="text-xs text-gray-400">Tüm butonlar listeye eklendi</span>
                    )}
                  </div>
                </div>
                <div className="space-y-1 min-h-[60px]">
                  {labelOrder.length === 0 && (
                    <p className="text-sm text-gray-400 text-center py-4 border-2 border-dashed rounded-lg">
                      Sıralamak istediğiniz butonları yukarıdan ekleyin
                    </p>
                  )}
                  {labelOrder.map((lbl, idx) => (
                    <div
                      key={lbl}
                      draggable
                      onDragStart={() => handleOrderDragStart(idx)}
                      onDragOver={e => handleOrderDragOver(e, idx)}
                      onDrop={() => handleOrderDrop(idx)}
                      onDragEnd={() => { setDraggedOrderIdx(null); setDragOverOrderIdx(null) }}
                      className={`flex items-center gap-2 p-2 rounded-lg border bg-white cursor-grab select-none transition-all ${
                        dragOverOrderIdx === idx ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                      } ${draggedOrderIdx === idx ? 'opacity-50' : ''}`}
                    >
                      <GripVertical className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="text-xs font-medium text-gray-500 w-5">{idx + 1}.</span>
                      <span className="text-sm flex-1">{lbl}</span>
                      <button
                        onClick={() => removeLabelFromOrder(lbl)}
                        className="text-gray-400 hover:text-red-500 text-xs px-1"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
                <Button
                  onClick={handleReorder}
                  disabled={applying || selectedIds.size === 0 || labelOrder.length === 0}
                  className="w-full"
                >
                  {applying ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <GripVertical className="w-4 h-4 mr-2" />}
                  {selectedIds.size > 0 ? `${selectedIds.size} Sitede Sıralamayı Uygula` : 'Site Seçin'}
                </Button>
              </TabsContent>

              {/* REMOVE BUTTON TAB */}
              <TabsContent value="remove" className="space-y-4">
                <p className="text-xs text-gray-500">
                  Seçili sitelerden belirtilen butonu kaldırır. Bu işlem geri alınamaz.
                </p>
                <div className="space-y-2">
                  <Label>Kaldırılacak Buton *</Label>
                  <select
                    value={removeLabel}
                    onChange={e => setRemoveLabel(e.target.value)}
                    className="w-full h-10 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1"
                  >
                    <option value="">Buton seçin...</option>
                    {allLabels.map(lbl => (
                      <option key={lbl} value={lbl}>{lbl}</option>
                    ))}
                  </select>
                </div>
                {removeLabel && (
                  <div className="p-3 bg-red-50 rounded-lg border border-red-200 text-xs text-red-700">
                    <strong>"{removeLabel}"</strong> butonu seçili {selectedIds.size} siteden kalıcı olarak silinecek.
                  </div>
                )}
                <Button
                  onClick={handleRemoveButton}
                  disabled={applying || selectedIds.size === 0 || !removeLabel}
                  variant="destructive"
                  className="w-full"
                >
                  {applying ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
                  {selectedIds.size > 0 ? `${selectedIds.size} Siteden Kaldır` : 'Site Seçin'}
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* RIGHT: Site List */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Siteler</CardTitle>
                <CardDescription>
                  {loading ? 'Yükleniyor...' : `${sites.length} site • ${selectedIds.size} seçili`}
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleSelectAll}
                disabled={loading || filteredSites.length === 0}
                className="text-xs"
              >
                {allSelected ? (
                  <><Square className="w-3 h-3 mr-1" /> Hiçbirini Seçme</>
                ) : (
                  <><CheckSquare className="w-3 h-3 mr-1" /> Tümünü Seç</>
                )}
              </Button>
            </div>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <Input
                placeholder="Site ara..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-9 h-8 text-sm"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : filteredSites.length === 0 ? (
              <div className="text-center py-12 text-sm text-gray-400">
                {searchTerm ? 'Sonuç bulunamadı' : 'Henüz site yok'}
              </div>
            ) : (
              <div className="divide-y max-h-[520px] overflow-y-auto">
                {filteredSites.map(site => {
                  const isSelected = selectedIds.has(site.id)
                  const isExpanded = expandedIds.has(site.id)
                  return (
                    <div
                      key={site.id}
                      className={`transition-colors ${isSelected ? 'bg-blue-50/50' : 'bg-white hover:bg-gray-50/50'}`}
                    >
                      <div className="flex items-center gap-3 px-4 py-3">
                        <button onClick={() => toggleSite(site.id)} className="flex-shrink-0">
                          {isSelected
                            ? <CheckSquare className="w-4 h-4 text-blue-600" />
                            : <Square className="w-4 h-4 text-gray-400" />
                          }
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-sm font-medium text-gray-800 truncate">
                              /{site.site_slug}
                            </span>
                            {site.title && site.title !== site.site_slug && (
                              <span className="text-xs text-gray-500 truncate">{site.title}</span>
                            )}
                            {!site.is_enabled && (
                              <Badge variant="secondary" className="text-xs py-0">Pasif</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-1 mt-1 flex-wrap">
                            {site.actions.slice(0, 4).map(action => (
                              <span
                                key={action.id}
                                className={`text-xs px-1.5 py-0.5 rounded border ${
                                  !action.is_enabled
                                    ? 'text-gray-400 border-gray-200 bg-gray-50'
                                    : 'text-gray-700 border-gray-300 bg-white'
                                }`}
                              >
                                {action.label}
                              </span>
                            ))}
                            {site.actions.length > 4 && (
                              <span className="text-xs text-gray-400">+{site.actions.length - 4}</span>
                            )}
                            {site.actions.length === 0 && (
                              <span className="text-xs text-gray-400 italic">Buton yok</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <a
                            href={`/${site.site_slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-gray-400 hover:text-blue-600 rounded transition-colors"
                            title="Siteyi Önizle"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                          <button
                            onClick={() => toggleExpand(site.id)}
                            className="p-1.5 text-gray-400 hover:text-gray-700 rounded transition-colors"
                          >
                            {isExpanded
                              ? <ChevronDown className="w-3.5 h-3.5" />
                              : <ChevronRight className="w-3.5 h-3.5" />
                            }
                          </button>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="px-11 pb-3 space-y-1">
                          {site.actions.length === 0 ? (
                            <p className="text-xs text-gray-400 italic">Bu sitede buton bulunmuyor</p>
                          ) : (
                            site.actions.map((action, idx) => (
                              <div
                                key={action.id}
                                className="flex items-center gap-2 text-xs py-1 border-l-2 border-gray-100 pl-3"
                              >
                                <span className="text-gray-400 w-4">{idx + 1}.</span>
                                <span className={`font-medium ${!action.is_enabled ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                                  {action.label}
                                </span>
                                <Badge variant="outline" className="text-xs py-0 font-normal">
                                  {getPresetById(action.preset)?.name || action.preset}
                                </Badge>
                                <a
                                  href={action.href}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-500 hover:text-blue-700 truncate max-w-[160px]"
                                >
                                  {action.href}
                                </a>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
