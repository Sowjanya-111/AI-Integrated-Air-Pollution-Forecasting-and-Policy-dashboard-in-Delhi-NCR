import { Card } from "./ui/card";
import { TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle } from "lucide-react";
import { motion } from "motion/react";
import { Badge } from "./ui/badge";

interface PollutantCardProps {
  name: string;
  value: number;
  unit: string;
  limit: number;
  trend: "up" | "down" | "stable";
  change: number;
}

const pollutantInfo: Record<string, { fullName: string; description: string; color: string }> = {
  'PM2.5': { 
    fullName: 'Fine Particulate Matter', 
    description: 'Particles smaller than 2.5 micrometers',
    color: 'bg-red-500'
  },
  'PM10': { 
    fullName: 'Coarse Particulate Matter', 
    description: 'Particles smaller than 10 micrometers',
    color: 'bg-orange-500'
  },
  'NO2': { 
    fullName: 'Nitrogen Dioxide', 
    description: 'From vehicle exhaust & industry',
    color: 'bg-amber-500'
  },
  'SO2': { 
    fullName: 'Sulfur Dioxide', 
    description: 'From burning fossil fuels',
    color: 'bg-yellow-500'
  },
  'CO': { 
    fullName: 'Carbon Monoxide', 
    description: 'From incomplete combustion',
    color: 'bg-slate-500'
  },
  'O3': { 
    fullName: 'Ozone', 
    description: 'Ground-level ozone',
    color: 'bg-blue-500'
  },
};

export function PollutantCard({ name, value, unit, limit, trend, change }: PollutantCardProps) {
  const percentage = (value / limit) * 100;
  const isHigh = percentage > 100;
  const isWarning = percentage > 75 && percentage <= 100;
  const info = pollutantInfo[name] || { fullName: name, description: '', color: 'bg-gray-500' };

  const getTrendIcon = () => {
    if (trend === "up") return <TrendingUp className="w-3.5 h-3.5" />;
    if (trend === "down") return <TrendingDown className="w-3.5 h-3.5" />;
    return <Minus className="w-3.5 h-3.5" />;
  };

  const getTrendColor = () => {
    if (trend === "up") return "text-red-500 bg-red-50 dark:bg-red-950/30";
    if (trend === "down") return "text-green-500 bg-green-50 dark:bg-green-950/30";
    return "text-muted-foreground bg-muted";
  };

  const getStatusColor = () => {
    if (isHigh) return "from-red-500 to-rose-600";
    if (isWarning) return "from-orange-500 to-amber-600";
    return "from-green-500 to-emerald-600";
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
    >
      <Card className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl ${
        isHigh ? 'border-red-300 dark:border-red-800' : ''
      }`}>
        {/* Top accent bar */}
        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${getStatusColor()}`} />
        
        <div className="p-4 pt-5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg">{name}</h3>
                {isHigh && (
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  >
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                  </motion.div>
                )}
              </div>
              <p className="text-xs text-muted-foreground truncate">{info.fullName}</p>
            </div>
            <Badge 
              variant="outline" 
              className={`gap-1 text-xs font-medium ${getTrendColor()}`}
            >
              {getTrendIcon()}
              {change}%
            </Badge>
          </div>
          
          <div className="flex items-baseline gap-2 mb-4">
            <motion.span 
              className={`text-3xl font-bold tabular-nums ${isHigh ? 'text-red-500' : ''}`}
              key={value}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {value}
            </motion.span>
            <span className="text-sm text-muted-foreground">{unit}</span>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground">
                Safe: {limit} {unit}
              </span>
              <span className={`font-semibold ${
                isHigh ? 'text-red-500' : isWarning ? 'text-orange-500' : 'text-green-500'
              }`}>
                {percentage.toFixed(0)}%
              </span>
            </div>
            
            <div className="relative w-full bg-muted rounded-full h-2.5 overflow-hidden">
              <motion.div
                className={`h-full rounded-full bg-gradient-to-r ${getStatusColor()}`}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(percentage, 100)}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
              {/* Safe limit marker */}
              <div 
                className="absolute top-0 bottom-0 w-0.5 bg-foreground/50" 
                style={{ left: '100%', transform: 'translateX(-100%)' }}
              />
            </div>
          </div>

          {/* Status indicator */}
          <div className="mt-3 pt-3 border-t flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              {isHigh ? (
                <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
              ) : (
                <CheckCircle className="w-3.5 h-3.5 text-green-500" />
              )}
              <span className={`text-xs font-medium ${isHigh ? 'text-red-500' : 'text-green-500'}`}>
                {isHigh ? 'Above Safe Limit' : 'Within Limits'}
              </span>
            </div>
            {isHigh && (
              <span className="text-[10px] text-muted-foreground">
                +{(percentage - 100).toFixed(0)}% over
              </span>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
