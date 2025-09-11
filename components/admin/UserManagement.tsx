'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
// import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { UserRole, roleDescriptions, roleColors } from '@/lib/auth/roles';
import { Users, Shield, Edit, Search, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface User {
  id: string;
  email: string;
  user_created_at: string;
  role: UserRole;
  role_assigned_at: string;
  role_notes: string;
  owned_sites_count: number;
  granted_permissions_count: number;
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newRole, setNewRole] = useState<UserRole>('pending');
  const [roleNotes, setRoleNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .rpc('get_admin_users_view');

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleUpdate = async () => {
    if (!editingUser) return;

    setIsSubmitting(true);
    try {
      // First, delete existing role if it exists
      const { error: deleteError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', editingUser.id);

      if (deleteError) {
        console.warn('Error deleting existing role:', deleteError);
        // Continue anyway, might not exist
      }

      // Then insert the new role
      const { error: insertError } = await supabase
        .from('user_roles')
        .insert({
          user_id: editingUser.id,
          role: newRole,
          notes: roleNotes,
          assigned_at: new Date().toISOString()
        } as any);

      if (insertError) throw insertError;

      await fetchUsers();
      setEditingUser(null);
      setRoleNotes('');
    } catch (error) {
      console.error('Error updating role:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deletingUser) return;

    // Admin hesapları silinemez
    if (deletingUser.role === 'admin') {
      alert('Admin hesapları silinemez!');
      setDeletingUser(null);
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch('/api/admin/delete-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: deletingUser.id
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Kullanıcı silinirken hata oluştu');
      }

      await fetchUsers();
      setDeletingUser(null);
      alert('Kullanıcı başarıyla silindi!');
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Kullanıcı silinirken hata oluştu: ' + (error as any).message);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const roleStats = {
    admin: users.filter(u => u.role === 'admin').length,
    moderator: users.filter(u => u.role === 'moderator').length,
    approved: users.filter(u => u.role === 'approved').length,
    pending: users.filter(u => u.role === 'pending').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent rounded-full animate-ping border-t-blue-400"></div>
          </div>
          <p className="mt-4 text-gray-600 font-medium">Kullanıcılar yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Modern Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Admin</p>
                <p className="text-3xl font-bold text-red-600">{roleStats.admin}</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-red-100 to-red-200 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Shield className="w-7 h-7 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Moderatör</p>
                <p className="text-3xl font-bold text-blue-600">{roleStats.moderator}</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Users className="w-7 h-7 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Onaylı</p>
                <p className="text-3xl font-bold text-green-600">{roleStats.approved}</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Users className="w-7 h-7 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Beklemede</p>
                <p className="text-3xl font-bold text-yellow-600">{roleStats.pending}</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Users className="w-7 h-7 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modern Filters */}
      <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            Kullanıcı Yönetimi
          </CardTitle>
          <CardDescription className="text-gray-600">
            Kullanıcı rollerini yönetin ve izinleri kontrol edin
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Label htmlFor="search" className="text-sm font-medium text-gray-700 mb-2 block">E-posta Ara</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="E-posta adresi ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-11 bg-white/50 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <Label htmlFor="role-filter" className="text-sm font-medium text-gray-700 mb-2 block">Rol Filtrele</Label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="h-11 bg-white/50 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white/95 backdrop-blur-sm border-white/20">
                  <SelectItem value="all">Tümü</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="moderator">Moderatör</SelectItem>
                  <SelectItem value="approved">Onaylı</SelectItem>
                  <SelectItem value="pending">Beklemede</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Modern Users List */}
          <div className="space-y-4">
            {filteredUsers.map((user) => (
              <div key={user.id} className="group relative backdrop-blur-sm bg-white/60 border border-white/30 rounded-2xl p-6 hover:bg-white/80 hover:shadow-xl transition-all duration-300">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center">
                        <Users className="w-6 h-6 text-gray-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg">{user.email}</h3>
                        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors ${roleColors[user.role]} mt-1`}>
                          {user.role === 'admin' ? 'Admin' :
                           user.role === 'moderator' ? 'Moderatör' :
                           user.role === 'approved' ? 'Onaylı' : 'Beklemede'}
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span>Kayıt: {formatDistanceToNow(new Date(user.user_created_at), { addSuffix: true })}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Rol: {formatDistanceToNow(new Date(user.role_assigned_at), { addSuffix: true })}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span>Siteler: {user.owned_sites_count} | İzinler: {user.granted_permissions_count}</span>
                      </div>
                    </div>
                    {user.role_notes && (
                      <div className="mt-3 p-3 bg-gray-50/50 rounded-lg border border-gray-200/50">
                        <p className="text-sm text-gray-700 italic">"{user.role_notes}"</p>
                      </div>
                    )}
                  </div>
                
                  <div className="flex items-center gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingUser(user);
                            setNewRole(user.role);
                            setRoleNotes(user.role_notes || '');
                          }}
                          className="bg-white/50 backdrop-blur-sm border-white/30 hover:bg-white/70 hover:border-white/50 transition-all duration-200"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Düzenle
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-white/95 backdrop-blur-md border-white/30 shadow-2xl">
                        <DialogHeader>
                          <DialogTitle className="text-xl font-semibold text-gray-900">Kullanıcı Rolü Düzenle</DialogTitle>
                          <DialogDescription className="text-gray-600">
                            {user.email} kullanıcısının rolünü ve notlarını güncelleyin
                          </DialogDescription>
                        </DialogHeader>
                      
                        <div className="space-y-6">
                          <div>
                            <Label htmlFor="role" className="text-sm font-medium text-gray-700 mb-2 block">Yeni Rol</Label>
                            <Select value={newRole} onValueChange={(value) => setNewRole(value as UserRole)}>
                              <SelectTrigger className="h-11 bg-white/50 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-white/95 backdrop-blur-sm border-white/20">
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="moderator">Moderatör</SelectItem>
                                <SelectItem value="approved">Onaylı</SelectItem>
                                <SelectItem value="pending">Beklemede</SelectItem>
                              </SelectContent>
                            </Select>
                            <div className="mt-2 p-3 bg-blue-50/50 rounded-lg border border-blue-200/50">
                              <p className="text-sm text-blue-700">
                                <strong>Açıklama:</strong> {roleDescriptions[newRole]}
                              </p>
                            </div>
                          </div>
                          
                          <div>
                            <Label htmlFor="notes" className="text-sm font-medium text-gray-700 mb-2 block">Notlar</Label>
                            <Textarea
                              id="notes"
                              placeholder="Rol atama sebebi veya notlar..."
                              value={roleNotes}
                              onChange={(e) => setRoleNotes(e.target.value)}
                              className="bg-white/50 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 min-h-[100px]"
                            />
                          </div>
                        </div>
                        
                        <DialogFooter className="pt-4">
                          <Button
                            onClick={handleRoleUpdate}
                            disabled={isSubmitting}
                            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-2 rounded-lg transition-all duration-200 disabled:opacity-50"
                          >
                            {isSubmitting ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Güncelleniyor...
                              </>
                            ) : (
                              'Güncelle'
                            )}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    {/* Silme Butonu - Admin hesapları hariç */}
                    {user.role !== 'admin' && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDeletingUser(user)}
                            className="bg-white/50 backdrop-blur-sm border-red-200 hover:bg-red-50 hover:border-red-300 text-red-600 hover:text-red-700 transition-all duration-200"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Sil
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-white/95 backdrop-blur-md border-white/30 shadow-2xl">
                          <DialogHeader>
                            <DialogTitle className="text-xl font-semibold text-red-600">Kullanıcıyı Sil</DialogTitle>
                            <DialogDescription className="text-gray-600">
                              <strong>{user.email}</strong> kullanıcısını silmek istediğinizden emin misiniz?
                              <br />
                              <span className="text-red-600 font-medium">Bu işlem geri alınamaz!</span>
                            </DialogDescription>
                          </DialogHeader>
                          
                          <div className="bg-red-50/50 border border-red-200/50 rounded-lg p-4">
                            <h4 className="font-semibold text-red-800 mb-2">Silinecek Veriler:</h4>
                            <ul className="text-sm text-red-700 space-y-1">
                              <li>• Kullanıcı hesabı (auth.users)</li>
                              <li>• Kullanıcı rolü (user_roles)</li>
                              <li>• Sahip olduğu siteler ({user.owned_sites_count} adet)</li>
                              <li>• Verilen izinler ({user.granted_permissions_count} adet)</li>
                            </ul>
                          </div>
                          
                          <DialogFooter className="pt-4">
                            <Button
                              variant="outline"
                              onClick={() => setDeletingUser(null)}
                              className="border-gray-300 hover:bg-gray-50"
                            >
                              İptal
                            </Button>
                            <Button
                              onClick={handleDeleteUser}
                              disabled={isDeleting}
                              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-6 py-2 rounded-lg transition-all duration-200 disabled:opacity-50"
                            >
                              {isDeleting ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                  Siliniyor...
                                </>
                              ) : (
                                <>
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Kullanıcıyı Sil
                                </>
                              )}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {filteredUsers.length === 0 && (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mx-auto mb-4">
                  <Users className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Kullanıcı Bulunamadı</h3>
                <p className="text-gray-500">Arama kriterlerinize uygun kullanıcı bulunamadı.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}