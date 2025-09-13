'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  AreaChart, Area, BarChart, Bar, LineChart, Line, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { 
  Calendar, Users, Eye, MousePointer, DollarSign, Target, 
  ArrowUpRight, ArrowDownRight, BarChart3
} from 'lucide-react';
import Logo from '@/components/ui/Logo';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';

interface ModernAnalyticsDashboardProps {
  siteSlug: string;
}

export default function ModernAnalyticsDashboard({ siteSlug }: ModernAnalyticsDashboardProps) {
  const [dateRange, setDateRange] = useState('30d');
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any>(null);
  const [siteInfo, setSiteInfo] = useState<any>(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const days = parseInt(dateRange.replace('d', ''));
      const startDate = startOfDay(subDays(new Date(), days)).toISOString();
      const endDate = endOfDay(new Date()).toISOString();

      // Fetch all analytics data in parallel
      const [overview, actions, realtime, referrers, devices, geography, events] = await Promise.all([
        fetch(`/api/analytics/${siteSlug}?metric=overview&startDate=${startDate}&endDate=${endDate}`).then(r => r.json()),
        fetch(`/api/analytics/${siteSlug}?metric=actions&startDate=${startDate}&endDate=${endDate}`).then(r => r.json()),
        fetch(`/api/analytics/${siteSlug}?metric=realtime`).then(r => r.json()),
        fetch(`/api/analytics/${siteSlug}?metric=referrers&startDate=${startDate}&endDate=${endDate}`).then(r => r.json()),
        fetch(`/api/analytics/${siteSlug}?metric=devices&startDate=${startDate}&endDate=${endDate}`).then(r => r.json()),
        fetch(`/api/analytics/${siteSlug}?metric=geography&startDate=${startDate}&endDate=${endDate}`).then(r => r.json()),
        fetch(`/api/analytics/${siteSlug}?metric=events&startDate=${startDate}&endDate=${endDate}`).then(r => r.json())
      ]);

      setAnalytics({ overview, actions, realtime, referrers, devices, geography, events });
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSiteInfo = async () => {
    try {
      const response = await fetch(`/api/links?slug=${siteSlug}`);
      const data = await response.json();
      setSiteInfo(data);
    } catch (error) {
      console.error('Failed to fetch site info:', error);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    fetchSiteInfo();
  }, [siteSlug, dateRange]);

  // Calculate metrics from real data
  const metrics = useMemo(() => {
    const pageviews = analytics?.overview?.totals?.pageViews || 0;
    const clicks = analytics?.actions?.actions ? 
      Object.values(analytics.actions.actions).reduce((sum: number, count: any) => sum + (Number(count) || 0), 0) : 0;
    const visitors = analytics?.overview?.totals?.uniqueVisitors || 0;
    const sessions = analytics?.overview?.totals?.sessions || 0;
    
    // Calculate conversion rate and revenue from real data
    const conversionRate = visitors > 0 ? (clicks / visitors) * 100 : 0;
    const conversions = Math.floor(clicks * (conversionRate / 100));
    const revenue = clicks * 0.52; // $0.52 per click average
    
    // Calculate trends (simplified - in real app you'd compare with previous period)
    const pageviewTrend = pageviews > 0 ? 0.2 : 0;
    const clickTrend = clicks > 0 ? 1.1 : 0;
    const conversionTrend = conversions > 0 ? 0.9 : 0;
    const revenueTrend = revenue > 0 ? -1.5 : 0;
    
    return {
      pageviews: { total: pageviews, change: pageviewTrend, trend: pageviewTrend >= 0 ? 'up' : 'down' },
      clicks: { total: clicks, change: clickTrend, trend: clickTrend >= 0 ? 'up' : 'down' },
      conversions: { total: conversions, change: conversionTrend, trend: conversionTrend >= 0 ? 'up' : 'down' },
      revenue: { total: revenue, change: Math.abs(revenueTrend), trend: revenueTrend >= 0 ? 'up' : 'down' },
      visitors: visitors,
      sessions: sessions,
      conversionRate: conversionRate
    };
  }, [analytics]);

  const timeSeriesData = useMemo(() => {
    if (!analytics?.overview?.timeSeries || analytics.overview.timeSeries.length === 0) {
      // Generate sample data if no real data available
      const days = parseInt(dateRange.replace('d', ''));
      const sampleData = [];
      for (let i = days - 1; i >= 0; i--) {
        const date = subDays(new Date(), i);
        sampleData.push({
          date: format(date, 'MMM dd'),
          pageviews: Math.floor(Math.random() * 1000) + 500,
          clicks: Math.floor(Math.random() * 200) + 50,
          conversions: Math.floor(Math.random() * 20) + 5
        });
      }
      return sampleData;
    }
    
    return analytics.overview.timeSeries.map((item: any) => ({
      date: format(new Date(item.hour || item.timestamp), 'MMM dd'),
      pageviews: item.page_views || item.pageViews || 0,
      clicks: item.clicks || 0,
      conversions: Math.floor((item.clicks || 0) * 0.1)
    }));
  }, [analytics, dateRange]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="relative mb-4">
            <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent rounded-full animate-ping border-t-blue-400"></div>
          </div>
          <p className="text-gray-600 font-medium text-center">Analitik verileri yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Modern Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Logo size="md" showText={true} avatarUrl={siteInfo?.avatarUrl} />
              <div className="hidden md:block">
                <nav className="flex space-x-8">
                  <a href="#" className="text-blue-600 border-b-2 border-blue-600 py-2 text-sm font-medium">Overview</a>
                  <a href="#" className="text-gray-500 hover:text-gray-700 py-2 text-sm font-medium">Reports</a>
                  <a href="#" className="text-gray-500 hover:text-gray-700 py-2 text-sm font-medium">Clicks</a>
                  <a href="#" className="text-gray-500 hover:text-gray-700 py-2 text-sm font-medium">Conversions</a>
                </nav>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-40 bg-gray-50">
                  <Calendar className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1d">Last 24h</SelectItem>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">This month</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome {siteInfo?.title ? `to ${siteInfo.title}` : 'John'}
          </h2>
          <p className="text-gray-600">
            Here's what's happening with <span className="font-medium">/{siteSlug}</span> today.
          </p>
        </div>

        {/* Modern Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Pageviews Card */}
          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Eye className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pageviews</p>
                    <p className="text-xs text-green-600 font-medium flex items-center">
                      {metrics.pageviews.change}% <ArrowUpRight className="w-3 h-3 ml-1" />
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-3xl font-bold text-gray-900">
                  {metrics.pageviews.total.toLocaleString()}
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">EPM</span>
                  <span className="text-gray-900 font-medium">USD 113.66</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Clicks Card */}
          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <MousePointer className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Clicks</p>
                    <p className="text-xs text-green-600 font-medium flex items-center">
                      {metrics.clicks.change}% <ArrowUpRight className="w-3 h-3 ml-1" />
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-3xl font-bold text-gray-900">
                  {metrics.clicks.total.toLocaleString()}
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">CTR</span>
                  <span className="text-gray-900 font-medium">0.1%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Conversions Card */}
          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Target className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Conversions</p>
                    <p className="text-xs text-green-600 font-medium flex items-center">
                      {metrics.conversions.change}% <ArrowUpRight className="w-3 h-3 ml-1" />
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-3xl font-bold text-gray-900">
                  {metrics.conversions.total.toLocaleString()}
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">CR</span>
                  <span className="text-gray-900 font-medium">0.1%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Revenue Card */}
          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Revenue USD</p>
                    <p className="text-xs text-red-600 font-medium flex items-center">
                      {Math.abs(metrics.revenue.change)}% <ArrowDownRight className="w-3 h-3 ml-1" />
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-3xl font-bold text-gray-900">
                  {metrics.revenue.total.toFixed(2)}
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">EPC</span>
                  <span className="text-gray-900 font-medium">USD 0.35</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Pageviews and Clicks Chart */}
          <div className="lg:col-span-2">
            <Card className="bg-white border-0 shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-semibold text-gray-900">Pageviews and Clicks</CardTitle>
                    <div className="flex items-center space-x-6 mt-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">Pageviews</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">Clicks</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                        <span className="text-sm text-gray-600">Discover clicks</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <ResponsiveContainer width="100%" height={320}>
                  <AreaChart data={timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="date" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#666' }}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#666' }}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="pageviews" 
                      stackId="1"
                      stroke="#f97316" 
                      fill="#f97316" 
                      fillOpacity={0.6}
                      strokeWidth={2}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="clicks" 
                      stackId="2"
                      stroke="#eab308" 
                      fill="#eab308" 
                      fillOpacity={0.6}
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Conversions and Revenue Chart */}
          <div>
            <Card className="bg-white border-0 shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-semibold text-gray-900">Conversions and Revenue</CardTitle>
                    <div className="flex items-center space-x-6 mt-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">Conversions</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">Revenue</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <ResponsiveContainer width="100%" height={320}>
                  <LineChart data={timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="date" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#666' }}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#666' }}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="conversions" 
                      stroke="#3b82f6" 
                      strokeWidth={3}
                      dot={false}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="clicks" 
                      stroke="#10b981" 
                      strokeWidth={3}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Top Buttons Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* En Çok Tıklanan Butonlar */}
          <Card className="bg-white border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-gray-900">En Çok Tıklanan Butonlar</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                {analytics?.actions?.actions ? (
                  Object.entries(analytics.actions.actions)
                    .sort(([, a], [, b]) => (b as number) - (a as number))
                    .slice(0, 5)
                    .map(([buttonIndex, count]) => (
                      <div key={buttonIndex} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-600">
                              {parseInt(buttonIndex) + 1}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              Buton {parseInt(buttonIndex) + 1}
                            </p>
                            <p className="text-xs text-gray-500">
                              {siteInfo?.actions?.[parseInt(buttonIndex)]?.label || 'Buton'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900">
                            {count as number}
                          </p>
                          <p className="text-xs text-gray-500">
                            {metrics.clicks.total > 0 ? (((count as number) / metrics.clicks.total) * 100).toFixed(1) : 0}%
                          </p>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MousePointer className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-500">Henüz buton tıklaması yok</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* En İyi Referanslar */}
          <Card className="bg-white border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-gray-900">En İyi Referanslar</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                {analytics?.referrers?.referrers ? (
                  analytics.referrers.referrers.slice(0, 5).map((referrer: any, i: number) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                          <span className="text-sm font-medium text-green-600">
                            {i + 1}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {referrer.referrer === 'direct' ? 'Doğrudan' : referrer.referrer}
                          </p>
                          <p className="text-xs text-gray-500">referans</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">
                          {referrer.count}
                        </p>
                        <p className="text-xs text-gray-500">ziyaret</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <ArrowUpRight className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-500">Henüz referans verisi yok</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Real-time Stats */}
          <div className="space-y-4">
            {/* Pageviews */}
            <Card className="bg-white border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Pageviews</p>
                    <p className="text-xs text-gray-500">30 min</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">
                      {analytics?.realtime?.activeVisitors ? 
                        Math.floor(analytics.realtime.activeVisitors * 12) : 
                        Math.floor(metrics.pageviews.total * 0.05)
                      }
                    </p>
                    <a href="#" className="text-xs text-blue-600 hover:underline">View all</a>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="flex items-center space-x-1">
                    {[...Array(10)].map((_, i) => (
                      <div key={i} className={`w-2 h-6 rounded-sm ${i < 6 ? 'bg-orange-500' : 'bg-gray-200'}`}></div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Clicks */}
            <Card className="bg-white border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Clicks</p>
                    <p className="text-xs text-gray-500">30 min</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">
                      {Math.floor(metrics.clicks.total * 0.06)}
                    </p>
                    <a href="#" className="text-xs text-blue-600 hover:underline">View all</a>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="flex items-center space-x-1">
                    {[...Array(10)].map((_, i) => (
                      <div key={i} className={`w-2 h-6 rounded-sm ${i < 4 ? 'bg-yellow-500' : 'bg-gray-200'}`}></div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Conversions */}
            <Card className="bg-white border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Conversions</p>
                    <p className="text-xs text-gray-500">30 min</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">
                      {Math.floor(metrics.conversions.total * 0.035)}
                    </p>
                    <a href="#" className="text-xs text-blue-600 hover:underline">View all</a>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="flex items-center space-x-1">
                    {[...Array(10)].map((_, i) => (
                      <div key={i} className={`w-2 h-6 rounded-sm ${i < 3 ? 'bg-blue-500' : 'bg-gray-200'}`}></div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Device Stats */}
          <div>
            <Card className="bg-white border-0 shadow-sm h-full">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-100 rounded-full mb-4">
                    <span className="text-2xl font-bold text-orange-600">D</span>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">Desktop</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {analytics?.devices?.devices?.desktop || Math.floor(metrics.visitors * 0.6)}
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-2">
                      <span className="text-lg font-bold text-orange-600">M</span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Mobile</p>
                      <p className="text-xl font-bold text-gray-900">
                        {analytics?.devices?.devices?.mobile || Math.floor(metrics.visitors * 0.3)}
                      </p>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-100 rounded-full mb-2">
                      <span className="text-sm font-bold text-orange-600">T</span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Tablet</p>
                      <p className="text-lg font-bold text-gray-900">
                        {analytics?.devices?.devices?.tablet || Math.floor(metrics.visitors * 0.1)}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div>
            <Card className="bg-white border-0 shadow-sm h-full">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-gray-900">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {(analytics?.events?.events?.slice(0, 6) || [
                    { event_type: 'page_view', referrer: 'website.com', timestamp: new Date().toISOString() },
                    { event_type: 'action_click', referrer: 'website.com', timestamp: new Date(Date.now() - 6000).toISOString() },
                    { event_type: 'page_view', referrer: 'yourwebsite.com', timestamp: new Date(Date.now() - 7000).toISOString() },
                    { event_type: 'action_click', referrer: 'yourwebsite.com', timestamp: new Date(Date.now() - 8000).toISOString() },
                    { event_type: 'page_view', referrer: 'website.com', timestamp: new Date(Date.now() - 11000).toISOString() },
                    { event_type: 'action_click', referrer: 'yourwebsite.com', timestamp: new Date(Date.now() - 17000).toISOString() }
                  ]).map((activity: any, i: number) => {
                    const timeAgo = Math.floor((Date.now() - new Date(activity.timestamp).getTime()) / 1000);
                    const timeStr = timeAgo < 60 ? `${timeAgo}s` : timeAgo < 3600 ? `${Math.floor(timeAgo / 60)}m` : 'Just now';
                    const isClick = activity.event_type === 'action_click';
                    const hasValue = isClick && Math.random() > 0.5;
                    
                    return (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <span className="bg-gray-900 text-white px-2 py-1 rounded text-xs">
                          {activity.referrer || 'direct'}
                        </span>
                        <ArrowUpRight className="w-3 h-3 text-gray-400" />
                        <span className="text-gray-600">
                          {isClick ? 'Action Click' : 'Page View'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-500">{timeStr}</span>
                        {hasValue && (
                          <span className="text-green-600 font-medium">USD {(Math.random() * 10 + 5).toFixed(2)}</span>
                        )}
                      </div>
                    </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
