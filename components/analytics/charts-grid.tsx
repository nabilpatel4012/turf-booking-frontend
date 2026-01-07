"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell, PieChart, Pie, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TurfPerformance, CustomerSegment, PeakHour } from "@/types/analytics";

export function TopTurfsChart({ data }: { data?: TurfPerformance[] }) {
    if (!data || data.length === 0) return null;

  return (
    <Card className="col-span-4 md:col-span-2">
      <CardHeader>
        <CardTitle>Top Performing Turfs</CardTitle>
         <CardDescription>By revenue generated.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.slice(0, 5)} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="turf_name" type="category" width={100} tick={{fontSize: 12}} />
                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ color: 'black' }} />
                <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
            </BarChart>
            </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"];

export function CustomerSegmentsChart({ data }: { data?: CustomerSegment[] }) {
    if (!data || data.length === 0) return null;

    return (
        <Card className="col-span-4 md:col-span-2">
            <CardHeader>
                <CardTitle>Customer Segments</CardTitle>
                 <CardDescription>Distribution by RFM Analysis.</CardDescription>
            </CardHeader>
            <CardContent>
                 <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data as any}
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
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                 </div>
            </CardContent>
        </Card>
    )
}

export function PeakHoursChart({ data }: { data?: PeakHour[] }) {
    if (!data || data.length === 0) return null;
    
    // Aggregate by hour for simplicity in this view
    const hourlyData = data.reduce((acc, curr) => {
        const existing = acc.find(item => item.hour_of_day === curr.hour_of_day);
        if (existing) {
            existing.booking_count += Number(curr.booking_count);
        } else {
            acc.push({ hour_of_day: curr.hour_of_day, booking_count: Number(curr.booking_count) });
        }
        return acc;
    }, [] as {hour_of_day: number, booking_count: number}[]).sort((a,b) => a.hour_of_day - b.hour_of_day);

    return (
        <Card className="col-span-4">
            <CardHeader>
                <CardTitle>Peak Booking Hours</CardTitle>
                <CardDescription>Total bookings by hour of day.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[250px]">
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={hourlyData}>
                        <XAxis dataKey="hour_of_day" tickFormatter={(val) => `${val}:00`}/>
                        <YAxis />
                        <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ color: 'black' }} />
                        <Bar dataKey="booking_count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                 </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )

}
