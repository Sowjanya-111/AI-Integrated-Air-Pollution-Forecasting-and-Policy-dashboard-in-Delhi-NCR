import { useEffect, useState } from "react";
import { AlertTriangle, Wind, Heart, Shield, Activity } from "lucide-react";
import { motion } from "motion/react";

interface AQIGaugeProps {
  value: number;
  showDetails?: boolean;
}

export function AQIGauge({ value, showDetails = true }: AQIGaugeProps) {
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    const duration = 1500;
    const start = 0;
    const increment = value / (duration / 16);
    let current = start;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setAnimatedValue(value);
        clearInterval(timer);
      } else {
        setAnimatedValue(Math.floor(current));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [value]);

  const getAQICategory = (aqi: number) => {
    if (aqi <= 50) return { 
      label: "Good", 
      color: "#22c55e", 
      gradient: "from-green-400 to-emerald-500",
      bgGradient: "from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30",
      advice: "Air quality is satisfactory",
      icon: Heart
    };
    if (aqi <= 100) return { 
      label: "Moderate", 
      color: "#eab308", 
      gradient: "from-yellow-400 to-amber-500",
      bgGradient: "from-yellow-50 to-amber-50 dark:from-yellow-950/30 dark:to-amber-950/30",
      advice: "Acceptable for most people",
      icon: Activity
    };
    if (aqi <= 150) return { 
      label: "Unhealthy for Sensitive", 
      color: "#f97316", 
      gradient: "from-orange-400 to-amber-600",
      bgGradient: "from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30",
      advice: "Sensitive groups may experience symptoms",
      icon: Shield
    };
    if (aqi <= 200) return { 
      label: "Unhealthy", 
      color: "#ef4444", 
      gradient: "from-red-400 to-rose-600",
      bgGradient: "from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/30",
      advice: "Everyone may begin to experience health effects",
      icon: AlertTriangle
    };
    if (aqi <= 300) return { 
      label: "Very Unhealthy", 
      color: "#a855f7", 
      gradient: "from-purple-400 to-violet-600",
      bgGradient: "from-purple-50 to-violet-50 dark:from-purple-950/30 dark:to-violet-950/30",
      advice: "Health warnings of emergency conditions",
      icon: AlertTriangle
    };
    return { 
      label: "Hazardous", 
      color: "#be123c", 
      gradient: "from-rose-600 to-red-800",
      bgGradient: "from-rose-50 to-red-50 dark:from-rose-950/30 dark:to-red-950/30",
      advice: "Health alert: everyone may be affected",
      icon: AlertTriangle
    };
  };

  const category = getAQICategory(value);
  const percentage = Math.min((animatedValue / 500) * 100, 100);
  const radius = 88;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - percentage / 100);
  const CategoryIcon = category.icon;

  return (
    <div className="relative">
      <div className={`flex flex-col items-center justify-center p-6 rounded-t-lg bg-gradient-to-br ${category.bgGradient}`}>
        <div className="relative w-44 h-44 sm:w-48 sm:h-48">
          {/* Background glow effect */}
          <div 
            className="absolute inset-4 rounded-full opacity-20 blur-xl"
            style={{ backgroundColor: category.color }}
          />
          
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 192 192">
            {/* Background track */}
            <circle
              cx="96"
              cy="96"
              r={radius}
              stroke="currentColor"
              strokeWidth="14"
              fill="none"
              className="text-muted/20"
            />
            
            {/* Gradient definition */}
            <defs>
              <linearGradient id={`gauge-gradient-${value}`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={category.color} stopOpacity="0.6" />
                <stop offset="100%" stopColor={category.color} />
              </linearGradient>
            </defs>
            
            {/* Progress arc */}
            <motion.circle
              cx="96"
              cy="96"
              r={radius}
              stroke={`url(#gauge-gradient-${value})`}
              strokeWidth="14"
              fill="none"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              strokeLinecap="round"
              style={{ filter: `drop-shadow(0 0 8px ${category.color}40)` }}
            />
          </svg>
          
          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <Wind className="w-6 h-6 text-muted-foreground mb-1" />
            </motion.div>
            <motion.span 
              className="text-4xl sm:text-5xl font-bold tabular-nums"
              style={{ color: category.color }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {animatedValue}
            </motion.span>
            <span className="text-xs text-muted-foreground font-medium mt-1">AQI</span>
          </div>
        </div>

        {/* Category badge */}
        <motion.div 
          className="mt-4"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-white shadow-lg"
            style={{ backgroundColor: category.color }}
          >
            <CategoryIcon className="w-4 h-4" />
            <span className="font-semibold text-sm">{category.label}</span>
          </div>
        </motion.div>

        {showDetails && (
          <motion.p 
            className="text-xs text-muted-foreground mt-3 text-center max-w-[200px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            {category.advice}
          </motion.p>
        )}
      </div>
    </div>
  );
}
