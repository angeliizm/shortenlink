'use client';

import { useRouter } from 'next/navigation';
import RoleGuard from '@/components/auth/RoleGuard';
import UserManagement from '@/components/admin/UserManagement';
import SitePermissions from '@/components/admin/SitePermissions';
import InvitationCodes from '@/components/admin/InvitationCodes';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Users, Settings, BarChart3, ArrowLeft, Activity, Database, Globe, Ticket } from 'lucide-react';

export default function AdminPage() {
  const router = useRouter();

  return (
    <RoleGuard requiredRole="admin">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        {/* Modern Header with Glassmorphism */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 via-purple-500/10 to-blue-500/10"></div>
          <div className="relative backdrop-blur-sm bg-white/80 border-b border-white/20 shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="py-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <Shield className="w-7 h-7 text-white" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                        Admin Panel
                      </h1>
                      <p className="text-gray-600 mt-1">Sistem yönetimi ve kullanıcı kontrolü</p>
                    </div>
                  </div>
                  
                  {/* Dashboard'a geri dönüş */}
                  <Button
                    variant="outline"
                    onClick={() => router.push('/dashboard')}
                    className="flex items-center space-x-2 bg-white/50 backdrop-blur-sm border-white/20 hover:bg-white/70 transition-all duration-200"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Dashboard'a Dön</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>


        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <Tabs defaultValue="users" className="space-y-8">
            <TabsList className="grid w-full grid-cols-3 bg-white/50 backdrop-blur-sm border border-white/20">
              <TabsTrigger 
                value="users" 
                className="data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200"
              >
                <Users className="w-4 h-4 mr-2" />
                Kullanıcı Yönetimi
              </TabsTrigger>
              <TabsTrigger 
                value="permissions" 
                className="data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200"
              >
                <Shield className="w-4 h-4 mr-2" />
                Site İzinleri
              </TabsTrigger>
              <TabsTrigger 
                value="invitation-codes" 
                className="data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200"
              >
                <Ticket className="w-4 h-4 mr-2" />
                Kod Oluşturucu
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="users" className="space-y-6">
              <UserManagement />
            </TabsContent>
            
            <TabsContent value="permissions" className="space-y-6">
              <SitePermissions />
            </TabsContent>
            
          <TabsContent value="invitation-codes" className="space-y-6">
            <InvitationCodes />
          </TabsContent>
          </Tabs>
        </div>
      </div>
    </RoleGuard>
  );
}
