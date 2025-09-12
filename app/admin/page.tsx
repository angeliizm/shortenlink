'use client';

import { useRouter } from 'next/navigation';
import RoleGuard from '@/components/auth/RoleGuard';
import UserManagement from '@/components/admin/UserManagement';
import SitePermissions from '@/components/admin/SitePermissions';
import InvitationCodes from '@/components/admin/InvitationCodes';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PageHeader from '@/components/ui/PageHeader';
import { Shield, Users, Settings, BarChart3, ArrowLeft, Activity, Database, Globe, Ticket } from 'lucide-react';

export default function AdminPage() {
  const router = useRouter();

  return (
    <RoleGuard requiredRole="admin">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        {/* Modern Header */}
        <PageHeader
          title="Linkfy."
          subtitle="Admin Panel"
          icon={<Shield className="w-6 h-6 text-white" />}
          showBackButton={true}
          backUrl="/dashboard"
          backLabel="Dashboard"
        />


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
