// API Types for SmartAQI Dashboard

export interface Station {
  id: string;
  name: string;
  location: string;
  latitude: number;
  longitude: number;
  is_active: boolean;
}

export interface AQIReading {
  id: string;
  station_id: string;
  aqi_value: number;
  aqi_category: string;
  recorded_at: string;
}

export interface PollutantReading {
  id: string;
  station_id: string;
  pollutant_name: string;
  value: number;
  unit: string;
  safe_limit: number;
  recorded_at: string;
}

export interface WeatherData {
  id: string;
  station_id: string;
  temperature: number;
  humidity: number;
  wind_speed: number;
  wind_direction: string;
  visibility: number;
  pressure: number;
  recorded_at: string;
}

export interface Prediction {
  id: string;
  station_id: string;
  predicted_aqi: number;
  lower_bound: number;
  upper_bound: number;
  confidence: number;
  forecast_horizon: string;
  model_name: string;
  prediction_for: string;
}

export interface ModelMetrics {
  id: string;
  model_name: string;
  accuracy: number;
  mae: number;
  rmse: number;
  r2_score: number;
  training_samples: number;
  validation_samples: number;
  evaluated_at: string;
}

export interface Alert {
  id: string;
  station_id: string;
  alert_type: 'AQI_SPIKE' | 'HEALTH_WARNING' | 'FORECAST_ALERT';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  title: string;
  description: string;
  aqi_value: number;
  is_active: boolean;
  triggered_at: string;
  resolved_at: string | null;
}

export interface Solution {
  id: string;
  category: 'IMMEDIATE' | 'SHORT_TERM' | 'LONG_TERM' | 'POLICY';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  description: string;
  expected_impact: string;
  timeline: string;
  estimated_cost: string;
  effectiveness_score: number;
  is_active: boolean;
}

// API Response types
export interface DashboardStats {
  currentAQI: number;
  aqiCategory: string;
  temperature: number;
  humidity: number;
  visibility: number;
  windSpeed: number;
  windDirection: string;
  avgAQI24h: number;
  unhealthyDaysPercentage: number;
  lastUpdated?: string;
}

export interface StationWithAQI {
  id: string;
  name: string;
  location: string;
  lat: number;
  lng: number;
  aqi: number;
  category: string;
  lastReading: string | null;
  pm25?: number;
  pm10?: number;
}

export interface SystemStatus {
  api: string;
  database: string;
  ml_model: string;
  data_pipeline: string;
  timestamp: string;
}

export interface WeeklyTrendData {
  day: string;
  aqi: number;
  pm25: number;
}

export interface MonthlyTrendData {
  month: string;
  avgAQI: number;
  pm25: number;
  days_unhealthy: number;
}

export interface HourlyForecast {
  time: string;
  actual: number | null;
  predicted: number | null;
  lower: number | null;
  upper: number | null;
}

export interface WeeklyForecast {
  day: string;
  predicted: number;
  lower: number;
  upper: number;
}

export interface YearComparison {
  month: string;
  y2024: number | null;
  y2025: number | null;
  y2026: number | null;
}

export interface PollutantData {
  name: string;
  value: number;
  unit: string;
  limit: number;
  trend: 'up' | 'down' | 'stable';
  change: number;
}

export interface FeatureImportance {
  feature: string;
  importance: number;
}

export interface AQIDistribution {
  category: string;
  days: number;
  color: string;
}
