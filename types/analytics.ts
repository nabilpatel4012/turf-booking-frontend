export interface DailyRevenue {
  booking_date: string;
  total_bookings: number;
  completed_bookings: number;
  cancelled_bookings: number;
  revenue: number;
  avg_booking_value: number;
  cancellation_rate: number;
  revenue_7d_ma: number;
}

export interface MonthlyRevenue {
  month: string;
  bookings: number;
  revenue: number;
  unique_customers: number;
  unique_turfs: number;
  avg_revenue_per_booking: number;
  revenue_growth_pct: number;
  booking_growth_pct: number;
}

export interface TurfPerformance {
  turf_name: string;
  total_bookings: number;
  completed_bookings: number;
  revenue: number;
  avg_booking_value: number;
  avg_rating: number;
  review_count: number;
  occupied_slots: number;
  utilization_rate_pct: number;
  revenue_rank: number;
}

export interface PeakHour {
  hour_of_day: number;
  day_of_week: number;
  day_name: string;
  booking_count: number;
  revenue: number;
  avg_value: number;
}

export interface CustomerSegment {
  customer_segment: "Champions" | "Loyalists" | "Potential Loyalists" | "Hibernating" | "At Risk" | "Others";
  user_count: number;
  avg_ltv: number;
  total_bookings: number;
}

export interface BookingForecast {
    ds: string;
    yhat: number;
    yhat_lower: number; 
    yhat_upper: number;
}

export interface KPIOverview {
    totalRevenue: number;
    totalBookings: number;
    avgBookingValue: number;
    utilizationRate: number;
    activeTurfs: number;
    totalCustomers: number;
}
