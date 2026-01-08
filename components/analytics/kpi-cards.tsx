"use client";

import { Card, CardContent } from "@/components/ui/card";
import { KPIOverview } from "@/types/analytics";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar, 
  Users, 
  CheckCircle2,
  XCircle,
  Wallet
} from "lucide-react";

interface KPICardsProps {
  data: KPIOverview | null;
  loading: boolean;
}

interface KPICardProps {
  title: string;
  value: string | number;
  trend?: number;
  trendLabel?: string;
  icon: React.ReactNode;
  accentColor: string;
  format?: "currency" | "number" | "percent";
}

function KPICard({ title, value, trend, trendLabel, icon, accentColor, format = "number" }: KPICardProps) {
  const formattedValue = () => {
    if (format === "currency") return `₹${Number(value).toLocaleString("en-IN")}`;
    if (format === "percent") return `${Number(value).toFixed(1)}%`;
    return Number(value).toLocaleString("en-IN");
  };

  const hasTrend = trend !== undefined && trend !== 0;
  const isPositive = trend !== undefined && trend >= 0;

  return (
    <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50/80 shadow-md hover:shadow-lg transition-all duration-300">
      {/* Accent bar */}
      <div 
        className="absolute top-0 left-0 w-full h-1 rounded-t-xl" 
        style={{ background: accentColor }}
      />
      
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold tracking-tight">{formattedValue()}</p>
            
            {hasTrend && (
              <div className="flex items-center gap-1.5">
                {isPositive ? (
                  <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
                ) : (
                  <TrendingDown className="h-3.5 w-3.5 text-red-500" />
                )}
                <span className={`text-xs font-medium ${isPositive ? 'text-emerald-600' : 'text-red-500'}`}>
                  {isPositive ? '+' : ''}{trend.toFixed(1)}%
                </span>
                {trendLabel && (
                  <span className="text-xs text-muted-foreground">{trendLabel}</span>
                )}
              </div>
            )}
            {!hasTrend && trendLabel && (
              <span className="text-xs text-muted-foreground">{trendLabel}</span>
            )}
          </div>
          
          <div 
            className="p-2.5 rounded-xl" 
            style={{ backgroundColor: `${accentColor}15` }}
          >
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function KPICardSkeleton() {
  return (
    <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50/80 shadow-md">
      <div className="absolute top-0 left-0 w-full h-1 bg-muted animate-pulse rounded-t-xl" />
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-3">
            <div className="h-4 w-24 bg-muted rounded animate-pulse" />
            <div className="h-7 w-28 bg-muted rounded animate-pulse" />
            <div className="h-3 w-20 bg-muted rounded animate-pulse" />
          </div>
          <div className="h-10 w-10 bg-muted rounded-xl animate-pulse" />
        </div>
      </CardContent>
    </Card>
  );
}

export function KPICards({ data, loading }: KPICardsProps) {
  if (loading) {
    return (
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {[1, 2, 3, 4, 5, 6].map(i => <KPICardSkeleton key={i} />)}
      </div>
    );
  }

  if (!data) return null;

  // Parse values
  const revenue = parseFloat(data.revenue_l30d || "0");
  const bookings = parseInt(data.bookings_l30d || "0");
  const prevBookings = parseInt(data.bookings_prev_30d || "0");
  const avgValue = parseFloat(data.avg_booking_value_l30d || "0");
  const activeCustomers = parseInt(data.active_customers_l30d || "0");
  const prevCustomers = parseInt(data.active_customers_prev_30d || "0");
  const completionRate = parseFloat(data.completion_rate_l30d || "0");
  const cancellationRate = parseFloat(data.cancellation_rate_l30d || "0");

  // Calculate trends
  const prevRevenue = parseFloat(data.revenue_prev_30d || "0");
  const revenueGrowth = prevRevenue > 0 ? ((revenue - prevRevenue) / prevRevenue) * 100 : 0;
  const bookingsGrowth = prevBookings > 0 ? ((bookings - prevBookings) / prevBookings) * 100 : 0;
  const customersGrowth = prevCustomers > 0 ? ((activeCustomers - prevCustomers) / prevCustomers) * 100 : 0;

  const kpis: KPICardProps[] = [
    {
      title: "Total Revenue",
      value: revenue,
      trend: prevRevenue > 0 ? revenueGrowth : undefined,
      trendLabel: prevRevenue > 0 ? "vs last period" : "Last 30 days",
      icon: <DollarSign className="h-5 w-5" style={{ color: "#10B981" }} />,
      accentColor: "#10B981",
      format: "currency"
    },
    {
      title: "Total Bookings",
      value: bookings,
      trend: prevBookings > 0 ? bookingsGrowth : undefined,
      trendLabel: prevBookings > 0 ? "vs last period" : "Last 30 days",
      icon: <Calendar className="h-5 w-5" style={{ color: "#6366F1" }} />,
      accentColor: "#6366F1",
      format: "number"
    },
    {
      title: "Avg. Booking Value",
      value: avgValue,
      trendLabel: "Per booking",
      icon: <Wallet className="h-5 w-5" style={{ color: "#F59E0B" }} />,
      accentColor: "#F59E0B",
      format: "currency"
    },
    {
      title: "Active Customers",
      value: activeCustomers,
      trend: prevCustomers > 0 ? customersGrowth : undefined,
      trendLabel: prevCustomers > 0 ? "vs last period" : "Last 30 days",
      icon: <Users className="h-5 w-5" style={{ color: "#8B5CF6" }} />,
      accentColor: "#8B5CF6",
      format: "number"
    },
    {
      title: "Completion Rate",
      value: completionRate,
      trendLabel: "Bookings completed",
      icon: <CheckCircle2 className="h-5 w-5" style={{ color: "#06B6D4" }} />,
      accentColor: "#06B6D4",
      format: "percent"
    },
    {
      title: "Cancellation Rate",
      value: cancellationRate,
      trendLabel: "Bookings cancelled",
      icon: <XCircle className="h-5 w-5" style={{ color: "#EF4444" }} />,
      accentColor: "#EF4444",
      format: "percent"
    }
  ];

  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {kpis.map((kpi, index) => (
        <KPICard key={index} {...kpi} />
      ))}
    </div>
  );
}
