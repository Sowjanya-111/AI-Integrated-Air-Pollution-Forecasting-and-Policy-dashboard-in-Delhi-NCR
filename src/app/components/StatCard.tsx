import { Card } from "./ui/card";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { motion } from "motion/react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  iconColor?: string;
  className?: string;
}

export function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend, 
  iconColor = "text-blue-500",
  className = ""
}: StatCardProps) {
  // Extract color name for gradient
  const colorName = iconColor.replace('text-', '').split('-')[0];
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02, y: -2 }}
      className={className}
    >
      <Card className="relative overflow-hidden h-full group hover:shadow-xl transition-all duration-300">
        {/* Background gradient */}
        <div className={`absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity bg-gradient-to-br from-${colorName}-500 to-transparent`} />
        
        {/* Accent line */}
        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-${colorName}-400 to-${colorName}-600 opacity-0 group-hover:opacity-100 transition-opacity`} />
        
        <div className="p-5 relative">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-muted-foreground truncate">{title}</p>
              <p className="text-2xl sm:text-3xl font-bold mt-1.5 tabular-nums">{value}</p>
              {subtitle && (
                <p className="text-xs text-muted-foreground mt-1 truncate">{subtitle}</p>
              )}
              {trend && (
                <div className="flex items-center gap-1.5 mt-2">
                  {trend.isPositive ? (
                    <TrendingUp className="w-3.5 h-3.5 text-green-500" />
                  ) : (
                    <TrendingDown className="w-3.5 h-3.5 text-red-500" />
                  )}
                  <span
                    className={`text-xs font-semibold ${
                      trend.isPositive ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {Math.abs(trend.value)}%
                  </span>
                  <span className="text-xs text-muted-foreground">vs last week</span>
                </div>
              )}
            </div>
            <div className={`p-3 rounded-xl bg-gradient-to-br from-${colorName}-100 to-${colorName}-50 dark:from-${colorName}-950 dark:to-${colorName}-900/50 ${iconColor} shadow-sm`}>
              <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
