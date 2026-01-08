"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell, Legend, LabelList } from "recharts";
import { TurfPerformance, CustomerSegment, PeakHour } from "@/types/analytics";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Trophy, Users, Clock } from "lucide-react";

// ============================================
// Top Turfs Horizontal Comparison Chart
// ============================================

const TURF_COLORS = [
  "#171717", // Black
  "#404040", // Dark gray
  "#525252", // Gray
  "#737373", // Medium gray
  "#A3A3A3", // Light gray
];

interface TurfBarData {
  turf_name: string;
  revenue: number;
  bookings: number;
  utilization: number;
  rank: number;
}

export function TopTurfsChart({ data }: { data?: TurfPerformance[] }) {
  if (!data || data.length === 0) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            <CardTitle className="text-lg">Turf Performance</CardTitle>
          </div>
          <CardDescription>Compare revenue across your turfs</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground text-sm">No turf data available</p>
        </CardContent>
      </Card>
    );
  }

  // Format data for horizontal bar comparison
  const formattedData: TurfBarData[] = data.slice(0, 5).map((t, index) => ({
    turf_name: t.turf_name.length > 15 ? t.turf_name.substring(0, 15) + '...' : t.turf_name,
    revenue: parseFloat(t.revenue) || 0,
    bookings: parseInt(t.total_bookings) || 0,
    utilization: parseFloat(t.utilization_rate_pct) || 0,
    rank: index + 1
  }));

  // Find max revenue for percentage calculation
  const maxRevenue = Math.max(...formattedData.map(d => d.revenue));

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            <CardTitle className="text-lg">Turf Performance</CardTitle>
          </div>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
            Top {formattedData.length}
          </span>
        </div>
        <CardDescription>Revenue comparison across your turfs</CardDescription>
      </CardHeader>
      
      <CardContent className="flex-1 pt-2">
        <div className="space-y-4 h-full">
          {formattedData.map((turf, index) => {
            const percentage = maxRevenue > 0 ? (turf.revenue / maxRevenue) * 100 : 0;
            const color = TURF_COLORS[index % TURF_COLORS.length];
            
            return (
              <div key={turf.turf_name} className="space-y-2">
                {/* Turf name and rank */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span 
                      className="text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center text-white"
                      style={{ backgroundColor: color }}
                    >
                      {turf.rank}
                    </span>
                    <span className="text-sm font-medium truncate max-w-[120px]" title={turf.turf_name}>
                      {turf.turf_name}
                    </span>
                  </div>
                  <span className="text-sm font-bold">
                    ₹{turf.revenue.toLocaleString('en-IN')}
                  </span>
                </div>
                
                {/* Progress bar */}
                <div className="relative h-6 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="absolute inset-y-0 left-0 rounded-full transition-all duration-500 ease-out flex items-center justify-end pr-2"
                    style={{ 
                      width: `${Math.max(percentage, 8)}%`,
                      background: `linear-gradient(90deg, ${color}20, ${color})`
                    }}
                  >
                    {percentage > 25 && (
                      <span className="text-[10px] font-medium text-white">
                        {turf.bookings} bookings
                      </span>
                    )}
                  </div>
                  {percentage <= 25 && (
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-medium text-muted-foreground">
                      {turf.bookings} bookings
                    </span>
                  )}
                </div>

                {/* Utilization rate */}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Utilization: {turf.utilization.toFixed(1)}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// Customer Segments Pie Chart
// ============================================

const SEGMENT_COLORS: Record<string, string> = {
  "Champions": "#16A34A",
  "Loyal Customers": "#171717", 
  "Promising": "#404040",
  "Hibernating": "#737373",
  "At Risk": "#DC2626",
  "Big Spenders": "#16A34A",
  "Regular": "#A3A3A3"
};

export function CustomerSegmentsChart({ data }: { data?: CustomerSegment[] }) {
  if (!data || data.length === 0) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-indigo-500" />
            <CardTitle className="text-lg">Customer Segments</CardTitle>
          </div>
          <CardDescription>RFM-based customer distribution</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground text-sm">No segmentation data available</p>
        </CardContent>
      </Card>
    );
  }

  const formattedData = data.map(d => ({
    segment: d.customer_segment,
    count: parseInt(d.customer_count) || 0,
    avgSpent: parseFloat(d.avg_total_spent) || 0,
    avgDays: parseFloat(d.avg_days_since_last_booking) || 0,
    color: SEGMENT_COLORS[d.customer_segment] || SEGMENT_COLORS["Regular"]
  }));

  const totalCustomers = formattedData.reduce((sum, d) => sum + d.count, 0);
  const maxCount = Math.max(...formattedData.map(d => d.count));

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-indigo-500" />
            <CardTitle className="text-lg">Customer Segments</CardTitle>
          </div>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
            {totalCustomers} total
          </span>
        </div>
        <CardDescription>RFM analysis distribution</CardDescription>
      </CardHeader>
      
      <CardContent className="flex-1 pt-2">
        <div className="space-y-3 h-full">
          {formattedData.map((segment) => {
            const percentage = totalCustomers > 0 ? (segment.count / totalCustomers) * 100 : 0;
            const barWidth = maxCount > 0 ? (segment.count / maxCount) * 100 : 0;
            
            return (
              <div key={segment.segment} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: segment.color }}
                    />
                    <span className="font-medium">{segment.segment}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-muted-foreground">
                      Spent: ₹{segment.avgSpent.toLocaleString('en-IN')}
                    </span>
                    <span className="font-bold">{segment.count}</span>
                  </div>
                </div>
                
                <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
                    style={{ 
                      width: `${barWidth}%`,
                      backgroundColor: segment.color
                    }}
                  />
                </div>
                
                <div className="text-[10px] text-muted-foreground">
                  {percentage.toFixed(1)}% of customers • Last booking: {segment.avgDays.toFixed(0)} days ago
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// Peak Hours Bar Chart
// ============================================

export function PeakHoursChart({ data }: { data?: PeakHour[] }) {
  if (!data || data.length === 0) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-cyan-500" />
            <CardTitle className="text-lg">Peak Hours</CardTitle>
          </div>
          <CardDescription>Booking distribution by time</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground text-sm">No peak hours data available</p>
        </CardContent>
      </Card>
    );
  }

  // Aggregate by hour
  const hourlyData = data.reduce((acc, curr) => {
    const hour = Number(curr.hour_of_day);
    const existing = acc.find(item => item.hour === hour);
    if (existing) {
      existing.bookings += Number(curr.booking_count);
      existing.revenue += parseFloat(curr.revenue as string) || 0;
    } else {
      acc.push({ 
        hour, 
        bookings: Number(curr.booking_count),
        revenue: parseFloat(curr.revenue as string) || 0
      });
    }
    return acc;
  }, [] as { hour: number; bookings: number; revenue: number }[])
    .sort((a, b) => a.hour - b.hour);

  // Find peak hour
  const peakHour = hourlyData.reduce((max, curr) => 
    curr.bookings > max.bookings ? curr : max, hourlyData[0]);
  
  const maxBookings = peakHour?.bookings || 1;

  // Format hour to 12-hour format
  const formatHour = (hour: number) => {
    if (hour === 0) return '12 AM';
    if (hour === 12) return '12 PM';
    return hour > 12 ? `${hour - 12} PM` : `${hour} AM`;
  };

  // Get color based on intensity
  const getBarColor = (bookings: number) => {
    const intensity = bookings / maxBookings;
    if (intensity > 0.8) return "#171717"; // High - Black
    if (intensity > 0.5) return "#404040"; // Medium - Dark gray
    if (intensity > 0.25) return "#737373"; // Low-Medium - Gray
    return "#A3A3A3"; // Low - Light gray
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-cyan-500" />
            <CardTitle className="text-lg">Peak Hours</CardTitle>
          </div>
          {peakHour && (
            <span className="text-xs bg-neutral-100 text-neutral-700 px-2 py-1 rounded-full font-medium">
              Peak: {formatHour(peakHour.hour)}
            </span>
          )}
        </div>
        <CardDescription>Booking distribution throughout the day</CardDescription>
      </CardHeader>
      
      <CardContent className="flex-1 pt-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={hourlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <XAxis 
              dataKey="hour" 
              tickFormatter={formatHour}
              tick={{ fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              interval={2}
            />
            <YAxis 
              tick={{ fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              width={35}
            />
            <Tooltip 
              cursor={{ fill: 'transparent' }}
              contentStyle={{ 
                borderRadius: '12px', 
                border: 'none', 
                boxShadow: '0 10px 40px -10px rgba(0,0,0,0.2)',
                padding: '12px'
              }}
              formatter={(value: number, name: string) => {
                if (name === 'bookings') return [value, 'Bookings'];
                return [`₹${value.toLocaleString('en-IN')}`, 'Revenue'];
              }}
              labelFormatter={(hour) => formatHour(Number(hour))}
            />
            <Bar 
              dataKey="bookings" 
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            >
              {hourlyData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.bookings)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
