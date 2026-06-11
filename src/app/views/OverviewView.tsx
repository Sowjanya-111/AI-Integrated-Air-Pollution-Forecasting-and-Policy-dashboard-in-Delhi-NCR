import { useState, useEffect } from "react";
import { StatCard } from "../components/StatCard";
import { DelhiMap } from "../components/DelhiMap";
import { WeeklyTrendChart } from "../components/WeeklyTrendChart";
import { MonthlyTrendChart } from "../components/MonthlyTrendChart";
import { AQIGauge } from "../components/AQIGauge";
import { PollutantCard } from "../components/PollutantCard";
import { SystemStatus } from "../components/SystemStatus";
import { InfoBanner } from "../components/InfoBanner";
import { 
  Wind, Droplets, Thermometer, Eye, Calendar, TrendingUp, 
  Activity, RefreshCw, Clock, AlertTriangle, ChevronRight,
  ArrowUpRight, ArrowDownRight, Zap, Target, Gauge
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Progress } from "../components/ui/progress";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { useDashboardStats, usePollutants, useAQIDistribution, useAlerts } from "../../hooks/useApiData";
import { Skeleton } from "../components/ui/skeleton";

// Real-time clock component
function LiveClock() {
  const [time, setTime] = useState(new Date());
  
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex items-center gap-2 text-sm">
      <Clock className="w-4 h-4 text-muted-foreground" />
      <span className="tabular-nums font-medium">
        {time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
      </span>
    </div>
  );
}

// Animated AQI Display
function AnimatedAQI({ value }: { value: number }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    const duration = 1500;
    const increment = end / (duration / 16);

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setDisplayValue(end);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [value]);

  return <span className="tabular-nums">{displayValue}</span>;
}

export function OverviewView() {
  const { data: stats, loading: statsLoading, isUsingMockData, refetch: refetchStats } = useDashboardStats();
  const { data: pollutants, loading: pollutantsLoading } = usePollutants();
  const { data: distribution } = useAQIDistribution();
  const { data: alerts } = useAlerts();
  const [selectedView, setSelectedView] = useState<'charts' | 'map'>('charts');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetchStats();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  // Get critical alerts
  const criticalAlerts = alerts.filter(a => a.severity === 'CRITICAL' || a.severity === 'HIGH');

  // Calculate health risk level
  const getHealthRisk = (aqi: number) => {
    if (aqi <= 50) return { level: 'Low', color: 'text-green-500', bg: 'bg-green-500' };
    if (aqi <= 100) return { level: 'Moderate', color: 'text-yellow-500', bg: 'bg-yellow-500' };
    if (aqi <= 150) return { level: 'High', color: 'text-orange-500', bg: 'bg-orange-500' };
    if (aqi <= 200) return { level: 'Very High', color: 'text-red-500', bg: 'bg-red-500' };
    return { level: 'Severe', color: 'text-purple-500', bg: 'bg-purple-500' };
  };

  const healthRisk = getHealthRisk(stats.currentAQI);

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
            Air Quality Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">Real-time monitoring for Delhi-NCR region</p>
        </div>
        <div className="flex items-center gap-3">
          <LiveClock />
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          {isUsingMockData && (
            <Badge variant="outline" className="text-yellow-600 border-yellow-300 bg-yellow-50 dark:bg-yellow-950/30">
              Demo Mode
            </Badge>
          )}
        </div>
      </div>

      {/* Critical Alerts Banner */}
      {criticalAlerts.length > 0 && (
        <Card className="border-red-500/50 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-red-500/20 animate-pulse">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-red-600 dark:text-red-400">
                  {criticalAlerts.length} Active Alert{criticalAlerts.length > 1 ? 's' : ''}
                </p>
                <p className="text-sm text-muted-foreground">{criticalAlerts[0]?.title}</p>
              </div>
              {/* <Button variant="ghost" size="sm" className="gap-1 text-red-600">
                View All <ChevronRight className="w-4 h-4" />
              </Button> */}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Large AQI Display */}
        <Card className="lg:col-span-1 overflow-hidden">
          <div className="relative h-full">
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-cyan-500/5 to-transparent" />
            <CardContent className="p-6 relative">
              <div className="flex items-center justify-between mb-4">
                <Badge variant="secondary" className="gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  Live
                </Badge>
                <Gauge className="w-5 h-5 text-muted-foreground" />
              </div>
              
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">Current AQI</p>
                {statsLoading ? (
                  <Skeleton className="h-16 w-24 mx-auto" />
                ) : (
                  <p className={`text-6xl font-bold ${healthRisk.color}`}>
                    <AnimatedAQI value={stats.currentAQI} />
                  </p>
                )}
                <Badge className={`${healthRisk.bg} text-white`}>
                  {stats.aqiCategory}
                </Badge>
              </div>

              <div className="mt-6 space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Health Risk</span>
                  <span className={`font-semibold ${healthRisk.color}`}>{healthRisk.level}</span>
                </div>
                <Progress 
                  value={Math.min((stats.currentAQI / 300) * 100, 100)} 
                  className="h-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0 (Good)</span>
                  <span>300+ (Hazardous)</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-6 pt-4 border-t">
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <p className="text-xl font-bold">{stats.avgAQI24h}</p>
                  <p className="text-xs text-muted-foreground">24h Avg</p>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <p className="text-xl font-bold">{stats.unhealthyDaysPercentage}%</p>
                  <p className="text-xs text-muted-foreground">Unhealthy Days</p>
                </div>
              </div>
            </CardContent>
          </div>
        </Card>

        {/* Weather & Environment Stats */}
        <div className="lg:col-span-3 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {statsLoading ? (
            [...Array(4)].map((_, i) => (
              <Card key={i} className="p-4">
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-8 w-16 mb-1" />
                <Skeleton className="h-3 w-12" />
              </Card>
            ))
          ) : (
            <>
              <StatCard
                title="Temperature"
                value={`${stats.temperature}°C`}
                subtitle="Comfortable"
                icon={Thermometer}
                iconColor="text-orange-500"
                trend={{ value: 2, isPositive: true }}
              />
              <StatCard
                title="Humidity"
                value={`${stats.humidity}%`}
                subtitle="Moderate"
                icon={Droplets}
                iconColor="text-blue-500"
              />
              <StatCard
                title="Wind Speed"
                value={`${stats.windSpeed} km/h`}
                subtitle={stats.windDirection}
                icon={Wind}
                iconColor="text-teal-500"
                trend={{ value: 5, isPositive: true }}
              />
              <StatCard
                title="Visibility"
                value={`${stats.visibility} km`}
                subtitle="Poor"
                icon={Eye}
                iconColor="text-purple-500"
                trend={{ value: 15, isPositive: false }}
              />
            </>
          )}
        </div>
      </div>

      {/* Map Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <DelhiMap />
        </div>

        {/* Quick Stats Panel */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="w-5 h-5 text-teal-500" />
              Quick Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Peak Hours */}
            <div className="p-4 rounded-lg bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30 border border-orange-200 dark:border-orange-800">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-orange-500" />
                <div>
                  <p className="font-semibold text-sm">Peak Pollution Hours</p>
                  <p className="text-xs text-muted-foreground">6:00 AM - 10:00 AM</p>
                </div>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Expected AQI</span>
                <Badge variant="destructive">195+</Badge>
              </div>
            </div>

            {/* Trend Indicator */}
            <div className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="font-semibold text-sm">Today's Trend</p>
                  <p className="text-xs text-muted-foreground">Compared to yesterday</p>
                </div>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <ArrowDownRight className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium text-green-500">8.5% improvement</span>
              </div>
            </div>

            {/* Model Prediction */}
            <div className="p-4 rounded-lg bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border border-purple-200 dark:border-purple-800">
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-purple-500" />
                <div>
                  <p className="font-semibold text-sm">ML Prediction</p>
                  <p className="text-xs text-muted-foreground">Next 6 hours</p>
                </div>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Predicted AQI</span>
                <span className="font-bold text-orange-500">185 - 195</span>
              </div>
            </div>

            {/* Worst Pollutant */}
            <div className="p-4 rounded-lg bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/30 border border-red-200 dark:border-red-800">
              <div className="flex items-center gap-3">
                <Target className="w-5 h-5 text-red-500" />
                <div>
                  <p className="font-semibold text-sm">Primary Pollutant</p>
                  <p className="text-xs text-muted-foreground">PM2.5 - Particulate Matter</p>
                </div>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Current Level</span>
                <span className="font-bold text-red-500">98 ug/m3</span>
              </div>
              <Progress value={98/60 * 100} className="h-1.5 mt-2" />
              <p className="text-[10px] text-muted-foreground mt-1">163% above safe limit (60 ug/m3)</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <Tabs defaultValue="weekly" className="w-full">
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="weekly">Weekly Trend</TabsTrigger>
            <TabsTrigger value="monthly">Monthly Overview</TabsTrigger>
            <TabsTrigger value="distribution">AQI Distribution</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="weekly" className="mt-0">
          <WeeklyTrendChart />
        </TabsContent>

        <TabsContent value="monthly" className="mt-0">
          <MonthlyTrendChart />
        </TabsContent>

        <TabsContent value="distribution" className="mt-0">
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Air Quality Distribution - Last 30 Days</h3>
            <p className="text-sm text-muted-foreground mb-6">Days by AQI category this month</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                {distribution.map((item, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: item.color }}
                        />
                        {item.category}
                      </span>
                      <span className="font-semibold">{item.days} days</span>
                    </div>
                    <Progress 
                      value={(item.days / 30) * 100} 
                      className="h-3"
                      style={{ '--progress-color': item.color } as React.CSSProperties}
                    />
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-950 dark:to-red-950 border-4 border-orange-500">
                    <div>
                      <p className="text-3xl font-bold text-orange-500">15</p>
                      <p className="text-xs text-muted-foreground">Unhealthy+</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    50% of days had unhealthy or worse air quality
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Pollutants Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Individual Pollutant Levels</h2>
          <Badge variant="outline" className="text-xs">
            Updated just now
          </Badge>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {pollutantsLoading ? (
            [...Array(6)].map((_, i) => (
              <Card key={i} className="p-4">
                <Skeleton className="h-4 w-16 mb-3" />
                <Skeleton className="h-8 w-20 mb-2" />
                <Skeleton className="h-2 w-full" />
              </Card>
            ))
          ) : (
            pollutants.map((pollutant) => (
              <PollutantCard key={pollutant.name} {...pollutant} />
            ))
          )}
        </div>
      </div>

      {/* System Status */}
      <SystemStatus />
    </div>
  );
}
