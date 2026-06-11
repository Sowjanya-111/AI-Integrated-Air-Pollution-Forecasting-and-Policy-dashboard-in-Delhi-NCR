-- SmartAQI Seed Data for PostgreSQL
-- Run this after creating the schema

-- Insert Monitoring Stations
INSERT INTO stations (id, name, location, latitude, longitude, is_active) VALUES
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Anand Vihar', 'East Delhi', 28.6469, 77.3164, true),
('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'ITO', 'Central Delhi', 28.6289, 77.2405, true),
('c3d4e5f6-a7b8-9012-cdef-123456789012', 'Dwarka Sector 8', 'South West Delhi', 28.5733, 77.0722, true),
('d4e5f6a7-b8c9-0123-def0-234567890123', 'Rohini', 'North West Delhi', 28.7495, 77.0564, true),
('e5f6a7b8-c9d0-1234-ef01-345678901234', 'RK Puram', 'South Delhi', 28.5651, 77.1724, true),
('f6a7b8c9-d0e1-2345-f012-456789012345', 'Punjabi Bagh', 'West Delhi', 28.6713, 77.1305, true);

-- Insert AQI Readings (Last 30 days of data)
INSERT INTO aqi_readings (station_id, aqi_value, aqi_category, recorded_at) 
SELECT 
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
    FLOOR(120 + RANDOM() * 100)::integer,
    CASE 
        WHEN FLOOR(120 + RANDOM() * 100) < 50 THEN 'Good'
        WHEN FLOOR(120 + RANDOM() * 100) < 100 THEN 'Moderate'
        WHEN FLOOR(120 + RANDOM() * 100) < 150 THEN 'Unhealthy for Sensitive'
        WHEN FLOOR(120 + RANDOM() * 100) < 200 THEN 'Unhealthy'
        WHEN FLOOR(120 + RANDOM() * 100) < 300 THEN 'Very Unhealthy'
        ELSE 'Hazardous'
    END,
    CURRENT_TIMESTAMP - (generate_series || ' hours')::interval
FROM generate_series(0, 720) -- 30 days * 24 hours
LIMIT 200;

-- Insert more specific daily readings for charts
INSERT INTO aqi_readings (station_id, aqi_value, aqi_category, recorded_at) VALUES
-- This week's data
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 165, 'Unhealthy', CURRENT_DATE - INTERVAL '6 days'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 172, 'Unhealthy', CURRENT_DATE - INTERVAL '5 days'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 185, 'Unhealthy', CURRENT_DATE - INTERVAL '4 days'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 178, 'Unhealthy', CURRENT_DATE - INTERVAL '3 days'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 192, 'Very Unhealthy', CURRENT_DATE - INTERVAL '2 days'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 168, 'Unhealthy', CURRENT_DATE - INTERVAL '1 day'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 178, 'Unhealthy', CURRENT_DATE);

-- Insert Pollutant Readings
INSERT INTO pollutant_readings (station_id, pollutant_name, value, unit, safe_limit, recorded_at) VALUES
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'PM2.5', 98.5, 'μg/m³', 60, CURRENT_TIMESTAMP),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'PM10', 187.2, 'μg/m³', 100, CURRENT_TIMESTAMP),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'NO2', 68.3, 'μg/m³', 80, CURRENT_TIMESTAMP),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'SO2', 22.1, 'μg/m³', 80, CURRENT_TIMESTAMP),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'CO', 1.8, 'mg/m³', 4, CURRENT_TIMESTAMP),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'O3', 45.6, 'μg/m³', 100, CURRENT_TIMESTAMP);

-- Insert Weather Data
INSERT INTO weather_data (station_id, temperature, humidity, wind_speed, wind_direction, visibility, pressure, recorded_at) VALUES
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 24.5, 62, 8.5, 'NW', 3.2, 1013.25, CURRENT_TIMESTAMP),
('b2c3d4e5-f6a7-8901-bcde-f12345678901', 25.2, 58, 7.2, 'N', 3.8, 1012.80, CURRENT_TIMESTAMP),
('c3d4e5f6-a7b8-9012-cdef-123456789012', 23.8, 65, 6.8, 'NE', 2.9, 1014.10, CURRENT_TIMESTAMP);

-- Insert Model Metrics
INSERT INTO model_metrics (model_name, accuracy, mae, rmse, r2_score, training_samples, validation_samples, evaluated_at) VALUES
('LSTM', 94.20, 12.5, 18.3, 0.9215, 2400000, 480000, CURRENT_TIMESTAMP),
('Random Forest', 91.80, 15.2, 21.7, 0.8945, 2400000, 480000, CURRENT_TIMESTAMP),
('XGBoost', 93.50, 13.8, 19.5, 0.9108, 2400000, 480000, CURRENT_TIMESTAMP),
('Ensemble', 95.10, 11.2, 16.8, 0.9342, 2400000, 480000, CURRENT_TIMESTAMP);

-- Insert Predictions
INSERT INTO predictions (station_id, predicted_aqi, lower_bound, upper_bound, confidence, forecast_horizon, model_name, prediction_for) VALUES
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 185, 178, 192, 95.0, '3h', 'Ensemble', CURRENT_TIMESTAMP + INTERVAL '3 hours'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 192, 183, 201, 94.0, '6h', 'Ensemble', CURRENT_TIMESTAMP + INTERVAL '6 hours'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 188, 179, 197, 93.0, '9h', 'Ensemble', CURRENT_TIMESTAMP + INTERVAL '9 hours'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 175, 165, 185, 92.0, '12h', 'Ensemble', CURRENT_TIMESTAMP + INTERVAL '12 hours'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 168, 158, 178, 91.0, '24h', 'Ensemble', CURRENT_TIMESTAMP + INTERVAL '24 hours'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 182, 172, 192, 88.0, '48h', 'Ensemble', CURRENT_TIMESTAMP + INTERVAL '48 hours');

-- Insert Weekly Predictions
INSERT INTO predictions (station_id, predicted_aqi, lower_bound, upper_bound, confidence, forecast_horizon, model_name, prediction_for) VALUES
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 178, 172, 184, 92.0, '1d', 'Ensemble', CURRENT_DATE),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 185, 177, 193, 90.0, '2d', 'Ensemble', CURRENT_DATE + INTERVAL '1 day'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 192, 182, 202, 88.0, '3d', 'Ensemble', CURRENT_DATE + INTERVAL '2 days'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 168, 158, 178, 85.0, '4d', 'Ensemble', CURRENT_DATE + INTERVAL '3 days'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 172, 162, 182, 82.0, '5d', 'Ensemble', CURRENT_DATE + INTERVAL '4 days'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 188, 178, 198, 78.0, '6d', 'Ensemble', CURRENT_DATE + INTERVAL '5 days'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 195, 185, 205, 75.0, '7d', 'Ensemble', CURRENT_DATE + INTERVAL '6 days');

-- Insert Alerts
INSERT INTO alerts (station_id, alert_type, severity, title, description, aqi_value, is_active, triggered_at) VALUES
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'AQI_SPIKE', 'HIGH', 'High AQI Alert - Anand Vihar', 'AQI has crossed 175. Sensitive groups should avoid outdoor activities.', 178, true, CURRENT_TIMESTAMP),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'FORECAST_ALERT', 'CRITICAL', 'Severe Pollution Expected Tomorrow', 'ML models predict AQI to reach 200+ in the morning hours due to low wind speed and temperature inversion.', 205, true, CURRENT_TIMESTAMP),
('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'HEALTH_WARNING', 'MEDIUM', 'Dust Storm Advisory', 'Possible dust storm from Rajasthan may affect air quality in the evening.', 185, true, CURRENT_TIMESTAMP - INTERVAL '2 hours'),
('c3d4e5f6-a7b8-9012-cdef-123456789012', 'AQI_SPIKE', 'LOW', 'Improving Air Quality', 'Rain expected - Air quality improvement likely in the next 24 hours.', 168, true, CURRENT_TIMESTAMP - INTERVAL '5 hours');

-- Insert Solutions
INSERT INTO solutions (category, priority, title, description, expected_impact, timeline, estimated_cost, effectiveness_score, is_active) VALUES
('IMMEDIATE', 'HIGH', 'Activate Odd-Even Vehicle Scheme', 'Implement odd-even vehicle restriction during peak pollution hours (6 AM - 10 AM and 5 PM - 9 PM).', '12-18 AQI points reduction', 'Immediate', 'Low', 78.5, true),
('IMMEDIATE', 'HIGH', 'Deploy Anti-Smog Guns', 'Activate water sprinklers and anti-smog guns in high pollution zones to suppress dust particles.', '8-12 AQI points reduction', '2-4 hours', 'Medium', 65.0, true),
('SHORT_TERM', 'HIGH', 'Halt Construction Activities', 'Temporary ban on construction and demolition activities during high pollution episodes.', '10-15 AQI points reduction', '24 hours', 'Low', 72.0, true),
('SHORT_TERM', 'MEDIUM', 'Increase Public Transport Frequency', 'Enhance metro and bus services to reduce private vehicle usage during peak hours.', '5-8 AQI points reduction', '3-5 days', 'Medium', 58.0, true),
('LONG_TERM', 'HIGH', 'Expand Electric Bus Fleet', 'Add 3,000 electric buses to replace diesel buses in Delhi-NCR.', '15-20% reduction in vehicular pollution', '12-18 months', 'Rs. 5,000 Cr', 85.0, true),
('LONG_TERM', 'MEDIUM', 'Industrial Emission Monitoring', 'Deploy real-time emission monitoring systems in all major industries with automated penalties.', '15% reduction in industrial emissions', '6-12 months', 'Rs. 500 Cr', 75.0, true),
('POLICY', 'HIGH', 'Stubble Burning Alternatives', 'Subsidize bio-decomposer spraying and provide machinery for stubble management to farmers in Punjab and Haryana.', '25% reduction in seasonal spike', 'Before Oct 2026', 'Rs. 1,500 Cr', 88.0, true),
('POLICY', 'MEDIUM', 'Green Cover Expansion', 'Plant 2 million trees in Delhi-NCR with focus on pollution-absorbing species.', '5-8 AQI points reduction (long-term)', '2-3 years', 'Rs. 800 Cr', 45.0, true);

-- Insert Monthly Historical Data for Analysis
INSERT INTO aqi_readings (station_id, aqi_value, aqi_category, recorded_at) VALUES
-- Monthly averages for the past 7 months
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 142, 'Unhealthy for Sensitive', '2025-09-15'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 168, 'Unhealthy', '2025-10-15'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 195, 'Very Unhealthy', '2025-11-15'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 215, 'Very Unhealthy', '2025-12-15'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 198, 'Very Unhealthy', '2026-01-15'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 172, 'Unhealthy', '2026-02-15'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 158, 'Unhealthy', '2026-03-05');

-- Insert Year-over-Year comparison data
INSERT INTO aqi_readings (station_id, aqi_value, aqi_category, recorded_at) VALUES
-- 2024 data
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 185, 'Unhealthy', '2024-01-15'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 172, 'Unhealthy', '2024-02-15'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 158, 'Unhealthy', '2024-03-15'),
-- 2025 data
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 198, 'Very Unhealthy', '2025-01-15'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 185, 'Unhealthy', '2025-02-15'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 165, 'Unhealthy', '2025-03-15');

-- Create a view for daily AQI summary
CREATE OR REPLACE VIEW daily_aqi_summary AS
SELECT 
    DATE(recorded_at) as date,
    station_id,
    ROUND(AVG(aqi_value)) as avg_aqi,
    MIN(aqi_value) as min_aqi,
    MAX(aqi_value) as max_aqi,
    COUNT(*) as reading_count
FROM aqi_readings
GROUP BY DATE(recorded_at), station_id
ORDER BY date DESC;

-- Create a view for weekly trends
CREATE OR REPLACE VIEW weekly_aqi_trend AS
SELECT 
    DATE(recorded_at) as date,
    TO_CHAR(recorded_at, 'Dy') as day_name,
    station_id,
    ROUND(AVG(aqi_value)) as avg_aqi
FROM aqi_readings
WHERE recorded_at >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY DATE(recorded_at), TO_CHAR(recorded_at, 'Dy'), station_id
ORDER BY date;

-- Create a view for model performance comparison
CREATE OR REPLACE VIEW model_comparison AS
SELECT 
    model_name,
    accuracy,
    mae,
    rmse,
    r2_score,
    training_samples,
    evaluated_at
FROM model_metrics
ORDER BY accuracy DESC;

COMMIT;
