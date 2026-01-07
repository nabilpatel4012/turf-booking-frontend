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
  
  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Revenue Overview</CardTitle>
         <CardDescription>
            Comparing revenue trends over time.
        </CardDescription>
      </CardHeader>
      <CardContent className="pl-2">
        <Tabs defaultValue="daily" className="space-y-4">
             <TabsList>
                <TabsTrigger value="daily">Daily</TabsTrigger>
                <TabsTrigger value="monthly">Monthly</TabsTrigger>
              </TabsList>

             <TabsContent value="daily" className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dailyData}>
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
                                                {label}
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
                    />
                  </LineChart>
                </ResponsiveContainer>
             </TabsContent>

             <TabsContent value="monthly" className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyData}>
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
                    />
                  </LineChart>
                </ResponsiveContainer>
             </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
