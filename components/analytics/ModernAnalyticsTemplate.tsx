'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import {
  Calendar, Users, Eye, MousePointer, Target,
  ArrowUpRight, BarChart3, Activity, Globe,
  Smartphone, Monitor, Tablet, ArrowLeft, Loader2, RefreshCw
} from 'lucide-react';
import Logo from '@/components/ui/Logo';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { tr } from 'date-fns/locale';
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'next/navigation';
import LoadingScreen from '@/components/ui/LoadingScreen';

interface ModernAnalyticsTemplateProps {
  siteSlug: string;
}

const DEVICE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const DATE_RANGES = [
  { key: 'today', label: 'Bugün' },
  { key: 'yesterday', label: 'Dün' },
  { key: 'last7days', label: '7 Gün' },
  { key: 'last30days', label: '30 Gün' },
] as const;

function getDateBounds(dateRange: string) {
  const now = new Date();
  switch (dateRange) {
    case 'yesterday': {
      const y = subDays(now, 1);
      return { start: startOfDay(y), end: endOfDay(y) };
    }
    case 'last7days':
      return { start: startOfDay(subDays(now, 6)), end: endOfDay(now) };
    case 'last30days':
      return { start: startOfDay(subDays(now, 29)), end: endOfDay(now) };
    default:
      return { start: startOfDay(now), end: endOfDay(now) };
  }
}

function formatNum(num: number) {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toLocaleString('tr-TR');
}

const deviceLabel = (name: string) => {
  if (name === 'desktop') return 'Masaüstü';
  if (name === 'mobile') return 'Mobil';
  if (name === 'tablet') return 'Tablet';
  return name.charAt(0).toUpperCase() + name.slice(1);
};

const DeviceIcon = ({ type }: { type: string }) => {
  switch (type.toLowerCase()) {
    case 'mobile': case 'mobil': return <Smartphone className="w-4 h-4" />;
    case 'tablet': return <Tablet className="w-4 h-4" />;
    default: return <Monitor className="w-4 h-4" />;
  }
};

const eventTypeLabel = (type: string) => {
  switch (type) {
    case 'page_view': return 'Sayfa Görüntüleme';
    case 'action_click': return 'Buton Tıklama';
    case 'session_start': return 'Oturum Başlatma';
    case 'unique_visitor': return 'Yeni Ziyaretçi';
    default: return type;
  }
};

const eventDotColor = (type: string) => {
  switch (type) {
    case 'page_view': return 'bg-green-500';
    case 'action_click': return 'bg-blue-500';
    case 'session_start': return 'bg-purple-500';
    case 'unique_visitor': return 'bg-orange-500';
    default: return 'bg-gray-400';
  }
};

export default function ModernAnalyticsTemplate({ siteSlug }: ModernAnalyticsTemplateProps) {
  const router = useRouter();
  const [dateRange, setDateRange] = useState('today');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [analytics, setAnalytics] = useState<any>(null);
  const [siteInfo, setSiteInfo] = useState<any>(null);
  const abortRef = useRef<AbortController | null>(null);

  const fetchAnalytics = useCallback(async (range: string, signal?: AbortSignal) => {
    try {
      const { start, end } = getDateBounds(range);
      const startStr = start.toISOString();
      const endStr = end.toISOString();

      const base = `/api/analytics/${siteSlug}`;
      const qs = `startDate=${startStr}&endDate=${endStr}`;

      const [overview, actions, realtime, referrers, devices, geography, events] = await Promise.all([
        fetch(`${base}?metric=overview&${qs}`, { signal }).then(r => r.json()),
        fetch(`${base}?metric=actions&${qs}`, { signal }).then(r => r.json()),
        fetch(`${base}?metric=realtime`, { signal }).then(r => r.json()),
        fetch(`${base}?metric=referrers&${qs}`, { signal }).then(r => r.json()),
        fetch(`${base}?metric=devices&${qs}`, { signal }).then(r => r.json()),
        fetch(`${base}?metric=geography&${qs}`, { signal }).then(r => r.json()),
        fetch(`${base}?metric=events&${qs}`, { signal }).then(r => r.json())
      ]);

      setAnalytics({ overview, actions, realtime, referrers, devices, geography, events });
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      console.error('Failed to fetch analytics:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [siteSlug]);

  const fetchSiteInfo = useCallback(async () => {
    try {
      const response = await fetch(`/api/links?slug=${siteSlug}`);
      const data = await response.json();
      setSiteInfo(data);
    } catch (error) {
      console.error('Failed to fetch site info:', error);
    }
  }, [siteSlug]);

  useEffect(() => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    if (!loading) setRefreshing(true);
    fetchAnalytics(dateRange, controller.signal);

    return () => controller.abort();
  }, [dateRange, fetchAnalytics]);

  useEffect(() => {
    fetchSiteInfo();
  }, [fetchSiteInfo]);

  // Computed metrics - prefer overview totals (aggregated server-side), fallback to events
  const metrics = useMemo(() => {
    const totals = analytics?.overview?.totals;
    const events = analytics?.events?.events || [];

    let pageviews = totals?.pageViews || totals?.page_views || 0;
    let clicks = totals?.clicks || 0;
    let visitors = totals?.uniqueVisitors || totals?.unique_visitors || 0;
    let sessions = totals?.sessions || 0;

    // If overview totals are all zero but we have events, count from events
    if (pageviews === 0 && clicks === 0 && visitors === 0 && events.length > 0) {
      pageviews = events.filter((e: any) => e.event_type === 'page_view').length;
      clicks = events.filter((e: any) => e.event_type === 'action_click').length;
      visitors = new Set(events.map((e: any) => e.visitor_id).filter(Boolean)).size;
      sessions = new Set(events.map((e: any) => e.session_id).filter(Boolean)).size;
    }

    const conversionRate = visitors > 0 ? (clicks / visitors) * 100 : 0;

    return { pageviews, clicks, visitors, sessions, conversionRate };
  }, [analytics]);

  // Time series chart data
  const timeSeriesData = useMemo(() => {
    const events = analytics?.events?.events;
    const { start, end } = getDateBounds(dateRange);
    const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));

    const dailyData = new Map<string, { date: string; views: number; clicks: number }>();
    for (let i = 0; i < days; i++) {
      const date = subDays(end, i);
      const key = format(date, 'yyyy-MM-dd');
      dailyData.set(key, { date: format(date, 'd MMM', { locale: tr }), views: 0, clicks: 0 });
    }

    if (events && events.length > 0) {
      events.forEach((event: any) => {
        const eventDate = new Date(event.timestamp);
        if (eventDate >= start && eventDate <= end) {
          const key = format(eventDate, 'yyyy-MM-dd');
          const day = dailyData.get(key);
          if (day) {
            if (event.event_type === 'page_view') day.views++;
            else if (event.event_type === 'action_click') day.clicks++;
          }
        }
      });
    }

    return Array.from(dailyData.values()).reverse();
  }, [analytics, dateRange]);

  // Device data
  const deviceData = useMemo(() => {
    const events = analytics?.events?.events;
    if (events && events.length > 0) {
      const counts = new Map<string, number>();
      events.forEach((e: any) => {
        if (e.device_type) {
          const t = e.device_type.toLowerCase();
          counts.set(t, (counts.get(t) || 0) + 1);
        }
      });
      if (counts.size > 0) {
        return Array.from(counts.entries()).map(([name, value], i) => ({
          name: deviceLabel(name), rawName: name, value, color: DEVICE_COLORS[i % DEVICE_COLORS.length]
        }));
      }
    }
    if (analytics?.devices?.devices) {
      return Object.entries(analytics.devices.devices).map(([name, value], i) => ({
        name: deviceLabel(name), rawName: name, value: value as number, color: DEVICE_COLORS[i % DEVICE_COLORS.length]
      }));
    }
    return [];
  }, [analytics]);

  const deviceTotal = useMemo(() => deviceData.reduce((s, d) => s + d.value, 0), [deviceData]);

  // Button clicks
  const buttonData = useMemo(() => {
    if (!analytics?.actions?.actions) return [];
    const labels = analytics.actions.actionLabels || {};
    return Object.entries(analytics.actions.actions)
      .map(([index, count]) => ({
        label: labels[index] || `Buton ${index}`,
        count: Number(count) || 0
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [analytics]);

  const totalButtonClicks = useMemo(() => buttonData.reduce((s, b) => s + b.count, 0), [buttonData]);

  // Referrers
  const referrerData = useMemo(() => {
    if (analytics?.referrers?.referrers && analytics.referrers.referrers.length > 0) {
      return analytics.referrers.referrers.slice(0, 6);
    }
    if (analytics?.events?.events) {
      const counts = new Map<string, number>();
      analytics.events.events.forEach((e: any) => {
        const ref = e.referrer || 'Doğrudan';
        counts.set(ref, (counts.get(ref) || 0) + 1);
      });
      return Array.from(counts.entries())
        .sort(([, a], [, b]) => b - a)
        .slice(0, 6)
        .map(([referrer, count]) => ({ referrer, count }));
    }
    return [];
  }, [analytics]);

  // Recent events
  const recentEvents = useMemo(() => {
    if (!analytics?.events?.events || analytics.events.events.length === 0) return [];
    return [...analytics.events.events]
      .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10);
  }, [analytics]);

  // Geography
  const geoData = useMemo(() => {
    if (!analytics?.geography?.countries) return [];
    return Object.entries(analytics.geography.countries)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 6)
      .map(([country, count]) => ({ country, count: count as number }));
  }, [analytics]);

  const geoTotal = useMemo(() => geoData.reduce((s, g) => s + g.count, 0), [geoData]);

  // Active visitors
  const activeVisitors = useMemo(() => {
    if (analytics?.realtime?.activeVisitors !== undefined) return analytics.realtime.activeVisitors;
    if (analytics?.events?.events?.length > 0) {
      const cutoff = new Date(Date.now() - 5 * 60 * 1000);
      const recent = new Set<string>();
      analytics.events.events.forEach((e: any) => {
        if (new Date(e.timestamp) > cutoff && e.visitor_id) recent.add(e.visitor_id);
      });
      return recent.size;
    }
    return 0;
  }, [analytics]);

  if (loading) {
    return <LoadingScreen message="Analitik verileri yükleniyor..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/dashboard')}
                className="gap-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </Button>
              <div className="h-6 w-px bg-gray-200" />
              <div>
                <h1 className="text-sm font-semibold text-gray-900 leading-tight">
                  {siteInfo?.title || siteSlug}
                </h1>
                <p className="text-xs text-gray-500">/{siteSlug}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Live indicator */}
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-green-50 border border-green-200 rounded-full">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs font-medium text-green-700">{activeVisitors} aktif</span>
              </div>

              {/* Date range */}
              <div className="flex items-center gap-0.5 p-0.5 bg-gray-100 rounded-lg">
                {DATE_RANGES.map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setDateRange(key)}
                    disabled={refreshing}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                      dateRange === key
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    } ${refreshing ? 'opacity-60 cursor-not-allowed' : ''}`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setRefreshing(true);
                  fetchAnalytics(dateRange);
                }}
                disabled={refreshing}
                className="h-8 w-8 p-0"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Loading bar */}
      {refreshing && (
        <div className="h-0.5 bg-blue-100">
          <div className="h-full bg-blue-500 animate-pulse" style={{ width: '60%' }} />
        </div>
      )}

      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 ${refreshing ? 'opacity-60' : ''}`}>
        {/* Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          {[
            { label: 'Görüntüleme', value: metrics.pageviews, icon: Eye, color: 'text-purple-500', bg: 'bg-purple-50' },
            { label: 'Tıklama', value: metrics.clicks, icon: MousePointer, color: 'text-blue-500', bg: 'bg-blue-50' },
            { label: 'Ziyaretçi', value: metrics.visitors, icon: Users, color: 'text-green-500', bg: 'bg-green-50' },
            { label: 'Oturum', value: metrics.sessions, icon: Activity, color: 'text-orange-500', bg: 'bg-orange-50' },
            { label: 'Dönüşüm', value: `%${metrics.conversionRate.toFixed(1)}`, icon: Target, color: 'text-indigo-500', bg: 'bg-indigo-50' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <Card key={label} className="bg-white border border-gray-100 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center`}>
                    <Icon className={`w-4 h-4 ${color}`} />
                  </div>
                  <span className="text-xs font-medium text-gray-500">{label}</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {typeof value === 'number' ? formatNum(value) : value}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          {/* Time Series - takes 2 cols */}
          <Card className="lg:col-span-2 bg-white border border-gray-100 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-gray-900">Zaman Serisi</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {timeSeriesData.some(d => d.views > 0 || d.clicks > 0) ? (
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={timeSeriesData}>
                    <defs>
                      <linearGradient id="viewsGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.15} />
                        <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="clicksGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.15} />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                    <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
                    <Tooltip
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                    />
                    <Area type="monotone" dataKey="views" name="Görüntüleme" stroke="#8b5cf6" fill="url(#viewsGrad)" strokeWidth={2} />
                    <Area type="monotone" dataKey="clicks" name="Tıklama" stroke="#3b82f6" fill="url(#clicksGrad)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[280px] text-gray-400 text-sm">
                  Bu dönem için veri bulunmuyor
                </div>
              )}
            </CardContent>
          </Card>

          {/* Device Breakdown */}
          <Card className="bg-white border border-gray-100 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-gray-900">Cihaz Dağılımı</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {deviceData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie
                        data={deviceData}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={70}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {deviceData.map((d, i) => (
                          <Cell key={i} fill={d.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(val: number) => [`${val.toLocaleString('tr-TR')}`, '']}
                        contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2 mt-2">
                    {deviceData.map((d) => (
                      <div key={d.name} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <DeviceIcon type={d.rawName} />
                          <span className="text-gray-700">{d.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">{formatNum(d.value)}</span>
                          <span className="text-xs text-gray-400 w-10 text-right">
                            {deviceTotal > 0 ? ((d.value / deviceTotal) * 100).toFixed(0) : 0}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-[280px] text-gray-400 text-sm">
                  Cihaz verisi yok
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Middle Row: Buttons + Referrers + Geography */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {/* Button Clicks */}
          <Card className="bg-white border border-gray-100 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-gray-900">Buton Tıklamaları</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {buttonData.length > 0 ? (
                <div className="space-y-2">
                  {buttonData.map((btn, i) => {
                    const pct = totalButtonClicks > 0 ? (btn.count / totalButtonClicks) * 100 : 0;
                    return (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-blue-50 rounded flex items-center justify-center shrink-0">
                          <span className="text-xs font-semibold text-blue-600">{i + 1}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="text-sm text-gray-700 truncate">{btn.label}</span>
                            <span className="text-sm font-semibold text-gray-900 ml-2 shrink-0">{formatNum(btn.count)}</span>
                          </div>
                          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500 rounded-full"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-gray-400 py-8 text-center">Tıklama verisi yok</p>
              )}
            </CardContent>
          </Card>

          {/* Referrers */}
          <Card className="bg-white border border-gray-100 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-gray-900">Referanslar</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {referrerData.length > 0 ? (
                <div className="space-y-2.5">
                  {referrerData.map((ref: any, i: number) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 min-w-0">
                        <Globe className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span className="text-gray-700 truncate">{ref.referrer}</span>
                      </div>
                      <span className="font-medium text-gray-900 ml-2 shrink-0">{formatNum(ref.count)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 py-8 text-center">Referans verisi yok</p>
              )}
            </CardContent>
          </Card>

          {/* Geography */}
          <Card className="bg-white border border-gray-100 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-gray-900">Ülkeler</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {geoData.length > 0 ? (
                <div className="space-y-2">
                  {geoData.map((geo, i) => {
                    const pct = geoTotal > 0 ? (geo.count / geoTotal) * 100 : 0;
                    return (
                      <div key={i} className="flex items-center gap-3">
                        <span className="text-sm text-gray-600 w-24 truncate">{geo.country}</span>
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-900 w-12 text-right">{formatNum(geo.count)}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-gray-400 py-8 text-center">Ülke verisi yok</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Events */}
        <Card className="bg-white border border-gray-100 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-gray-900">Son Aktiviteler</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {recentEvents.length > 0 ? (
              <div className="space-y-1">
                {recentEvents.map((event: any, i: number) => (
                  <div key={i} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-2 h-2 rounded-full shrink-0 ${eventDotColor(event.event_type)}`} />
                      <span className="text-sm font-medium text-gray-700">{eventTypeLabel(event.event_type)}</span>
                      {event.referrer && (
                        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded truncate max-w-[200px]">
                          {event.referrer}
                        </span>
                      )}
                      {event.device_type && (
                        <span className="hidden sm:inline text-xs text-gray-400">
                          <DeviceIcon type={event.device_type} />
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-400 shrink-0 ml-2">
                      {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true, locale: tr })}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 py-8 text-center">Henüz aktivite yok</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
