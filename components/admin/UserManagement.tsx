'use client';

import { useState, useEffect, useMemo, useRef } from 'react';

function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

/** Defer opening a dialog to idle time so the button click doesn't block INP. */
function deferOpen(open: () => void, timeoutMs = 80) {
  if (typeof requestIdleCallback !== 'undefined') {
    requestIdleCallback(open, { timeout: timeoutMs });
  } else {
    setTimeout(open, 0);
  }
}
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
// import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { UserRole, roleDescriptions, roleColors } from '@/lib/auth/roles';
import { Users, Shield, Edit, Search, Trash2, Key, CheckCircle } from 'lucide-react';
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
  const [resettingPassword, setResettingPassword] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [approvingUserId, setApprovingUserId] = useState<string | null>(null);

  const supabaseRef = useRef(createClient());
  const supabase = supabaseRef.current;

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
      const res = await fetch('/api/admin/update-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          userId: editingUser.id,
          role: newRole,
          notes: roleNotes || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || 'Rol güncellenemedi');
      }

      const updatedUserId = editingUser.id;
      setUsers((prev) =>
        prev.map((u) =>
          u.id === updatedUserId
            ? { ...u, role: newRole, role_notes: roleNotes || u.role_notes || '' }
            : u
        )
      );
      setEditDialogOpen(false);
      setEditingUser(null);
      setRoleNotes('');
    } catch (error) {
      console.error('Error updating role:', error);
      alert((error instanceof Error ? error.message : 'Rol güncellenemedi'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApproveAccount = async (user: User) => {
    if (user.role !== 'pending') return;
    setApprovingUserId(user.id);
    try {
      const res = await fetch('/api/admin/update-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ userId: user.id, role: 'approved', notes: user.role_notes || undefined }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Hesap onaylanamadı');
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, role: 'approved' as const } : u))
      );
    } catch (error) {
      console.error('Error approving account:', error);
      alert(error instanceof Error ? error.message : 'Hesap onaylanamadı');
    } finally {
      setApprovingUserId(null);
    }
  };

  const handleDeleteUser = async () => {
    if (!deletingUser) return;

    // Admin hesapları silinemez
    if (deletingUser.role === 'admin') {
      alert('Admin hesapları silinemez!');
      setDeleteDialogOpen(false);
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

      setUsers(prev => prev.filter(u => u.id !== deletingUser.id));
      setDeleteDialogOpen(false);
      setDeletingUser(null);
      alert('Kullanıcı başarıyla silindi!');
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Kullanıcı silinirken hata oluştu: ' + (error as any).message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleResetPassword = async () => {
    if (!resettingPassword) return;

    if (newPassword !== confirmPassword) {
      alert('Şifreler eşleşmiyor!');
      return;
    }

    if (newPassword.length < 6) {
      alert('Şifre en az 6 karakter olmalıdır!');
      return;
    }

    setIsResetting(true);
    try {
      const response = await fetch('/api/admin/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: resettingPassword.id,
          newPassword: newPassword
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Şifre sıfırlanırken hata oluştu');
      }

      setPasswordDialogOpen(false);
      setResettingPassword(null);
      setNewPassword('');
      setConfirmPassword('');
      alert('Şifre başarıyla sıfırlandı!');
    } catch (error) {
      console.error('Error resetting password:', error);
      alert('Şifre sıfırlanırken hata oluştu: ' + (error as any).message);
    } finally {
      setIsResetting(false);
    }
  };

  const debouncedSearch = useDebounce(searchTerm, 300);

  const filteredUsers = useMemo(() =>
    users.filter(user => {
      const matchesSearch = user.email.toLowerCase().includes(debouncedSearch.toLowerCase());
      const matchesRole = selectedRole === 'all' || user.role === selectedRole;
      return matchesSearch && matchesRole;
    }), [users, debouncedSearch, selectedRole]);

  const roleStats = useMemo(() => ({
    admin: users.filter(u => u.role === 'admin').length,
    moderator: users.filter(u => u.role === 'moderator').length,
    approved: users.filter(u => u.role === 'approved').length,
    pending: users.filter(u => u.role === 'pending').length,
  }), [users]);

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
        <Card className="bg-white border-gray-200 shadow-md hover:shadow-lg transition-shadow duration-200 group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Admin</p>
                <p className="text-3xl font-bold text-red-600">{roleStats.admin}</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-red-100 to-red-200 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <Shield className="w-7 h-7 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200 shadow-md hover:shadow-lg transition-shadow duration-200 group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Moderatör</p>
                <p className="text-3xl font-bold text-blue-600">{roleStats.moderator}</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <Users className="w-7 h-7 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200 shadow-md hover:shadow-lg transition-shadow duration-200 group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Onaylı</p>
                <p className="text-3xl font-bold text-green-600">{roleStats.approved}</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <Users className="w-7 h-7 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200 shadow-md hover:shadow-lg transition-shadow duration-200 group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Beklemede</p>
                <p className="text-3xl font-bold text-yellow-600">{roleStats.pending}</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <Users className="w-7 h-7 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modern Filters */}
      <Card className="bg-white border-gray-200 shadow-md">
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
                  className="pl-10 h-11 bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <Label htmlFor="role-filter" className="text-sm font-medium text-gray-700 mb-2 block">Rol Filtrele</Label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="h-11 bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200">
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
              <div key={user.id} className="group relative bg-gray-50 border border-gray-200 rounded-2xl p-6 hover:bg-white hover:shadow-md transition-shadow duration-200">
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
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const u = user;
                        setTimeout(() => {
                          deferOpen(() => {
                            setEditingUser(u);
                            setNewRole(u.role);
                            setRoleNotes(u.role_notes || '');
                            setEditDialogOpen(true);
                          });
                        }, 0);
                      }}
                      className="bg-white border-gray-300 hover:bg-gray-50 transition-colors duration-150"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Düzenle
                    </Button>

                    {user.role === 'pending' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleApproveAccount(user)}
                        disabled={approvingUserId === user.id}
                        className="bg-white border-green-200 hover:bg-green-50 hover:border-green-300 text-green-700 hover:text-green-800 transition-colors duration-150"
                      >
                        {approvingUserId === user.id ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-green-600 border-t-transparent mr-2" />
                            Onaylanıyor...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Hesabı Onayla
                          </>
                        )}
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const u = user;
                        setTimeout(() => {
                          deferOpen(() => {
                            setResettingPassword(u);
                            setNewPassword('');
                            setConfirmPassword('');
                            setPasswordDialogOpen(true);
                          });
                        }, 0);
                      }}
                      className="bg-white border-orange-200 hover:bg-orange-50 hover:border-orange-300 text-orange-600 hover:text-orange-700 transition-colors duration-150"
                    >
                      <Key className="w-4 h-4 mr-2" />
                      Şifre
                    </Button>

                    {user.role !== 'admin' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const u = user;
                          setTimeout(() => {
                            deferOpen(() => {
                              setDeletingUser(u);
                              setDeleteDialogOpen(true);
                            });
                          }, 0);
                        }}
                        className="bg-white border-red-200 hover:bg-red-50 hover:border-red-300 text-red-600 hover:text-red-700 transition-colors duration-150"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Sil
                      </Button>
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

          {/* Edit role dialog (controlled, deferred open for INP) */}
          <Dialog open={editDialogOpen} onOpenChange={(open) => { setEditDialogOpen(open); if (!open) setEditingUser(null); }}>
            <DialogContent className="bg-white border-gray-200 shadow-2xl">
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold text-gray-900">Kullanıcı Rolü Düzenle</DialogTitle>
                <DialogDescription className="text-gray-600">
                  {editingUser?.email} kullanıcısının rolünü ve notlarını güncelleyin
                </DialogDescription>
              </DialogHeader>
              {editingUser && (
                <>
                  <div className="space-y-6">
                    <div>
                      <Label htmlFor="role" className="text-sm font-medium text-gray-700 mb-2 block">Yeni Rol</Label>
                      <Select value={newRole} onValueChange={(value) => setNewRole(value as UserRole)}>
                        <SelectTrigger className="h-11 bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500/20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-gray-200">
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
                        className="bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 min-h-[100px]"
                      />
                    </div>
                  </div>
                  <DialogFooter className="pt-4">
                    <Button
                      onClick={handleRoleUpdate}
                      disabled={isSubmitting}
                      className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-2 rounded-lg transition-opacity duration-150 disabled:opacity-50"
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
                </>
              )}
            </DialogContent>
          </Dialog>

          {/* Reset password dialog (controlled, deferred open for INP) */}
          <Dialog open={passwordDialogOpen} onOpenChange={(open) => { setPasswordDialogOpen(open); if (!open) { setResettingPassword(null); setNewPassword(''); setConfirmPassword(''); } }}>
            <DialogContent className="bg-white border-gray-200 shadow-2xl">
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold text-orange-600">Şifre Sıfırla</DialogTitle>
                <DialogDescription className="text-gray-600">
                  <strong>{resettingPassword?.email}</strong> kullanıcısının şifresini sıfırlayın
                </DialogDescription>
              </DialogHeader>
              {resettingPassword && (
                <>
                  <div className="space-y-6">
                    <div>
                      <Label htmlFor="new-password" className="text-sm font-medium text-gray-700 mb-2 block">Yeni Şifre</Label>
                      <Input
                        id="new-password"
                        type="password"
                        placeholder="En az 6 karakter"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="h-11 bg-white border-gray-200 focus:border-orange-500 focus:ring-orange-500/20"
                      />
                    </div>
                    <div>
                      <Label htmlFor="confirm-password" className="text-sm font-medium text-gray-700 mb-2 block">Şifre Tekrar</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        placeholder="Şifreyi tekrar girin"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="h-11 bg-white border-gray-200 focus:border-orange-500 focus:ring-orange-500/20"
                      />
                    </div>
                    <div className="bg-orange-50/50 border border-orange-200/50 rounded-lg p-4">
                      <h4 className="font-semibold text-orange-800 mb-2">Güvenlik Uyarısı:</h4>
                      <ul className="text-sm text-orange-700 space-y-1">
                        <li>• Kullanıcı mevcut oturumundan çıkış yapacak</li>
                        <li>• Yeni şifre ile tekrar giriş yapması gerekecek</li>
                        <li>• Bu işlem geri alınamaz</li>
                      </ul>
                    </div>
                  </div>
                  <DialogFooter className="pt-4">
                    <Button
                      variant="outline"
                      onClick={() => { setPasswordDialogOpen(false); setResettingPassword(null); setNewPassword(''); setConfirmPassword(''); }}
                      className="border-gray-300 hover:bg-gray-50"
                    >
                      İptal
                    </Button>
                    <Button
                      onClick={handleResetPassword}
                      disabled={isResetting || !newPassword || !confirmPassword}
                      className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white px-6 py-2 rounded-lg transition-opacity duration-150 disabled:opacity-50"
                    >
                      {isResetting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Sıfırlanıyor...
                        </>
                      ) : (
                        <>
                          <Key className="w-4 h-4 mr-2" />
                          Şifreyi Sıfırla
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </>
              )}
            </DialogContent>
          </Dialog>

          {/* Delete user dialog (controlled, deferred open for INP) */}
          <Dialog open={deleteDialogOpen} onOpenChange={(open) => { setDeleteDialogOpen(open); if (!open) setDeletingUser(null); }}>
            <DialogContent className="bg-white border-gray-200 shadow-2xl">
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold text-red-600">Kullanıcıyı Sil</DialogTitle>
                <DialogDescription className="text-gray-600">
                  <strong>{deletingUser?.email}</strong> kullanıcısını silmek istediğinizden emin misiniz?
                  <br />
                  <span className="text-red-600 font-medium">Bu işlem geri alınamaz!</span>
                </DialogDescription>
              </DialogHeader>
              {deletingUser && (
                <>
                  <div className="bg-red-50/50 border border-red-200/50 rounded-lg p-4">
                    <h4 className="font-semibold text-red-800 mb-2">Silinecek Veriler:</h4>
                    <ul className="text-sm text-red-700 space-y-1">
                      <li>• Kullanıcı hesabı (auth.users)</li>
                      <li>• Kullanıcı rolü (user_roles)</li>
                      <li>• Sahip olduğu siteler ({deletingUser.owned_sites_count} adet)</li>
                      <li>• Verilen izinler ({deletingUser.granted_permissions_count} adet)</li>
                    </ul>
                  </div>
                  <DialogFooter className="pt-4">
                    <Button
                      variant="outline"
                      onClick={() => { setDeleteDialogOpen(false); setDeletingUser(null); }}
                      className="border-gray-300 hover:bg-gray-50"
                    >
                      İptal
                    </Button>
                    <Button
                      onClick={handleDeleteUser}
                      disabled={isDeleting}
                      className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-6 py-2 rounded-lg transition-opacity duration-150 disabled:opacity-50"
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
                </>
              )}
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}