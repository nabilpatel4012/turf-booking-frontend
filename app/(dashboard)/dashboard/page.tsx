"use client";

import { useEffect, useState } from "react";
import { EarningsChart } from "@/components/dashboard/earnings-chart";
import { BookingsStatusChart } from "@/components/dashboard/bookings-status-chart";
import {
  Calendar,
  Users,
  Star,
  XCircle,
  Clock,
  Hourglass,
  BadgeCheck,
  Loader2,
  AlertCircle,
  TrendingUp,
} from "lucide-react";
import { getApiUrl, getAuthHeaders } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DashboardData {
  overview?: {
    activeBookings?: number;
    completedBookings?: number;
    cancelledBookings?: number;
    totalBookings?: number;
    totalUsers?: number;
    recentUsers?: number;
    totalReviews?: number;
    averageRating?: number;
    bookingsByStatus?: {
      active: number;
      completed: number;
      cancelled: number;
      pending: number;
      confirmed: number;
    };
  };
  last7Days?: {
    breakdown: Array<{ day?: string; month?: string; earnings: number }>;
    totalEarnings: number;
  };
  currentWeek?: {
    breakdown: Array<{ day: string; earnings: number }>;
    totalEarnings: number;
  };
  last5Weeks?: {
    breakdown: Array<{ week: string; earnings: number }>;
    totalEarnings: number;
  };
  thisMonth?: {
    breakdown: Array<{ week: string; earnings: number }>;
    totalEarnings: number;
  };
  thisYear?: {
    breakdown: Array<{ month: string; earnings: number }>;
    totalEarnings: number;
  };
  insights?: Record<string, unknown>;
}

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [timePeriod, setTimePeriod] = useState("last7Days");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(getApiUrl("/admin/stats"), {
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Dashboard API Response:", data);
        setDashboardData(data);
      } else {
        console.error("API Error:", response.status, response.statusText);
        setError(`Failed to load dashboard data (${response.status})`);
      }
    } catch (error) {
      console.error("[v0] Failed to fetch dashboard data:", error);
      setError("Network error. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const getChartData = () => {
    switch (timePeriod) {
      case "last7Days":
        return {
          title: "Last 7 Days Earnings",
          description: "Daily earnings breakdown",
          data: dashboardData?.last7Days?.breakdown || [],
          totalEarnings: dashboardData?.last7Days?.totalEarnings || 0,
        };
      case "currentWeek":
        return {
          title: "This Week Earnings",
          description: "Current week earnings",
          data: dashboardData?.currentWeek?.breakdown || [],
          totalEarnings: dashboardData?.currentWeek?.totalEarnings || 0,
        };
      case "last5Weeks":
        return {
          title: "Last 5 Weeks Earnings",
          description: "Weekly earnings breakdown",
          data: dashboardData?.last5Weeks?.breakdown || [],
          totalEarnings: dashboardData?.last5Weeks?.totalEarnings || 0,
        };
      case "thisMonth":
        return {
          title: "This Month Earnings",
          description: "Monthly earnings by week",
          data: dashboardData?.thisMonth?.breakdown || [],
          totalEarnings: dashboardData?.thisMonth?.totalEarnings || 0,
        };
      case "thisYear":
        return {
          title: "This Year Earnings",
          description: "Yearly earnings by month",
          data: dashboardData?.thisYear?.breakdown || [],
          totalEarnings: dashboardData?.thisYear?.totalEarnings || 0,
        };
      default:
        return {
          title: "Earnings",
          description: "",
          data: [],
          totalEarnings: 0,
        };
    }
  };

  if (isLoading) {
    return (
      <div className="p-3 md:p-6 lg:p-8 space-y-4 md:space-y-6">
        <div>
          <Skeleton className="h-9 w-48 mb-2" />
          <Skeleton className="h-5 w-96" />
        </div>

        <div className="grid gap-3 md:gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="rounded-lg border bg-card p-4 md:p-6 shadow-sm"
            >
              <Skeleton className="h-4 w-32 mb-4" />
              <Skeleton className="h-8 w-20 mb-2" />
              <Skeleton className="h-3 w-40" />
            </div>
          ))}
        </div>

        <div className="grid gap-3 md:gap-4 lg:grid-cols-2">
          {[...Array(2)].map((_, i) => (
            <div
              key={i}
              className="rounded-lg border bg-card p-4 md:p-6 shadow-sm"
            >
              <Skeleton className="h-6 w-48 mb-6" />
              <Skeleton className="h-64 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="text-center space-y-4 max-w-md">
          <div className="flex justify-center">
            <div className="rounded-full bg-destructive/10 p-3">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-1">
              Failed to load dashboard
            </h3>
            <p className="text-sm text-muted-foreground">
              {error || "Unable to fetch dashboard data. Please try again."}
            </p>
          </div>
          <Button onClick={fetchDashboardData} variant="outline">
            <Loader2 className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const chartData = getChartData();
  const overview = dashboardData.overview || {};
  const totalBookings = overview.totalBookings ?? 0;
  const totalUsers = overview.totalUsers ?? 0;
  const recentUsers = overview.recentUsers ?? 0;
  const totalReviews = overview.totalReviews ?? 0;
  const averageRating = overview.averageRating ?? 0;

  const bookingsByStatus = overview.bookingsByStatus || {
    active: 0,
    completed: 0,
    cancelled: 0,
    pending: 0,
    confirmed: 0,
  };

  const {
    active: activeBookings,
    completed: completedBookings,
    cancelled: cancelledBookings,
    pending: pendingBookings,
    confirmed: confirmedBookings,
  } = bookingsByStatus;

  return (
    <div className="p-2 md:p-3 lg:p-4 space-y-3 md:space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 md:gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            Overview of your turf booking business
          </p>
        </div>
        <div className="text-xs md:text-sm text-muted-foreground">
          {new Date().toLocaleDateString("en-IN", {
            weekday: "short",
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </div>
      </div>

      <div className="grid gap-3 md:gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Bookings
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalBookings}</div>
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Hourglass className="h-3 w-3" />
                  Pending
                </span>
                <span className="font-medium">{pendingBookings}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <BadgeCheck className="h-3 w-3" />
                  Confirmed
                </span>
                <span className="font-medium">{confirmedBookings}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  Active
                </span>
                <span className="font-medium">{activeBookings}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Booking Status
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {completedBookings}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Completed</p>
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <XCircle className="h-3 w-3" />
                  Cancelled
                </span>
                <span className="font-medium text-red-600">
                  {cancelledBookings}
                </span>
              </div>
              <div className="mt-2 pt-2 border-t">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Success Rate</span>
                  <span className="font-medium">
                    {totalBookings > 0
                      ? Math.round((completedBookings / totalBookings) * 100)
                      : 0}
                    %
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Users & Reviews
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground mt-1">Total Users</p>
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Recent Users</span>
                <span className="font-medium">{recentUsers}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total Reviews</span>
                <span className="font-medium">{totalReviews}</span>
              </div>
              <div className="flex items-center justify-between text-sm pt-2 border-t">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  Avg Rating
                </span>
                <span className="font-medium">
                  {averageRating.toFixed(1)} / 5.0
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* FIX: Removed mobile gap and will add margin to the child element instead */}
      <div className="grid lg:grid-cols-2 lg:gap-4 gap-y-8">
        {/* Left: Revenue Analytics */}
        <div className="space-y-3 md:space-y-4 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <h2 className="text-base md:text-lg font-semibold">
              Revenue Analytics
            </h2>
            <Select value={timePeriod} onValueChange={setTimePeriod}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="last7Days">Last 7 Days</SelectItem>
                <SelectItem value="currentWeek">This Week</SelectItem>
                <SelectItem value="last5Weeks">Last 5 Weeks</SelectItem>
                <SelectItem value="thisMonth">This Month</SelectItem>
                <SelectItem value="thisYear">This Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <EarningsChart
            title={chartData.title}
            description={chartData.description}
            data={chartData.data}
            totalEarnings={chartData.totalEarnings}
          />
        </div>

        {/* Right: Status Distribution */}
        <div className="mt-1 sm:mt-8 lg:mt-0 space-y-3 md:space-y-4 min-w-0">
          <h2 className="hidden sm:block text-base md:text-lg font-semibold">
            Status Distribution
          </h2>
          <BookingsStatusChart data={bookingsByStatus} />
        </div>
      </div>
    </div>
  );
}
