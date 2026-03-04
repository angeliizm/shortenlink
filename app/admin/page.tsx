'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import RoleGuard from '@/components/auth/RoleGuard';
import UserManagement from '@/components/admin/UserManagement';
import SitePermissions from '@/components/admin/SitePermissions';
import InvitationCodes from '@/components/admin/InvitationCodes';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PageHeader from '@/components/ui/PageHeader';
import { Shield, Users, Settings, BarChart3, ArrowLeft, Activity, Database, Globe, Ticket, FileText, Layers } from 'lucide-react';
import BulkSiteManager from '@/components/admin/BulkSiteManager';

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('users');
  const [visited, setVisited] = useState<Set<string>>(new Set(['users']));

  function handleTabChange(value: string) {
    setActiveTab(value);
    setVisited(prev => new Set([...Array.from(prev), value]));
  }

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
          rightContent={
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/reports')}
              className="flex items-center gap-2 bg-white/50 backdrop-blur-sm border-gray-200 hover:bg-white/70 hover:border-gray-300 transition-all duration-200"
            >
              <FileText className="h-4 w-4" />
              Genel Raporlar
            </Button>
          }
        />


        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-8">
            <TabsList className="grid w-full grid-cols-4 bg-white/50 border border-white/20">
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
              <TabsTrigger
                value="bulk"
                className="data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200"
              >
                <Layers className="w-4 h-4 mr-2" />
                Toplu Yönetim
              </TabsTrigger>
            </TabsList>

            <TabsContent value="users" className="space-y-6">
              <UserManagement />
            </TabsContent>

            <TabsContent value="permissions" className="space-y-6">
              {visited.has('permissions') && <SitePermissions />}
            </TabsContent>

            <TabsContent value="invitation-codes" className="space-y-6">
              {visited.has('invitation-codes') && <InvitationCodes />}
            </TabsContent>

            <TabsContent value="bulk" className="space-y-6">
              {visited.has('bulk') && <BulkSiteManager />}
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </RoleGuard>
  );
}
