'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { getUserRole, canAccessDashboard, UserRole } from '@/lib/auth/roles';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, Clock, Shield, Users, Crown, Ticket, Key } from 'lucide-react';

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
  
  // Invitation code states
  const [invitationCode, setInvitationCode] = useState('');
  const [isUsingCode, setIsUsingCode] = useState(false);
  const [codeError, setCodeError] = useState('');
  const [blockedUntil, setBlockedUntil] = useState<Date | null>(null);
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

      // First, delete existing role if it exists
      const { error: deleteError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', user.id);

      if (deleteError) {
        console.warn('Error deleting existing role:', deleteError);
        // Continue anyway, might not exist
      }

      // Then insert the new admin role
      const { error } = await supabase
        .from('user_roles')
        .insert({
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

  const handleUseInvitationCode = async () => {
    if (!invitationCode.trim()) {
      setCodeError('Lütfen bir kod girin');
      return;
    }

    // Check if currently blocked
    if (blockedUntil && blockedUntil > new Date()) {
      const remainingTime = Math.ceil((blockedUntil.getTime() - Date.now()) / (1000 * 60));
      setCodeError(`Çok fazla hatalı deneme. ${remainingTime} dakika sonra tekrar deneyin.`);
      return;
    }

    setIsUsingCode(true);
    setCodeError('');

    try {
      const response = await fetch('/api/invitation-codes/use', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: invitationCode.trim()
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Success - redirect to dashboard
        router.push('/dashboard');
      } else {
        setCodeError(result.error || 'Kod kullanılırken hata oluştu');
        
        // Handle rate limiting
        if (result.blocked_until) {
          setBlockedUntil(new Date(result.blocked_until));
        }
      }
    } catch (error) {
      console.error('Error using invitation code:', error);
      setCodeError('Kod kullanılırken hata oluştu');
    } finally {
      setIsUsingCode(false);
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

                {/* Invitation Code Section */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <div className="text-center">
                    <Ticket className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <h3 className="text-lg font-semibold text-green-900 mb-2">Davet Kodunuz Var mı?</h3>
                    <p className="text-sm text-green-700 mb-4">
                      Yöneticiden aldığınız davet kodunu girerek hemen onaylanabilirsiniz.
                    </p>
                    
                    <div className="space-y-3">
                      <div className="text-left">
                        <Label htmlFor="invitation-code" className="text-sm font-medium text-green-800">
                          Davet Kodu
                        </Label>
                        <Input
                          id="invitation-code"
                          type="text"
                          placeholder="ABCD1234"
                          value={invitationCode}
                          onChange={(e) => {
                            setInvitationCode(e.target.value.toUpperCase());
                            setCodeError('');
                          }}
                          disabled={isUsingCode}
                          className="mt-1 uppercase text-center font-mono tracking-wider"
                          maxLength={12}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handleUseInvitationCode();
                            }
                          }}
                        />
                      </div>
                      
                      {codeError && (
                        <div className="text-left">
                          <div className="bg-red-50 border border-red-200 rounded-md p-2">
                            <div className="flex items-center">
                              <AlertCircle className="w-4 h-4 text-red-500 mr-2" />
                              <p className="text-sm text-red-700">{codeError}</p>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <Button
                        onClick={handleUseInvitationCode}
                        disabled={isUsingCode || !invitationCode.trim()}
                        className="w-full bg-green-600 hover:bg-green-700 text-white"
                      >
                        {isUsingCode ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Kod Kullanılıyor...
                          </>
                        ) : (
                          <>
                            <Key className="w-4 h-4 mr-2" />
                            Kodu Kullan
                          </>
                        )}
                      </Button>
                    </div>
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
