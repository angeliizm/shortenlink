import { createClient } from '@/lib/supabase/client';

export type UserRole = 'admin' | 'moderator' | 'approved' | 'pending';

export interface UserRoleInfo {
  role: UserRole;
  assignedAt: string;
  notes?: string;
}

export interface SitePermission {
  siteSlug: string;
  permissionType: 'view' | 'edit' | 'analytics' | 'create';
  grantedAt: string;
  expiresAt?: string;
  isActive: boolean;
}

// Kullanıcının rolünü al
export async function getUserRole(userId?: string): Promise<UserRole> {
  try {
    const supabase = createClient();
    
    if (!userId) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return 'pending';
      userId = user.id;
    }

    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      return 'pending';
    }

    return (data as { role: UserRole }).role;
  } catch (error) {
    console.error('Error getting user role:', error);
    return 'pending';
  }
}

// Kullanıcının dashboard'a erişip erişemeyeceğini kontrol et
export async function canAccessDashboard(userId?: string): Promise<boolean> {
  const role = await getUserRole(userId);
  return role !== 'pending';
}

// Kullanıcının yeni site oluşturup oluşturamayacağını kontrol et
export async function canCreateSites(userId?: string): Promise<boolean> {
  const role = await getUserRole(userId);
  return role === 'admin' || role === 'moderator';
}

// Kullanıcının belirli bir site için izni olup olmadığını kontrol et
export async function hasSitePermission(
  siteSlug: string, 
  permissionType: 'view' | 'edit' | 'analytics' | 'create',
  userId?: string
): Promise<boolean> {
  try {
    const supabase = createClient();
    
    if (!userId) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;
      userId = user.id;
    }

    // Admin her şeyi yapabilir
    const role = await getUserRole(userId);
    if (role === 'admin') return true;
    
    // Pending kullanıcılar hiçbir şey yapamaz
    if (role === 'pending') return false;

    // Site sahibi kontrol et
    const { data: pageData } = await supabase
      .from('pages')
      .select('owner_id')
      .eq('site_slug', siteSlug)
      .single();

    if (pageData && (pageData as { owner_id: string }).owner_id === userId) {
      return true;
    }

    // Specific permission kontrol et
    const { data: permissionData } = await supabase
      .from('site_permissions')
      .select('*')
      .eq('user_id', userId)
      .eq('site_slug', siteSlug)
      .eq('permission_type', permissionType)
      .eq('is_active', true)
      .single();

    if (permissionData) {
      // Expire date kontrol et
      const typedPermissionData = permissionData as { expires_at: string | null };
      if (typedPermissionData.expires_at && new Date(typedPermissionData.expires_at) < new Date()) {
        return false;
      }
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error checking site permission:', error);
    return false;
  }
}

// Kullanıcının site silme yetkisi olup olmadığını kontrol et
export async function canDeleteSite(siteSlug: string, userId?: string): Promise<boolean> {
  try {
    const supabase = createClient();
    
    if (!userId) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;
      userId = user.id;
    }

    // Admin her şeyi silebilir
    const role = await getUserRole(userId);
    if (role === 'admin') return true;

    // Sadece site sahibi silebilir
    const { data: pageData } = await supabase
      .from('pages')
      .select('owner_id')
      .eq('site_slug', siteSlug)
      .single();

    return pageData ? (pageData as { owner_id: string }).owner_id === userId : false;
  } catch (error) {
    console.error('Error checking delete permission:', error);
    return false;
  }
}

// Kullanıcının tüm izinlerini al
export async function getUserPermissions(userId?: string): Promise<SitePermission[]> {
  try {
    const supabase = createClient();
    
    if (!userId) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      userId = user.id;
    }

    const { data, error } = await supabase
      .from('site_permissions')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true);

    if (error || !data) {
      return [];
    }

    return data.map(permission => {
      const typedPermission = permission as {
        site_slug: string;
        permission_type: string;
        granted_at: string;
        expires_at: string | null;
        is_active: boolean;
      };
      
      return {
        siteSlug: typedPermission.site_slug,
        permissionType: typedPermission.permission_type as 'view' | 'edit' | 'analytics' | 'create',
        grantedAt: typedPermission.granted_at,
        expiresAt: typedPermission.expires_at || undefined,
        isActive: typedPermission.is_active
      };
    });
  } catch (error) {
    console.error('Error getting user permissions:', error);
    return [];
  }
}

// Rol açıklamaları
export const roleDescriptions: Record<UserRole, string> = {
  admin: 'Tam yetki - Tüm siteleri yönetebilir, kullanıcı rollerini atayabilir',
  moderator: 'İzin verilen siteleri oluşturabilir, düzenleyebilir ve analiz görüntüleyebilir (silme yetkisi yok)',
  approved: 'Sadece izin verilen siteleri düzenleyebilir ve analiz görüntüleyebilir',
  pending: 'Beklemede - Dashboard ve diğer özelliklere erişim yok'
};

// Rol renkları (UI için)
export const roleColors: Record<UserRole, string> = {
  admin: 'bg-red-100 text-red-800',
  moderator: 'bg-blue-100 text-blue-800',
  approved: 'bg-green-100 text-green-800',
  pending: 'bg-gray-100 text-gray-800'
};

// Rol öncelikleri (sıralama için)
export const rolePriority: Record<UserRole, number> = {
  admin: 4,
  moderator: 3,
  approved: 2,
  pending: 1
};
