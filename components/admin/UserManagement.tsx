'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { UserRole, roleDescriptions, roleColors } from '@/lib/auth/roles';
import { Users, Shield, Edit, Plus, Search } from 'lucide-react';
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

interface SitePermission {
  id: string;
  user_id: string;
  site_slug: string;
  permission_type: string;
  granted_at: string;
  expires_at?: string;
  is_active: boolean;
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
      const { error } = await supabase
        .from('user_roles')
        .upsert({
          user_id: editingUser.id,
          role: newRole,
          notes: roleNotes,
          assigned_at: new Date().toISOString()
        } as any);

      if (error) throw error;

      await fetchUsers();
      setEditingUser(null);
      setRoleNotes('');
    } catch (error) {
      console.error('Error updating role:', error);
    } finally {
      setIsSubmitting(false);
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
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Admin</CardDescription>
            <CardTitle className="text-2xl text-red-600">{roleStats.admin}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Moderatör</CardDescription>
            <CardTitle className="text-2xl text-blue-600">{roleStats.moderator}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Onaylı</CardDescription>
            <CardTitle className="text-2xl text-green-600">{roleStats.approved}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Beklemede</CardDescription>
            <CardTitle className="text-2xl text-gray-600">{roleStats.pending}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Kullanıcı Yönetimi
          </CardTitle>
          <CardDescription>
            Kullanıcı rollerini yönetin ve izinleri kontrol edin
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <Label htmlFor="search">E-posta Ara</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="E-posta adresi..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="role-filter">Rol Filtrele</Label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="moderator">Moderatör</SelectItem>
                  <SelectItem value="approved">Onaylı</SelectItem>
                  <SelectItem value="pending">Beklemede</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Users Table */}
          <div className="space-y-3">
            {filteredUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-medium">{user.email}</h3>
                    <Badge className={roleColors[user.role]}>
                      {user.role === 'admin' ? 'Admin' :
                       user.role === 'moderator' ? 'Moderatör' :
                       user.role === 'approved' ? 'Onaylı' : 'Beklemede'}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-500 space-y-1">
                    <div>Kayıt: {formatDistanceToNow(new Date(user.user_created_at), { addSuffix: true })}</div>
                    <div>Rol atanma: {formatDistanceToNow(new Date(user.role_assigned_at), { addSuffix: true })}</div>
                    <div>Sahip olduğu site: {user.owned_sites_count} | Verilen izin: {user.granted_permissions_count}</div>
                    {user.role_notes && <div className="italic">"{user.role_notes}"</div>}
                  </div>
                </div>
                
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
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Düzenle
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Kullanıcı Rolü Düzenle</DialogTitle>
                      <DialogDescription>
                        {user.email} kullanıcısının rolünü ve notlarını güncelleyin
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="role">Yeni Rol</Label>
                        <Select value={newRole} onValueChange={(value) => setNewRole(value as UserRole)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="moderator">Moderatör</SelectItem>
                            <SelectItem value="approved">Onaylı</SelectItem>
                            <SelectItem value="pending">Beklemede</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-sm text-gray-500 mt-1">
                          {roleDescriptions[newRole]}
                        </p>
                      </div>
                      
                      <div>
                        <Label htmlFor="notes">Notlar</Label>
                        <Textarea
                          id="notes"
                          placeholder="Rol atama sebebi veya notlar..."
                          value={roleNotes}
                          onChange={(e) => setRoleNotes(e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <DialogFooter>
                      <Button
                        onClick={handleRoleUpdate}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? 'Güncelleniyor...' : 'Güncelle'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            ))}
            
            {filteredUsers.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Hiç kullanıcı bulunamadı
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
