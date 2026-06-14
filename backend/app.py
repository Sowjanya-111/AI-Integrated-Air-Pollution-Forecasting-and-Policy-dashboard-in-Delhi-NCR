"""
SmartAQI Backend API Server
Flask application that connects to PostgreSQL database and serves data to the frontend.
Includes endpoints for storing and retrieving ML model predictions.

To run:
1. Install dependencies: pip install flask flask-cors psycopg2-binary python-dotenv
2. Set environment variables in .env file
3. Run: python app.py

Environment variables needed:
- DB_HOST: PostgreSQL host (default: localhost)
- DB_PORT: PostgreSQL port (default: 5432)
- DB_NAME: Database name (default: smartaqi)
- DB_USER: Database user (default: postgres)
- DB_PASSWORD: Database password
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
import psycopg2
from psycopg2.extras import RealDictCursor
import os
from datetime import datetime, timedelta
from dotenv import load_dotenv
import json

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Database configuration
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'port': os.getenv('DB_PORT', '5432'),
    'database': os.getenv('DB_NAME', 'smartaqi'),
    'user': os.getenv('DB_USER', 'postgres'),
    'password': os.getenv('DB_PASSWORD', 'pass@123')
}

def get_db_connection():
    """Create a database connection"""
    try:
        conn = psycopg2.connect(**DB_CONFIG, cursor_factory=RealDictCursor)
        return conn
    except Exception as e:
        print(f"Database connection error: {e}")
        return None


# ==================== DASHBOARD ENDPOINTS ====================

@app.route('/api/dashboard/stats', methods=['GET'])
def get_dashboard_stats():
    """Get current dashboard statistics"""
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cur = conn.cursor()
        
        # Get latest AQI reading
        cur.execute("""
            SELECT aqi_value, aqi_category 
            FROM smartaqi.aqi_readings 
            ORDER BY recorded_at DESC 
            LIMIT 1
        """)
        aqi_data = cur.fetchone()
        
        # Get latest weather data
        cur.execute("""
            SELECT temperature, humidity, wind_speed, wind_direction, visibility 
            FROM smartaqi.weather_data 
            ORDER BY recorded_at DESC 
            LIMIT 1
        """)
        weather_data = cur.fetchone()
        
        # Get 24h average AQI
        cur.execute("""
            SELECT ROUND(AVG(aqi_value)) as avg_aqi
            FROM smartaqi.aqi_readings 
            WHERE recorded_at >= NOW() - INTERVAL '24 hours'
        """)
        avg_data = cur.fetchone()
        
        # Get unhealthy days percentage (last 30 days)
        cur.execute("""
            SELECT 
                ROUND(COUNT(CASE WHEN aqi_value > 100 THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0)) as unhealthy_pct
            FROM (
                SELECT DATE(recorded_at) as day, AVG(aqi_value) as aqi_value
                FROM smartaqi.aqi_readings 
                WHERE recorded_at >= NOW() - INTERVAL '30 days'
                GROUP BY DATE(recorded_at)
            ) daily_avg
        """)
        unhealthy_data = cur.fetchone()
        
        response = {
            'currentAQI': aqi_data['aqi_value'] if aqi_data else 178,
            'aqiCategory': aqi_data['aqi_category'] if aqi_data else 'Unhealthy',
            'temperature': float(weather_data['temperature']) if weather_data else 24,
            'humidity': float(weather_data['humidity']) if weather_data else 62,
            'visibility': float(weather_data['visibility']) if weather_data else 3.2,
            'windSpeed': float(weather_data['wind_speed']) if weather_data else 8,
            'windDirection': weather_data['wind_direction'] if weather_data else 'NW',
            'avgAQI24h': int(avg_data['avg_aqi']) if avg_data and avg_data['avg_aqi'] else 156,
            'unhealthyDaysPercentage': int(unhealthy_data['unhealthy_pct']) if unhealthy_data and unhealthy_data['unhealthy_pct'] else 42,
            'lastUpdated': datetime.now().isoformat()
        }
        
        cur.close()
        conn.close()
        return jsonify(response)
        
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'error': str(e)}), 500



@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "message": "SmartAQI Backend API is running",
        "status": "healthy",
        "version": "2.0.0"
    })
@app.route('/api/stations', methods=['GET'])
def get_stations():
    """Get all monitoring stations with current AQI"""
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cur = conn.cursor()
        cur.execute("""
            SELECT 
                s.id, s.name, s.location, s.latitude, s.longitude, s.is_active,
                ar.aqi_value, ar.aqi_category, ar.recorded_at as last_reading
            FROM smartaqi.stations s
            LEFT JOIN LATERAL (
                SELECT aqi_value, aqi_category, recorded_at
                FROM smartaqi.aqi_readings
                WHERE station_id = s.id
                ORDER BY recorded_at DESC
                LIMIT 1
            ) ar ON true
            WHERE s.is_active = true
            ORDER BY s.name
        """)
        
        data = cur.fetchall()
        result = [{
            'id': str(row['id']),
            'name': row['name'],
            'location': row['location'],
            'lat': float(row['latitude']),
            'lng': float(row['longitude']),
            'aqi': row['aqi_value'] or 0,
            'category': row['aqi_category'] or 'Unknown',
            'lastReading': row['last_reading'].isoformat() if row['last_reading'] else None
        } for row in data]
        
        cur.close()
        conn.close()
        return jsonify(result)
        
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'error': str(e)}), 500


# ==================== MODEL PREDICTION ENDPOINTS ====================

@app.route('/api/model/predict', methods=['POST'])
def store_model_prediction():
    """
    Store ML model prediction output in database.
    Expected JSON body:
    {
        "station_id": "uuid",
        "predicted_aqi": 185,
        "lower_bound": 175,
        "upper_bound": 195,
        "confidence": 92.5,
        "forecast_horizon": "6h",
        "model_name": "LSTM",
        "prediction_for": "2026-03-22T18:00:00Z"
    }
    """
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['predicted_aqi', 'forecast_horizon', 'prediction_for']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO smartaqi.predictions (
                station_id, predicted_aqi, lower_bound, upper_bound,
                confidence, forecast_horizon, model_name, prediction_for
            ) VALUES (
                %(station_id)s, %(predicted_aqi)s, %(lower_bound)s, %(upper_bound)s,
                %(confidence)s, %(forecast_horizon)s, %(model_name)s, %(prediction_for)s
            )
            RETURNING id
        """, {
            'station_id': data.get('station_id'),
            'predicted_aqi': data['predicted_aqi'],
            'lower_bound': data.get('lower_bound'),
            'upper_bound': data.get('upper_bound'),
            'confidence': data.get('confidence'),
            'forecast_horizon': data['forecast_horizon'],
            'model_name': data.get('model_name', 'Ensemble'),
            'prediction_for': data['prediction_for']
        })
        
        prediction_id = cur.fetchone()['id']
        conn.commit()
        cur.close()
        conn.close()
        
        return jsonify({
            'success': True,
            'prediction_id': str(prediction_id),
            'message': 'Prediction stored successfully'
        }), 201
        
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/model/batch-predict', methods=['POST'])
def store_batch_predictions():
    """
    Store multiple ML model predictions at once.
    Expected JSON body:
    {
        "predictions": [
            {
                "station_id": "uuid",
                "predicted_aqi": 185,
                "forecast_horizon": "1h",
                ...
            },
            ...
        ]
    }
    """
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        data = request.get_json()
        predictions = data.get('predictions', [])
        
        if not predictions:
            return jsonify({'error': 'No predictions provided'}), 400
        
        cur = conn.cursor()
        inserted_ids = []
        
        for pred in predictions:
            cur.execute("""
                INSERT INTO smartaqi.predictions (
                    station_id, predicted_aqi, lower_bound, upper_bound,
                    confidence, forecast_horizon, model_name, prediction_for
                ) VALUES (
                    %(station_id)s, %(predicted_aqi)s, %(lower_bound)s, %(upper_bound)s,
                    %(confidence)s, %(forecast_horizon)s, %(model_name)s, %(prediction_for)s
                )
                RETURNING id
            """, {
                'station_id': pred.get('station_id'),
                'predicted_aqi': pred['predicted_aqi'],
                'lower_bound': pred.get('lower_bound'),
                'upper_bound': pred.get('upper_bound'),
                'confidence': pred.get('confidence'),
                'forecast_horizon': pred['forecast_horizon'],
                'model_name': pred.get('model_name', 'Ensemble'),
                'prediction_for': pred['prediction_for']
            })
            inserted_ids.append(str(cur.fetchone()['id']))
        
        conn.commit()
        cur.close()
        conn.close()
        
        return jsonify({
            'success': True,
            'count': len(inserted_ids),
            'prediction_ids': inserted_ids,
            'message': f'{len(inserted_ids)} predictions stored successfully'
        }), 201
        
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/model/store-reading', methods=['POST'])
def store_aqi_reading():
    """
    Store a new AQI reading from sensor/model.
    Expected JSON body:
    {
        "station_id": "uuid",
        "aqi_value": 185,
        "aqi_category": "Unhealthy",
        "pollutants": {
            "PM2.5": {"value": 98, "unit": "μg/m³"},
            "PM10": {"value": 187, "unit": "μg/m³"},
            ...
        }
    }
    """
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        data = request.get_json()
        
        # Validate required fields
        if 'aqi_value' not in data:
            return jsonify({'error': 'Missing required field: aqi_value'}), 400
        
        cur = conn.cursor()
        
        # Get AQI category if not provided
        aqi_value = data['aqi_value']
        aqi_category = data.get('aqi_category')
        if not aqi_category:
            if aqi_value <= 50:
                aqi_category = 'Good'
            elif aqi_value <= 100:
                aqi_category = 'Moderate'
            elif aqi_value <= 150:
                aqi_category = 'Unhealthy for Sensitive Groups'
            elif aqi_value <= 200:
                aqi_category = 'Unhealthy'
            elif aqi_value <= 300:
                aqi_category = 'Very Unhealthy'
            else:
                aqi_category = 'Hazardous'
        
        # Store AQI reading
        cur.execute("""
            INSERT INTO smartaqi.aqi_readings (station_id, aqi_value, aqi_category)
            VALUES (%(station_id)s, %(aqi_value)s, %(aqi_category)s)
            RETURNING id
        """, {
            'station_id': data.get('station_id'),
            'aqi_value': aqi_value,
            'aqi_category': aqi_category
        })
        
        reading_id = cur.fetchone()['id']
        
        # Store pollutant readings if provided
        pollutants = data.get('pollutants', {})
        pollutant_limits = {
            'PM2.5': 60,
            'PM10': 100,
            'NO2': 80,
            'SO2': 80,
            'CO': 4,
            'O3': 100
        }
        
        for pollutant_name, pollutant_data in pollutants.items():
            cur.execute("""
                INSERT INTO smartaqi.pollutant_readings (
                    station_id, pollutant_name, value, unit, safe_limit
                ) VALUES (
                    %(station_id)s, %(pollutant_name)s, %(value)s, %(unit)s, %(safe_limit)s
                )
            """, {
                'station_id': data.get('station_id'),
                'pollutant_name': pollutant_name,
                'value': pollutant_data['value'],
                'unit': pollutant_data.get('unit', 'μg/m³'),
                'safe_limit': pollutant_limits.get(pollutant_name, 100)
            })
        
        conn.commit()
        cur.close()
        conn.close()
        
        return jsonify({
            'success': True,
            'reading_id': str(reading_id),
            'message': 'AQI reading stored successfully'
        }), 201
        
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/model/store-metrics', methods=['POST'])
def store_model_metrics():
    """
    Store ML model performance metrics after training/evaluation.
    Expected JSON body:
    {
        "model_name": "LSTM",
        "accuracy": 94.2,
        "mae": 12.5,
        "rmse": 18.3,
        "r2_score": 0.9215,
        "training_samples": 2400000,
        "validation_samples": 480000
    }
    """
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['model_name', 'accuracy', 'mae', 'rmse']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO smartaqi.model_metrics (
                model_name, accuracy, mae, rmse, r2_score,
                training_samples, validation_samples
            ) VALUES (
                %(model_name)s, %(accuracy)s, %(mae)s, %(rmse)s, %(r2_score)s,
                %(training_samples)s, %(validation_samples)s
            )
            RETURNING id
        """, {
            'model_name': data['model_name'],
            'accuracy': data['accuracy'],
            'mae': data['mae'],
            'rmse': data['rmse'],
            'r2_score': data.get('r2_score'),
            'training_samples': data.get('training_samples'),
            'validation_samples': data.get('validation_samples')
        })
        
        metrics_id = cur.fetchone()['id']
        conn.commit()
        cur.close()
        conn.close()
        
        return jsonify({
            'success': True,
            'metrics_id': str(metrics_id),
            'message': 'Model metrics stored successfully'
        }), 201
        
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'error': str(e)}), 500


# ==================== TREND ENDPOINTS ====================

@app.route('/api/trends/weekly', methods=['GET'])
def get_weekly_trend():
    """Get weekly AQI trend data"""
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cur = conn.cursor()
        cur.execute("""
            SELECT 
                TO_CHAR(DATE(recorded_at), 'Dy') as day,
                ROUND(AVG(aqi_value)) as aqi,
                ROUND(AVG(aqi_value) * 0.55) as pm25
            FROM smartaqi.aqi_readings 
            WHERE recorded_at >= NOW() - INTERVAL '7 days'
            GROUP BY DATE(recorded_at), TO_CHAR(DATE(recorded_at), 'Dy')
            ORDER BY DATE(recorded_at)
        """)
        
        data = cur.fetchall()
        result = [{'day': row['day'], 'aqi': int(row['aqi']), 'pm25': int(row['pm25'])} for row in data]
        
        cur.close()
        conn.close()
        return jsonify(result)
        
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/trends/monthly', methods=['GET'])
def get_monthly_trend():
    """Get monthly AQI trend data"""
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cur = conn.cursor()
        cur.execute("""
            SELECT 
                TO_CHAR(DATE_TRUNC('month', recorded_at), 'Mon ''YY') as month,
                ROUND(AVG(aqi_value)) as "avgAQI",
                ROUND(AVG(aqi_value) * 0.58) as pm25,
                COUNT(CASE WHEN aqi_value > 100 THEN 1 END) as days_unhealthy
            FROM smartaqi.aqi_readings 
            WHERE recorded_at >= NOW() - INTERVAL '7 months'
            GROUP BY DATE_TRUNC('month', recorded_at)
            ORDER BY DATE_TRUNC('month', recorded_at)
        """)
        
        data = cur.fetchall()
        result = [{
            'month': row['month'], 
            'avgAQI': int(row['avgAQI']), 
            'pm25': int(row['pm25']),
            'days_unhealthy': int(row['days_unhealthy'])
        } for row in data]
        
        cur.close()
        conn.close()
        return jsonify(result)
        
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/trends/hourly', methods=['GET'])
def get_hourly_trend():
    """Get hourly AQI trend for the last 24 hours"""
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cur = conn.cursor()
        cur.execute("""
            SELECT 
                TO_CHAR(DATE_TRUNC('hour', recorded_at), 'HH24:00') as hour,
                ROUND(AVG(aqi_value)) as aqi
            FROM smartaqi.aqi_readings 
            WHERE recorded_at >= NOW() - INTERVAL '24 hours'
            GROUP BY DATE_TRUNC('hour', recorded_at)
            ORDER BY DATE_TRUNC('hour', recorded_at)
        """)
        
        data = cur.fetchall()
        result = [{'hour': row['hour'], 'aqi': int(row['aqi'])} for row in data]
        
        cur.close()
        conn.close()
        return jsonify(result)
        
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'error': str(e)}), 500


# ==================== PREDICTION ENDPOINTS ====================

@app.route('/api/predictions/hourly', methods=['GET'])
def get_hourly_forecast():
    """Get hourly AQI predictions"""
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cur = conn.cursor()
        
        # Get current AQI
        cur.execute("""
            SELECT aqi_value FROM smartaqi.aqi_readings 
            ORDER BY recorded_at DESC LIMIT 1
        """)
        current = cur.fetchone()
        
        # Get predictions
        cur.execute("""
            SELECT 
                forecast_horizon,
                predicted_aqi,
                lower_bound,
                upper_bound,
                confidence
            FROM smartaqi.predictions 
            WHERE prediction_for >= NOW()
            ORDER BY prediction_for
            LIMIT 8
        """)
        
        predictions = cur.fetchall()
        
        # Build response with current + predictions
        result = [{
            'time': 'Now',
            'actual': current['aqi_value'] if current else 178,
            'predicted': None,
            'lower': None,
            'upper': None,
            'confidence': None
        }]
        
        for pred in predictions:
            result.append({
                'time': f"+{pred['forecast_horizon']}",
                'actual': None,
                'predicted': pred['predicted_aqi'],
                'lower': pred['lower_bound'],
                'upper': pred['upper_bound'],
                'confidence': float(pred['confidence']) if pred['confidence'] else None
            })
        
        cur.close()
        conn.close()
        return jsonify(result)
        
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/predictions/weekly', methods=['GET'])
def get_weekly_forecast():
    """Get 7-day AQI predictions"""
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cur = conn.cursor()
        cur.execute("""
            SELECT 
                CASE 
                    WHEN DATE(prediction_for) = CURRENT_DATE THEN 'Today'
                    WHEN DATE(prediction_for) = CURRENT_DATE + 1 THEN 'Tomorrow'
                    ELSE TO_CHAR(prediction_for, 'Dy')
                END as day,
                predicted_aqi as predicted,
                lower_bound as lower,
                upper_bound as upper,
                confidence
            FROM smartaqi.predictions 
            WHERE forecast_horizon IN ('1d', '2d', '3d', '4d', '5d', '6d', '7d')
            ORDER BY prediction_for
            LIMIT 7
        """)
        
        data = cur.fetchall()
        result = [{
            'day': row['day'], 
            'predicted': row['predicted'], 
            'lower': row['lower'],
            'upper': row['upper'],
            'confidence': float(row['confidence']) if row['confidence'] else None
        } for row in data]
        
        cur.close()
        conn.close()
        return jsonify(result)
        
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'error': str(e)}), 500


# ==================== MODEL METRICS ENDPOINTS ====================

@app.route('/api/models/metrics', methods=['GET'])
def get_model_metrics():
    """Get ML model performance metrics"""
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cur = conn.cursor()
        cur.execute("""
            SELECT 
                id, model_name, accuracy, mae, rmse, r2_score,
                training_samples, validation_samples, evaluated_at
            FROM smartaqi.model_metrics 
            ORDER BY accuracy DESC
        """)
        
        data = cur.fetchall()
        result = [{
            'id': str(row['id']),
            'model_name': row['model_name'],
            'accuracy': float(row['accuracy']),
            'mae': float(row['mae']),
            'rmse': float(row['rmse']),
            'r2_score': float(row['r2_score']) if row['r2_score'] else 0,
            'training_samples': row['training_samples'],
            'validation_samples': row['validation_samples'],
            'evaluated_at': row['evaluated_at'].isoformat() if row['evaluated_at'] else None
        } for row in data]
        
        cur.close()
        conn.close()
        return jsonify(result)
        
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/models/feature-importance', methods=['GET'])
def get_feature_importance():
    """Get feature importance for ML models"""
    # This would typically come from your ML model
    features = [
        {'feature': 'PM2.5 (t-1)', 'importance': 92},
        {'feature': 'Temperature', 'importance': 78},
        {'feature': 'Wind Speed', 'importance': 71},
        {'feature': 'Humidity', 'importance': 65},
        {'feature': 'Traffic Density', 'importance': 58},
        {'feature': 'Industrial Activity', 'importance': 52},
        {'feature': 'Day of Week', 'importance': 35},
        {'feature': 'Holiday Flag', 'importance': 28}
    ]
    return jsonify(features)


# ==================== ANALYSIS ENDPOINTS ====================

@app.route('/api/analysis/year-comparison', methods=['GET'])
def get_year_comparison():
    """Get year-over-year AQI comparison"""
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cur = conn.cursor()
        cur.execute("""
            SELECT 
                TO_CHAR(recorded_at, 'Mon') as month,
                EXTRACT(YEAR FROM recorded_at) as year,
                ROUND(AVG(aqi_value)) as avg_aqi
            FROM smartaqi.aqi_readings 
            WHERE recorded_at >= '2024-01-01'
            GROUP BY TO_CHAR(recorded_at, 'Mon'), EXTRACT(MONTH FROM recorded_at), EXTRACT(YEAR FROM recorded_at)
            ORDER BY EXTRACT(MONTH FROM recorded_at)
        """)
        
        data = cur.fetchall()
        
        # Organize by month
        months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        result = []
        
        for month in months:
            entry = {'month': month, 'y2024': None, 'y2025': None, 'y2026': None}
            for row in data:
                if row['month'] == month:
                    year_key = f"y{int(row['year'])}"
                    entry[year_key] = int(row['avg_aqi'])
            result.append(entry)
        
        cur.close()
        conn.close()
        return jsonify(result)
        
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/analysis/distribution', methods=['GET'])
def get_aqi_distribution():
    """Get AQI distribution by category"""
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cur = conn.cursor()
        cur.execute("""
            SELECT 
                CASE 
                    WHEN aqi_value <= 50 THEN 'Good (0-50)'
                    WHEN aqi_value <= 100 THEN 'Moderate (51-100)'
                    WHEN aqi_value <= 150 THEN 'Unhealthy (101-150)'
                    WHEN aqi_value <= 200 THEN 'Very Unhealthy (151-200)'
                    ELSE 'Hazardous (200+)'
                END as category,
                COUNT(DISTINCT DATE(recorded_at)) as days
            FROM smartaqi.aqi_readings 
            WHERE recorded_at >= NOW() - INTERVAL '30 days'
            GROUP BY 
                CASE 
                    WHEN aqi_value <= 50 THEN 'Good (0-50)'
                    WHEN aqi_value <= 100 THEN 'Moderate (51-100)'
                    WHEN aqi_value <= 150 THEN 'Unhealthy (101-150)'
                    WHEN aqi_value <= 200 THEN 'Very Unhealthy (151-200)'
                    ELSE 'Hazardous (200+)'
                END
        """)
        
        data = cur.fetchall()
        
        colors = {
            'Good (0-50)': '#22c55e',
            'Moderate (51-100)': '#eab308',
            'Unhealthy (101-150)': '#f97316',
            'Very Unhealthy (151-200)': '#ef4444',
            'Hazardous (200+)': '#a855f7'
        }
        
        result = [{
            'category': row['category'],
            'days': row['days'],
            'color': colors.get(row['category'], '#94a3b8')
        } for row in data]
        
        cur.close()
        conn.close()
        return jsonify(result)
        
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'error': str(e)}), 500


# ==================== POLLUTANT ENDPOINTS ====================

@app.route('/api/pollutants/current', methods=['GET'])
def get_pollutants():
    """Get current pollutant levels"""
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cur = conn.cursor()
        cur.execute("""
            SELECT DISTINCT ON (pollutant_name)
                pollutant_name as name,
                value,
                unit,
                safe_limit as limit
            FROM smartaqi.pollutant_readings 
            ORDER BY pollutant_name, recorded_at DESC
        """)
        
        data = cur.fetchall()
        
        result = []
        for row in data:
            # Calculate trend (would need historical data for real trend)
            result.append({
                'name': row['name'],
                'value': float(row['value']),
                'unit': row['unit'],
                'limit': float(row['limit']),
                'trend': 'up' if float(row['value']) > float(row['limit']) else 'stable',
                'change': abs(int((float(row['value']) / float(row['limit']) - 1) * 10))
            })
        
        cur.close()
        conn.close()
        return jsonify(result)
        
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'error': str(e)}), 500


# ==================== ALERTS ENDPOINTS ====================

@app.route('/api/alerts/active', methods=['GET'])
def get_active_alerts():
    """Get active alerts"""
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cur = conn.cursor()
        cur.execute("""
            SELECT 
                id, station_id, alert_type, severity, title, 
                description, aqi_value, is_active, triggered_at, resolved_at
            FROM smartaqi.alerts 
            WHERE is_active = true
            ORDER BY 
                CASE severity 
                    WHEN 'CRITICAL' THEN 1 
                    WHEN 'HIGH' THEN 2 
                    WHEN 'MEDIUM' THEN 3 
                    ELSE 4 
                END,
                triggered_at DESC
        """)
        
        data = cur.fetchall()
        
        result = [{
            'id': str(row['id']),
            'station_id': str(row['station_id']) if row['station_id'] else None,
            'alert_type': row['alert_type'],
            'severity': row['severity'],
            'title': row['title'],
            'description': row['description'],
            'aqi_value': row['aqi_value'],
            'is_active': row['is_active'],
            'triggered_at': row['triggered_at'].isoformat() if row['triggered_at'] else None,
            'resolved_at': row['resolved_at'].isoformat() if row['resolved_at'] else None
        } for row in data]
        
        cur.close()
        conn.close()
        return jsonify(result)
        
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/alerts/create', methods=['POST'])
def create_alert():
    """Create a new alert (for automated alert systems)"""
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['alert_type', 'severity', 'title']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO smartaqi.alerts (
                station_id, alert_type, severity, title, description, aqi_value
            ) VALUES (
                %(station_id)s, %(alert_type)s, %(severity)s, %(title)s, %(description)s, %(aqi_value)s
            )
            RETURNING id
        """, {
            'station_id': data.get('station_id'),
            'alert_type': data['alert_type'],
            'severity': data['severity'],
            'title': data['title'],
            'description': data.get('description'),
            'aqi_value': data.get('aqi_value')
        })
        
        alert_id = cur.fetchone()['id']
        conn.commit()
        cur.close()
        conn.close()
        
        return jsonify({
            'success': True,
            'alert_id': str(alert_id),
            'message': 'Alert created successfully'
        }), 201
        
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'error': str(e)}), 500


# ==================== SOLUTIONS ENDPOINTS ====================

@app.route('/api/solutions', methods=['GET'])
def get_solutions():
    """Get recommended solutions"""
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cur = conn.cursor()
        cur.execute("""
            SELECT 
                id, category, priority, title, description,
                expected_impact, timeline, estimated_cost, 
                effectiveness_score, is_active
            FROM smartaqi.solutions 
            WHERE is_active = true
            ORDER BY 
                CASE priority 
                    WHEN 'HIGH' THEN 1 
                    WHEN 'MEDIUM' THEN 2 
                    ELSE 3 
                END,
                CASE category 
                    WHEN 'IMMEDIATE' THEN 1 
                    WHEN 'SHORT_TERM' THEN 2 
                    WHEN 'LONG_TERM' THEN 3 
                    ELSE 4 
                END
        """)
        
        data = cur.fetchall()
        
        result = [{
            'id': str(row['id']),
            'category': row['category'],
            'priority': row['priority'],
            'title': row['title'],
            'description': row['description'],
            'expected_impact': row['expected_impact'],
            'timeline': row['timeline'],
            'estimated_cost': row['estimated_cost'],
            'effectiveness_score': float(row['effectiveness_score']) if row['effectiveness_score'] else 0,
            'is_active': row['is_active']
        } for row in data]
        
        cur.close()
        conn.close()
        return jsonify(result)
        
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'error': str(e)}), 500


# ==================== HEALTH & UTILITY ENDPOINTS ====================

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'version': '2.0.0'
    })


@app.route('/api/status', methods=['GET'])
def system_status():
    """Get overall system status"""
    conn = get_db_connection()
    db_status = 'connected' if conn else 'disconnected'
    if conn:
        conn.close()
    
    return jsonify({
        'api': 'operational',
        'database': db_status,
        'ml_model': 'active',
        'data_pipeline': 'running',
        'timestamp': datetime.now().isoformat()
    })


if __name__ == '__main__':
    print("Starting SmartAQI API Server v2.0...")
    print(f"Database: {DB_CONFIG['host']}:{DB_CONFIG['port']}/{DB_CONFIG['database']}")
    app.run(host='0.0.0.0', port=5000, debug=True)