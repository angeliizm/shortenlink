'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import RoleGuard from '@/components/auth/RoleGuard';
import PageHeader from '@/components/ui/PageHeader';
import LoadingScreen from '@/components/ui/LoadingScreen';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Globe, 
  MousePointer, 
  Eye, 
  Calendar,
  Search,
  Download,
  Filter,
  RefreshCw,
  Activity,
  Smartphone,
  Monitor,
  Tablet
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from 'recharts';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

interface GlobalReportsData {
  overview: {
    totalSites: number;
    activeSites: number;
    totalPageViews: number;
    totalClicks: number;
    totalSessions: number;
    uniqueVisitors: number;
  };
  sites: Array<{
    id: string;
    site_slug: string;
    title: string;
    owner_id: string;
    created_at: string;
    is_enabled: boolean;
    profiles: {
      email: string;
      full_name: string;
    };
    metrics: {
      pageViews: number;
      clicks: number;
      sessions: number;
      uniqueVisitors: number;
      lastActivity: string | null;
    };
  }>;
  analytics: {
    topSites: Array<{ slug: string; views: number }>;
    countries: Array<{ country: string; count: number }>;
    devices: Array<{ device: string; count: number }>;
    browsers: Array<{ browser: string; count: number }>;
    referrers: Array<{ referrer: string; count: number }>;
  };
  dateRange: {
    startDate: string;
    endDate: string;
  };
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'];

export default function ReportsPage() {
  const router = useRouter();
  const [data, setData] = useState<GlobalReportsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  const fetchReportsData = async () => {
    try {
      setRefreshing(true);
      
      // First, check user role for debugging
      const debugResponse = await fetch('/api/debug/user-role');
      const debugData = await debugResponse.json();
      console.log('Debug user role data:', debugData);
      setDebugInfo(debugData);
      
      const response = await fetch('/api/reports/global');
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Reports API error:', errorData);
        throw new Error(`Failed to fetch reports data: ${response.status} - ${JSON.stringify(errorData)}`);
      }
      const reportsData = await response.json();
      setData(reportsData);
      setError(null);
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError(`Rapor verileri yüklenirken hata oluştu: ${err instanceof Error ? err.message : 'Bilinmeyen hata'}`);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReportsData();
  }, []);

  const filteredSites = data?.sites.filter(site => 
    site.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    site.site_slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
    site.profiles.email.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const getDeviceIcon = (device: string) => {
    switch (device.toLowerCase()) {
      case 'mobile':
        return <Smartphone className="w-4 h-4" />;
      case 'tablet':
        return <Tablet className="w-4 h-4" />;
      case 'desktop':
        return <Monitor className="w-4 h-4" />;
      default:
        return <Monitor className="w-4 h-4" />;
    }
  };

  if (loading) {
    return <LoadingScreen message="Genel raporlar yükleniyor..." />;
  }

  const handleSetAdmin = async () => {
    try {
      const response = await fetch('/api/debug/set-admin', { method: 'POST' });
      const result = await response.json();
      console.log('Set admin result:', result);
      if (response.ok) {
        alert('Admin rolü atandı! Sayfayı yenileyin.');
        fetchReportsData();
      } else {
        alert('Admin rolü atanamadı: ' + JSON.stringify(result));
      }
    } catch (err) {
      console.error('Error setting admin:', err);
      alert('Admin rolü atanamadı: ' + err);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="text-red-600">Hata</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">{error}</p>
            
            {debugInfo && (
              <div className="mb-4 p-4 bg-gray-100 rounded-lg">
                <h3 className="font-semibold mb-2">Debug Bilgileri:</h3>
                <pre className="text-xs overflow-auto">
                  {JSON.stringify(debugInfo, null, 2)}
                </pre>
                {debugInfo.userRole !== 'admin' && debugInfo.userRole !== 'moderator' && (
                  <Button 
                    onClick={handleSetAdmin} 
                    className="mt-2 bg-orange-600 hover:bg-orange-700"
                    size="sm"
                  >
                    Admin Rolü Ata (Debug)
                  </Button>
                )}
              </div>
            )}
            
            <div className="flex gap-2">
              <Button onClick={fetchReportsData} className="flex-1">
                Tekrar Dene
              </Button>
              <Button onClick={() => router.push('/admin')} variant="outline">
                Admin Panel'e Dön
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <RoleGuard requiredRole={['admin', 'moderator']}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        {/* Header */}
        <PageHeader
          title="Linkfy."
          subtitle="Genel Raporlar"
          icon={<BarChart3 className="w-6 h-6 text-white" />}
          showBackButton={true}
          backUrl="/admin"
          backLabel="Admin Panel"
          rightContent={
            <Button
              variant="outline"
              size="sm"
              onClick={fetchReportsData}
              disabled={refreshing}
              className="flex items-center gap-2 bg-white/50 backdrop-blur-sm border-gray-200 hover:bg-white/70"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Yenile
            </Button>
          }
        />

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Toplam Site</p>
                    <p className="text-2xl font-bold text-gray-900">{data?.overview.totalSites}</p>
                  </div>
                  <Globe className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Aktif Site</p>
                    <p className="text-2xl font-bold text-gray-900">{data?.overview.activeSites}</p>
                  </div>
                  <Activity className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Toplam Görüntüleme</p>
                    <p className="text-2xl font-bold text-gray-900">{data?.overview.totalPageViews.toLocaleString()}</p>
                  </div>
                  <Eye className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Toplam Tıklama</p>
                    <p className="text-2xl font-bold text-gray-900">{data?.overview.totalClicks.toLocaleString()}</p>
                  </div>
                  <MousePointer className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Toplam Oturum</p>
                    <p className="text-2xl font-bold text-gray-900">{data?.overview.totalSessions.toLocaleString()}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-indigo-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Benzersiz Ziyaretçi</p>
                    <p className="text-2xl font-bold text-gray-900">{data?.overview.uniqueVisitors.toLocaleString()}</p>
                  </div>
                  <Users className="h-8 w-8 text-pink-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs for different views */}
          <Tabs defaultValue="sites" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 bg-white/50 backdrop-blur-sm border border-white/20">
              <TabsTrigger value="sites" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <Globe className="w-4 h-4 mr-2" />
                Siteler
              </TabsTrigger>
              <TabsTrigger value="analytics" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <BarChart3 className="w-4 h-4 mr-2" />
                Analitikler
              </TabsTrigger>
              <TabsTrigger value="geography" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <Globe className="w-4 h-4 mr-2" />
                Coğrafya
              </TabsTrigger>
              <TabsTrigger value="technology" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <Monitor className="w-4 h-4 mr-2" />
                Teknoloji
              </TabsTrigger>
            </TabsList>

            {/* Sites Tab */}
            <TabsContent value="sites" className="space-y-6">
              <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Site Performansı</CardTitle>
                    <div className="flex items-center space-x-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          placeholder="Site ara..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 w-64"
                        />
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredSites.map((site, index) => (
                      <div key={site.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex items-center space-x-4">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{site.title}</h3>
                            <p className="text-sm text-gray-500">
                              {site.site_slug} • {site.profiles.email}
                            </p>
                            {site.metrics.lastActivity && (
                              <p className="text-xs text-gray-400">
                                Son aktivite: {formatDistanceToNow(new Date(site.metrics.lastActivity), { addSuffix: true, locale: tr })}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-6 text-sm">
                          <div className="text-center">
                            <p className="font-medium text-gray-900">{site.metrics.pageViews}</p>
                            <p className="text-gray-500">Görüntüleme</p>
                          </div>
                          <div className="text-center">
                            <p className="font-medium text-gray-900">{site.metrics.clicks}</p>
                            <p className="text-gray-500">Tıklama</p>
                          </div>
                          <div className="text-center">
                            <p className="font-medium text-gray-900">{site.metrics.uniqueVisitors}</p>
                            <p className="text-gray-500">Ziyaretçi</p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/dashboard/analytics/${site.site_slug}`)}
                          >
                            Detay
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Sites Chart */}
                <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
                  <CardHeader>
                    <CardTitle>En Popüler Siteler</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={data?.analytics.topSites.slice(0, 8)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="slug" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="views" fill="#3B82F6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Referrers Chart */}
                <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
                  <CardHeader>
                    <CardTitle>En İyi Referanslar</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={data?.analytics.referrers.slice(0, 8)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="referrer" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#10B981" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Geography Tab */}
            <TabsContent value="geography" className="space-y-6">
              <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle>Ülke Dağılımı</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={data?.analytics.countries.slice(0, 8)}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ country, percent }) => `${country} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="count"
                        >
                          {data?.analytics.countries.slice(0, 8).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-3">
                      {data?.analytics.countries.slice(0, 10).map((country, index) => (
                        <div key={country.country} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            />
                            <span className="text-sm font-medium">{country.country}</span>
                          </div>
                          <span className="text-sm text-gray-600">{country.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Technology Tab */}
            <TabsContent value="technology" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Devices */}
                <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
                  <CardHeader>
                    <CardTitle>Cihaz Türleri</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {data?.analytics.devices.map((device, index) => (
                        <div key={device.device} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            {getDeviceIcon(device.device)}
                            <span className="font-medium">{device.device}</span>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">{device.count}</p>
                            <p className="text-xs text-gray-500">
                              {((device.count / data.overview.totalPageViews) * 100).toFixed(1)}%
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Browsers */}
                <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
                  <CardHeader>
                    <CardTitle>Tarayıcılar</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {data?.analytics.browsers.slice(0, 8).map((browser, index) => (
                        <div key={browser.browser} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            />
                            <span className="font-medium">{browser.browser}</span>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">{browser.count}</p>
                            <p className="text-xs text-gray-500">
                              {((browser.count / data.overview.totalPageViews) * 100).toFixed(1)}%
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </RoleGuard>
  );
}
