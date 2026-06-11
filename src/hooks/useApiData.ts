// Custom hooks for fetching data from API with fallback to mock data
import { useState, useEffect, useCallback } from 'react';
import * as api from '../services/api';
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

// Generic hook for data fetching with loading and error states
function useApiData<T>(
  fetchFn: () => Promise<T>,
  mockData: T,
  refreshInterval?: number
) {
  const [data, setData] = useState<T>(mockData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isUsingMockData, setIsUsingMockData] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const result = await fetchFn();
      setData(result);
      setIsUsingMockData(false);
      setError(null);
    } catch (err) {
      console.warn('API unavailable, using mock data:', err);
      setData(mockData);
      setIsUsingMockData(true);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [fetchFn, mockData]);

  useEffect(() => {
    fetchData();

    if (refreshInterval) {
      const interval = setInterval(fetchData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchData, refreshInterval]);

  return { data, loading, error, isUsingMockData, refetch: fetchData };
}

// Dashboard Stats Hook
export function useDashboardStats(refreshInterval = 60000) {
  return useApiData(
    api.getDashboardStats,
    api.mockDashboardStats,
    refreshInterval
  );
}

// Weekly Trend Hook
export function useWeeklyTrend(refreshInterval = 300000) {
  return useApiData(
    api.getWeeklyTrend,
    api.mockWeeklyTrend,
    refreshInterval
  );
}

// Monthly Trend Hook
export function useMonthlyTrend(refreshInterval = 600000) {
  return useApiData(
    api.getMonthlyTrend,
    api.mockMonthlyTrend,
    refreshInterval
  );
}

// Hourly Forecast Hook
export function useHourlyForecast(refreshInterval = 300000) {
  return useApiData(
    api.getHourlyForecast,
    api.mockHourlyForecast,
    refreshInterval
  );
}

// Weekly Forecast Hook
export function useWeeklyForecast(refreshInterval = 600000) {
  return useApiData(
    api.getWeeklyForecast,
    api.mockWeeklyForecast,
    refreshInterval
  );
}

// Model Metrics Hook
export function useModelMetrics(refreshInterval = 3600000) {
  return useApiData(
    api.getModelMetrics,
    api.mockModelMetrics,
    refreshInterval
  );
}

// Year Comparison Hook
export function useYearComparison(refreshInterval = 3600000) {
  return useApiData(
    api.getYearComparison,
    api.mockYearComparison,
    refreshInterval
  );
}

// Pollutants Hook
export function usePollutants(refreshInterval = 60000) {
  return useApiData(
    api.getPollutants,
    api.mockPollutants,
    refreshInterval
  );
}

// Feature Importance Hook
export function useFeatureImportance(refreshInterval = 3600000) {
  return useApiData(
    api.getFeatureImportance,
    api.mockFeatureImportance,
    refreshInterval
  );
}

// Alerts Hook
export function useAlerts(refreshInterval = 30000) {
  return useApiData(
    api.getActiveAlerts,
    api.mockAlerts,
    refreshInterval
  );
}

// Solutions Hook
export function useSolutions(refreshInterval = 300000) {
  return useApiData(
    api.getSolutions,
    api.mockSolutions,
    refreshInterval
  );
}

// AQI Distribution Hook
export function useAQIDistribution(refreshInterval = 300000) {
  return useApiData(
    api.getAQIDistribution,
    api.mockAQIDistribution,
    refreshInterval
  );
}

// Combined hook for overview data
export function useOverviewData() {
  const stats = useDashboardStats();
  const weeklyTrend = useWeeklyTrend();
  const pollutants = usePollutants();
  const distribution = useAQIDistribution();

  return {
    stats,
    weeklyTrend,
    pollutants,
    distribution,
    isLoading: stats.loading || weeklyTrend.loading || pollutants.loading,
    hasError: !!(stats.error && weeklyTrend.error && pollutants.error),
  };
}

// Combined hook for analysis data
export function useAnalysisData() {
  const modelMetrics = useModelMetrics();
  const yearComparison = useYearComparison();
  const featureImportance = useFeatureImportance();

  return {
    modelMetrics,
    yearComparison,
    featureImportance,
    isLoading: modelMetrics.loading || yearComparison.loading || featureImportance.loading,
  };
}

// Combined hook for predictions data
export function usePredictionsData() {
  const hourlyForecast = useHourlyForecast();
  const weeklyForecast = useWeeklyForecast();

  return {
    hourlyForecast,
    weeklyForecast,
    isLoading: hourlyForecast.loading || weeklyForecast.loading,
  };
}
