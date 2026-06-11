-- SmartAQI Database Schema for PostgreSQL
-- Run this script in pgAdmin to create all required tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (be careful in production!)
DROP TABLE IF EXISTS predictions CASCADE;
DROP TABLE IF EXISTS model_metrics CASCADE;
DROP TABLE IF EXISTS pollutant_readings CASCADE;
DROP TABLE IF EXISTS aqi_readings CASCADE;
DROP TABLE IF EXISTS weather_data CASCADE;
DROP TABLE IF EXISTS alerts CASCADE;
DROP TABLE IF EXISTS solutions CASCADE;
DROP TABLE IF EXISTS stations CASCADE;

-- 1. Monitoring Stations Table
CREATE TABLE stations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    location VARCHAR(200) NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. AQI Readings Table (Real-time and Historical)
CREATE TABLE aqi_readings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    station_id UUID REFERENCES stations(id),
    aqi_value INTEGER NOT NULL,
    aqi_category VARCHAR(50) NOT NULL, -- Good, Moderate, Unhealthy, etc.
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Individual Pollutant Readings
CREATE TABLE pollutant_readings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    station_id UUID REFERENCES stations(id),
    pollutant_name VARCHAR(20) NOT NULL, -- PM2.5, PM10, NO2, SO2, CO, O3
    value DECIMAL(10, 4) NOT NULL,
    unit VARCHAR(20) NOT NULL, -- μg/m³, mg/m³
    safe_limit DECIMAL(10, 4) NOT NULL,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Weather Data Table
CREATE TABLE weather_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    station_id UUID REFERENCES stations(id),
    temperature DECIMAL(5, 2), -- Celsius
    humidity DECIMAL(5, 2), -- Percentage
    wind_speed DECIMAL(5, 2), -- km/h
    wind_direction VARCHAR(10), -- N, NE, E, etc.
    visibility DECIMAL(5, 2), -- km
    pressure DECIMAL(7, 2), -- hPa
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Model Predictions Table
CREATE TABLE predictions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    station_id UUID REFERENCES stations(id),
    predicted_aqi INTEGER NOT NULL,
    lower_bound INTEGER,
    upper_bound INTEGER,
    confidence DECIMAL(5, 2), -- Percentage
    forecast_horizon VARCHAR(20) NOT NULL, -- 1h, 6h, 12h, 24h, 48h, 7d
    model_name VARCHAR(50) DEFAULT 'Ensemble',
    prediction_for TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Model Performance Metrics Table
CREATE TABLE model_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    model_name VARCHAR(50) NOT NULL, -- LSTM, RandomForest, XGBoost, Ensemble
    accuracy DECIMAL(5, 2) NOT NULL,
    mae DECIMAL(10, 4) NOT NULL, -- Mean Absolute Error
    rmse DECIMAL(10, 4) NOT NULL, -- Root Mean Square Error
    r2_score DECIMAL(5, 4), -- R-squared
    training_samples INTEGER,
    validation_samples INTEGER,
    evaluated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Alerts Table
CREATE TABLE alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    station_id UUID REFERENCES stations(id),
    alert_type VARCHAR(50) NOT NULL, -- AQI_SPIKE, HEALTH_WARNING, FORECAST_ALERT
    severity VARCHAR(20) NOT NULL, -- LOW, MEDIUM, HIGH, CRITICAL
    title VARCHAR(200) NOT NULL,
    description TEXT,
    aqi_value INTEGER,
    is_active BOOLEAN DEFAULT true,
    triggered_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Solutions/Recommendations Table
CREATE TABLE solutions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category VARCHAR(50) NOT NULL, -- IMMEDIATE, SHORT_TERM, LONG_TERM, POLICY
    priority VARCHAR(20) NOT NULL, -- HIGH, MEDIUM, LOW
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    expected_impact VARCHAR(200),
    timeline VARCHAR(100),
    estimated_cost VARCHAR(100),
    effectiveness_score DECIMAL(5, 2),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_aqi_readings_station ON aqi_readings(station_id);
CREATE INDEX idx_aqi_readings_recorded_at ON aqi_readings(recorded_at);
CREATE INDEX idx_pollutant_readings_station ON pollutant_readings(station_id);
CREATE INDEX idx_pollutant_readings_recorded_at ON pollutant_readings(recorded_at);
CREATE INDEX idx_predictions_station ON predictions(station_id);
CREATE INDEX idx_predictions_forecast ON predictions(prediction_for);
CREATE INDEX idx_alerts_active ON alerts(is_active);
CREATE INDEX idx_weather_recorded_at ON weather_data(recorded_at);

-- Add comments to tables
COMMENT ON TABLE stations IS 'Air quality monitoring stations in Delhi-NCR';
COMMENT ON TABLE aqi_readings IS 'Real-time and historical AQI readings';
COMMENT ON TABLE pollutant_readings IS 'Individual pollutant concentration readings';
COMMENT ON TABLE weather_data IS 'Weather conditions affecting air quality';
COMMENT ON TABLE predictions IS 'ML model predictions for AQI';
COMMENT ON TABLE model_metrics IS 'Performance metrics for different ML models';
COMMENT ON TABLE alerts IS 'Air quality alerts and warnings';
COMMENT ON TABLE solutions IS 'Recommended solutions and interventions';
