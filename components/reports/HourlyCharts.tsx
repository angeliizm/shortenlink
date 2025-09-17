'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  ComposedChart
} from 'recharts';
import { Clock, TrendingUp, MousePointer, Eye, Users } from 'lucide-react';

interface HourlyData {
  hour: number;
  hourLabel: string;
  pageViews: number;
  clicks: number;
  sessions: number;
  total: number;
}

interface HourlyChartsProps {
  data: HourlyData[];
}

const COLORS = {
  pageViews: '#3B82F6',
  clicks: '#10B981', 
  sessions: '#F59E0B',
  total: '#8B5CF6'
};

export function HourlyOverviewChart({ data }: { data: HourlyData[] }) {
  return (
    <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-blue-600" />
          Saatlik Genel Etkileşim
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis 
              dataKey="hourLabel" 
              tick={{ fontSize: 12 }}
              interval={1}
              domain={[0, 23]}
              type="category"
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
              formatter={(value: number, name: string) => [
                value.toLocaleString(),
                {
                  'total': 'Toplam Etkileşim',
                  'pageViews': 'Sayfa Görüntüleme',
                  'clicks': 'Tıklama',
                  'sessions': 'Oturum'
                }[name] || name
              ]}
            />
            <Area
              type="monotone"
              dataKey="total"
              fill={COLORS.total}
              fillOpacity={0.3}
              stroke={COLORS.total}
              strokeWidth={2}
            />
            <Bar dataKey="pageViews" fill={COLORS.pageViews} opacity={0.7} />
            <Bar dataKey="clicks" fill={COLORS.clicks} opacity={0.7} />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function HourlyPageViewsChart({ data }: { data: HourlyData[] }) {
  return (
    <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5 text-blue-600" />
          Saatlik Sayfa Görüntülemeleri
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="pageViewsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS.pageViews} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={COLORS.pageViews} stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis 
              dataKey="hourLabel" 
              tick={{ fontSize: 12 }}
              interval={1}
              domain={[0, 23]}
              type="category"
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
              formatter={(value: number) => [value.toLocaleString(), 'Sayfa Görüntüleme']}
            />
            <Area
              type="monotone"
              dataKey="pageViews"
              stroke={COLORS.pageViews}
              strokeWidth={3}
              fill="url(#pageViewsGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function HourlyClicksChart({ data }: { data: HourlyData[] }) {
  return (
    <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MousePointer className="h-5 w-5 text-green-600" />
          Saatlik Tıklamalar
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis 
              dataKey="hourLabel" 
              tick={{ fontSize: 12 }}
              interval={1}
              domain={[0, 23]}
              type="category"
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
              formatter={(value: number) => [value.toLocaleString(), 'Tıklama']}
            />
            <Bar 
              dataKey="clicks" 
              fill={COLORS.clicks}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function HourlySessionsChart({ data }: { data: HourlyData[] }) {
  return (
    <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-orange-600" />
          Saatlik Oturumlar
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis 
              dataKey="hourLabel" 
              tick={{ fontSize: 12 }}
              interval={1}
              domain={[0, 23]}
              type="category"
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
              formatter={(value: number) => [value.toLocaleString(), 'Oturum']}
            />
            <Line 
              type="monotone" 
              dataKey="sessions" 
              stroke={COLORS.sessions}
              strokeWidth={3}
              dot={{ fill: COLORS.sessions, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: COLORS.sessions, strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function HourlyPeakHours({ data }: { data: HourlyData[] }) {
  const peakHours = data
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  const lowHours = data
    .sort((a, b) => a.total - b.total)
    .slice(0, 5);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-600">
            <TrendingUp className="h-5 w-5" />
            En Yoğun Saatler
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {peakHours.map((hour, index) => (
              <div key={hour.hour} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-sm font-medium text-green-600">{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{hour.hourLabel}</p>
                    <p className="text-sm text-gray-500">
                      {hour.pageViews} görüntüleme, {hour.clicks} tıklama
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">{hour.total}</p>
                  <p className="text-xs text-gray-500">toplam</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-600">
            <Clock className="h-5 w-5" />
            En Az Yoğun Saatler
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {lowHours.map((hour, index) => (
              <div key={hour.hour} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-600">{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{hour.hourLabel}</p>
                    <p className="text-sm text-gray-500">
                      {hour.pageViews} görüntüleme, {hour.clicks} tıklama
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-600">{hour.total}</p>
                  <p className="text-xs text-gray-500">toplam</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
