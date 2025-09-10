'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
  Calendar, Download, Users, Eye, MousePointer, Clock, TrendingUp, Globe, 
  RefreshCw, DollarSign, Target, ArrowUpRight, ArrowDownRight, Activity,
  BarChart3, PieChart as PieChartIcon, Zap
} from 'lucide-react';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';

interface AnalyticsDashboardProps {
  siteSlug: string;
}

export default function AnalyticsDashboard({ siteSlug }: AnalyticsDashboardProps) {
  const [dateRange, setDateRange] = useState('30d');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [realtime, setRealtime] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<'pageViews' | 'uniqueVisitors' | 'sessions' | 'clicks'>('clicks');

  const fetchJson = async (url: string) => {
    const res = await fetch(url, {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache', 'Accept': 'application/json' },
      credentials: 'include',
      redirect: 'manual'
    });
    if (res.status === 307 || res.status === 308) {
      throw new Error(`Request redirected (status ${res.status}). Are you logged in?`);
    }
    const contentType = res.headers.get('content-type') || '';
    if (!res.ok) {
      const body = contentType.includes('application/json') ? await res.json().catch(() => ({})) : await res.text().catch(() => '');
      const msg = typeof body === 'string' ? body : (body.error || JSON.stringify(body));
      throw new Error(`HTTP ${res.status}: ${msg}`);
    }
    if (!contentType.includes('application/json')) {
      const text = await res.text().catch(() => '');
      throw new Error(`Non-JSON response from API: ${text.slice(0, 200)}`);
    }
    return res.json();
  };

  const fetchAnalytics = async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true);
    else setLoading(true);
    setError(null);
    
    try {
      const days = parseInt(dateRange.replace('d', ''));
      const startDate = startOfDay(subDays(new Date(), days)).toISOString();
      const endDate = endOfDay(new Date()).toISOString();

      console.log(`[Dashboard] Fetching analytics for ${siteSlug} from ${startDate} to ${endDate}`);

      // Fetch all metrics in parallel
      const [overview, actions, referrers, devices, geography, events] = await Promise.all([
        fetchJson(`/api/analytics/${siteSlug}?metric=overview&startDate=${startDate}&endDate=${endDate}`),
        fetchJson(`/api/analytics/${siteSlug}?metric=actions&startDate=${startDate}&endDate=${endDate}`),
        fetchJson(`/api/analytics/${siteSlug}?metric=referrers&startDate=${startDate}&endDate=${endDate}`),
        fetchJson(`/api/analytics/${siteSlug}?metric=devices&startDate=${startDate}&endDate=${endDate}`),
        fetchJson(`/api/analytics/${siteSlug}?metric=geography&startDate=${startDate}&endDate=${endDate}`),
        fetchJson(`/api/analytics/${siteSlug}?metric=events&startDate=${startDate}&endDate=${endDate}`),
      ]);

      console.log('[Dashboard] Analytics data fetched:', {
        overview: overview?.totals,
        actions: Object.keys(actions?.actions || {}).length,
        referrers: referrers?.referrers?.length,
        devices: Object.keys(devices?.devices || {}).length,
        events: events?.events?.length
      });

      setAnalytics({
        overview,
        actions,
        referrers,
        devices,
        geography,
        events
      });
    } catch (error: any) {
      console.error('[Dashboard] Failed to fetch analytics:', error);
      setError(error.message || 'Failed to fetch analytics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchRealtime = async () => {
    try {
      const data = await fetchJson(`/api/analytics/${siteSlug}?metric=realtime`);
      console.log(`[Dashboard] Realtime: ${data.activeVisitors} active visitors`);
      setRealtime(data);
    } catch (error) {
      console.error('[Dashboard] Failed to fetch realtime data:', error);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    fetchRealtime();
    
    // Refresh realtime data every 10 seconds
    const interval = setInterval(fetchRealtime, 10000);
    return () => clearInterval(interval);
  }, [siteSlug, dateRange]);

  const exportCSV = async () => {
    try {
      const days = parseInt(dateRange.replace('d', ''));
      const startDate = startOfDay(subDays(new Date(), days)).toISOString();
      const endDate = endOfDay(new Date()).toISOString();
      
      const response = await fetch(
        `/api/analytics/export/${siteSlug}?startDate=${startDate}&endDate=${endDate}`
      );
      
      if (!response.ok) throw new Error('Export failed');
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-${siteSlug}-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export CSV:', error);
    }
  };

  

  // Prepare chart data (robust normalization + fallback from events)
  const normalizeOverviewSeries = (overview: any): any[] => {
    if (!overview) return [];
    const series = overview.timeSeries || overview.timeseries || overview.series || overview.timeline || [];
    if (!Array.isArray(series)) return [];
    return series.map((item: any) => {
      const tsRaw = item.hour ?? item.timestamp ?? item.time ?? item.date ?? null;
      const date = tsRaw ? new Date(tsRaw) : null;
      return {
        hour: date ? format(date, 'MMM dd HH:mm') : String(tsRaw ?? ''),
        pageViews: item.page_views ?? item.pageViews ?? item.pageviews ?? item.views ?? 0,
        uniqueVisitors: item.unique_visitors ?? item.uniqueVisitors ?? item.visitors ?? 0,
        sessions: item.sessions ?? 0,
        clicks: item.clicks ?? 0
      };
    }).filter((d: any) => d.hour);
  };

  const buildSeriesFromEvents = (events: any[]): any[] => {
    if (!Array.isArray(events) || events.length === 0) return [];
    const buckets = new Map<string, { pageViews: number; visitors: Set<string>; sessions: Set<string>; clicks: number }>();
    for (const ev of events) {
      const ts = ev.timestamp ? new Date(ev.timestamp) : null;
      if (!ts || isNaN(ts.getTime())) continue;
      const bucketKey = format(ts, 'yyyy-MM-dd HH:00');
      if (!buckets.has(bucketKey)) buckets.set(bucketKey, { pageViews: 0, visitors: new Set(), sessions: new Set(), clicks: 0 });
      const b = buckets.get(bucketKey)!;
      if (ev.event_type === 'page_view' || ev.eventType === 'page_view') {
        b.pageViews += 1;
      }
      if (ev.event_type === 'action_click' || ev.eventType === 'action_click') {
        b.clicks += 1;
      }
      const visitorId = ev.visitor_id ?? ev.visitorId ?? ev.uid ?? null;
      if (visitorId) b.visitors.add(String(visitorId));
      const sessionId = ev.session_id ?? ev.sessionId ?? null;
      if (sessionId) b.sessions.add(String(sessionId));
    }
    const rows = Array.from(buckets.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, b]) => {
        // key is in 'yyyy-MM-dd HH:00' format. Convert safely to ISO.
        const isoCandidate = `${key.replace(' ', 'T')}:00Z`; // -> yyyy-MM-ddTHH:00:00Z
        const d = new Date(isoCandidate);
        const label = isNaN(d.getTime()) ? key : format(d, 'MMM dd HH:mm');
        return {
          hour: label,
          pageViews: b.pageViews,
          uniqueVisitors: b.visitors.size,
          sessions: b.sessions.size,
          clicks: b.clicks
        };
      });
    return rows;
  };

  const timeSeriesData = (() => {
    const fromOverview = normalizeOverviewSeries(analytics?.overview);
    if (fromOverview.length > 0) return fromOverview;
    const fromEvents = buildSeriesFromEvents(analytics?.events?.events || []);
    return fromEvents;
  })();

  const actionData = Object.entries(analytics?.actions?.actions || {}).map(([index, count]) => ({
    action: `Button ${index}`,
    clicks: count as number
  }));

  const deviceData = Object.entries(analytics?.devices?.devices || {}).map(([name, value]) => ({
    name,
    value: value as number
  }));

  const browserData = Object.entries(analytics?.devices?.browsers || {}).map(([name, value]) => ({
    name,
    value: value as number
  }));

  const countryData = Object.entries(analytics?.geography?.countries || {})
    .sort(([, a]: any, [, b]: any) => b - a)
    .slice(0, 10)
    .map(([name, value]) => ({
      name,
      value: value as number
    }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#8DD1E1'];

  // Check if we have any data
  const hasData = analytics?.overview?.totals?.pageViews > 0 || 
                  analytics?.events?.events?.length > 0;

  // Derived totals and trend for Traffic Overview
  const sumMetric = (data: any[], key: 'pageViews' | 'uniqueVisitors' | 'sessions' | 'clicks') => {
    return data.reduce((acc: number, item: any) => acc + (item[key] || 0), 0);
  };

  const totals = useMemo(() => {
    const actionsTotal = analytics?.actions?.actions
      ? Object.values(analytics.actions.actions).reduce((a: number, b: any) => a + (Number(b) || 0), 0)
      : undefined;
    return {
      pageViews: analytics?.overview?.totals?.pageViews ?? sumMetric(timeSeriesData, 'pageViews'),
      uniqueVisitors: analytics?.overview?.totals?.uniqueVisitors ?? sumMetric(timeSeriesData, 'uniqueVisitors'),
      sessions: analytics?.overview?.totals?.sessions ?? sumMetric(timeSeriesData, 'sessions'),
      clicks: actionsTotal ?? sumMetric(timeSeriesData, 'clicks')
    } as Record<'pageViews' | 'uniqueVisitors' | 'sessions' | 'clicks', number>;
  }, [analytics?.overview?.totals, timeSeriesData]);

  const metricLabels: Record<'pageViews' | 'uniqueVisitors' | 'sessions' | 'clicks', string> = {
    pageViews: 'Page Views',
    uniqueVisitors: 'Visitors',
    sessions: 'Sessions',
    clicks: 'Clicks'
  };

  const activeColor = selectedMetric === 'pageViews'
    ? '#8884d8'
    : selectedMetric === 'uniqueVisitors'
    ? '#82ca9d'
    : selectedMetric === 'sessions'
    ? '#ffc658'
    : '#FF8042';

  const trend = useMemo(() => {
    const totalPoints = timeSeriesData.length;
    const mid = Math.floor(totalPoints / 2);
    const prevSum = sumMetric(timeSeriesData.slice(0, mid), selectedMetric);
    const currSum = sumMetric(timeSeriesData.slice(mid), selectedMetric);
    const delta = currSum - prevSum;
    const pct = prevSum > 0 ? (delta / prevSum) * 100 : null;
    return { prevSum, currSum, delta, pct } as { prevSum: number; currSum: number; delta: number; pct: number | null };
  }, [timeSeriesData, selectedMetric]);

  const chartData = useMemo(() => {
    const windowSize = 6; // moving average window
    const values: number[] = [];
    return timeSeriesData.map((item: any, index: number) => {
      const value = item[selectedMetric] || 0;
      values.push(value);
      const start = Math.max(0, index - windowSize + 1);
      const windowValues = values.slice(start, index + 1);
      const avg = windowValues.reduce((a, b) => a + b, 0) / windowValues.length;
      return { ...item, trend: avg };
    });
  }, [timeSeriesData, selectedMetric]);

  if (loading && !refreshing) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-sm text-gray-500">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={() => fetchAnalytics()}>Retry</Button>
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
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">linkfy.</h1>
              </div>
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
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome John</h2>
          <p className="text-gray-600">Here's what's happening with your link today.</p>
        </div>

      {/* Realtime indicator */}
      {realtime && realtime.activeVisitors > 0 && (
        <Card className="border-green-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                Live - Active Now
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{realtime.activeVisitors} visitor{realtime.activeVisitors !== 1 ? 's' : ''}</div>
          </CardContent>
        </Card>
      )}

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
                      0.2% <ArrowUpRight className="w-3 h-3 ml-1" />
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-3xl font-bold text-gray-900">
                  {analytics?.overview?.totals?.pageViews?.toLocaleString() || '240,280'}
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
                      1.1% <ArrowUpRight className="w-3 h-3 ml-1" />
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-3xl font-bold text-gray-900">
                  {totals.clicks?.toLocaleString() || '50,950'}
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
                      0.9% <ArrowUpRight className="w-3 h-3 ml-1" />
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-3xl font-bold text-gray-900">2,345</div>
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
                      1.5% <ArrowDownRight className="w-3 h-3 ml-1" />
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-3xl font-bold text-gray-900">26,762.21</div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">EPC</span>
                  <span className="text-gray-900 font-medium">USD 0.35</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

      {!hasData ? (
        <Card>
          <CardContent className="py-10">
            <div className="text-center">
              <p className="text-gray-500 mb-2">No analytics data available for this period</p>
              <p className="text-sm text-gray-400">
                Visit your site at <code className="bg-gray-100 px-2 py-1 rounded">/{siteSlug}</code> to start tracking
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Charts */
        <Tabs defaultValue="traffic" className="space-y-4">
          <TabsList>
            <TabsTrigger value="traffic">Traffic</TabsTrigger>
            <TabsTrigger value="actions">Actions</TabsTrigger>
            <TabsTrigger value="sources">Sources</TabsTrigger>
            <TabsTrigger value="devices">Devices</TabsTrigger>
            <TabsTrigger value="geography">Geography</TabsTrigger>
          </TabsList>

          <TabsContent value="traffic" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                  <div>
                    <CardTitle>Traffic Overview</CardTitle>
                    <CardDescription>Page views, visitors, and sessions over time</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant={selectedMetric === 'clicks' ? 'default' : 'outline'}
                      onClick={() => setSelectedMetric('clicks')}
                    >
                      Clicks
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={selectedMetric === 'uniqueVisitors' ? 'default' : 'outline'}
                      onClick={() => setSelectedMetric('uniqueVisitors')}
                    >
                      Visitors
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={selectedMetric === 'sessions' ? 'default' : 'outline'}
                      onClick={() => setSelectedMetric('sessions')}
                    >
                      Sessions
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={selectedMetric === 'pageViews' ? 'default' : 'outline'}
                      onClick={() => setSelectedMetric('pageViews')}
                    >
                      Page Views
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {timeSeriesData.length > 0 ? (
                  <div className="space-y-6">
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      <div>
                        <div className="text-sm text-gray-500">{metricLabels[selectedMetric]}</div>
                        <div className="text-3xl font-bold">{totals[selectedMetric]?.toLocaleString?.() ?? 0}</div>
                      </div>
                      <div className="text-sm">
                        {trend.pct !== null ? (
                          <span className={trend.pct >= 0 ? 'text-green-600' : 'text-red-600'}>
                            {trend.pct >= 0 ? '+' : ''}{trend.pct.toFixed(1)}% vs previous period
                          </span>
                        ) : (
                          <span className="text-gray-500">Insufficient data for trend</span>
                        )}
                      </div>
                    </div>

                    {/* Removed sparkline to avoid extra line at the top */}

                    <ResponsiveContainer width="100%" height={320}>
                      <AreaChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="hour" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Area type="monotone" dataKey={selectedMetric} stroke={activeColor} fill={activeColor} fillOpacity={0.25} />
                        <Line type="monotone" dataKey="trend" stroke={activeColor} strokeWidth={2} dot={false} name="Moving Avg" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-gray-500">
                    No time series data available
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="actions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Action Clicks</CardTitle>
                <CardDescription>Button clicks by action index</CardDescription>
              </CardHeader>
              <CardContent>
                {actionData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={actionData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="action" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="clicks" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-gray-500">
                    No action click data available
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sources" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Top Referrers</CardTitle>
                <CardDescription>Where your traffic comes from</CardDescription>
              </CardHeader>
              <CardContent>
                {analytics?.referrers?.referrers?.length > 0 ? (
                  <div className="space-y-2">
                    {analytics.referrers.referrers.map((ref: any, i: number) => (
                      <div key={i} className="flex items-center justify-between">
                        <span className="text-sm truncate max-w-xs">{ref.referrer || 'Direct'}</span>
                        <span className="text-sm font-medium">{ref.count.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-500 text-center py-4">
                    No referrer data available
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="devices" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Device Types</CardTitle>
                </CardHeader>
                <CardContent>
                  {deviceData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={deviceData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {deviceData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[250px] flex items-center justify-center text-gray-500">
                      No device data available
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Browsers</CardTitle>
                </CardHeader>
                <CardContent>
                  {browserData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={browserData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {browserData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[250px] flex items-center justify-center text-gray-500">
                      No browser data available
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="geography" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Top Countries</CardTitle>
                <CardDescription>Geographic distribution of visitors</CardDescription>
              </CardHeader>
              <CardContent>
                {countryData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={countryData} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" />
                      <Tooltip />
                      <Bar dataKey="value" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-gray-500">
                    No geographic data available
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
      </div>
    </div>
  );
}