// API Service for SmartAQI Dashboard
// This service handles all API calls to the backend

import type {
  DashboardStats,
  WeeklyTrendData,
  MonthlyTrendData,
  HourlyForecast,
  WeeklyForecast,
  ModelMetrics,
  YearComparison,
  PollutantData,
  FeatureImportance,
  Alert,
  Solution,
  AQIDistribution,
} from '../types/api';

// Base URL for API - change this to your backend URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper function for API calls
async function fetchAPI<T>(endpoint: string): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`);
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    console.error(`Failed to fetch ${endpoint}:`, error);
    throw error;
  }
}

// Dashboard Stats API
export async function getDashboardStats(): Promise<DashboardStats> {
  return fetchAPI<DashboardStats>('/dashboard/stats');
}

// Weekly Trend Data API
export async function getWeeklyTrend(): Promise<WeeklyTrendData[]> {
  return fetchAPI<WeeklyTrendData[]>('/trends/weekly');
}

// Monthly Trend Data API
export async function getMonthlyTrend(): Promise<MonthlyTrendData[]> {
  return fetchAPI<MonthlyTrendData[]>('/trends/monthly');
}

// Hourly Forecast API
export async function getHourlyForecast(): Promise<HourlyForecast[]> {
  return fetchAPI<HourlyForecast[]>('/predictions/hourly');
}

// Weekly Forecast API
export async function getWeeklyForecast(): Promise<WeeklyForecast[]> {
  return fetchAPI<WeeklyForecast[]>('/predictions/weekly');
}

// Model Metrics API
export async function getModelMetrics(): Promise<ModelMetrics[]> {
  return fetchAPI<ModelMetrics[]>('/models/metrics');
}

// Year Comparison API
export async function getYearComparison(): Promise<YearComparison[]> {
  return fetchAPI<YearComparison[]>('/analysis/year-comparison');
}

// Pollutant Data API
export async function getPollutants(): Promise<PollutantData[]> {
  return fetchAPI<PollutantData[]>('/pollutants/current');
}

// Feature Importance API
export async function getFeatureImportance(): Promise<FeatureImportance[]> {
  return fetchAPI<FeatureImportance[]>('/models/feature-importance');
}

// Alerts API
export async function getActiveAlerts(): Promise<Alert[]> {
  return fetchAPI<Alert[]>('/alerts/active');
}

// Solutions API
export async function getSolutions(): Promise<Solution[]> {
  return fetchAPI<Solution[]>('/solutions');
}

// AQI Distribution API
export async function getAQIDistribution(): Promise<AQIDistribution[]> {
  return fetchAPI<AQIDistribution[]>('/analysis/distribution');
}

// Stations API
export async function getStations(): Promise<any[]> {
  return fetchAPI<any[]>('/stations');
}

// Store model prediction
export async function storePrediction(data: {
  station_id?: string;
  predicted_aqi: number;
  lower_bound?: number;
  upper_bound?: number;
  confidence?: number;
  forecast_horizon: string;
  model_name?: string;
  prediction_for: string;
}): Promise<{ success: boolean; prediction_id: string }> {
  const response = await fetch(`${API_BASE_URL}/model/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error(`API Error: ${response.status}`);
  return response.json();
}

// Store AQI reading
export async function storeAQIReading(data: {
  station_id?: string;
  aqi_value: number;
  aqi_category?: string;
  pollutants?: Record<string, { value: number; unit: string }>;
}): Promise<{ success: boolean; reading_id: string }> {
  const response = await fetch(`${API_BASE_URL}/model/store-reading`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error(`API Error: ${response.status}`);
  return response.json();
}

// ============================================
// MOCK DATA FALLBACK (for development/demo)
// When backend is not available, use this data
// ============================================

export const mockDashboardStats: DashboardStats = {
  currentAQI: 178,
  aqiCategory: 'Unhealthy',
  temperature: 24,
  humidity: 62,
  visibility: 3.2,
  windSpeed: 8,
  windDirection: 'NW',
  avgAQI24h: 156,
  unhealthyDaysPercentage: 42,
};

export const mockWeeklyTrend: WeeklyTrendData[] = [
  { day: 'Mon', aqi: 165, pm25: 88 },
  { day: 'Tue', aqi: 172, pm25: 95 },
  { day: 'Wed', aqi: 185, pm25: 105 },
  { day: 'Thu', aqi: 178, pm25: 98 },
  { day: 'Fri', aqi: 192, pm25: 112 },
  { day: 'Sat', aqi: 168, pm25: 90 },
  { day: 'Sun', aqi: 175, pm25: 96 },
];

export const mockMonthlyTrend: MonthlyTrendData[] = [
  { month: "Sep '25", avgAQI: 142, pm25: 78, days_unhealthy: 18 },
  { month: "Oct '25", avgAQI: 168, pm25: 95, days_unhealthy: 24 },
  { month: "Nov '25", avgAQI: 195, pm25: 115, days_unhealthy: 28 },
  { month: "Dec '25", avgAQI: 215, pm25: 128, days_unhealthy: 29 },
  { month: "Jan '26", avgAQI: 198, pm25: 118, days_unhealthy: 27 },
  { month: "Feb '26", avgAQI: 172, pm25: 98, days_unhealthy: 22 },
  { month: "Mar '26", avgAQI: 158, pm25: 88, days_unhealthy: 19 },
];

export const mockHourlyForecast: HourlyForecast[] = [
  { time: 'Now', actual: 178, predicted: null, lower: null, upper: null },
  { time: '+3h', actual: null, predicted: 185, lower: 178, upper: 192 },
  { time: '+6h', actual: null, predicted: 192, lower: 183, upper: 201 },
  { time: '+9h', actual: null, predicted: 188, lower: 179, upper: 197 },
  { time: '+12h', actual: null, predicted: 175, lower: 165, upper: 185 },
  { time: '+15h', actual: null, predicted: 168, lower: 158, upper: 178 },
  { time: '+18h', actual: null, predicted: 182, lower: 172, upper: 192 },
  { time: '+21h', actual: null, predicted: 195, lower: 185, upper: 205 },
  { time: '+24h', actual: null, predicted: 198, lower: 188, upper: 208 },
];

export const mockWeeklyForecast: WeeklyForecast[] = [
  { day: 'Today', predicted: 178, lower: 172, upper: 184 },
  { day: 'Tomorrow', predicted: 185, lower: 177, upper: 193 },
  { day: 'Fri', predicted: 192, lower: 182, upper: 202 },
  { day: 'Sat', predicted: 168, lower: 158, upper: 178 },
  { day: 'Sun', predicted: 172, lower: 162, upper: 182 },
  { day: 'Mon', predicted: 188, lower: 178, upper: 198 },
  { day: 'Tue', predicted: 195, lower: 185, upper: 205 },
];

export const mockModelMetrics: ModelMetrics[] = [
  { id: '1', model_name: 'LSTM', accuracy: 94.2, mae: 12.5, rmse: 18.3, r2_score: 0.9215, training_samples: 2400000, validation_samples: 480000, evaluated_at: new Date().toISOString() },
  { id: '2', model_name: 'Random Forest', accuracy: 91.8, mae: 15.2, rmse: 21.7, r2_score: 0.8945, training_samples: 2400000, validation_samples: 480000, evaluated_at: new Date().toISOString() },
  { id: '3', model_name: 'XGBoost', accuracy: 93.5, mae: 13.8, rmse: 19.5, r2_score: 0.9108, training_samples: 2400000, validation_samples: 480000, evaluated_at: new Date().toISOString() },
  { id: '4', model_name: 'Ensemble', accuracy: 95.1, mae: 11.2, rmse: 16.8, r2_score: 0.9342, training_samples: 2400000, validation_samples: 480000, evaluated_at: new Date().toISOString() },
];

export const mockYearComparison: YearComparison[] = [
  { month: 'Jan', y2024: 185, y2025: 198, y2026: 178 },
  { month: 'Feb', y2024: 172, y2025: 185, y2026: 172 },
  { month: 'Mar', y2024: 158, y2025: 165, y2026: 158 },
  { month: 'Apr', y2024: 145, y2025: 152, y2026: null },
  { month: 'May', y2024: 132, y2025: 138, y2026: null },
  { month: 'Jun', y2024: 125, y2025: 130, y2026: null },
  { month: 'Jul', y2024: 118, y2025: 122, y2026: null },
  { month: 'Aug', y2024: 128, y2025: 135, y2026: null },
  { month: 'Sep', y2024: 135, y2025: 142, y2026: null },
  { month: 'Oct', y2024: 162, y2025: 168, y2026: null },
  { month: 'Nov', y2024: 188, y2025: 195, y2026: null },
  { month: 'Dec', y2024: 205, y2025: 215, y2026: null },
];

export const mockPollutants: PollutantData[] = [
  { name: 'PM2.5', value: 98, unit: 'μg/m³', limit: 60, trend: 'up', change: 12 },
  { name: 'PM10', value: 187, unit: 'μg/m³', limit: 100, trend: 'up', change: 8 },
  { name: 'NO2', value: 68, unit: 'μg/m³', limit: 80, trend: 'down', change: 5 },
  { name: 'SO2', value: 22, unit: 'μg/m³', limit: 80, trend: 'stable', change: 0 },
  { name: 'CO', value: 1.8, unit: 'mg/m³', limit: 4, trend: 'down', change: 3 },
  { name: 'O3', value: 45, unit: 'μg/m³', limit: 100, trend: 'stable', change: 1 },
];

export const mockFeatureImportance: FeatureImportance[] = [
  { feature: 'PM2.5 (t-1)', importance: 92 },
  { feature: 'Temperature', importance: 78 },
  { feature: 'Wind Speed', importance: 71 },
  { feature: 'Humidity', importance: 65 },
  { feature: 'Traffic Density', importance: 58 },
  { feature: 'Industrial Activity', importance: 52 },
  { feature: 'Day of Week', importance: 35 },
  { feature: 'Holiday Flag', importance: 28 },
];

export const mockAlerts: Alert[] = [
  {
    id: '1',
    station_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    alert_type: 'AQI_SPIKE',
    severity: 'HIGH',
    title: 'High AQI Alert - Anand Vihar',
    description: 'AQI has crossed 175. Sensitive groups should avoid outdoor activities.',
    aqi_value: 178,
    is_active: true,
    triggered_at: new Date().toISOString(),
    resolved_at: null,
  },
  {
    id: '2',
    station_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    alert_type: 'FORECAST_ALERT',
    severity: 'CRITICAL',
    title: 'Severe Pollution Expected Tomorrow',
    description: 'ML models predict AQI to reach 200+ in the morning hours due to low wind speed and temperature inversion.',
    aqi_value: 205,
    is_active: true,
    triggered_at: new Date().toISOString(),
    resolved_at: null,
  },
  {
    id: '3',
    station_id: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    alert_type: 'HEALTH_WARNING',
    severity: 'MEDIUM',
    title: 'Dust Storm Advisory',
    description: 'Possible dust storm from Rajasthan may affect air quality in the evening.',
    aqi_value: 185,
    is_active: true,
    triggered_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    resolved_at: null,
  },
  {
    id: '4',
    station_id: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
    alert_type: 'AQI_SPIKE',
    severity: 'LOW',
    title: 'Improving Air Quality',
    description: 'Rain expected - Air quality improvement likely in the next 24 hours.',
    aqi_value: 168,
    is_active: true,
    triggered_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    resolved_at: null,
  },
];

export const mockSolutions: Solution[] = [
  {
    id: '1',
    category: 'IMMEDIATE',
    priority: 'HIGH',
    title: 'Activate Odd-Even Vehicle Scheme',
    description: 'Implement odd-even vehicle restriction during peak pollution hours (6 AM - 10 AM and 5 PM - 9 PM).',
    expected_impact: '12-18 AQI points reduction',
    timeline: 'Immediate',
    estimated_cost: 'Low',
    effectiveness_score: 78.5,
    is_active: true,
  },
  {
    id: '2',
    category: 'IMMEDIATE',
    priority: 'HIGH',
    title: 'Deploy Anti-Smog Guns',
    description: 'Activate water sprinklers and anti-smog guns in high pollution zones to suppress dust particles.',
    expected_impact: '8-12 AQI points reduction',
    timeline: '2-4 hours',
    estimated_cost: 'Medium',
    effectiveness_score: 65.0,
    is_active: true,
  },
  {
    id: '3',
    category: 'SHORT_TERM',
    priority: 'HIGH',
    title: 'Halt Construction Activities',
    description: 'Temporary ban on construction and demolition activities during high pollution episodes.',
    expected_impact: '10-15 AQI points reduction',
    timeline: '24 hours',
    estimated_cost: 'Low',
    effectiveness_score: 72.0,
    is_active: true,
  },
  {
    id: '4',
    category: 'SHORT_TERM',
    priority: 'MEDIUM',
    title: 'Increase Public Transport Frequency',
    description: 'Enhance metro and bus services to reduce private vehicle usage during peak hours.',
    expected_impact: '5-8 AQI points reduction',
    timeline: '3-5 days',
    estimated_cost: 'Medium',
    effectiveness_score: 58.0,
    is_active: true,
  },
  {
    id: '5',
    category: 'LONG_TERM',
    priority: 'HIGH',
    title: 'Expand Electric Bus Fleet',
    description: 'Add 3,000 electric buses to replace diesel buses in Delhi-NCR.',
    expected_impact: '15-20% reduction in vehicular pollution',
    timeline: '12-18 months',
    estimated_cost: 'Rs. 5,000 Cr',
    effectiveness_score: 85.0,
    is_active: true,
  },
  {
    id: '6',
    category: 'LONG_TERM',
    priority: 'MEDIUM',
    title: 'Industrial Emission Monitoring',
    description: 'Deploy real-time emission monitoring systems in all major industries with automated penalties.',
    expected_impact: '15% reduction in industrial emissions',
    timeline: '6-12 months',
    estimated_cost: 'Rs. 500 Cr',
    effectiveness_score: 75.0,
    is_active: true,
  },
  {
    id: '7',
    category: 'POLICY',
    priority: 'HIGH',
    title: 'Stubble Burning Alternatives',
    description: 'Subsidize bio-decomposer spraying and provide machinery for stubble management to farmers.',
    expected_impact: '25% reduction in seasonal spike',
    timeline: 'Before Oct 2026',
    estimated_cost: 'Rs. 1,500 Cr',
    effectiveness_score: 88.0,
    is_active: true,
  },
  {
    id: '8',
    category: 'POLICY',
    priority: 'MEDIUM',
    title: 'Green Cover Expansion',
    description: 'Plant 2 million trees in Delhi-NCR with focus on pollution-absorbing species.',
    expected_impact: '5-8 AQI points reduction (long-term)',
    timeline: '2-3 years',
    estimated_cost: 'Rs. 800 Cr',
    effectiveness_score: 45.0,
    is_active: true,
  },
];

export const mockAQIDistribution: AQIDistribution[] = [
  { category: 'Good (0-50)', days: 2, color: '#22c55e' },
  { category: 'Moderate (51-100)', days: 5, color: '#eab308' },
  { category: 'Unhealthy (101-150)', days: 8, color: '#f97316' },
  { category: 'Very Unhealthy (151-200)', days: 12, color: '#ef4444' },
  { category: 'Hazardous (200+)', days: 3, color: '#a855f7' },
];
