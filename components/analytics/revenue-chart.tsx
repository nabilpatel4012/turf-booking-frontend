"use client";

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DailyRevenue, MonthlyRevenue } from "@/types/analytics";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface RevenueChartProps {
  dailyData?: DailyRevenue[];
  monthlyData?: MonthlyRevenue[];
}

export function RevenueChart({ dailyData, monthlyData }: RevenueChartProps) {
  
  const formattedDaily = dailyData?.map(d => ({
      ...d,
      revenue: parseFloat(d.revenue) || 0
  }));

  const formattedMonthly = monthlyData?.map(m => ({
      ...m,
      revenue: parseFloat(m.revenue) || 0
  }));

  return (
      <div className="col-span-1 rounded-xl border bg-card text-card-foreground shadow-sm h-full flex flex-col p-6">
        <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="space-y-1">
                <h3 className="font-semibold leading-none tracking-tight">Revenue Overview</h3>
                <p className="text-sm text-muted-foreground">Comparing revenue trends over time.</p>
            </div>
        </div>
        <div className="flex-1 pt-4 min-h-[350px]">
            <Tabs defaultValue="daily" className="space-y-4 h-full flex flex-col">
             <TabsList>
                <TabsTrigger value="daily">Daily</TabsTrigger>
                <TabsTrigger value="monthly">Monthly</TabsTrigger>
              </TabsList>

             <TabsContent value="daily" className="flex-1 h-full min-h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={formattedDaily}>
                    <XAxis
                        dataKey="booking_date"
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                         tickFormatter={(value) => {
                             const date = new Date(value as string);
                             return `${date.getDate()}/${date.getMonth() + 1}`;
                         }}
                    />
                    <YAxis
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `₹${value}`}
                    />
                     <Tooltip 
                        content={({ active, payload, label }) => {
                             if (active && payload && payload.length) {
                                return (
                                <div className="rounded-lg border bg-background p-2 shadow-sm">
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="flex flex-col">
                                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                                                Date
                                            </span>
                                            <span className="font-bold text-muted-foreground">
                                                {new Date(label as string | number).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                                                Revenue
                                            </span>
                                            <span className="font-bold">
                                                 ₹{payload[0].value}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                )
                            }
                            return null
                        }}
                     />
                     <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
             </TabsContent>

             <TabsContent value="monthly" className="flex-1 h-full min-h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={formattedMonthly}>
                     <XAxis
                        dataKey="month"
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => {
                             const date = new Date(value as string);
                             return `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
                        }}
                    />
                    <YAxis
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                         tickFormatter={(value) => `₹${value}`}
                    />
                    <Tooltip 
                        content={({ active, payload, label }) => {
                             if (active && payload && payload.length) {
                                return (
                                <div className="rounded-lg border bg-background p-2 shadow-sm">
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="flex flex-col">
                                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                                                Month
                                            </span>
                                            <span className="font-bold text-muted-foreground">
                                                {new Date(label as string).toLocaleDateString(undefined, { month: "long", year: "numeric"})}
                                            </span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                                                Revenue
                                            </span>
                                            <span className="font-bold">
                                                 ₹{payload[0].value}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                )
                            }
                            return null
                        }}
                     />
                     <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
             </TabsContent>
        </Tabs>
        </div>
      </div>
  );
}
