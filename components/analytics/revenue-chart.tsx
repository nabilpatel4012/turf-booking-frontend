"use client";

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Area, AreaChart, ComposedChart } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DailyRevenue, MonthlyRevenue } from "@/types/analytics";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, TrendingDown, BarChart3 } from "lucide-react";

interface RevenueChartProps {
  dailyData?: DailyRevenue[];
  monthlyData?: MonthlyRevenue[];
}

export function RevenueChart({ dailyData, monthlyData }: RevenueChartProps) {
  
  const formattedDaily = dailyData?.map(d => ({
    ...d,
    revenue: parseFloat(d.revenue) || 0,
    revenue_7d_ma: parseFloat(d.revenue_7d_ma) || 0,
    bookings: parseInt(d.total_bookings) || 0,
    date: d.booking_date
  })) || [];

  const formattedMonthly = monthlyData?.map(m => ({
    ...m,
    revenue: parseFloat(m.revenue) || 0,
    bookings: parseInt(m.bookings) || 0,
    growth: parseFloat(m.revenue_growth_pct || "0")
  })) || [];

  // Calculate trend for daily data
  const dailyTrend = formattedDaily.length >= 2 
    ? formattedDaily[formattedDaily.length - 1].revenue - formattedDaily[formattedDaily.length - 2].revenue
    : 0;
  
  const totalRevenue = formattedDaily.reduce((sum, d) => sum + d.revenue, 0);
  const avgDailyRevenue = formattedDaily.length > 0 ? totalRevenue / formattedDaily.length : 0;

  // Calculate monthly trend
  const monthlyTrend = formattedMonthly.length >= 1 ? formattedMonthly[formattedMonthly.length - 1].growth : 0;

  const CustomTooltip = ({ active, payload, label, type }: any) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload;
    
    return (
      <div className="bg-white/95 backdrop-blur-sm rounded-xl border shadow-xl p-3 min-w-[180px]">
        <p className="text-xs text-muted-foreground mb-2 font-medium">
          {type === 'daily' 
            ? new Date(label).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })
            : new Date(label).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
          }
        </p>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Revenue</span>
            <span className="text-sm font-bold">₹{data.revenue.toLocaleString('en-IN')}</span>
          </div>
          {type === 'daily' && data.revenue_7d_ma > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">7-day avg</span>
              <span className="text-xs text-indigo-600">₹{data.revenue_7d_ma.toLocaleString('en-IN')}</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Bookings</span>
            <span className="text-xs">{data.bookings}</span>
          </div>
          {type === 'monthly' && data.growth !== undefined && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Growth</span>
              <span className={`text-xs font-medium ${data.growth >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                {data.growth >= 0 ? '+' : ''}{data.growth.toFixed(1)}%
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-emerald-500" />
            <CardTitle className="text-lg">Revenue Trends</CardTitle>
          </div>
          {dailyTrend !== 0 && (
            <div className="flex items-center gap-1">
              {dailyTrend > 0 ? (
                <TrendingUp className="h-4 w-4 text-emerald-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
              <span className={`text-xs font-medium ${dailyTrend > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                {dailyTrend > 0 ? '+' : ''}₹{Math.abs(dailyTrend).toLocaleString('en-IN')}
              </span>
            </div>
          )}
        </div>
        <CardDescription>
          Avg. daily revenue: ₹{avgDailyRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex-1 pt-0">
        <Tabs defaultValue="daily" className="h-full flex flex-col">
          <TabsList className="grid w-full max-w-[200px] grid-cols-2">
            <TabsTrigger value="daily" className="text-xs">Daily</TabsTrigger>
            <TabsTrigger value="monthly" className="text-xs">Monthly</TabsTrigger>
          </TabsList>

          <TabsContent value="daily" className="flex-1 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={formattedDaily} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#10B981" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis
                  dataKey="date"
                  stroke="#94A3B8"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return `${date.getDate()}/${date.getMonth() + 1}`;
                  }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  stroke="#94A3B8"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => value >= 1000 ? `${(value/1000).toFixed(0)}k` : value}
                  width={45}
                />
                <Tooltip content={(props) => <CustomTooltip {...props} type="daily" />} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="transparent"
                  fill="url(#revenueGradient)"
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10B981"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 6, fill: "#10B981", stroke: "#fff", strokeWidth: 2 }}
                />
                <Line
                  type="monotone"
                  dataKey="revenue_7d_ma"
                  stroke="#6366F1"
                  strokeWidth={1.5}
                  strokeDasharray="5 5"
                  dot={false}
                  activeDot={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="monthly" className="flex-1 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={formattedMonthly} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
                <defs>
                  <linearGradient id="monthlyGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366F1" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#6366F1" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis
                  dataKey="month"
                  stroke="#94A3B8"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return date.toLocaleString('en-IN', { month: 'short' });
                  }}
                />
                <YAxis
                  stroke="#94A3B8"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => value >= 1000 ? `${(value/1000).toFixed(0)}k` : value}
                  width={45}
                />
                <Tooltip content={(props) => <CustomTooltip {...props} type="monthly" />} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="transparent"
                  fill="url(#monthlyGradient)"
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#6366F1"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: "#6366F1", stroke: "#fff", strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: "#6366F1", stroke: "#fff", strokeWidth: 2 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
