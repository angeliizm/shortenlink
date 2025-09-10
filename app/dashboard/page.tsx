'use client'

import { useAuth } from '@/stores/auth-store'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Link2, Plus, ExternalLink, Edit, Trash2, Globe, LogOut, Eye, Zap, Shield, Sparkles, BarChart, Palette, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import CreateSiteDialog from '@/components/dashboard/CreateSiteDialog'
import DeleteSiteDialog from '@/components/dashboard/DeleteSiteDialog'
import RoleGuard from '@/components/auth/RoleGuard'
import { getUserRole } from '@/lib/auth/roles'
import { formatDistanceToNow } from 'date-fns'

interface Site {
  id: string
  site_slug: string
  title: string
  brand_color: string
  target_url: string
  is_enabled: boolean
  created_at: string
  updated_at: string
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

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/')
    } else if (isAuthenticated && user) {
      fetchSites()
      fetchUserRole()
    }
  }, [isLoading, isAuthenticated, router, user])

  const fetchUserRole = async () => {
    if (!user) return
    try {
      const role = await getUserRole(user.id)
      setUserRole(role)
    } catch (error) {
      console.error('Error fetching user role:', error)
    }
  }

  const fetchSites = async () => {
    if (!user) return
    
    try {
      const { data, error } = await supabase
        .from('pages')
        .select('*')
        .eq('owner_id', user.id)
        .order('updated_at', { ascending: false })

      if (error) throw error
      
      setSites(data || [])
      
      const totalSites = data?.length || 0
      const activeSites = data?.filter((site: any) => site.is_enabled).length || 0
      
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
        {/* Modern Navigation with Glassmorphism */}
        <nav className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-indigo-500/10"></div>
          <div className="relative backdrop-blur-sm bg-white/80 border-b border-white/20 shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-20">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Globe className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                      Site Manager
                    </h1>
                    <p className="text-sm text-gray-600">Link yönetim platformu</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="hidden sm:block px-4 py-2 bg-white/50 backdrop-blur-sm rounded-xl border border-white/30">
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
                      className="flex items-center space-x-2 bg-gradient-to-r from-red-500 to-red-600 text-white border-0 hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      <Settings className="h-4 w-4" />
                      <span>Admin Panel</span>
                    </Button>
                  )}
                  
                  <button
                    onClick={logout}
                    className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white/50 backdrop-blur-sm border border-white/30 rounded-xl hover:bg-white/70 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Çıkış</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </nav>

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
        </div>

        {/* Modern Sites List */}
        <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
                <Globe className="w-5 h-5 text-blue-600" />
              </div>
              Siteleriniz
            </CardTitle>
            <CardDescription className="text-gray-600">
              Dinamik sitelerinizi yönetin ve yapılandırmalarını düzenleyin
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
                  Create Your First Site
                </Button>
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
                  <div className="flex flex-col items-center text-center p-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-2">
                      <Zap className="h-5 w-5 text-blue-600" />
                    </div>
                    <p className="text-sm font-medium text-gray-700">Quick Setup</p>
                    <p className="text-xs text-gray-500">Under 60 seconds</p>
                  </div>
                  <div className="flex flex-col items-center text-center p-4">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-2">
                      <Shield className="h-5 w-5 text-green-600" />
                    </div>
                    <p className="text-sm font-medium text-gray-700">Secure</p>
                    <p className="text-xs text-gray-500">Protected by RLS</p>
                  </div>
                  <div className="flex flex-col items-center text-center p-4">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-2">
                      <Sparkles className="h-5 w-5 text-purple-600" />
                    </div>
                    <p className="text-sm font-medium text-gray-700">Customizable</p>
                    <p className="text-xs text-gray-500">Your brand, your way</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {sites.map((site) => (
                  <div 
                    key={site.id} 
                    className="flex items-center justify-between p-4 bg-white border rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-1">
                        <h3 className="text-lg font-semibold">{site.title}</h3>
                        <span 
                          className={`px-2 py-1 text-xs rounded-full ${
                            site.is_enabled 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {site.is_enabled ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center">
                          <Link2 className="h-3 w-3 mr-1" />
                          /{site.site_slug}
                        </span>
                        <span className="flex items-center">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          {site.target_url === 'https://placeholder.empty'
                            ? '(No content)'
                            : site.target_url.startsWith('https://text/') 
                            ? decodeURIComponent(site.target_url.replace('https://text/', ''))
                            : site.target_url}
                        </span>
                        <span>
                          Updated {formatDistanceToNow(new Date(site.updated_at), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(`/${site.site_slug}`, '_blank')}
                        title="View Site"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/dashboard/analytics/${site.site_slug}`)}
                        title="Analytics"
                      >
                        <BarChart className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/dashboard/sites/${site.id}/edit`)}
                        title="Edit Site"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteTarget(site)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        title="Delete Site"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
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