from flask import Flask, request, jsonify
from sklearn.ensemble import IsolationForest
from sklearn.utils.validation import check_array
import pickle
import os
import numpy as np
import math
from collections import deque
import requests
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Constants
DATA_FILE = "training_data.pkl"
REQUIRED_FEATURES = 4  # temperature, vibration, pressure, runtime
ANOMALY_THRESHOLD = 3
TREND_WINDOW_SIZE = 5

# Initialize global variables
training_data = []
model = None
previous_point = None
trend_window = deque(maxlen=TREND_WINDOW_SIZE)
anomaly_count = 0

def validate_and_convert_data(input_data):
    """
    Enhanced validation with better error handling
    """
    try:
        # Handle case where input is None or boolean
        if input_data is None or isinstance(input_data, bool):
            raise ValueError("Input cannot be None or boolean")
            
        # Handle case where input is a dictionary (from startTraining)
        if isinstance(input_data, dict):
            if not all(key in input_data for key in ['temperature', 'vibration', 'pressure', 'runtime']):
                raise ValueError("Dictionary must contain all required fields")
                
            try:
                converted = [
                    float(input_data['temperature']),
                    float(input_data['vibration']),
                    float(input_data['pressure']),
                    float(input_data['runtime'])
                ]
            except (ValueError, TypeError) as e:
                raise ValueError(f"Invalid numeric value: {str(e)}")
                
        # Handle case where input is a list (from startLive)
        elif isinstance(input_data, (list, tuple)):
            # Flatten nested structures
            flat_data = []
            for item in input_data:
                if isinstance(item, (list, tuple)):
                    flat_data.extend(item)
                else:
                    flat_data.append(item)
                    
            if len(flat_data) != REQUIRED_FEATURES:
                raise ValueError(f"Expected {REQUIRED_FEATURES} features, got {len(flat_data)}")
                
            try:
                converted = [float(x) for x in flat_data]
            except (ValueError, TypeError) as e:
                raise ValueError(f"Invalid numeric value: {str(e)}")
                
        else:
            raise ValueError("Input must be dictionary or list")
            
        # Validate numerical ranges
        if not (0 <= converted[0] <= 150):  # temperature
            raise ValueError("Temperature must be between 0-150")
        if not (0 <= converted[1] <= 10):  # vibration
            raise ValueError("Vibration must be between 0-10")
        if not (0 <= converted[2] <= 200):   # pressure
            raise ValueError("Pressure must be between 0-200")
        if converted[3] < 0:                 # runtime
            raise ValueError("Runtime cannot be negative")
            
        return converted
        
    except Exception as e:
        logger.error(f"Validation error for input {input_data}: {str(e)}")
        raise ValueError(f"Data validation failed: {str(e)}")


def validate_training_set(data):
    """Ensure all training data has consistent shape"""
    try:
        X = np.array(data, dtype=np.float64)
        X = check_array(X, ensure_2d=True)
        
        if X.shape[1] != REQUIRED_FEATURES:
            raise ValueError(f"All data points must have {REQUIRED_FEATURES} features")
            
        return X
    except ValueError as e:
        logger.error(f"Training set validation failed: {str(e)}")
        raise

def save_training_data():
    """Save data to disk with error handling"""
    try:
        with open(DATA_FILE, "wb") as f:
            pickle.dump(training_data, f)
    except Exception as e:
        logger.error(f"Failed to save training data: {str(e)}")
        raise

def load_training_data():
    """Load data from disk with error handling"""
    global training_data
    try:
        if os.path.exists(DATA_FILE):
            with open(DATA_FILE, "rb") as f:
                training_data = pickle.load(f)
                
            if training_data:
                validate_training_set(training_data)
                train_model()
    except Exception as e:
        logger.error(f"Failed to load training data: {str(e)}")
        training_data = []

def train_model():
    """Train or retrain the Isolation Forest model"""
    global model
    try:
        if not training_data:
            model = None
            return
            
        X = validate_training_set(training_data)
        model = IsolationForest(
            contamination=0.1,
            random_state=42,
            n_estimators=100
        )
        model.fit(X)
        logger.info(f"Model trained with {len(training_data)} samples")
    except Exception as e:
        logger.error(f"Model training failed: {str(e)}")
        model = None
        raise

# Load data at startup
load_training_data()

@app.route("/api/ml/train_model", methods=["POST"])
def handle_training():
    global training_data
    
    try:
        req_data = request.get_json()
        logger.info(f"Received training data: {req_data}")
        
        if not req_data:
            logger.error("Empty request received")
            return jsonify({"error": "No data received"}), 400
            
        try:
            data_point = validate_and_convert_data(req_data)
        except ValueError as e:
            logger.error(f"Data validation failed: {str(e)}")
            return jsonify({"error": str(e)}), 400
            
        training_data.append(data_point)
        
        try:
            X = validate_training_set(training_data)
            save_training_data()
            train_model()
        except ValueError as e:
            # Remove the invalid point if it caused validation to fail
            training_data.pop()
            logger.error(f"Training set validation failed: {str(e)}")
            return jsonify({"error": str(e)}), 400
            
        return jsonify({
            "status": "success",
            "data_point": data_point,
            "training_size": len(training_data)
        })
        
    except Exception as e:
        logger.error(f"Unexpected error in training: {str(e)}", exc_info=True)
        return jsonify({"error": "Internal server error"}), 500

@app.route("/api/ml/check", methods=["POST"])
def check_anomaly():
    global model, previous_point, trend_window, anomaly_count
    
    try:
        if not model:
            return jsonify({"error": "Model not trained yet"}), 400
            
        req_data = request.get_json()
        if not req_data:
            return jsonify({"error": "No data received"}), 400
            
        # Handle both formats like in training
        if isinstance(req_data, dict) and "data" in req_data:
            input_data = req_data["data"]
        else:
            input_data = req_data
            
        data_point = validate_and_convert_data(input_data)
        trend_window.append(data_point)
        
        # Detect sudden changes (5-10 unit increase)
        alert_triggered = False
        if previous_point:
            changes = [curr - prev for curr, prev in zip(data_point, previous_point)]
            if any(5 <= abs(change) <= 10 for change in changes):
                alert_triggered = True
                try:
                    requests.post(
                        "http://localhost:8000/alert",
                        json={
                            "alert": "Sudden change detected",
                            "changes": changes,
                            "data_point": data_point
                        },
                        timeout=2
                    )
                except Exception as e:
                    logger.error(f"Alert failed: {str(e)}")

        previous_point = data_point
        
        # Predict anomaly
        prediction = model.predict([data_point])[0]
        is_anomaly = prediction == -1
        
        # Update anomaly count
        if is_anomaly:
            anomaly_count += 1
            
        if len(trend_window) == TREND_WINDOW_SIZE:
            recent_preds = model.predict(list(trend_window))
            anomaly_count = sum(1 for p in recent_preds if p == -1)

        return jsonify({
            "status": "success",
            "data": data_point,
            "is_anomaly": is_anomaly,
            "anomaly_count": anomaly_count,
            "predicted_failure": anomaly_count >= ANOMALY_THRESHOLD,
            "alert_triggered": alert_triggered,
            "trend_window_size": len(trend_window)
        })
        
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        logger.error(f"Anomaly check failed: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

@app.route("/api/ml/reset", methods=["POST"])
def reset_system():
    global training_data, model, previous_point, trend_window, anomaly_count
    training_data = []
    model = None
    previous_point = None
    trend_window.clear()
    anomaly_count = 0
    
    try:
        if os.path.exists(DATA_FILE):
            os.remove(DATA_FILE)
    except Exception as e:
        logger.error(f"Reset failed: {str(e)}")
        
    return jsonify({
        "status": "success",
        "message": "System reset complete"
    })

@app.route("/api/ml/get_all_data", methods=["GET"])
def get_training_data():
    try:
        return jsonify({
            "status": "success",
            "count": len(training_data),
            "data": training_data,
            "features": REQUIRED_FEATURES
        })
    except Exception as e:
        logger.error(f"Data retrieval failed: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route("/api/ml/status", methods=["GET"])
def system_status():
    return jsonify({
        "status": "success",
        "model_trained": model is not None,
        "training_samples": len(training_data),
        "last_anomaly_count": anomaly_count,
        "trend_window_size": len(trend_window),
        "required_features": REQUIRED_FEATURES
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=False)