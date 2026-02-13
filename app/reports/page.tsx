'use client';

import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
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
  RefreshCw,
  Activity,
  Smartphone,
  Monitor,
  Tablet,
  Clock,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Crown,
  Medal,
  Award,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import {
  HourlyOverviewChart,
  HourlyPageViewsChart,
  HourlyClicksChart,
  HourlySessionsChart,
  HourlyPeakHours
} from '@/components/reports/HourlyCharts';

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
    owner_name: string;
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
    devices: Array<{ device: string; count: number }>;
    browsers: Array<{ browser: string; count: number }>;
    referrers: Array<{ referrer: string; count: number }>;
  };
  hourly: Array<{
    hour: number;
    hourLabel: string;
    pageViews: number;
    clicks: number;
    sessions: number;
    total: number;
  }>;
  dateRange: {
    startDate: string;
    endDate: string;
    timeRange: string;
  };
}

type SortField = 'pageViews' | 'clicks' | 'uniqueVisitors' | 'sessions' | 'lastActivity';
type SortDirection = 'asc' | 'desc';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'];

const TIME_RANGES = [
  { key: 'today', label: 'Bugün' },
  { key: 'yesterday', label: 'Dün' },
  { key: '7d', label: '1 Hafta' },
  { key: '30d', label: '1 Ay' },
  { key: '1y', label: '1 Yıl' },
  { key: 'all', label: 'Tümü' },
] as const;

const RANK_STYLES = [
  { bg: 'bg-amber-400', text: 'text-amber-900', border: 'border-amber-200', rowBg: 'bg-amber-50/50' },
  { bg: 'bg-gray-300', text: 'text-gray-700', border: 'border-gray-200', rowBg: 'bg-gray-50/50' },
  { bg: 'bg-orange-300', text: 'text-orange-800', border: 'border-orange-200', rowBg: 'bg-orange-50/50' },
] as const;

const RANK_ICONS = [Crown, Medal, Award] as const;

const OVERVIEW_CARDS = [
  { label: 'Toplam Site', key: 'totalSites' as const, iconClass: 'text-blue-500' },
  { label: 'Aktif Site', key: 'activeSites' as const, iconClass: 'text-green-500' },
  { label: 'Görüntüleme', key: 'totalPageViews' as const, iconClass: 'text-purple-500' },
  { label: 'Tıklama', key: 'totalClicks' as const, iconClass: 'text-orange-500' },
  { label: 'Oturum', key: 'totalSessions' as const, iconClass: 'text-indigo-500' },
  { label: 'Ziyaretçi', key: 'uniqueVisitors' as const, iconClass: 'text-pink-500' },
] as const;

const OVERVIEW_ICONS = [Globe, Activity, Eye, MousePointer, TrendingUp, Users] as const;

const getTimeRangeLabel = (timeRange: string) => {
  return TIME_RANGES.find(t => t.key === timeRange)?.label || 'Bugün';
};

const formatNumber = (num: number) => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toLocaleString('tr-TR');
};

const SORT_LABELS: Record<SortField, string> = {
  pageViews: 'Görüntüleme',
  clicks: 'Tıklama',
  uniqueVisitors: 'Ziyaretçi',
  sessions: 'Oturum',
  lastActivity: 'Son Aktivite',
};

// SortButton defined outside component to avoid re-creation on every render
function SortButton({ field, label, sortField, sortDirection, onSort }: {
  field: SortField;
  label: string;
  sortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
}) {
  const isActive = sortField === field;
  return (
    <button
      onClick={() => onSort(field)}
      className={`flex items-center gap-1 text-xs font-medium uppercase tracking-wider ${
        isActive ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
      }`}
    >
      {label}
      {isActive ? (
        sortDirection === 'desc' ? <ArrowDown className="w-3 h-3" /> : <ArrowUp className="w-3 h-3" />
      ) : (
        <ArrowUpDown className="w-3 h-3 opacity-40" />
      )}
    </button>
  );
}

export default function ReportsPage() {
  const router = useRouter();
  const [data, setData] = useState<GlobalReportsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState('today');
  const [sortField, setSortField] = useState<SortField>('pageViews');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchReportsData = useCallback(async (range: string, signal?: AbortSignal) => {
    try {
      setRefreshing(true);

      const response = await fetch(`/api/reports/global?time_range=${range}`, { signal });
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Reports API error:', errorData);
        throw new Error(`Failed to fetch reports data: ${response.status} - ${JSON.stringify(errorData)}`);
      }
      const reportsData = await response.json();
      setData(reportsData);
      setError(null);
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        return;
      }
      console.error('Error fetching reports:', err);
      setError(`Rapor verileri yüklenirken hata oluştu: ${err instanceof Error ? err.message : 'Bilinmeyen hata'}`);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    fetchReportsData(timeRange, controller.signal);

    return () => {
      controller.abort();
    };
  }, [timeRange, fetchReportsData]);

  const handleSort = useCallback((field: SortField) => {
    setSortField(prev => {
      if (prev === field) {
        setSortDirection(d => d === 'desc' ? 'asc' : 'desc');
        return prev;
      }
      setSortDirection('desc');
      return field;
    });
  }, []);

  const filteredAndSortedSites = useMemo(() => {
    const term = searchTerm.toLowerCase();
    let sites = data?.sites.filter(site =>
      site.title.toLowerCase().includes(term) ||
      site.site_slug.toLowerCase().includes(term) ||
      site.profiles.email.toLowerCase().includes(term) ||
      (site.profiles.full_name && site.profiles.full_name.toLowerCase().includes(term))
    ) || [];

    sites.sort((a, b) => {
      let aVal: number | string;
      let bVal: number | string;

      if (sortField === 'lastActivity') {
        aVal = a.metrics.lastActivity || '';
        bVal = b.metrics.lastActivity || '';
      } else {
        aVal = a.metrics[sortField];
        bVal = b.metrics[sortField];
      }

      if (sortDirection === 'desc') {
        return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
      }
      return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
    });

    return sites;
  }, [data?.sites, searchTerm, sortField, sortDirection]);

  const maxEngagement = useMemo(() => {
    if (!filteredAndSortedSites.length) return 1;
    const first = filteredAndSortedSites[0];
    return Math.max(first.metrics.pageViews + first.metrics.clicks, 1);
  }, [filteredAndSortedSites]);

  const getDeviceIcon = (device: string) => {
    switch (device.toLowerCase()) {
      case 'mobile': return <Smartphone className="w-4 h-4" />;
      case 'tablet': return <Tablet className="w-4 h-4" />;
      default: return <Monitor className="w-4 h-4" />;
    }
  };

  if (loading) {
    return <LoadingScreen message="Genel raporlar yükleniyor..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="text-red-600">Hata</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">{error}</p>
            <div className="flex gap-2">
              <Button onClick={() => fetchReportsData(timeRange)} className="flex-1">
                Tekrar Dene
              </Button>
              <Button onClick={() => router.push('/admin')} variant="outline">
                Admin Panel&apos;e Dön
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
        <PageHeader
          title="Linkfy."
          subtitle={`Genel Raporlar - ${getTimeRangeLabel(timeRange)}`}
          icon={<BarChart3 className="w-6 h-6 text-white" />}
          showBackButton={true}
          backUrl="/admin"
          backLabel="Admin Panel"
          rightContent={
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchReportsData(timeRange)}
              disabled={refreshing}
              className="flex items-center gap-2 bg-white/50 border-gray-200 hover:bg-white/70"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Yenile
            </Button>
          }
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          {/* Time Range Filter */}
          <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-1 p-1 bg-white/60 rounded-xl border border-gray-200/50 shadow-sm">
              {TIME_RANGES.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setTimeRange(key)}
                  disabled={refreshing}
                  className={`px-3.5 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                    timeRange === key
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'
                  } ${refreshing ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {label}
                </button>
              ))}
            </div>
            {data?.dateRange && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar className="h-3.5 w-3.5" />
                <span>
                  {new Date(data.dateRange.startDate).toLocaleDateString('tr-TR')} - {new Date(data.dateRange.endDate).toLocaleDateString('tr-TR')}
                </span>
              </div>
            )}
          </div>

          {/* Loading indicator for filter changes */}
          {refreshing && data && (
            <div className="mb-4 flex items-center justify-center gap-2 py-2 px-4 bg-blue-50 border border-blue-100 rounded-lg">
              <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
              <span className="text-sm text-blue-700">Veriler güncelleniyor...</span>
            </div>
          )}

          {/* Overview Cards */}
          <div className={`grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-8 ${refreshing ? 'opacity-60' : ''}`}>
            {OVERVIEW_CARDS.map(({ label, key, iconClass }, i) => {
              const Icon = OVERVIEW_ICONS[i];
              return (
                <Card key={key} className="bg-white/70 border-0 shadow-lg">
                  <CardContent className="p-4">
                    <Icon className={`h-5 w-5 mb-1 ${iconClass}`} />
                    <p className="text-2xl font-bold text-gray-900">{formatNumber(data?.overview[key] || 0)}</p>
                    <p className="text-xs font-medium text-gray-500 mt-0.5">{label}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Tabs */}
          <Tabs defaultValue="sites" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4 bg-white/60 border border-gray-200/50 h-11">
              <TabsTrigger value="sites" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <Globe className="w-4 h-4 mr-2" />
                Siteler
              </TabsTrigger>
              <TabsTrigger value="analytics" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <BarChart3 className="w-4 h-4 mr-2" />
                Analitikler
              </TabsTrigger>
              <TabsTrigger value="hourly" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <Clock className="w-4 h-4 mr-2" />
                Saatlik
              </TabsTrigger>
              <TabsTrigger value="technology" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <Monitor className="w-4 h-4 mr-2" />
                Cihaz
              </TabsTrigger>
            </TabsList>

            {/* Sites Tab */}
            <TabsContent value="sites" className="space-y-4">
              <Card className={`bg-white/70 border-0 shadow-xl ${refreshing ? 'opacity-60' : ''}`}>
                <CardHeader className="pb-3">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <CardTitle className="text-lg">Site Performansı</CardTitle>
                      <CardDescription className="mt-0.5">
                        {filteredAndSortedSites.length} site listeleniyor
                        {searchTerm && ` ("${searchTerm}" filtresi ile)`}
                      </CardDescription>
                    </div>
                    <div className="relative w-full sm:w-auto">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Site, slug veya sahip ara..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-full sm:w-72 bg-white/50"
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Table header - desktop only */}
                  <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-2.5 mb-2 border-b border-gray-100">
                    <div className="col-span-1 text-xs font-medium text-gray-500 uppercase tracking-wider">#</div>
                    <div className="col-span-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Site</div>
                    <div className="col-span-1 flex justify-center">
                      <SortButton field="pageViews" label="Görüntüleme" sortField={sortField} sortDirection={sortDirection} onSort={handleSort} />
                    </div>
                    <div className="col-span-1 flex justify-center">
                      <SortButton field="clicks" label="Tıklama" sortField={sortField} sortDirection={sortDirection} onSort={handleSort} />
                    </div>
                    <div className="col-span-1 flex justify-center">
                      <SortButton field="uniqueVisitors" label="Ziyaretçi" sortField={sortField} sortDirection={sortDirection} onSort={handleSort} />
                    </div>
                    <div className="col-span-1 flex justify-center">
                      <SortButton field="sessions" label="Oturum" sortField={sortField} sortDirection={sortDirection} onSort={handleSort} />
                    </div>
                    <div className="col-span-2 flex justify-center">
                      <SortButton field="lastActivity" label="Son Aktivite" sortField={sortField} sortDirection={sortDirection} onSort={handleSort} />
                    </div>
                    <div className="col-span-1"></div>
                  </div>

                  {/* Site rows */}
                  <div className="space-y-1.5">
                    {filteredAndSortedSites.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                        <Search className="w-10 h-10 mb-3 opacity-50" />
                        <p className="font-medium text-gray-500">Site bulunamadı</p>
                        <p className="text-sm mt-1">Arama kriterlerinizi değiştirin</p>
                      </div>
                    ) : (
                      filteredAndSortedSites.map((site, index) => {
                        const rankStyle = index < 3 ? RANK_STYLES[index] : null;
                        const RankIcon = index < 3 ? RANK_ICONS[index] : null;
                        const hasActivity = site.metrics.pageViews > 0 || site.metrics.clicks > 0;
                        const engagementPercent = (site.metrics.pageViews + site.metrics.clicks) / maxEngagement * 100;

                        return (
                          <div
                            key={site.id}
                            onClick={() => router.push(`/dashboard/analytics/${site.site_slug}`)}
                            className={`group relative rounded-xl border cursor-pointer hover:shadow-md ${
                              rankStyle
                                ? `${rankStyle.border} ${rankStyle.rowBg} hover:${rankStyle.border}`
                                : 'border-gray-100 bg-white hover:border-gray-200'
                            }`}
                          >
                            {/* Engagement bar */}
                            {hasActivity && (
                              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-100 rounded-b-xl overflow-hidden">
                                <div
                                  className="h-full bg-blue-500 rounded-b-xl"
                                  style={{ width: `${engagementPercent}%` }}
                                />
                              </div>
                            )}

                            {/* Single responsive layout */}
                            <div className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                {/* Rank */}
                                <div className="shrink-0 w-8 h-8 flex items-center justify-center">
                                  {rankStyle && RankIcon ? (
                                    <div className={`w-8 h-8 ${rankStyle.bg} rounded-full flex items-center justify-center ${rankStyle.text} shadow-sm`}>
                                      <RankIcon className="w-4 h-4" />
                                    </div>
                                  ) : (
                                    <span className="text-sm font-medium text-gray-400">{index + 1}</span>
                                  )}
                                </div>

                                {/* Site info */}
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2">
                                    <h3 className="font-semibold text-gray-900 truncate text-sm group-hover:text-blue-600">
                                      {site.title}
                                    </h3>
                                    {!hasActivity && (
                                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-gray-200 text-gray-400 shrink-0">
                                        Veri yok
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-xs text-gray-500 truncate">
                                    /{site.site_slug}
                                    {site.profiles.full_name && (
                                      <>
                                        <span className="text-gray-300 mx-1">|</span>
                                        <span className="text-gray-400">{site.profiles.full_name}</span>
                                      </>
                                    )}
                                  </p>
                                </div>

                                {/* Metrics - hidden on mobile, shown on md+ */}
                                <div className="hidden md:flex items-center gap-6 shrink-0">
                                  <div className="text-center w-16">
                                    <p className={`text-sm font-bold ${site.metrics.pageViews > 0 ? 'text-gray-900' : 'text-gray-300'}`}>
                                      {formatNumber(site.metrics.pageViews)}
                                    </p>
                                  </div>
                                  <div className="text-center w-14">
                                    <p className={`text-sm font-bold ${site.metrics.clicks > 0 ? 'text-gray-900' : 'text-gray-300'}`}>
                                      {formatNumber(site.metrics.clicks)}
                                    </p>
                                  </div>
                                  <div className="text-center w-14">
                                    <p className={`text-sm font-bold ${site.metrics.uniqueVisitors > 0 ? 'text-gray-900' : 'text-gray-300'}`}>
                                      {formatNumber(site.metrics.uniqueVisitors)}
                                    </p>
                                  </div>
                                  <div className="text-center w-14">
                                    <p className={`text-sm font-bold ${site.metrics.sessions > 0 ? 'text-gray-900' : 'text-gray-300'}`}>
                                      {formatNumber(site.metrics.sessions)}
                                    </p>
                                  </div>
                                  <div className="text-center w-24">
                                    {site.metrics.lastActivity ? (
                                      <p className="text-xs text-gray-500">
                                        {formatDistanceToNow(new Date(site.metrics.lastActivity), { addSuffix: true, locale: tr })}
                                      </p>
                                    ) : (
                                      <p className="text-xs text-gray-300">-</p>
                                    )}
                                  </div>
                                </div>

                                <ChevronRight className="w-4 h-4 text-gray-300 shrink-0 group-hover:text-blue-500" />
                              </div>

                              {/* Mobile metrics row */}
                              <div className="md:hidden grid grid-cols-4 gap-2 mt-2">
                                <div className="text-center bg-gray-50 rounded-lg py-1.5 px-1">
                                  <p className="text-xs font-bold text-gray-900">{formatNumber(site.metrics.pageViews)}</p>
                                  <p className="text-[10px] text-gray-400">Görüntüleme</p>
                                </div>
                                <div className="text-center bg-gray-50 rounded-lg py-1.5 px-1">
                                  <p className="text-xs font-bold text-gray-900">{formatNumber(site.metrics.clicks)}</p>
                                  <p className="text-[10px] text-gray-400">Tıklama</p>
                                </div>
                                <div className="text-center bg-gray-50 rounded-lg py-1.5 px-1">
                                  <p className="text-xs font-bold text-gray-900">{formatNumber(site.metrics.uniqueVisitors)}</p>
                                  <p className="text-[10px] text-gray-400">Ziyaretçi</p>
                                </div>
                                <div className="text-center bg-gray-50 rounded-lg py-1.5 px-1">
                                  <p className="text-xs font-bold text-gray-900">{formatNumber(site.metrics.sessions)}</p>
                                  <p className="text-[10px] text-gray-400">Oturum</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Summary footer */}
                  {filteredAndSortedSites.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
                      <span>Toplam {filteredAndSortedSites.length} site</span>
                      <span>
                        Sırala: {SORT_LABELS[sortField]} ({sortDirection === 'desc' ? 'Azalan' : 'Artan'})
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 ${refreshing ? 'opacity-60' : ''}`}>
                <Card className="bg-white/70 border-0 shadow-xl">
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
                        <Bar dataKey="views" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="bg-white/70 border-0 shadow-xl">
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
                        <Bar dataKey="count" fill="#10B981" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Hourly Analysis Tab */}
            <TabsContent value="hourly" className="space-y-6">
              <div className={refreshing ? 'opacity-60' : ''}>
                <HourlyOverviewChart data={data?.hourly || []} />
                <div className="mt-6">
                  <HourlyPeakHours data={data?.hourly || []} />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                  <HourlyPageViewsChart data={data?.hourly || []} />
                  <HourlyClicksChart data={data?.hourly || []} />
                </div>
                <div className="mt-6">
                  <HourlySessionsChart data={data?.hourly || []} />
                </div>
              </div>
            </TabsContent>

            {/* Technology Tab */}
            <TabsContent value="technology" className="space-y-6">
              <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 ${refreshing ? 'opacity-60' : ''}`}>
                <Card className="bg-white/70 border-0 shadow-xl">
                  <CardHeader>
                    <CardTitle>Cihaz Türleri</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {data?.analytics.devices.map((device) => (
                        <div key={device.device} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            {getDeviceIcon(device.device)}
                            <span className="font-medium">{device.device}</span>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">{device.count}</p>
                            <p className="text-xs text-gray-500">
                              {data.overview.totalPageViews > 0
                                ? ((device.count / data.overview.totalPageViews) * 100).toFixed(1)
                                : '0.0'}%
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/70 border-0 shadow-xl">
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
                              {data.overview.totalPageViews > 0
                                ? ((browser.count / data.overview.totalPageViews) * 100).toFixed(1)
                                : '0.0'}%
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
