'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { getUserRole, canAccessDashboard, UserRole } from '@/lib/auth/roles';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Clock, Shield, Users } from 'lucide-react';

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
