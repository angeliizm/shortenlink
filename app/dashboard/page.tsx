'use client'

import { useAuth } from '@/stores/auth-store'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Link2, Plus, ExternalLink, Edit, Trash2, Globe, LogOut, Eye, Zap, Shield, Sparkles, BarChart, Palette, Settings, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import CreateSiteDialog from '@/components/dashboard/CreateSiteDialog'
import DeleteSiteDialog from '@/components/dashboard/DeleteSiteDialog'
import RoleGuard from '@/components/auth/RoleGuard'
import { getUserRole } from '@/lib/auth/roles'
import { formatDistanceToNow } from 'date-fns'
import { tr } from 'date-fns/locale'

interface Site {
  id: string
  site_slug: string
  title: string
  brand_color: string
  target_url: string
  is_enabled: boolean
  created_at: string
  updated_at: string
  owner_id?: string
  permission_type?: string
}


export default function DashboardPage() {
  const { user, isAuthenticated, isLoading, logout } = useAuth()
  const router = useRouter()
  const supabase = createClient()
  
  const [sites, setSites] = useState<Site[]>([])
  const [isLoadingSites, setIsLoadingSites] = useState(true)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Site | null>(null)
  const [stats, setStats] = useState({ totalSites: 0, activeSites: 0 })
  const [userRole, setUserRole] = useState<string>('')
  
  // Invitation code states
  const [invitationCode, setInvitationCode] = useState('')
  const [isUsingCode, setIsUsingCode] = useState(false)
  const [codeError, setCodeError] = useState('')

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/')
    } else if (isAuthenticated && user) {
      fetchUserRole()
      checkPendingInvitationCode()
    }
  }, [isLoading, isAuthenticated, router, user])

  const checkPendingInvitationCode = async () => {
    if (!user) return
    
    try {
      const pendingCode = localStorage.getItem('pending_invitation_code')
      if (pendingCode) {
        // Remove from localStorage first
        localStorage.removeItem('pending_invitation_code')
        
        // Try to use the invitation code
        const response = await fetch('/api/invitation-codes/use', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            code: pendingCode
          })
        })

        const result = await response.json()
        if (result.success) {
          // Code used successfully, refresh user role and sites
          const newRole = await fetchUserRole()
          if (newRole === 'approved') {
            // If user is now approved, fetch sites immediately with the new role
            await fetchSites(newRole)
          }
        } else {
          console.warn('Invitation code could not be used:', result.error)
        }
      }
    } catch (error) {
      console.warn('Error using pending invitation code:', error)
    }
  }

  useEffect(() => {
    if (user && userRole) {
      fetchSites()
    }
  }, [user, userRole])

  const fetchUserRole = async () => {
    if (!user) return
    try {
      const role = await getUserRole(user.id)
      setUserRole(role)
      return role // Return the role for immediate use
    } catch (error) {
      console.error('Error fetching user role:', error)
    }
  }

  const handleUseInvitationCode = async () => {
    if (!invitationCode.trim()) {
      setCodeError('Lütfen bir davet kodu girin')
      return
    }

    setIsUsingCode(true)
    setCodeError('')

    try {
      const response = await fetch('/api/invitation-codes/use', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: invitationCode.trim()
        }),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        // Code used successfully, refresh user role and sites
        const newRole = await fetchUserRole()
        if (newRole === 'approved') {
          // If user is now approved, fetch sites immediately with the new role
          await fetchSites(newRole)
        }
        setInvitationCode('')
      } else {
        setCodeError(result.error || 'Kod kullanılırken hata oluştu')
      }
    } catch (error) {
      console.error('Error using invitation code:', error)
      setCodeError('Kod kullanılırken hata oluştu')
    } finally {
      setIsUsingCode(false)
    }
  }

  const fetchSites = async (role?: string) => {
    if (!user) return
    
    const currentRole = role || userRole
    
    try {
      let allSites: Site[] = []

      // If user is admin, fetch all sites
      if (currentRole === 'admin') {
        const { data: allSitesData, error: allSitesError } = await supabase
          .from('pages')
          .select('*')
          .order('updated_at', { ascending: false })

        if (allSitesError) throw allSitesError
        allSites = allSitesData || []
      } else {
        // Fetch owned sites
        const { data: ownedSites, error: ownedError } = await supabase
          .from('pages')
          .select('*')
          .eq('owner_id', user.id)
          .order('updated_at', { ascending: false })

        if (ownedError) throw ownedError

        // Fetch sites with permissions
        const { data: permissionSites, error: permissionError } = await supabase
          .from('site_permissions')
          .select('permission_type, site_slug')
          .eq('user_id', user.id)
          .eq('is_active', true)

        if (permissionError) throw permissionError

        // Get site details for each permission
        const permissionSitesList: any[] = []
        if (permissionSites && permissionSites.length > 0) {
          for (const permission of permissionSites as Array<{permission_type: string, site_slug: string}>) {
            const { data: siteData, error: siteError } = await supabase
              .from('pages')
              .select('*')
              .eq('site_slug', permission.site_slug)
              .single()
            
            if (!siteError && siteData) {
              permissionSitesList.push({
                ...(siteData as any),
                permission_type: permission.permission_type
              })
            }
          }
        }

        // Combine owned sites and permission sites
        const ownedSitesList = ownedSites || []

        // Remove duplicates (in case user owns a site and also has permission)
        allSites = [...ownedSitesList]
        permissionSitesList.forEach((permissionSite: any) => {
          if (!allSites.find(site => site.id === permissionSite.id)) {
            allSites.push(permissionSite)
          }
        })
      }

      // Sort by updated_at
      allSites.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())

      setSites(allSites)
      
      const totalSites = allSites.length
      const activeSites = allSites.filter((site: any) => site.is_enabled).length
      
      setStats({ totalSites, activeSites })
    } catch (error) {
      console.error('Error fetching sites:', error)
    } finally {
      setIsLoadingSites(false)
    }
  }

  const handleDeleteSite = async (siteId: string) => {
    try {
      const { error } = await supabase
        .from('pages')
        .delete()
        .eq('id', siteId)

      if (error) throw error
      
      fetchSites()
      setDeleteTarget(null)
    } catch (error) {
      console.error('Error deleting site:', error)
    }
  }


  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent rounded-full animate-ping border-t-blue-400"></div>
          </div>
          <p className="mt-4 text-gray-600 font-medium">Dashboard yükleniyor...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <RoleGuard requireDashboardAccess={true}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Globe className="h-6 w-6 text-blue-600" />
                  <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">
                    {user?.email}
                  </span>
                </div>
                
                {/* Admin Panel Link - Sadece admin kullanıcılar için */}
                {userRole === 'admin' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push('/admin')}
                    className="flex items-center space-x-2"
                  >
                    <Settings className="h-4 w-4" />
                    <span>Admin Panel</span>
                  </Button>
                )}
                
                {/* Moderator Panel Link - Sadece moderatör kullanıcılar için */}
                {userRole === 'moderator' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push('/moderator')}
                    className="flex items-center space-x-2"
                  >
                    <Shield className="h-4 w-4" />
                    <span>Moderatör Panel</span>
                  </Button>
                )}
                
                <button
                  onClick={logout}
                  className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white/50 backdrop-blur-sm border border-white/30 rounded-xl hover:bg-white/70 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Çıkış Yap</span>
                </button>
              </div>
            </div>
          </div>
        </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Modern Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Toplam Site</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.totalSites}</p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Globe className="w-7 h-7 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Aktif Site</p>
                  <p className="text-3xl font-bold text-green-600">{stats.activeSites}</p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Zap className="w-7 h-7 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Site Oluşturma veya Bekleme Kartı */}
          {userRole === 'admin' ? (
            <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 group">
              <CardContent className="p-6">
                <Button 
                  onClick={() => setIsCreateOpen(true)}
                  className="w-full h-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 group-hover:scale-105"
                  size="lg"
                >
                  <Plus className="h-6 w-6 mr-2" />
                  Yeni Site Oluştur
                </Button>
              </CardContent>
            </Card>
          ) : userRole === 'approved' ? (
            <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 group">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-orange-200 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Shield className="w-8 h-8 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Site Ataması Bekleniyor</h3>
                <p className="text-sm text-gray-600">
                  Moderatör veya yönetici tarafından size site atanmasını bekleyin
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 group">
              <CardContent className="p-6">
                <Button 
                  onClick={() => setIsCreateOpen(true)}
                  className="w-full h-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 group-hover:scale-105"
                  size="lg"
                >
                  <Plus className="h-6 w-6 mr-2" />
                  Yeni Site Oluştur
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Modern Sites List */}
        <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
                <Globe className="w-5 h-5 text-blue-600" />
              </div>
              Siteler
            </CardTitle>
            <CardDescription className="text-gray-600">
              Erişime sahip olduğun tüm siteler burada listelenir
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingSites ? (
              <div className="flex justify-center py-16">
                <div className="text-center">
                  <div className="relative">
                    <div className="w-12 h-12 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600"></div>
                    <div className="absolute inset-0 w-12 h-12 border-4 border-transparent rounded-full animate-ping border-t-blue-400"></div>
                  </div>
                  <p className="mt-4 text-gray-600 font-medium">Siteler yükleniyor...</p>
                </div>
              </div>
            ) : sites.length === 0 ? (
              userRole === 'approved' ? (
                <div className="text-center py-16">
                  <div className="relative inline-block mb-6">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-200 to-purple-200 rounded-full blur-xl opacity-50 animate-pulse"></div>
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl flex items-center justify-center relative">
                      <Sparkles className="h-10 w-10 text-blue-600" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-2">Davet Kodunu Kullan</h3>
                  <p className="text-gray-500 mb-8 max-w-md mx-auto">
                    Size verilen davet kodunu girerek site erişimi kazanabilirsiniz.
                  </p>
                  
                  {/* Invitation Code Form */}
                  <div className="max-w-md mx-auto">
                    <div className="space-y-4">
                      <div>
                        <input
                          type="text"
                          value={invitationCode}
                          onChange={(e) => setInvitationCode(e.target.value.toUpperCase())}
                          placeholder="Davet kodunu girin"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg font-mono tracking-wider"
                          disabled={isUsingCode}
                        />
                      </div>
                      
                      {codeError && (
                        <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                          {codeError}
                        </div>
                      )}
                      
                      <Button
                        onClick={handleUseInvitationCode}
                        disabled={isUsingCode || !invitationCode.trim()}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                      >
                        {isUsingCode ? (
                          <div className="flex items-center justify-center">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                            Kod kullanılıyor...
                          </div>
                        ) : (
                          'Davet Kodunu Kullan'
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
                    <div className="flex flex-col items-center text-center p-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-2">
                        <Shield className="h-5 w-5 text-blue-600" />
                      </div>
                      <p className="text-sm font-medium text-gray-700">Güvenli Kod</p>
                      <p className="text-xs text-gray-500">Yetkili kişiler tarafından</p>
                    </div>
                    <div className="flex flex-col items-center text-center p-4">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-2">
                        <Globe className="h-5 w-5 text-green-600" />
                      </div>
                      <p className="text-sm font-medium text-gray-700">Anında Erişim</p>
                      <p className="text-xs text-gray-500">Kod girince aktif</p>
                    </div>
                    <div className="flex flex-col items-center text-center p-4">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-2">
                        <Zap className="h-5 w-5 text-purple-600" />
                      </div>
                      <p className="text-sm font-medium text-gray-700">Hızlı Başlangıç</p>
                      <p className="text-xs text-gray-500">Hemen kullanıma hazır</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="relative inline-block mb-6">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-200 to-purple-200 rounded-full blur-xl opacity-50 animate-pulse"></div>
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl flex items-center justify-center relative">
                      <Globe className="h-10 w-10 text-blue-600" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-2">Henüz site yok</h3>
                  <p className="text-gray-500 mb-8 max-w-md mx-auto">
                    İlk dinamik sitenizi oluşturarak başlayın. Sadece birkaç saniye sürer!
                  </p>
                  <Button 
                    onClick={() => setIsCreateOpen(true)}
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    İlk Sitenizi Oluşturun
                  </Button>
                  <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
                    <div className="flex flex-col items-center text-center p-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-2">
                        <Zap className="h-5 w-5 text-blue-600" />
                      </div>
                      <p className="text-sm font-medium text-gray-700">Hızlı Kurulum</p>
                      <p className="text-xs text-gray-500">60 saniyeden az</p>
                    </div>
                    <div className="flex flex-col items-center text-center p-4">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-2">
                        <Shield className="h-5 w-5 text-green-600" />
                      </div>
                      <p className="text-sm font-medium text-gray-700">Güvenli</p>
                      <p className="text-xs text-gray-500">RLS ile korumalı</p>
                    </div>
                    <div className="flex flex-col items-center text-center p-4">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-2">
                        <Sparkles className="h-5 w-5 text-purple-600" />
                      </div>
                      <p className="text-sm font-medium text-gray-700">Özelleştirilebilir</p>
                      <p className="text-xs text-gray-500">Markanız, tarzınız</p>
                    </div>
                  </div>
                </div>
              )
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {sites.map((site) => (
                  <Card 
                    key={site.id} 
                    className="group backdrop-blur-sm bg-white/90 border-white/30 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
                              <Globe className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                {site.title}
                              </h3>
                              <div className="flex items-center space-x-2">
                                {/* Permission type badge */}
                                {site.permission_type && userRole !== 'admin' && (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    <Shield className="w-3 h-3 mr-1" />
                                    {site.permission_type === 'view' ? 'Görüntüleme' : 
                                     site.permission_type === 'edit' ? 'Düzenleme' : 
                                     site.permission_type === 'analytics' ? 'Analitik' : 
                                     site.permission_type}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-2 text-sm text-gray-600">
                            <div className="flex items-center space-x-2">
                              <Link2 className="h-4 w-4 text-blue-500" />
                              <span className="font-mono bg-gray-100 px-2 py-1 rounded text-xs">
                                /{site.site_slug}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2 text-xs text-gray-500">
                              <span>{formatDistanceToNow(new Date(site.updated_at), { addSuffix: true, locale: tr })} güncellendi</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center space-x-1">
                          {/* View button - always available */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(`/${site.site_slug}`, '_blank')}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            title="Siteyi Görüntüle"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            <span className="text-xs">Görüntüle</span>
                          </Button>
                          
                          {/* Analytics button - for analytics permission, owner, or admin */}
                          {(site.permission_type === 'analytics' || !site.permission_type || userRole === 'admin') && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => router.push(`/dashboard/analytics/${site.site_slug}`)}
                              className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                              title="Analitik"
                            >
                              <BarChart className="h-4 w-4 mr-1" />
                              <span className="text-xs">Analitik</span>
                            </Button>
                          )}
                        </div>
                        
                        {/* Edit and Delete buttons - for owners or admin */}
                        {(!site.permission_type || userRole === 'admin') && (
                          <div className="flex items-center space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => router.push(`/dashboard/sites/${site.id}/edit`)}
                              className="text-gray-600 hover:text-gray-700 hover:bg-gray-50"
                              title="Siteyi Düzenle"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            {/* Delete button - only for admin/moderator */}
                            {(userRole === 'admin' || userRole === 'moderator') && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setDeleteTarget(site)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                title="Siteyi Sil"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        )}
                        
                        {/* Edit button for edit permission (non-admin, non-owner) */}
                        {site.permission_type === 'edit' && userRole !== 'admin' && (
                          <div className="flex items-center space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => router.push(`/dashboard/sites/${site.id}/edit`)}
                              className="text-gray-600 hover:text-gray-700 hover:bg-gray-50"
                              title="Siteyi Düzenle"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Dialogs */}
      <CreateSiteDialog 
        open={isCreateOpen} 
        onOpenChange={setIsCreateOpen}
        onSuccess={fetchSites}
      />
      
      <DeleteSiteDialog
        site={deleteTarget}
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={handleDeleteSite}
      />
      
      </div>
    </RoleGuard>
  )
}