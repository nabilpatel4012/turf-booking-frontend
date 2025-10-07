"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface EarningsChartProps {
  title: string;
  description: string;
  data: Array<{
    day?: string;
    week?: string;
    month?: string;
    earnings: number;
  }>;
  totalEarnings: number;
}

export function EarningsChart({
  title,
  description,
  data,
  totalEarnings,
}: EarningsChartProps) {
  const chartData = data.map((item) => ({
    name: item.day || item.week || item.month || "",
    earnings: item.earnings,
  }));

  return (
    // FIX: Added 'overflow-hidden' to clip the chart content and prevent it from spilling out.
    <Card className="overflow-hidden flex flex-col">
      <CardHeader className="p-4 md:p-6 flex-shrink-0">
        <CardTitle className="text-base md:text-lg">{title}</CardTitle>
        <CardDescription className="text-xs md:text-sm">
          {description}
        </CardDescription>
        <div className="text-2xl md:text-3xl font-bold mt-2">
          ₹{totalEarnings.toLocaleString("en-IN")}
        </div>
      </CardHeader>

      {/* FIX: Removed flex-1 and min-h-0, added a fixed height wrapper */}
      <CardContent className="p-2 md:p-6 pt-0">
        <div className="h-[250px] md:h-[300px] w-full">
          <ChartContainer
            config={{
              earnings: {
                label: "Earnings",
                color: "hsl(var(--chart-1))",
              },
            }}
            className="h-full w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{
                  top: 10,
                  right: 10,
                  left: 0,
                  bottom: 40,
                }}
              >
                <defs>
                  <linearGradient
                    id="colorEarnings"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor="hsl(var(--chart-1))"
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor="hsl(var(--chart-1))"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="name"
                  className="text-[9px] sm:text-[10px] md:text-xs"
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                  angle={-45}
                  textAnchor="end"
                  height={50}
                  interval="preserveStartEnd"
                />
                <YAxis
                  className="text-[9px] sm:text-[10px] md:text-xs"
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                  tickFormatter={(value) =>
                    `₹${value >= 1000 ? `${value / 1000}k` : value}`
                  }
                  width={45}
                />
                <ChartTooltip
                  cursor={{ fill: "hsl(var(--muted))", opacity: 0.3 }}
                  content={<ChartTooltipContent />}
                />
                <Area
                  type="monotone"
                  dataKey="earnings"
                  stroke="hsl(var(--chart-1))"
                  fillOpacity={1}
                  fill="url(#colorEarnings)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}
