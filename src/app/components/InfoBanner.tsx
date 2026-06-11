import { Card } from "./ui/card";
import { Info, ExternalLink } from "lucide-react";
import { Badge } from "./ui/badge";

export function InfoBanner() {
  return (
    <Card className="p-4 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-pink-950/20 border-blue-200 dark:border-blue-800">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-sm mb-1">About SmartAQI</h4>
            <p className="text-xs text-muted-foreground">
              Intelligent Air Pollution Forecasting and Policy Dashboard powered by advanced machine learning models.
              Real-time monitoring across 50+ stations in Delhi-NCR with 95% prediction accuracy.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="gap-1 whitespace-nowrap">
            <ExternalLink className="w-3 h-3" />
            Learn More
          </Badge>
        </div>
      </div>
    </Card>
  );
}
