'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { Ticket, Plus, Clock, CheckCircle, XCircle, Copy, Calendar, User, Globe } from 'lucide-react'

interface InvitationCode {
  id: string
  code: string
  site_title: string
  site_slug: string
  expires_at: string | null
  is_used: boolean
  created_by: string
  creator_email: string
  used_by: string | null
  user_email: string | null
  created_at: string
  used_at: string | null
}

export default function InvitationCodes() {
  const supabase = createClient()
  
  // Create Code States
  const [sites, setSites] = useState([{ title: '', slug: '' }])
  const [expiresIn, setExpiresIn] = useState('never')
  const [isCreating, setIsCreating] = useState(false)
  const [createdCode, setCreatedCode] = useState<string | null>(null)
  const [showCodePopup, setShowCodePopup] = useState(false)
  
  // List States
  const [codes, setCodes] = useState<InvitationCode[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'active' | 'used' | 'expired'>('all')

  useEffect(() => {
    fetchCodes()
  }, [])

  const fetchCodes = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/invitation-codes/list')
      const result = await response.json()

      if (result.success) {
        setCodes(result.data)
      } else {
        toast.error(result.error || 'Kodlar yüklenirken hata oluştu')
      }
    } catch (error) {
      console.error('Error fetching codes:', error)
      toast.error('Kodlar yüklenirken hata oluştu')
    } finally {
      setIsLoading(false)
    }
  }

  const addSite = () => {
    setSites([...sites, { title: '', slug: '' }])
  }

  const removeSite = (index: number) => {
    if (sites.length > 1) {
      setSites(sites.filter((_, i) => i !== index))
    }
  }

  const updateSite = (index: number, field: 'title' | 'slug', value: string) => {
    const updatedSites = [...sites]
    updatedSites[index][field] = value
    setSites(updatedSites)
  }

  const createCode = async () => {
    // Validate all sites
    for (let i = 0; i < sites.length; i++) {
      const site = sites[i]
      if (!site.title.trim() || !site.slug.trim()) {
        toast.error(`${i + 1}. site için ad ve uzantısı gerekli`)
        return
      }

      // Validate site slug format
      if (!/^[a-zA-Z0-9-]+$/.test(site.slug)) {
        toast.error(`${i + 1}. site uzantısı sadece harf, rakam ve tire içerebilir`)
        return
      }
    }

    setIsCreating(true)
    try {
      const response = await fetch('/api/invitation-codes/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sites: sites,
          expires_in: expiresIn
        }),
      })

      const result = await response.json()

      if (result.success) {
        setCreatedCode(result.data.code)
        setShowCodePopup(true)
        setSites([{ title: '', slug: '' }])
        setExpiresIn('never')
        fetchCodes() // Refresh the list
      } else {
        toast.error(result.error || 'Kod oluşturulurken hata oluştu')
      }
    } catch (error) {
      console.error('Error creating code:', error)
      toast.error('Kod oluşturulurken hata oluştu')
    } finally {
      setIsCreating(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success('Kod panoya kopyalandı')
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false
    return new Date(expiresAt) < new Date()
  }

  const getFilteredCodes = () => {
    return codes.filter(code => {
      switch (filter) {
        case 'active':
          return !code.is_used && !isExpired(code.expires_at)
        case 'used':
          return code.is_used
        case 'expired':
          return !code.is_used && isExpired(code.expires_at)
        default:
          return true
      }
    })
  }

  const getStatusBadge = (code: InvitationCode) => {
    if (code.is_used) {
      return <Badge variant="secondary" className="bg-green-100 text-green-800">Kullanıldı</Badge>
    }
    if (isExpired(code.expires_at)) {
      return <Badge variant="secondary" className="bg-red-100 text-red-800">Süresi Doldu</Badge>
    }
    return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Aktif</Badge>
  }

  const filteredCodes = getFilteredCodes()
  const stats = {
    total: codes.length,
    active: codes.filter(c => !c.is_used && !isExpired(c.expires_at)).length,
    used: codes.filter(c => c.is_used).length,
    expired: codes.filter(c => !c.is_used && isExpired(c.expires_at)).length
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="create" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="create">Kod Oluştur</TabsTrigger>
          <TabsTrigger value="list">Aktif Kodlar ({stats.active})</TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Plus className="h-5 w-5 text-green-600" />
                <span>Yeni Davet Kodu Oluştur</span>
              </CardTitle>
              <CardDescription>
                Beklemede olan kullanıcılar için site oluşturucu kod üretin
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Sites Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Site Bilgileri</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addSite}
                    className="flex items-center space-x-2 text-green-600 border-green-200 hover:bg-green-50"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Site Ekle</span>
                  </Button>
                </div>
                
                <div className="space-y-4">
                  {sites.map((site, index) => (
                    <div key={index} className="relative p-4 border border-gray-200 rounded-lg bg-gray-50/50">
                      {sites.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSite(index)}
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-100 text-red-600 hover:bg-red-200"
                        >
                          ×
                        </Button>
                      )}
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`site-title-${index}`}>
                            Site Adı {sites.length > 1 && `#${index + 1}`}
                          </Label>
                          <Input
                            id={`site-title-${index}`}
                            placeholder="Örnek: Kişisel Blog"
                            value={site.title}
                            onChange={(e) => updateSite(index, 'title', e.target.value)}
                            disabled={isCreating}
                            className="bg-white"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor={`site-slug-${index}`}>
                            Site Uzantısı {sites.length > 1 && `#${index + 1}`}
                          </Label>
                          <Input
                            id={`site-slug-${index}`}
                            placeholder="Örnek: kisisel-blog"
                            value={site.slug}
                            onChange={(e) => updateSite(index, 'slug', e.target.value.toLowerCase())}
                            disabled={isCreating}
                            className="bg-white"
                          />
                          <p className="text-xs text-gray-500">
                            Sadece harf, rakam ve tire kullanın
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Expiration Section */}
              <div className="space-y-2">
                <Label htmlFor="expires-in" className="text-base font-semibold">Geçerlilik Süresi</Label>
                <Select value={expiresIn} onValueChange={setExpiresIn} disabled={isCreating}>
                  <SelectTrigger className="bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1_day">1 Gün</SelectItem>
                    <SelectItem value="1_week">1 Hafta</SelectItem>
                    <SelectItem value="1_month">1 Ay</SelectItem>
                    <SelectItem value="never">Süresiz</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Create Button */}
              <Button 
                onClick={createCode} 
                disabled={isCreating}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {isCreating ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Kod Oluşturuluyor...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Ticket className="h-5 w-5" />
                    <span>Kod Oluştur</span>
                  </div>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="list" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Ticket className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-2xl font-bold">{stats.total}</p>
                    <p className="text-xs text-gray-500">Toplam</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <div>
                    <p className="text-2xl font-bold text-blue-600">{stats.active}</p>
                    <p className="text-xs text-gray-500">Aktif</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <div>
                    <p className="text-2xl font-bold text-green-600">{stats.used}</p>
                    <p className="text-xs text-gray-500">Kullanıldı</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <XCircle className="h-4 w-4 text-red-500" />
                  <div>
                    <p className="text-2xl font-bold text-red-600">{stats.expired}</p>
                    <p className="text-xs text-gray-500">Süresi Doldu</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filter */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <Label>Filtrele:</Label>
                <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tümü ({stats.total})</SelectItem>
                    <SelectItem value="active">Aktif ({stats.active})</SelectItem>
                    <SelectItem value="used">Kullanıldı ({stats.used})</SelectItem>
                    <SelectItem value="expired">Süresi Doldu ({stats.expired})</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Codes List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Ticket className="h-5 w-5 text-blue-600" />
                <span>Davet Kodları</span>
              </CardTitle>
              <CardDescription>
                Oluşturulan tüm davet kodları ve durumları
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Kodlar yükleniyor...</p>
                </div>
              ) : filteredCodes.length === 0 ? (
                <div className="text-center py-8">
                  <Ticket className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">
                    {filter === 'all' ? 'Henüz kod oluşturulmamış' : 'Bu filtrele eşleşen kod bulunamadı'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredCodes.map((code) => (
                    <div key={code.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center space-x-3">
                            <div className="font-mono text-lg font-bold bg-gray-100 px-3 py-1 rounded">
                              {code.code}
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard(code.code)}
                              className="flex items-center space-x-1"
                            >
                              <Copy className="h-3 w-3" />
                              <span>Kopyala</span>
                            </Button>
                            {getStatusBadge(code)}
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                            <div className="flex items-center space-x-2">
                              <Globe className="h-4 w-4" />
                              <div>
                                <p className="font-medium">{code.site_title}</p>
                                <p className="text-xs">/{code.site_slug}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4" />
                              <div>
                                <p className="font-medium">Oluşturuldu</p>
                                <p className="text-xs">{formatDate(code.created_at)}</p>
                                <p className="text-xs">by {code.creator_email}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              {code.is_used ? (
                                <>
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                  <div>
                                    <p className="font-medium text-green-600">Kullanıldı</p>
                                    <p className="text-xs">{code.used_at ? formatDate(code.used_at) : 'Bilinmiyor'}</p>
                                    <p className="text-xs">by {code.user_email || 'Bilinmiyor'}</p>
                                  </div>
                                </>
                              ) : code.expires_at ? (
                                <>
                                  <Clock className="h-4 w-4 text-blue-500" />
                                  <div>
                                    <p className="font-medium">Süresi</p>
                                    <p className="text-xs">{formatDate(code.expires_at)}</p>
                                    <p className={`text-xs ${isExpired(code.expires_at) ? 'text-red-500' : 'text-gray-500'}`}>
                                      {isExpired(code.expires_at) ? 'Doldu' : 'Dolacak'}
                                    </p>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <Clock className="h-4 w-4 text-gray-500" />
                                  <div>
                                    <p className="font-medium">Süresiz</p>
                                    <p className="text-xs">Geçerlilik süresi yok</p>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Code Created Popup */}
      {showCodePopup && createdCode && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative">
            {/* Close Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCodePopup(false)}
              className="absolute top-4 right-4 h-8 w-8 rounded-full hover:bg-gray-100"
            >
              ×
            </Button>

            {/* Success Icon */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Kod Başarıyla Oluşturuldu!</h3>
              <p className="text-gray-600 text-sm">
                Bu kodu beklemede olan kullanıcılara paylaşabilirsiniz
              </p>
            </div>

            {/* Code Display */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Davet Kodu</p>
                <div className="font-mono text-2xl font-bold text-gray-900 bg-white rounded-lg p-3 border-2 border-dashed border-gray-300">
                  {createdCode}
                </div>
              </div>
            </div>

            {/* Copy Button */}
            <Button
              onClick={() => {
                copyToClipboard(createdCode)
                setShowCodePopup(false)
              }}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-3 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <div className="flex items-center justify-center space-x-2">
                <Copy className="h-5 w-5" />
                <span>Kopyala ve Kapat</span>
              </div>
            </Button>

            {/* Info */}
            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500">
                Kod kullanıldığında otomatik olarak site oluşturulacak ve kullanıcı onaylı statüye geçecektir
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
