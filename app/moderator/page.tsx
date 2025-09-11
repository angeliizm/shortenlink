'use client'

import { useAuth } from '@/stores/auth-store'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Shield, Users, CheckCircle, XCircle, AlertCircle, Ticket } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { getUserRole } from '@/lib/auth/roles'
import InvitationCodes from '@/components/admin/InvitationCodes'

interface User {
  id: string
  email: string
  full_name: string
  role: string
  created_at: string
}

interface Site {
  id: string
  site_slug: string
  title: string
  owner_id: string
  owner_email: string
  created_at: string
}

interface SitePermission {
  id: string
  user_id: string
  site_slug: string
  permission_type: string
  granted_by: string
  granted_at: string
  user_email: string
  site_title: string
}

export default function ModeratorPage() {
  const { user, isAuthenticated, isLoading, logout } = useAuth()
  const router = useRouter()
  const supabase = createClient()
  
  const [userRole, setUserRole] = useState<string>('')
  const [isLoadingRole, setIsLoadingRole] = useState(true)
  
  // Site Permission States
  const [searchEmail, setSearchEmail] = useState('')
  const [searchResults, setSearchResults] = useState<User[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedUsers, setSelectedUsers] = useState<User[]>([])
  const [selectedSites, setSelectedSites] = useState<string[]>([])
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])
  const [isGranting, setIsGranting] = useState(false)
  
  // Existing Permissions States
  const [existingPermissions, setExistingPermissions] = useState<SitePermission[]>([])
  const [isLoadingPermissions, setIsLoadingPermissions] = useState(true)
  const [siteSearchTerm, setSiteSearchTerm] = useState('')
  const [expandedSites, setExpandedSites] = useState<Set<string>>(new Set())
  
  // Available Sites
  const [availableSites, setAvailableSites] = useState<Site[]>([])

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/')
    } else if (isAuthenticated && user) {
      fetchUserRole()
    }
  }, [isLoading, isAuthenticated, router, user])

  const fetchUserRole = async () => {
    if (!user) return
    
    try {
      const role = await getUserRole(user.id)
      setUserRole(role)
      
      // Moderator olmayan kullanıcıları yönlendir
      if (role !== 'moderator' && role !== 'admin') {
        router.push('/dashboard')
        return
      }
      
      // Moderator yetkisi varsa verileri yükle
      if (role === 'moderator' || role === 'admin') {
        await Promise.all([
          fetchAvailableSites(),
          fetchExistingPermissions()
        ])
      }
    } catch (error) {
      console.error('Error fetching user role:', error)
      router.push('/dashboard')
    } finally {
      setIsLoadingRole(false)
    }
  }

  const fetchAvailableSites = async () => {
    try {
      const { data, error } = await (supabase
        .from('pages') as any)
        .select(`
          id,
          site_slug,
          title,
          owner_id,
          created_at,
          profiles!pages_owner_id_fkey(email)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      const sitesWithOwnerEmail = data?.map((site: any) => ({
        id: site.id,
        site_slug: site.site_slug,
        title: site.title,
        owner_id: site.owner_id,
        owner_email: site.profiles?.email || 'Bilinmeyen',
        created_at: site.created_at
      })) || []

      setAvailableSites(sitesWithOwnerEmail)
    } catch (error) {
      console.error('Error fetching sites:', error)
      toast.error('Siteler yüklenirken hata oluştu')
    }
  }

  const fetchExistingPermissions = async () => {
    try {
      setIsLoadingPermissions(true)
      const { data, error } = await (supabase
        .from('site_permissions') as any)
        .select(`
          id,
          user_id,
          site_slug,
          permission_type,
          granted_by,
          granted_at,
          profiles!site_permissions_user_id_fkey(email),
          pages!site_permissions_site_slug_fkey(title)
        `)
        .order('granted_at', { ascending: false })

      if (error) throw error

      const permissionsWithDetails = data?.map((permission: any) => ({
        id: permission.id,
        user_id: permission.user_id,
        site_slug: permission.site_slug,
        permission_type: permission.permission_type,
        granted_by: permission.granted_by,
        granted_at: permission.granted_at,
        user_email: permission.profiles?.email || 'Bilinmeyen',
        site_title: permission.pages?.title || 'Bilinmeyen Site'
      })) || []

      setExistingPermissions(permissionsWithDetails)
    } catch (error) {
      console.error('Error fetching permissions:', error)
      toast.error('İzinler yüklenirken hata oluştu')
    } finally {
      setIsLoadingPermissions(false)
    }
  }

  const searchUsers = async () => {
    if (!searchEmail.trim()) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    try {
      const { data, error } = await (supabase as any)
        .rpc('get_user_emails', { search_email: `%${searchEmail}%` })

      if (error) throw error

      setSearchResults(data || [])
    } catch (error) {
      console.error('Error searching users:', error)
      toast.error('Kullanıcı arama sırasında hata oluştu')
    } finally {
      setIsSearching(false)
    }
  }

  const toggleUserSelection = (user: User) => {
    setSelectedUsers(prev => {
      const isSelected = prev.some(u => u.id === user.id)
      if (isSelected) {
        return prev.filter(u => u.id !== user.id)
      } else {
        return [...prev, user]
      }
    })
  }

  const toggleSiteSelection = (siteSlug: string) => {
    setSelectedSites(prev => {
      const isSelected = prev.includes(siteSlug)
      if (isSelected) {
        return prev.filter(s => s !== siteSlug)
      } else {
        return [...prev, siteSlug]
      }
    })
  }

  const togglePermissionSelection = (permission: string) => {
    setSelectedPermissions(prev => {
      const isSelected = prev.includes(permission)
      if (isSelected) {
        return prev.filter(p => p !== permission)
      } else {
        return [...prev, permission]
      }
    })
  }

  const grantPermissions = async () => {
    if (selectedUsers.length === 0 || selectedSites.length === 0 || selectedPermissions.length === 0) {
      toast.error('Lütfen kullanıcı, site ve izin türü seçin')
      return
    }

    if (!user) {
      toast.error('Kullanıcı bilgisi bulunamadı')
      return
    }

    setIsGranting(true)
    try {
      const permissionsToInsert = []
      
      for (const user of selectedUsers) {
        for (const siteSlug of selectedSites) {
          for (const permissionType of selectedPermissions) {
            permissionsToInsert.push({
              user_id: user.id,
              site_slug: siteSlug,
              permission_type: permissionType,
              granted_by: user.id
            })
          }
        }
      }

      const { error } = await (supabase
        .from('site_permissions') as any)
        .insert(permissionsToInsert)

      if (error) throw error

      toast.success('İzinler başarıyla verildi')
      
      // Reset form
      setSelectedUsers([])
      setSelectedSites([])
      setSelectedPermissions([])
      setSearchEmail('')
      setSearchResults([])
      
      // Refresh permissions
      await fetchExistingPermissions()
    } catch (error) {
      console.error('Error granting permissions:', error)
      toast.error('İzin verilirken hata oluştu')
    } finally {
      setIsGranting(false)
    }
  }

  const toggleSiteExpansion = (siteSlug: string) => {
    setExpandedSites(prev => {
      const newSet = new Set(prev)
      if (newSet.has(siteSlug)) {
        newSet.delete(siteSlug)
      } else {
        newSet.add(siteSlug)
      }
      return newSet
    })
  }

  // Group permissions by site
  const groupedPermissions = existingPermissions.reduce((acc, permission) => {
    if (!acc[permission.site_slug]) {
      acc[permission.site_slug] = {
        site_title: permission.site_title,
        site_slug: permission.site_slug,
        permissions: []
      }
    }
    acc[permission.site_slug].permissions.push(permission)
    return acc
  }, {} as Record<string, { site_title: string; site_slug: string; permissions: SitePermission[] }>)

  // Filter grouped permissions based on search
  const filteredGroupedPermissions = Object.entries(groupedPermissions).filter(([siteSlug, siteData]) => {
    if (!siteSearchTerm) return true
    
    const searchLower = siteSearchTerm.toLowerCase()
    return (
      siteData.site_title.toLowerCase().includes(searchLower) ||
      siteSlug.toLowerCase().includes(searchLower) ||
      siteData.permissions.some(p => 
        p.user_email.toLowerCase().includes(searchLower)
      )
    )
  })

  if (isLoading || isLoadingRole) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || userRole !== 'moderator') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Erişim Reddedildi</h1>
          <p className="text-gray-600 mb-4">Bu sayfaya erişim yetkiniz bulunmuyor.</p>
          <Button onClick={() => router.push('/dashboard')}>
            Dashboard'a Dön
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/dashboard')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Dashboard'a Dön</span>
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              <div className="flex items-center space-x-2">
                <Shield className="h-6 w-6 text-orange-600" />
                <h1 className="text-xl font-bold text-gray-900">Moderatör Panel</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">
                  {user?.email}
                </span>
              </div>
              
              <button
                onClick={logout}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white/50 backdrop-blur-sm border border-white/30 rounded-xl hover:bg-white/70 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
              >
                <span>Çıkış Yap</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="grant-permissions" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="grant-permissions">Site İzni Ver</TabsTrigger>
            <TabsTrigger value="existing-permissions">Mevcut İzinler</TabsTrigger>
            <TabsTrigger value="invitation-codes">Kod Oluşturucu</TabsTrigger>
          </TabsList>

          <TabsContent value="grant-permissions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-orange-600" />
                  <span>Site İzni Ver</span>
                </CardTitle>
                <CardDescription>
                  Kullanıcılara belirli siteler için izin verebilirsiniz
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* User Search */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="search-email">Kullanıcı Ara</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="search-email"
                        type="email"
                        placeholder="ornek@email.com"
                        value={searchEmail}
                        onChange={(e) => setSearchEmail(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && searchUsers()}
                      />
                      <Button 
                        onClick={searchUsers} 
                        disabled={isSearching || !searchEmail.trim()}
                        variant="outline"
                      >
                        {isSearching ? 'Aranıyor...' : 'Ara'}
                      </Button>
                    </div>
                  </div>

                  {/* Search Results */}
                  {searchResults.length > 0 && (
                    <div className="space-y-2">
                      <Label>Bulunan Kullanıcılar</Label>
                      <div className="space-y-2 max-h-40 overflow-y-auto border rounded-lg p-2">
                        {searchResults.map((user) => (
                          <div
                            key={user.id}
                            className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                            onClick={() => toggleUserSelection(user)}
                          >
                            <Checkbox
                              checked={selectedUsers.some(u => u.id === user.id)}
                              onChange={() => toggleUserSelection(user)}
                            />
                            <div className="flex-1">
                              <p className="text-sm font-medium">{user.email}</p>
                              <p className="text-xs text-gray-500">{user.full_name || 'İsim belirtilmemiş'}</p>
                            </div>
                            <Badge variant="outline">{user.role}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Selected Users */}
                  {selectedUsers.length > 0 && (
                    <div className="space-y-2">
                      <Label>Seçilen Kullanıcılar ({selectedUsers.length})</Label>
                      <div className="flex flex-wrap gap-2">
                        {selectedUsers.map((user) => (
                          <Badge
                            key={user.id}
                            variant="secondary"
                            className="flex items-center space-x-1"
                          >
                            <span>{user.email}</span>
                            <button
                              onClick={() => toggleUserSelection(user)}
                              className="ml-1 hover:text-red-500"
                            >
                              ×
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Site Selection */}
                <div className="space-y-4">
                  <Label>Site Seçimi</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto border rounded-lg p-3">
                    {availableSites.map((site) => (
                      <div
                        key={site.id}
                        className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                        onClick={() => toggleSiteSelection(site.site_slug)}
                      >
                        <Checkbox
                          checked={selectedSites.includes(site.site_slug)}
                          onChange={() => toggleSiteSelection(site.site_slug)}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{site.title}</p>
                          <p className="text-xs text-gray-500 truncate">{site.site_slug}</p>
                          <p className="text-xs text-gray-400 truncate">{site.owner_email}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Permission Selection */}
                <div className="space-y-4">
                  <Label>İzin Türü</Label>
                  <div className="space-y-2">
                    {[
                      { value: 'view', label: 'Görüntüleme', description: 'Siteyi görüntüleyebilir' },
                      { value: 'edit', label: 'Düzenleme', description: 'Siteyi düzenleyebilir' },
                      { value: 'analytics', label: 'Analitik', description: 'Site analitiklerini görüntüleyebilir' }
                    ].map((permission) => (
                      <div
                        key={permission.value}
                        className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                        onClick={() => togglePermissionSelection(permission.value)}
                      >
                        <Checkbox
                          checked={selectedPermissions.includes(permission.value)}
                          onChange={() => togglePermissionSelection(permission.value)}
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{permission.label}</p>
                          <p className="text-xs text-gray-500">{permission.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Grant Button */}
                <Button
                  onClick={grantPermissions}
                  disabled={isGranting || selectedUsers.length === 0 || selectedSites.length === 0 || selectedPermissions.length === 0}
                  className="w-full"
                >
                  {isGranting ? 'İzinler Veriliyor...' : 'İzinleri Ver'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="existing-permissions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  <span>Mevcut İzinler</span>
                </CardTitle>
                <CardDescription>
                  Verilen tüm site izinlerini görüntüleyebilirsiniz
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Search */}
                <div className="mb-6">
                  <Input
                    placeholder="Site adı, slug veya kullanıcı email'i ile ara..."
                    value={siteSearchTerm}
                    onChange={(e) => setSiteSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>

                {/* Permissions List */}
                {isLoadingPermissions ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">İzinler yükleniyor...</p>
                  </div>
                ) : filteredGroupedPermissions.length === 0 ? (
                  <div className="text-center py-8">
                    <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Henüz verilmiş izin bulunmuyor</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredGroupedPermissions.map(([siteSlug, siteData]) => {
                      const isExpanded = expandedSites.has(siteSlug)
                      return (
                        <div key={siteSlug} className="border rounded-lg">
                          {/* Site Header */}
                          <div
                            className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
                            onClick={() => toggleSiteExpansion(siteSlug)}
                          >
                            <div className="flex-1">
                              <h3 className="font-medium text-gray-900">{siteData.site_title}</h3>
                              <p className="text-sm text-gray-500">{siteSlug}</p>
                            </div>
                            <div className="flex items-center space-x-3">
                              <Badge variant="outline">
                                {siteData.permissions.length} izin
                              </Badge>
                              <div className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </div>
                            </div>
                          </div>

                          {/* Permissions List */}
                          {isExpanded && (
                            <div className="border-t bg-gray-50">
                              {siteData.permissions.map((permission) => (
                                <div key={permission.id} className="flex items-center justify-between p-4 border-b last:border-b-0">
                                  <div className="flex-1">
                                    <p className="font-medium text-gray-900">{permission.user_email}</p>
                                    <p className="text-sm text-gray-500">
                                      {new Date(permission.granted_at).toLocaleDateString('tr-TR')}
                                    </p>
                                  </div>
                                  <Badge variant="secondary">
                                    {permission.permission_type === 'view' && 'Görüntüleme'}
                                    {permission.permission_type === 'edit' && 'Düzenleme'}
                                    {permission.permission_type === 'analytics' && 'Analitik'}
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="invitation-codes" className="space-y-6">
            <InvitationCodes />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
