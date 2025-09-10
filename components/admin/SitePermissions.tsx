'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Globe, Plus, Edit, Trash2, Users, Shield } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Site {
  id: string;
  site_slug: string;
  title: string;
  owner_id: string;
  created_at: string;
  owner_email: string;
}

interface SitePermission {
  id: string;
  user_id: string;
  site_slug: string;
  permission_type: 'view' | 'edit' | 'analytics' | 'create';
  granted_at: string;
  expires_at?: string;
  is_active: boolean;
  user_email: string;
}

export default function SitePermissions() {
  const [sites, setSites] = useState<Site[]>([]);
  const [permissions, setPermissions] = useState<SitePermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSite, setSelectedSite] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [selectedPermission, setSelectedPermission] = useState<'view' | 'edit' | 'analytics' | 'create'>('view');
  const [expiryDate, setExpiryDate] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [users, setUsers] = useState<{id: string, email: string}[]>([]);
  const [userSearchTerm, setUserSearchTerm] = useState<string>('');

  const supabase = createClient();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch sites
      const { data: sitesData, error: sitesError } = await supabase
        .from('pages')
        .select(`
          id,
          site_slug,
          title,
          owner_id,
          created_at
        `);

      if (sitesError) throw sitesError;

      // Get owner emails separately using RPC function
      const ownerIds = sitesData?.map((site: any) => site.owner_id) || [];
      let userEmailMap = new Map();
      
      if (ownerIds.length > 0) {
        const { data: usersData, error: usersError } = await (supabase as any)
          .rpc('get_user_emails', { user_ids: ownerIds });

        if (usersError) {
          console.warn('Could not fetch user emails:', usersError);
        } else {
          (usersData as any[])?.forEach((user: any) => {
            userEmailMap.set(user.id, user.email);
          });
        }
      }

      const formattedSites = sitesData?.map((site: any) => ({
        id: site.id,
        site_slug: site.site_slug,
        title: site.title,
        owner_id: site.owner_id,
        created_at: site.created_at,
        owner_email: userEmailMap.get(site.owner_id) || 'Unknown'
      })) || [];

      setSites(formattedSites);

      // Fetch all users for permission granting using RPC function
      const { data: allUsersData, error: allUsersError } = await supabase
        .rpc('get_all_users' as any);

      if (allUsersError) {
        console.warn('Could not fetch all users:', allUsersError);
      }

      setUsers((allUsersData as unknown as any[]) ?? []);

      // Fetch permissions
      const { data: permissionsData, error: permissionsError } = await supabase
        .from('site_permissions')
        .select(`
          id,
          user_id,
          site_slug,
          permission_type,
          granted_at,
          expires_at,
          is_active
        `);

      if (permissionsError) throw permissionsError;

      // Get user emails for permissions using RPC function
      const permissionUserIds = permissionsData?.map((p: any) => p.user_id) || [];
      let permissionUserEmailMap = new Map();
      
      if (permissionUserIds.length > 0) {
        const { data: permissionUsersData, error: permissionUsersError } = await (supabase as any)
          .rpc('get_user_emails', { user_ids: permissionUserIds });

        if (permissionUsersError) {
          console.warn('Could not fetch permission user emails:', permissionUsersError);
        } else {
          (permissionUsersData as any[])?.forEach((user: any) => {
            permissionUserEmailMap.set(user.id, user.email);
          });
        }
      }

      const formattedPermissions = permissionsData?.map((permission: any) => ({
        id: permission.id,
        user_id: permission.user_id,
        site_slug: permission.site_slug,
        permission_type: permission.permission_type,
        granted_at: permission.granted_at,
        expires_at: permission.expires_at,
        is_active: permission.is_active,
        user_email: permissionUserEmailMap.get(permission.user_id) || 'Unknown'
      })) || [];

      setPermissions(formattedPermissions);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(userSearchTerm.toLowerCase())
  );

  const handleGrantPermission = async () => {
    if (!selectedSite || !selectedUser || !selectedPermission) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('site_permissions')
        .insert({
          user_id: selectedUser,
          site_slug: selectedSite,
          permission_type: selectedPermission,
          granted_at: new Date().toISOString(),
          expires_at: expiryDate || null,
          is_active: true
        } as any);

      if (error) throw error;

      await fetchData();
      setIsDialogOpen(false);
      setSelectedSite('');
      setSelectedUser('');
      setUserSearchTerm('');
      setSelectedPermission('view');
      setExpiryDate('');
    } catch (error) {
      console.error('Error granting permission:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRevokePermission = async (permissionId: string) => {
    try {
      // Simple approach with type assertion
      const { error } = await (supabase as any)
        .from('site_permissions')
        .update({ is_active: false })
        .eq('id', permissionId);

      if (error) throw error;

      await fetchData();
    } catch (error) {
      console.error('Error revoking permission:', error);
    }
  };

  const getPermissionTypeLabel = (type: string) => {
    switch (type) {
      case 'view': return 'Görüntüleme';
      case 'edit': return 'Düzenleme';
      case 'analytics': return 'Analitik';
      case 'create': return 'Oluşturma';
      default: return type;
    }
  };

  const getPermissionTypeColor = (type: string) => {
    switch (type) {
      case 'view': return 'bg-blue-100 text-blue-800';
      case 'edit': return 'bg-green-100 text-green-800';
      case 'analytics': return 'bg-purple-100 text-purple-800';
      case 'create': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent rounded-full animate-ping border-t-blue-400"></div>
          </div>
          <p className="mt-4 text-gray-600 font-medium">Site izinleri yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Grant Permission Section */}
      <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-green-600" />
            </div>
            Site İzni Ver
          </CardTitle>
          <CardDescription className="text-gray-600">
            Kullanıcılara belirli siteler için izin verin
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Site Selection */}
            <div>
              <Label htmlFor="site-select" className="text-sm font-medium text-gray-700 mb-2 block">Site Seç</Label>
              <Select value={selectedSite} onValueChange={setSelectedSite}>
                <SelectTrigger className="h-12 bg-white/50 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20">
                  <SelectValue placeholder="İzin verilecek siteyi seçin..." />
                </SelectTrigger>
                <SelectContent className="bg-white/95 backdrop-blur-sm border-white/20">
                  {sites.map((site) => (
                    <SelectItem key={site.id} value={site.site_slug}>
                      <div className="flex flex-col">
                        <span className="font-medium">{site.title}</span>
                        <span className="text-xs text-gray-500">{site.site_slug}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* User Selection */}
            <div>
              <Label htmlFor="user-search" className="text-sm font-medium text-gray-700 mb-2 block">Kullanıcı Ara</Label>
              <div className="space-y-2">
                <Input
                  id="user-search"
                  placeholder="Kullanıcı email'i ile ara..."
                  value={userSearchTerm}
                  onChange={(e) => setUserSearchTerm(e.target.value)}
                  className="h-12 bg-white/50 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                />
                
                {userSearchTerm && filteredUsers.length > 0 && (
                  <div className="max-h-48 overflow-y-auto bg-white/80 backdrop-blur-sm border border-white/30 rounded-lg shadow-lg">
                    {filteredUsers.slice(0, 10).map((user) => (
                      <div
                        key={user.id}
                        onClick={() => {
                          setSelectedUser(user.id);
                          setUserSearchTerm(user.email);
                        }}
                        className={`p-3 hover:bg-blue-50 cursor-pointer transition-colors ${
                          selectedUser === user.id ? 'bg-blue-100 border-l-4 border-blue-500' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
                            <Users className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{user.email}</p>
                            <p className="text-xs text-gray-500">ID: {user.id.slice(0, 8)}...</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {userSearchTerm && filteredUsers.length === 0 && (
                  <div className="p-4 text-center text-gray-500 bg-gray-50 rounded-lg">
                    Kullanıcı bulunamadı
                  </div>
                )}
              </div>
            </div>

            {/* Permission Type */}
            <div>
              <Label htmlFor="permission-select" className="text-sm font-medium text-gray-700 mb-2 block">İzin Türü</Label>
              <Select value={selectedPermission} onValueChange={(value: any) => setSelectedPermission(value)}>
                <SelectTrigger className="h-12 bg-white/50 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white/95 backdrop-blur-sm border-white/20">
                  <SelectItem value="view">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>Görüntüleme - Sadece siteyi görüntüleyebilir</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="edit">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Düzenleme - Site içeriğini düzenleyebilir</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="analytics">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span>Analitik - Site analitiklerini görüntüleyebilir</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="create">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <span>Oluşturma - Yeni içerik oluşturabilir</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Expiry Date */}
            <div>
              <Label htmlFor="expiry-date" className="text-sm font-medium text-gray-700 mb-2 block">
                Son Geçerlilik Tarihi (Opsiyonel)
              </Label>
              <Input
                id="expiry-date"
                type="datetime-local"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="h-12 bg-white/50 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
              />
              <p className="text-xs text-gray-500 mt-1">
                Boş bırakırsanız izin süresiz olacaktır
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              {selectedSite && selectedUser && selectedPermission ? (
                <span className="text-green-600 font-medium">
                  ✓ Tüm alanlar dolduruldu, izin verilebilir
                </span>
              ) : (
                <span>Lütfen tüm gerekli alanları doldurun</span>
              )}
            </div>
            
            <Button
              onClick={handleGrantPermission}
              disabled={!selectedSite || !selectedUser || !selectedPermission || isSubmitting}
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-8 py-3 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  İzin Veriliyor...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  İzin Ver
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Permissions List */}
      <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            Mevcut İzinler
          </CardTitle>
          <CardDescription className="text-gray-600">
            Verilen site izinlerini yönetin
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {permissions.filter(p => p.is_active).map((permission) => (
              <div key={permission.id} className="group relative backdrop-blur-sm bg-white/60 border border-white/30 rounded-2xl p-6 hover:bg-white/80 hover:shadow-xl transition-all duration-300">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center">
                        <Globe className="w-6 h-6 text-gray-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg">{permission.user_email}</h3>
                        <p className="text-sm text-gray-600">Site: {permission.site_slug}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span>İzin: {getPermissionTypeLabel(permission.permission_type)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Verilme: {formatDistanceToNow(new Date(permission.granted_at), { addSuffix: true })}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span>
                          {permission.expires_at 
                            ? `Bitiş: ${formatDistanceToNow(new Date(permission.expires_at), { addSuffix: true })}`
                            : 'Süresiz'
                          }
                        </span>
                      </div>
                    </div>
                    <div className="mt-3">
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors ${getPermissionTypeColor(permission.permission_type)}`}>
                        {getPermissionTypeLabel(permission.permission_type)}
                      </span>
                    </div>
                  </div>
                
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRevokePermission(permission.id)}
                      className="bg-red-50 backdrop-blur-sm border-red-200 hover:bg-red-100 hover:border-red-300 text-red-600 transition-all duration-200"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      İptal Et
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            
            {permissions.filter(p => p.is_active).length === 0 && (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Henüz İzin Verilmemiş</h3>
                <p className="text-gray-500">Kullanıcılara site izni vermek için yukarıdaki formu kullanın.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
