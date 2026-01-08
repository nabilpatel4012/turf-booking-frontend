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
  const [interval, setInterval] = useState("30");
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
      setKpis(kpiData[0] || null);

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100/50">
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Toolbar */}
        <AnalyticsToolbar
          interval={interval}
          setInterval={setInterval}
          onRefresh={fetchData}
          loading={loading}
        />

        {/* KPI Cards */}
        <section>
          <KPICards data={kpis} loading={loading} />
        </section>

        {/* Main Charts - Revenue & Turfs */}
        <section className="grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3 min-h-[400px]">
            <RevenueChart dailyData={dailyRevenue} monthlyData={monthlyRevenue} />
          </div>
          <div className="lg:col-span-2 min-h-[400px]">
            <TopTurfsChart data={topTurfs} />
          </div>
        </section>

        {/* Secondary Charts - Segments & Peak Hours */}
        <section className="grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-2 min-h-[380px]">
            <CustomerSegmentsChart data={segments} />
          </div>
          <div className="lg:col-span-3 min-h-[380px]">
            <PeakHoursChart data={peakHours} />
          </div>
        </section>
      </div>
    </div>
  );
}
