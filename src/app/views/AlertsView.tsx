import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Bell, AlertTriangle, AlertCircle, CheckCircle, Clock, MapPin, TrendingUp, Shield } from "lucide-react";
import { useAlerts } from "../../hooks/useApiData";
import { Skeleton } from "../components/ui/skeleton";
import type { Alert } from "../../types/api";

function AlertSkeleton() {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between mb-3">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-5 w-16" />
      </div>
      <Skeleton className="h-4 w-3/4 mb-2" />
      <Skeleton className="h-4 w-1/2" />
    </Card>
  );
}

function getAlertIcon(severity: Alert['severity']) {
  switch (severity) {
    case 'CRITICAL':
      return <AlertTriangle className="w-5 h-5 text-red-500" />;
    case 'HIGH':
      return <AlertCircle className="w-5 h-5 text-orange-500" />;
    case 'MEDIUM':
      return <Bell className="w-5 h-5 text-yellow-500" />;
    case 'LOW':
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    default:
      return <Bell className="w-5 h-5" />;
  }
}

function getAlertCardStyles(severity: Alert['severity']) {
  switch (severity) {
    case 'CRITICAL':
      return 'border-red-500 bg-red-50 dark:bg-red-950/30';
    case 'HIGH':
      return 'border-orange-500 bg-orange-50 dark:bg-orange-950/30';
    case 'MEDIUM':
      return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950/30';
    case 'LOW':
      return 'border-green-500 bg-green-50 dark:bg-green-950/30';
    default:
      return '';
  }
}

function formatTimeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  return `${diffDays} days ago`;
}

export function AlertsView() {
  const { data: alerts, loading, isUsingMockData } = useAlerts();

  const criticalAlerts = alerts.filter(a => a.severity === 'CRITICAL');
  const highAlerts = alerts.filter(a => a.severity === 'HIGH');
  const mediumAlerts = alerts.filter(a => a.severity === 'MEDIUM');
  const lowAlerts = alerts.filter(a => a.severity === 'LOW');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Active Alerts</h1>
          <p className="text-muted-foreground">Real-time air quality alerts and warnings</p>
        </div>
        <div className="flex items-center gap-2">
          {isUsingMockData && (
            <Badge variant="outline" className="text-yellow-600 border-yellow-300">
              Demo Data
            </Badge>
          )}
          <Badge variant="secondary" className="gap-1">
            <Bell className="w-3 h-3" />
            {alerts.length} Active
          </Badge>
        </div>
      </div>

      {/* Alert Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/40 dark:to-red-900/30 border-red-200 dark:border-red-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-red-500/20">
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{criticalAlerts.length}</p>
              <p className="text-xs text-muted-foreground">Critical</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/40 dark:to-orange-900/30 border-orange-200 dark:border-orange-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-orange-500/20">
              <AlertCircle className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{highAlerts.length}</p>
              <p className="text-xs text-muted-foreground">High</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950/40 dark:to-yellow-900/30 border-yellow-200 dark:border-yellow-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-yellow-500/20">
              <Bell className="w-5 h-5 text-yellow-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{mediumAlerts.length}</p>
              <p className="text-xs text-muted-foreground">Medium</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/40 dark:to-green-900/30 border-green-200 dark:border-green-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-green-500/20">
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{lowAlerts.length}</p>
              <p className="text-xs text-muted-foreground">Low</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Active Alerts List */}
      <div>
        <h2 className="text-xl font-semibold mb-4">All Active Alerts</h2>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => <AlertSkeleton key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {alerts.map((alert) => (
              <Card
                key={alert.id}
                className={`p-5 border-l-4 transition-all hover:shadow-lg ${getAlertCardStyles(alert.severity)}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getAlertIcon(alert.severity)}
                    <Badge
                      variant={alert.severity === 'CRITICAL' || alert.severity === 'HIGH' ? 'destructive' : 'secondary'}
                    >
                      {alert.severity}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      AQI {alert.aqi_value}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {formatTimeAgo(alert.triggered_at)}
                  </div>
                </div>

                <h3 className="font-semibold mb-2">{alert.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">{alert.description}</p>

                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    Anand Vihar
                  </span>
                  <span className="flex items-center gap-1">
                    {alert.alert_type === 'AQI_SPIKE' && <TrendingUp className="w-3 h-3" />}
                    {alert.alert_type === 'HEALTH_WARNING' && <Shield className="w-3 h-3" />}
                    {alert.alert_type === 'FORECAST_ALERT' && <Clock className="w-3 h-3" />}
                    {alert.alert_type.replace('_', ' ')}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Alert Response Guidelines */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 border-blue-200 dark:border-blue-800">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-500" />
          Alert Response Guidelines
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-3 bg-background/50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="font-medium text-sm">Critical</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Stay indoors. Close all windows. Use air purifiers. Avoid all outdoor activities.
            </p>
          </div>
          <div className="p-3 bg-background/50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-full bg-orange-500"></div>
              <span className="font-medium text-sm">High</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Minimize outdoor exposure. Sensitive groups should stay indoors.
            </p>
          </div>
          <div className="p-3 bg-background/50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span className="font-medium text-sm">Medium</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Reduce prolonged outdoor exertion. Monitor air quality updates.
            </p>
          </div>
          <div className="p-3 bg-background/50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="font-medium text-sm">Low</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Normal activities. Good air quality expected.
            </p>
          </div>
        </div>
      </Card>

      {/* Notification Settings */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Alert Notification Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">Critical Alerts</span>
              <Badge variant="destructive">Enabled</Badge>
            </div>
            <p className="text-xs text-muted-foreground">Push notifications for critical air quality events</p>
          </div>
          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">Forecast Alerts</span>
              <Badge variant="secondary">Enabled</Badge>
            </div>
            <p className="text-xs text-muted-foreground">Daily forecast updates and predictions</p>
          </div>
          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">Health Advisories</span>
              <Badge variant="secondary">Enabled</Badge>
            </div>
            <p className="text-xs text-muted-foreground">Health recommendations based on AQI</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
