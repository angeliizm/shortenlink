'use client';

import { useRouter } from 'next/navigation';
import RoleGuard from '@/components/auth/RoleGuard';
import UserManagement from '@/components/admin/UserManagement';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Users, Settings, BarChart3, ArrowLeft } from 'lucide-react';

export default function AdminPage() {
  const router = useRouter();

  return (
    <RoleGuard requiredRole="admin">
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <Shield className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
                    <p className="text-gray-600">Sistem yönetimi ve kullanıcı kontrolü</p>
                  </div>
                </div>
                
                {/* Dashboard'a geri dönüş */}
                <Button
                  variant="outline"
                  onClick={() => router.push('/dashboard')}
                  className="flex items-center space-x-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Dashboard'a Dön</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <UserManagement />
        </div>
      </div>
    </RoleGuard>
  );
}
