"use client";

import { useEffect, useState } from "react";
import { DailyRevenue, MonthlyRevenue, TurfPerformance, PeakHour, CustomerSegment, KPIOverview } from "@/types/analytics";
import { KPICards } from "@/components/analytics/kpi-cards";
import { RevenueChart } from "@/components/analytics/revenue-chart";
import { TopTurfsChart, CustomerSegmentsChart, PeakHoursChart } from "@/components/analytics/charts-grid";
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";
import { fetchWithAuth, getApiUrl } from "@/lib/api";

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [dailyRevenue, setDailyRevenue] = useState<DailyRevenue[]>([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState<MonthlyRevenue[]>([]);
  const [topTurfs, setTopTurfs] = useState<TurfPerformance[]>([]);
  const [peakHours, setPeakHours] = useState<PeakHour[]>([]);
  const [segments, setSegments] = useState<CustomerSegment[]>([]);
  const [kpis, setKpis] = useState<KPIOverview | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
        const fetchJson = async (url: string) => {
            const res = await fetchWithAuth(getApiUrl(url));
            if (!res.ok) throw new Error(`Failed to fetch ${url}`);
            return res.json();
        };

        const [daily, monthly, turfs, hours, segs, kpiData] = await Promise.all([
            fetchJson('/analytics/daily-revenue?interval=90 days'),
            fetchJson('/analytics/monthly-revenue'),
            fetchJson('/analytics/top-turfs?interval=30 days'),
            fetchJson('/analytics/peak-hours?interval=60 days'),
            fetchJson('/analytics/customer-segments'),
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
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h2>
        <div className="flex items-center space-x-2">
           <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
             <RefreshCcw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
             Refresh
           </Button>
        </div>
      </div>
      
      <KPICards data={kpis} loading={loading} />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4 lg:col-span-4">
             <RevenueChart dailyData={dailyRevenue} monthlyData={monthlyRevenue} />
        </div>
        <div className="col-span-4 lg:col-span-3">
             <TopTurfsChart data={topTurfs} />
        </div>
      </div>

       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4 lg:col-span-4">
             <PeakHoursChart data={peakHours} />
        </div>
        <div className="col-span-4 lg:col-span-3">
             <CustomerSegmentsChart data={segments} />
        </div>
      </div>
    </div>
  );
}
