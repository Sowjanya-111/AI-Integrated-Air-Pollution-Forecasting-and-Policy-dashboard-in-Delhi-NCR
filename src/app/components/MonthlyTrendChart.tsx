import { Card } from "./ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Line, ComposedChart } from "recharts";
import { useMonthlyTrend } from "../../hooks/useApiData";
import { Skeleton } from "./ui/skeleton";
import { Badge } from "./ui/badge";

export function MonthlyTrendChart() {
  const { data: monthlyData, loading, isUsingMockData } = useMonthlyTrend();

  if (loading) {
    return (
      <Card className="p-6">
        <Skeleton className="h-6 w-48 mb-2" />
        <Skeleton className="h-4 w-64 mb-4" />
        <Skeleton className="h-80 w-full" />
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold">Monthly Air Quality Trends</h3>
          <p className="text-sm text-muted-foreground">Last 7 months average AQI and PM2.5 levels</p>
        </div>
        {isUsingMockData && (
          <Badge variant="outline" className="text-xs text-yellow-600 border-yellow-300">
            Demo Data
          </Badge>
        )}
      </div>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis 
              dataKey="month" 
              tick={{ fill: 'var(--muted-foreground)' }}
              fontSize={12}
              axisLine={{ stroke: 'var(--border)' }}
              tickLine={{ stroke: 'var(--border)' }}
            />
            <YAxis 
              yAxisId="left"
              tick={{ fill: 'var(--muted-foreground)' }}
              fontSize={12}
              axisLine={{ stroke: 'var(--border)' }}
              tickLine={{ stroke: 'var(--border)' }}
              label={{ value: 'AQI', angle: -90, position: 'insideLeft', fill: 'var(--muted-foreground)' }}
            />
            <YAxis 
              yAxisId="right"
              orientation="right"
              tick={{ fill: 'var(--muted-foreground)' }}
              fontSize={12}
              axisLine={{ stroke: 'var(--border)' }}
              tickLine={{ stroke: 'var(--border)' }}
              label={{ value: 'PM2.5 (μg/m³)', angle: 90, position: 'insideRight', fill: 'var(--muted-foreground)' }}
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
            <Bar 
              yAxisId="left"
              dataKey="avgAQI" 
              fill="var(--chart-1)" 
              name="Average AQI"
              radius={[8, 8, 0, 0]}
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="pm25" 
              stroke="var(--chart-2)" 
              strokeWidth={3}
              dot={{ fill: "var(--chart-2)", r: 5 }}
              name="PM2.5"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
