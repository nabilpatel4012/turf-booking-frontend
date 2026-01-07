import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KPIOverview } from "@/types/analytics";
import { DollarSign, Calendar, TrendingUp, Users, MapPin, Activity } from "lucide-react";

interface KPICardsProps {
  data: KPIOverview | null;
  loading: boolean;
}

export function KPICards({ data, loading }: KPICardsProps) {
  if (loading) {
     return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
             {[1,2,3,4,5,6].map(i => (
                 <Card key={i} className="animate-pulse">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div className="h-4 w-24 bg-muted rounded"></div>
                        <div className="h-4 w-4 bg-muted rounded"></div>
                    </CardHeader>
                    <CardContent>
                         <div className="h-8 w-20 bg-muted rounded"></div>
                    </CardContent>
                 </Card>
             ))}
        </div>
     )
  }

  if (!data) return null;

  const revenue = parseFloat(data.revenue_l30d || "0");
  const bookings = parseInt(data.bookings_l30d || "0");
  const avgValue = parseFloat(data.avg_booking_value_l30d || "0");
  const activeCustomers = parseInt(data.active_customers_l30d || "0");
  const completionRate = parseFloat(data.completion_rate_l30d || "0");
  
  // Previous period comparison logic (simplified)
  const prevRevenue = parseFloat(data.revenue_prev_30d || "0");
  const revenueGrowth = prevRevenue > 0 ? ((revenue - prevRevenue) / prevRevenue) * 100 : 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">₹{revenue.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
             {revenueGrowth !== 0 ? (
                 <span className={revenueGrowth >= 0 ? "text-green-600" : "text-red-600"}>
                     {revenueGrowth > 0 ? "+" : ""}{revenueGrowth.toFixed(1)}%
                 </span>
             ) : "No previous data"} from last month
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Monthly Bookings</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{bookings.toLocaleString()}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg Booking Value</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">₹{Math.round(avgValue)}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeCustomers}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{completionRate.toFixed(1)}%</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Cancellation Rate</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{parseFloat(data.cancellation_rate_l30d || "0").toFixed(1)}%</div>
        </CardContent>
      </Card>

    </div>
  );
}
