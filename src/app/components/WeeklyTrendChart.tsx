import { Card } from "./ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useWeeklyTrend } from "../../hooks/useApiData";
import { Skeleton } from "./ui/skeleton";
import { Badge } from "./ui/badge";

export function WeeklyTrendChart() {
  const { data: weeklyData, loading, isUsingMockData } = useWeeklyTrend();

  if (loading) {
    return (
      <Card className="p-6">
        <Skeleton className="h-6 w-48 mb-2" />
        <Skeleton className="h-4 w-64 mb-4" />
        <Skeleton className="h-64 w-full" />
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold">7-Day AQI Trend</h3>
          <p className="text-sm text-muted-foreground">Air quality index over the past week</p>
        </div>
        {isUsingMockData && (
          <Badge variant="outline" className="text-xs text-yellow-600 border-yellow-300">
            Demo Data
          </Badge>
        )}
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={weeklyData}>
            <defs>
              <linearGradient id="colorAqi" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="colorPm25" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--chart-2)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--chart-2)" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis 
              dataKey="day" 
              tick={{ fill: 'var(--muted-foreground)' }}
              fontSize={12}
              axisLine={{ stroke: 'var(--border)' }}
              tickLine={{ stroke: 'var(--border)' }}
            />
            <YAxis 
              tick={{ fill: 'var(--muted-foreground)' }}
              fontSize={12}
              axisLine={{ stroke: 'var(--border)' }}
              tickLine={{ stroke: 'var(--border)' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                color: "var(--card-foreground)",
              }}
              labelStyle={{ color: 'var(--foreground)' }}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="aqi"
              stroke="var(--chart-1)"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorAqi)"
              name="AQI"
            />
            <Area
              type="monotone"
              dataKey="pm25"
              stroke="var(--chart-2)"
              strokeWidth={2}
              fillOpacity={0.6}
              fill="url(#colorPm25)"
              name="PM2.5"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
