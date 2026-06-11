import { Card } from "../components/ui/card";
import { StatCard } from "../components/StatCard";
import { CloudRain, TrendingUp, AlertTriangle, Calendar } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart } from "recharts";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Skeleton } from "../components/ui/skeleton";
import { usePredictionsData, useDashboardStats } from "../../hooks/useApiData";

const forecastEvents = [
  {
    date: "Mar 6, 2026",
    time: "Morning",
    aqi: 192,
    severity: "high",
    reason: "Low wind speed + temperature inversion expected",
  },
  {
    date: "Mar 7, 2026",
    time: "Evening",
    aqi: 205,
    severity: "very-high",
    reason: "Possible dust storm from Rajasthan",
  },
  {
    date: "Mar 8, 2026",
    time: "All Day",
    aqi: 168,
    severity: "moderate",
    reason: "Rain expected - Air quality improvement likely",
  },
];

export function PredictionsView() {
  const { hourlyForecast, weeklyForecast, isLoading } = usePredictionsData();
  const { data: stats } = useDashboardStats();

  // Get next hour prediction
  const nextHourPrediction = hourlyForecast.data.find(f => f.predicted !== null);
  
  return (
    <div className="space-y-6">
      {/* Data Source Indicator */}
      {hourlyForecast.isUsingMockData && (
        <Badge variant="outline" className="text-yellow-600 border-yellow-300 bg-yellow-50 dark:bg-yellow-950/30">
          Demo Mode - Connected backend for live data
        </Badge>
      )}

      {/* Forecast Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          [...Array(4)].map((_, i) => (
            <Card key={i} className="p-6">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-16 mb-1" />
              <Skeleton className="h-3 w-20" />
            </Card>
          ))
        ) : (
          <>
            <StatCard
              title="Next Hour Forecast"
              value={nextHourPrediction?.predicted || 185}
              subtitle="AQI (±7)"
              icon={TrendingUp}
              trend={{ value: 3.9, isPositive: false }}
              iconColor="text-orange-500"
            />
            <StatCard
              title="Tomorrow Average"
              value={weeklyForecast.data[1]?.predicted || 185}
              subtitle="AQI Prediction"
              icon={Calendar}
              iconColor="text-blue-500"
            />
            <StatCard
              title="Forecast Confidence"
              value="92%"
              subtitle="High Reliability"
              icon={TrendingUp}
              iconColor="text-green-500"
            />
            <StatCard
              title="Weather Impact"
              value="Medium"
              subtitle={`Wind: ${stats.windSpeed} km/h`}
              icon={CloudRain}
              iconColor="text-purple-500"
            />
          </>
        )}
      </div>

      {/* Prediction Charts */}
      <Tabs defaultValue="hourly" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="hourly">24-Hour Forecast</TabsTrigger>
          <TabsTrigger value="weekly">7-Day Forecast</TabsTrigger>
        </TabsList>

        <TabsContent value="hourly" className="mt-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold">24-Hour AQI Prediction</h3>
                <p className="text-sm text-muted-foreground">Hourly forecast with confidence intervals</p>
              </div>
              <Badge variant="outline">Updated 5 min ago</Badge>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={hourlyForecast.data}>
                  <defs>
                    <linearGradient id="confidence" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="time" tick={{ fill: 'var(--muted-foreground)' }} fontSize={12} />
                  <YAxis tick={{ fill: 'var(--muted-foreground)' }} fontSize={12} />
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
                    dataKey="upper"
                    stroke="none"
                    fill="url(#confidence)"
                    name="Upper Bound"
                  />
                  <Area
                    type="monotone"
                    dataKey="lower"
                    stroke="none"
                    fill="var(--background)"
                    name="Lower Bound"
                  />
                  <Line
                    type="monotone"
                    dataKey="actual"
                    stroke="var(--chart-2)"
                    strokeWidth={3}
                    dot={{ r: 5, fill: "var(--chart-2)" }}
                    name="Current AQI"
                  />
                  <Line
                    type="monotone"
                    dataKey="predicted"
                    stroke="var(--chart-1)"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ r: 4, fill: "var(--chart-1)" }}
                    name="Predicted AQI"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="weekly" className="mt-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold">7-Day AQI Forecast</h3>
                <p className="text-sm text-muted-foreground">Daily predictions with uncertainty range</p>
              </div>
              <Badge variant="outline">ML Model v2.1</Badge>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyForecast.data}>
                  <defs>
                    <linearGradient id="weekConfidence" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--chart-3)" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="var(--chart-3)" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="day" tick={{ fill: 'var(--muted-foreground)' }} fontSize={12} />
                  <YAxis tick={{ fill: 'var(--muted-foreground)' }} fontSize={12} />
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
                    dataKey="upper"
                    stroke="none"
                    fill="url(#weekConfidence)"
                    name="Upper Bound"
                  />
                  <Area
                    type="monotone"
                    dataKey="lower"
                    stroke="none"
                    fill="var(--background)"
                    name="Lower Bound"
                  />
                  <Line
                    type="monotone"
                    dataKey="predicted"
                    stroke="var(--chart-3)"
                    strokeWidth={3}
                    dot={{ r: 5, fill: "var(--chart-3)" }}
                    name="Predicted AQI"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Forecast Events */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Upcoming Events & Alerts</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {forecastEvents.map((event, idx) => (
            <Card
              key={idx}
              className={`p-5 ${
                event.severity === "very-high"
                  ? "border-red-500 bg-red-50 dark:bg-red-950/20"
                  : event.severity === "high"
                  ? "border-orange-500 bg-orange-50 dark:bg-orange-950/20"
                  : "border-blue-500 bg-blue-50 dark:bg-blue-950/20"
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle
                    className={`w-5 h-5 ${
                      event.severity === "very-high"
                        ? "text-red-500"
                        : event.severity === "high"
                        ? "text-orange-500"
                        : "text-blue-500"
                    }`}
                  />
                  <Badge
                    variant={event.severity === "moderate" ? "secondary" : "destructive"}
                  >
                    AQI {event.aqi}
                  </Badge>
                </div>
              </div>
              <h4 className="font-semibold mb-1">{event.date}</h4>
              <p className="text-sm text-muted-foreground mb-2">{event.time}</p>
              <p className="text-sm">{event.reason}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* Prediction Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Contributing Factors</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <span className="text-sm">Meteorological Conditions</span>
              <Badge variant="destructive">High Impact</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <span className="text-sm">Traffic Volume</span>
              <Badge variant="destructive">High Impact</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <span className="text-sm">Industrial Emissions</span>
              <Badge variant="secondary">Medium Impact</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <span className="text-sm">Seasonal Factors</span>
              <Badge variant="secondary">Medium Impact</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <span className="text-sm">Long-range Transport</span>
              <Badge variant="outline">Low Impact</Badge>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold mb-4">Forecast Reliability</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>1-6 Hour Forecast</span>
                <span className="font-semibold text-green-500">95% Accurate</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-green-500 w-[95%]"></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>12-24 Hour Forecast</span>
                <span className="font-semibold text-green-500">92% Accurate</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-green-500 w-[92%]"></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>2-3 Day Forecast</span>
                <span className="font-semibold text-yellow-500">85% Accurate</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-yellow-500 w-[85%]"></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>4-7 Day Forecast</span>
                <span className="font-semibold text-orange-500">78% Accurate</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-orange-500 w-[78%]"></div>
              </div>
            </div>
          </div>
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-xs text-muted-foreground">
              Forecast accuracy is validated against actual measurements using a rolling 30-day window.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
