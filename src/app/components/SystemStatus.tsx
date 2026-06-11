import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { 
  CheckCircle, Activity, Database, Wifi, Server, 
  Cpu, Clock, RefreshCw, ChevronDown, ChevronUp 
} from "lucide-react";
import { LiveIndicator } from "./LiveIndicator";
import { Button } from "./ui/button";
import { motion, AnimatePresence } from "motion/react";

interface SystemMetric {
  name: string;
  status: 'operational' | 'degraded' | 'down';
  latency?: number;
  icon: typeof Activity;
}

export function SystemStatus() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const metrics: SystemMetric[] = [
    { name: 'API Server', status: 'operational', latency: 45, icon: Server },
    { name: 'Database', status: 'operational', latency: 12, icon: Database },
    { name: 'ML Pipeline', status: 'operational', latency: 230, icon: Cpu },
    { name: 'Data Stream', status: 'operational', latency: 85, icon: Wifi },
  ];

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setLastUpdate(new Date());
      setIsRefreshing(false);
    }, 1000);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: SystemMetric['status']) => {
    switch (status) {
      case 'operational': return 'text-green-500 bg-green-500/20';
      case 'degraded': return 'text-yellow-500 bg-yellow-500/20';
      case 'down': return 'text-red-500 bg-red-500/20';
    }
  };

  const allOperational = metrics.every(m => m.status === 'operational');

  return (
    <Card className={`overflow-hidden transition-all duration-300 ${
      allOperational 
        ? 'bg-gradient-to-r from-green-50/80 to-emerald-50/80 dark:from-green-950/30 dark:to-emerald-950/30 border-green-200 dark:border-green-800' 
        : 'bg-gradient-to-r from-yellow-50/80 to-amber-50/80 dark:from-yellow-950/30 dark:to-amber-950/30 border-yellow-200 dark:border-yellow-800'
    }`}>
      {/* Main Status Bar */}
      <div className="p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <motion.div 
              className={`p-2.5 rounded-xl ${allOperational ? 'bg-green-500/20' : 'bg-yellow-500/20'}`}
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <CheckCircle className={`w-5 h-5 ${allOperational ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`} />
            </motion.div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-semibold">System Status</h4>
                <LiveIndicator />
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Last checked: {lastUpdate.toLocaleTimeString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2">
              {metrics.slice(0, 3).map((metric, idx) => (
                <Badge key={idx} variant="outline" className="gap-1.5">
                  <metric.icon className="w-3 h-3 text-green-500" />
                  <span className="hidden md:inline">{metric.name}</span>
                  <span className="text-xs text-muted-foreground">{metric.latency}ms</span>
                </Badge>
              ))}
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="gap-1"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              Details
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-2 border-t border-border/50">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {metrics.map((metric, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="p-3 rounded-lg bg-background/60 border"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`p-1.5 rounded-lg ${getStatusColor(metric.status)}`}>
                        <metric.icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-sm font-medium">{metric.name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-medium capitalize ${
                        metric.status === 'operational' ? 'text-green-500' : 
                        metric.status === 'degraded' ? 'text-yellow-500' : 'text-red-500'
                      }`}>
                        {metric.status}
                      </span>
                      {metric.latency && (
                        <span className="text-xs text-muted-foreground">{metric.latency}ms</span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Performance Summary */}
              <div className="mt-4 p-3 rounded-lg bg-background/60 border">
                <h5 className="text-xs font-semibold mb-2 text-muted-foreground uppercase tracking-wide">
                  Performance Summary
                </h5>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-xl font-bold text-green-500">99.9%</p>
                    <p className="text-xs text-muted-foreground">Uptime</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-blue-500">
                      {Math.round(metrics.reduce((acc, m) => acc + (m.latency || 0), 0) / metrics.length)}ms
                    </p>
                    <p className="text-xs text-muted-foreground">Avg Latency</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-purple-500">1.2M</p>
                    <p className="text-xs text-muted-foreground">Daily Requests</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
