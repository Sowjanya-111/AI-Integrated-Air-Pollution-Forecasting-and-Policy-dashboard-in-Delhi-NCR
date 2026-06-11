import { Card } from "./ui/card";
import { Heart, Users, Activity, Home, AlertCircle } from "lucide-react";

interface HealthRecommendationsProps {
  aqi: number;
}

export function HealthRecommendations({ aqi }: HealthRecommendationsProps) {
  const getRecommendations = (aqi: number) => {
    if (aqi <= 50) {
      return {
        general: "Air quality is satisfactory. Perfect for outdoor activities!",
        sensitive: "No special precautions needed.",
        icon: Heart,
        iconColor: "text-green-500",
        bgColor: "bg-green-50",
      };
    } else if (aqi <= 100) {
      return {
        general: "Air quality is acceptable for most people.",
        sensitive: "Unusually sensitive people should consider reducing prolonged outdoor exertion.",
        icon: Users,
        iconColor: "text-yellow-500",
        bgColor: "bg-yellow-50",
      };
    } else if (aqi <= 150) {
      return {
        general: "General public should limit prolonged outdoor exertion.",
        sensitive: "Sensitive groups should avoid prolonged outdoor activities.",
        icon: Activity,
        iconColor: "text-orange-500",
        bgColor: "bg-orange-50",
      };
    } else if (aqi <= 200) {
      return {
        general: "Everyone should avoid prolonged outdoor exertion.",
        sensitive: "Sensitive groups should remain indoors and keep activity levels low.",
        icon: Home,
        iconColor: "text-red-500",
        bgColor: "bg-red-50",
      };
    } else {
      return {
        general: "Everyone should avoid all outdoor physical activities.",
        sensitive: "Everyone should remain indoors and keep windows closed.",
        icon: AlertCircle,
        iconColor: "text-purple-500",
        bgColor: "bg-purple-50",
      };
    }
  };

  const recommendations = getRecommendations(aqi);
  const Icon = recommendations.icon;

  return (
    <Card className={`p-6 ${recommendations.bgColor}`}>
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-full bg-white ${recommendations.iconColor}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold mb-3">Health Recommendations</h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">General Public</p>
              <p className="text-sm text-gray-600">{recommendations.general}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">Sensitive Groups</p>
              <p className="text-sm text-gray-600">{recommendations.sensitive}</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Sensitive groups include children, elderly, and people with respiratory conditions.
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
