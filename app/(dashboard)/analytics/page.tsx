"use client";

import { AnalyticsToolbar } from "@/components/analytics/analytics-toolbar";
import { useEffect, useState, useCallback } from "react";
import { DailyRevenue, MonthlyRevenue, TurfPerformance, PeakHour, CustomerSegment, KPIOverview } from "@/types/analytics";
import { KPICards } from "@/components/analytics/kpi-cards";
import { RevenueChart } from "@/components/analytics/revenue-chart";
import { TopTurfsChart, CustomerSegmentsChart, PeakHoursChart } from "@/components/analytics/charts-grid";
import { fetchWithAuth, getApiUrl } from "@/lib/api";

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [interval, setInterval] = useState("30"); // Default 30 days
  const [dailyRevenue, setDailyRevenue] = useState<DailyRevenue[]>([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState<MonthlyRevenue[]>([]);
  const [topTurfs, setTopTurfs] = useState<TurfPerformance[]>([]);
  const [peakHours, setPeakHours] = useState<PeakHour[]>([]);
  const [segments, setSegments] = useState<CustomerSegment[]>([]);
  const [kpis, setKpis] = useState<KPIOverview | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
        const fetchJson = async (url: string) => {
            const res = await fetchWithAuth(getApiUrl(url));
            if (!res.ok) throw new Error(`Failed to fetch ${url}`);
            return res.json();
        };

        const [daily, monthly, turfs, hours, segs, kpiData] = await Promise.all([
            fetchJson(`/analytics/revenue/daily?interval=${interval}`),
            fetchJson('/analytics/revenue/monthly'),
            fetchJson(`/analytics/turfs/top?interval=${interval}`),
            fetchJson(`/analytics/peak-hours?interval=${interval}`),
            fetchJson('/analytics/customers/segmentation'),
            fetchJson('/analytics/kpis')
        ]);

        setDailyRevenue(daily);
        setMonthlyRevenue(monthly);
        setTopTurfs(turfs);
        setPeakHours(hours);
        setSegments(segs);
        setKpis(kpiData);

    } catch (error) {
        console.error("Failed to fetch analytics:", error);
    } finally {
        setLoading(false);
    }
  }, [interval]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="space-y-3 sm:space-y-4 p-3 sm:p-4 bg-slate-50/50 min-h-screen">
      <AnalyticsToolbar
        interval={interval}
        setInterval={setInterval}
        onRefresh={fetchData}
        loading={loading}
      />

      {/* KPI Section */}
      <KPICards data={kpis} loading={loading} />
      {/* Main Charts Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7 h-[400px]">
        {/* Revenue Chart */}
        <div className="col-span-4 lg:col-span-4 h-full">
            <RevenueChart dailyData={dailyRevenue} monthlyData={monthlyRevenue} />
        </div>

        {/* Top Turfs */}
        <div className="col-span-4 lg:col-span-3 h-full">
             <TopTurfsChart data={topTurfs} />
        </div>
      </div>

      {/* Secondary Charts Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7 h-[400px]">
        {/* Customer Segments */}
         <div className="col-span-4 lg:col-span-3 h-full">
            <CustomerSegmentsChart data={segments} />
         </div>

         {/* Peak Hours */}
         <div className="col-span-4 lg:col-span-4 h-full">
            <PeakHoursChart data={peakHours} />
         </div>
      </div>
    </div>
  );
}
