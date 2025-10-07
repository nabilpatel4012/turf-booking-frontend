"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface BookingsStatusChartProps {
  data?: {
    active: number;
    completed: number;
    cancelled?: number;
    confirmed?: number;
    pending?: number;
  } | null;
}

const STATUS_COLORS = {
  pending: "#FBBF24",
  active: "#3B82F6",
  confirmed: "#14B8A6",
  completed: "#22C55E",
  cancelled: "#EF4444",
};

export function BookingsStatusChart({ data }: BookingsStatusChartProps) {
  const safeData = {
    active: data?.active ?? 0,
    completed: data?.completed ?? 0,
    cancelled: data?.cancelled ?? 0,
    confirmed: data?.confirmed ?? 0,
    pending: data?.pending ?? 0,
  };

  const chartData = [
    { name: "Pending", value: safeData.pending, color: STATUS_COLORS.pending },
    { name: "Active", value: safeData.active, color: STATUS_COLORS.active },
    {
      name: "Confirmed",
      value: safeData.confirmed,
      color: STATUS_COLORS.confirmed,
    },
    {
      name: "Completed",
      value: safeData.completed,
      color: STATUS_COLORS.completed,
    },
    ...(safeData.cancelled > 0
      ? [
          {
            name: "Cancelled",
            value: safeData.cancelled,
            color: STATUS_COLORS.cancelled,
          },
        ]
      : []),
  ].filter((item) => item.value > 0);

  const hasData = chartData.length > 0;

  if (!hasData) {
    return (
      <Card className="overflow-hidden h-full flex flex-col">
        <CardHeader className="p-4 md:p-6">
          <CardTitle className="text-base md:text-lg">
            Bookings by Status
          </CardTitle>
          <CardDescription className="text-xs md:text-sm">
            Distribution of booking statuses
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[250px] md:h-[300px] p-4 md:p-6 flex-1">
          <p className="text-muted-foreground text-xs md:text-sm text-center">
            No booking data available to display a chart.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <CardHeader className="p-4 md:p-6">
        <CardTitle className="text-base md:text-lg">
          Bookings by Status
        </CardTitle>
        <CardDescription className="text-xs md:text-sm">
          Distribution of booking statuses
        </CardDescription>
      </CardHeader>

      <CardContent className="p-4 md:p-6 pt-0 flex-1 flex items-center">
        <div className="flex flex-col items-center justify-center gap-4 lg:flex-row lg:gap-8 w-full">
          <div className="h-[220px] sm:h-[250px] md:h-[300px] w-full max-w-[260px] mx-auto">
            <ChartContainer
              config={{
                pending: { label: "Pending", color: STATUS_COLORS.pending },
                active: { label: "Active", color: STATUS_COLORS.active },
                confirmed: {
                  label: "Confirmed",
                  color: STATUS_COLORS.confirmed,
                },
                completed: {
                  label: "Completed",
                  color: STATUS_COLORS.completed,
                },
                cancelled: {
                  label: "Cancelled",
                  color: STATUS_COLORS.cancelled,
                },
              }}
              className="h-full w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <ChartTooltip
                    content={<ChartTooltipContent nameKey="name" hideLabel />}
                  />
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    nameKey="name"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>

          {/* Legend section */}
          <div className="space-y-2 w-full lg:w-auto">
            {chartData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div
                  className="h-3 w-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs md:text-sm text-muted-foreground">
                  {item.name}:{" "}
                  <span className="font-medium text-foreground">
                    {item.value}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
