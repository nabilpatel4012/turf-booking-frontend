export interface DailyRevenue {
  booking_date: string;
  total_bookings: string;
  completed_bookings: string;
  cancelled_bookings: string;
  revenue: string;
  avg_booking_value: string | null;
  cancellation_rate: string;
  revenue_7d_ma: string;
}

export interface MonthlyRevenue {
  month: string;
  bookings: string;
  revenue: string;
  unique_customers: string;
  unique_turfs: string;
  avg_revenue_per_booking: string;
  revenue_growth_pct: string | null;
  booking_growth_pct: string | null;
}

export interface TurfPerformance {
  turf_name: string;
  total_bookings: string;
  completed_bookings: string;
  revenue: string;
  avg_booking_value: string;
  avg_rating: string | null;
  review_count: string;
  occupied_slots: string;
  utilization_rate_pct: string;
  revenue_rank: string;
}

export interface PeakHour {
  hour_of_day: string | number;
  day_of_week: string | number;
  day_name: string;
  booking_count: string;
  revenue: string;
  avg_value: string | null;
}

export interface CustomerSegment {
  customer_segment: "Champions" | "Loyal Customers" | "Promising" | "At Risk" | "Hibernating" | "Big Spenders" | "Regular";
  customer_count: string;
  avg_total_spent: string;
  avg_bookings: string;
  avg_days_since_last_booking: string;
}

export interface BookingForecast {
    ds: string;
    yhat: number;
    yhat_lower: number; 
    yhat_upper: number;
}

export interface KPIOverview {
    revenue_l30d: string;
    bookings_l30d: string;
    bookings_prev_30d: string;
    revenue_prev_30d: string | null;
    active_customers_l30d: string;
    active_customers_prev_30d: string;
    completion_rate_l30d: string;
    cancellation_rate_l30d: string;
    avg_booking_value_l30d: string;
}
