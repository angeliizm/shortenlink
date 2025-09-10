'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { getUserRole, canAccessDashboard, UserRole } from '@/lib/auth/roles';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Clock, Shield, Users, Crown } from 'lucide-react';

interface RoleGuardProps {
  children: React.ReactNode;
  requiredRole?: UserRole | UserRole[];
  requireDashboardAccess?: boolean;
  fallbackPath?: string;
}

export default function RoleGuard({ 
  children, 
  requiredRole, 
  requireDashboardAccess = false,
  fallbackPath = '/'
}: RoleGuardProps) {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [isMakingAdmin, setIsMakingAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkAccess();
  }, []);

  const checkAccess = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/auth-demo');
        return;
      }

      const role = await getUserRole(user.id);
      setUserRole(role);

      // Dashboard erişim kontrolü
      if (requireDashboardAccess) {
        const canAccess = await canAccessDashboard(user.id);
        if (!canAccess) {
          setHasAccess(false);
          setLoading(false);
          return;
        }
      }

      // Belirli rol kontrolü
      if (requiredRole) {
        const requiredRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
        if (!requiredRoles.includes(role)) {
          setHasAccess(false);
          setLoading(false);
          return;
        }
      }

      setHasAccess(true);
    } catch (error) {
      console.error('Error checking access:', error);
      setHasAccess(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/auth-demo');
  };

  const handleGoHome = () => {
    router.push(fallbackPath);
  };

  const handleMakeAdmin = async () => {
    setIsMakingAdmin(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      // Admin rolünü ata
      const { error } = await supabase
        .from('user_roles')
        .upsert({
          user_id: user.id,
          role: 'admin',
          notes: 'Self-assigned admin role',
          assigned_at: new Date().toISOString()
        } as any);

      if (error) throw error;

      // Sayfayı yenile
      window.location.reload();
    } catch (error) {
      console.error('Error making admin:', error);
      alert('Admin olma işlemi başarısız oldu. Lütfen tekrar deneyin.');
    } finally {
      setIsMakingAdmin(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-sm text-gray-600">Yetki kontrol ediliyor...</p>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            {userRole === 'pending' ? (
              <>
                <Clock className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Hesabınız Beklemede</h2>
                <p className="text-gray-600 mb-6">
                  Hesabınız henüz onaylanmamış. Dashboard ve diğer özelliklere erişim için 
                  yöneticinin onayını beklemeniz gerekmektedir.
                </p>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
                    <p className="text-sm text-yellow-800">
                      <strong>Mevcut Rolünüz:</strong> Beklemede
                    </p>
                  </div>
                </div>
                
                {/* Admin Olma Butonu */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="text-center">
                    <Crown className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <h3 className="text-lg font-semibold text-blue-900 mb-2">Geliştirici Modu</h3>
                    <p className="text-sm text-blue-700 mb-4">
                      Test amaçlı olarak kendinize admin yetkisi verebilirsiniz.
                    </p>
                    <Button
                      onClick={handleMakeAdmin}
                      disabled={isMakingAdmin}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {isMakingAdmin ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Admin Yapılıyor...
                        </>
                      ) : (
                        <>
                          <Crown className="w-4 h-4 mr-2" />
                          Beni Admin Yap
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Erişim Engellendi</h2>
                <p className="text-gray-600 mb-6">
                  Bu sayfaya erişim için yeterli yetkiniz bulunmamaktadır.
                </p>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center">
                    <Users className="w-5 h-5 text-red-600 mr-2" />
                    <p className="text-sm text-red-800">
                      <strong>Mevcut Rolünüz:</strong> {userRole === 'admin' ? 'Admin' : 
                        userRole === 'moderator' ? 'Moderatör' : 
                        userRole === 'approved' ? 'Onaylı' : 'Beklemede'}
                    </p>
                  </div>
                </div>
              </>
            )}
            
            <div className="flex gap-3">
              <Button 
                onClick={handleGoHome} 
                variant="outline" 
                className="flex-1"
              >
                Ana Sayfaya Dön
              </Button>
              <Button 
                onClick={handleSignOut} 
                variant="destructive" 
                className="flex-1"
              >
                Çıkış Yap
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
