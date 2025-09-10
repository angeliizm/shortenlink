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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-neutral-50 to-neutral-100">
        <div className="text-center">
          <svg className="animate-spin h-8 w-8 text-blue-600 mx-auto" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <RoleGuard requireDashboardAccess={true}>
      <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-neutral-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Globe className="h-6 w-6 text-blue-600" />
              <h1 className="text-xl font-bold">Site Manager</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {user?.email}
              </span>
              
              {/* Admin Panel Link - Sadece admin kullanıcılar için */}
              {userRole === 'admin' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push('/admin')}
                  className="flex items-center space-x-2 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                >
                  <Settings className="h-4 w-4" />
                  <span>Admin Panel</span>
                </Button>
              )}
              
              <button
                onClick={logout}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign out</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Sites</CardDescription>
              <CardTitle className="text-3xl">{stats.totalSites}</CardTitle>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Active Sites</CardDescription>
              <CardTitle className="text-3xl">{stats.activeSites}</CardTitle>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <Button 
                onClick={() => setIsCreateOpen(true)}
                className="w-full"
                size="lg"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create New Site
              </Button>
            </CardHeader>
          </Card>
        </div>

        {/* Sites List */}
        <Card>
          <CardHeader>
            <CardTitle>Your Sites</CardTitle>
            <CardDescription>
              Manage your dynamic sites and their configurations
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingSites ? (
              <div className="flex justify-center py-8">
                <svg className="animate-spin h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              </div>
            ) : sites.length === 0 ? (
              <div className="text-center py-12">
                <div className="relative inline-block mb-6">
                  <div className="absolute inset-0 bg-blue-200 rounded-full blur-xl opacity-50 animate-pulse"></div>
                  <Globe className="h-16 w-16 text-blue-500 relative" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No sites yet</h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  Get started by creating your first dynamic site. It only takes a few seconds!
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