"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell, PieChart, Pie, Legend } from "recharts";
import { TurfPerformance, CustomerSegment, PeakHour } from "@/types/analytics";

export function TopTurfsChart({ data }: { data?: TurfPerformance[] }) {
    if (!data || data.length === 0) return (
       <div className="col-span-1 min-h-[300px] flex items-center justify-center text-muted-foreground rounded-xl border bg-card text-card-foreground shadow-sm p-6">
         No data available for Top Turfs
       </div>
    );
  
  const formattedData = data.slice(0, 5).map(t => ({
      ...t,
      revenue: parseFloat(t.revenue) || 0
  }));

  return (
    <div className="col-span-1 rounded-xl border bg-card text-card-foreground shadow-sm p-6 h-full flex flex-col">
      <div className="space-y-1 pb-4">
        <h3 className="font-semibold leading-none tracking-tight">Top Performing Turfs</h3>
         <p className="text-sm text-muted-foreground">By revenue generated.</p>
      </div>
      <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
            <BarChart data={formattedData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="turf_name" type="category" width={100} tick={{fontSize: 12}} />
                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={20} />
            </BarChart>
            </ResponsiveContainer>
      </div>
    </div>
  );
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"];

export function CustomerSegmentsChart({ data }: { data?: CustomerSegment[] }) {
    if (!data || data.length === 0) return (
        <div className="col-span-1 min-h-[300px] flex items-center justify-center text-muted-foreground rounded-xl border bg-card text-card-foreground shadow-sm p-6">
             No customer segmentation data
        </div>
    );

    const formattedData = data.map(d => ({
        ...d,
        user_count: parseInt(d.user_count) || 0
    }));

    return (
        <div className="col-span-1 rounded-xl border bg-card text-card-foreground shadow-sm p-6 h-full flex flex-col">
            <div className="space-y-1 pb-4">
                <h3 className="font-semibold leading-none tracking-tight">Customer Segments</h3>
                 <p className="text-sm text-muted-foreground">Distribution by RFM Analysis.</p>
            </div>
            <div className="flex-1 min-h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={formattedData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                // @ts-ignore
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="user_count"
                                nameKey="customer_segment"
                            >
                                {formattedData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
             </div>
        </div>
    )
}

export function PeakHoursChart({ data }: { data?: PeakHour[] }) {
    if (!data || data.length === 0) return (
         <div className="col-span-1 min-h-[300px] flex items-center justify-center text-muted-foreground rounded-xl border bg-card text-card-foreground shadow-sm p-6">
             No peak hours data
        </div>
    );
    
    // Aggregate by hour for simplicity in this view
    const hourlyData = data.reduce((acc, curr) => {
        const hour = Number(curr.hour_of_day);
        const existing = acc.find(item => item.hour_of_day === hour);
        if (existing) {
            existing.booking_count += Number(curr.booking_count);
        } else {
            acc.push({ hour_of_day: hour, booking_count: Number(curr.booking_count) });
        }
        return acc;
    }, [] as {hour_of_day: number, booking_count: number}[]).sort((a,b) => a.hour_of_day - b.hour_of_day);

    return (
        <div className="col-span-1 rounded-xl border bg-card text-card-foreground shadow-sm p-6 h-full flex flex-col">
            <div className="space-y-1 pb-4">
                <h3 className="font-semibold leading-none tracking-tight">Peak Booking Hours</h3>
                <p className="text-sm text-muted-foreground">Total bookings by hour of day.</p>
            </div>
            <div className="flex-1 min-h-[250px]">
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={hourlyData}>
                        <XAxis dataKey="hour_of_day" tickFormatter={(val) => `${val}:00`}/>
                        <YAxis />
                        <Tooltip cursor={{fill: 'transparent'}} contentStyle={{  borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                        <Bar dataKey="booking_count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                 </ResponsiveContainer>
            </div>
        </div>
    )

}
