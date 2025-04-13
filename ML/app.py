from flask import Flask, request, jsonify
from sklearn.ensemble import IsolationForest
import numpy as np
import pickle
import os
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Constants
DATA_FILE = "training_data.pkl"
MODEL_FILE = "isolation_forest_model.pkl"
REQUIRED_FEATURES = 4

# Global variables
training_data = []
model = None

# Standard Response Format
def make_response(success, data=None, message="", error=None):
    return {
        "success": success,
        "data": data if data is not None else [],
        "message": message,
        "error": error,
        "timestamp": datetime.now().isoformat()
    }

def validate_data_point(data):
    try:
        if isinstance(data, dict):
            point = [
                float(data.get('temperature', 0)),
                float(data.get('vibration', 0)),
                float(data.get('pressure', 0)),
                float(data.get('runtime', 0))
            ]
        elif isinstance(data, list) and len(data) == REQUIRED_FEATURES:
            point = [float(x) for x in data]
        else:
            raise ValueError("Data must be a dictionary or list of 4 values")
        
        # Validate ranges
        if not (0 <= point[0] <= 150):  # temperature
            raise ValueError("Temperature must be 0-150°C")
        if not (0 <= point[1] <= 10):   # vibration
            raise ValueError("Vibration must be 0-10 mm/s")
        if not (0 <= point[2] <= 200):  # pressure
            raise ValueError("Pressure must be 0-200 kPa")
        if point[3] < 0:               # runtime
            raise ValueError("Runtime cannot be negative")
            
        return point
    except Exception as e:
        logger.error(f"Validation error: {str(e)}")
        raise

def save_training_data():
    try:
        with open(DATA_FILE, 'wb') as f:
            pickle.dump({
                "values": training_data,
                "metadata": {
                    "created_at": datetime.now().isoformat(),
                    "count": len(training_data)
                }
            }, f)
    except Exception as e:
        logger.error(f"Failed to save training data: {str(e)}")
        raise

def load_training_data():
    global training_data
    try:
        if os.path.exists(DATA_FILE):
            with open(DATA_FILE, 'rb') as f:
                data = pickle.load(f)
                training_data = data.get("values", [])
    except Exception as e:
        logger.error(f"Failed to load training data: {str(e)}")
        training_data = []

def save_model():
    try:
        if model:
            with open(MODEL_FILE, 'wb') as f:
                pickle.dump(model, f)
    except Exception as e:
        logger.error(f"Failed to save model: {str(e)}")
        raise

def load_model():
    global model
    try:
        if os.path.exists(MODEL_FILE):
            with open(MODEL_FILE, 'rb') as f:
                model = pickle.load(f)
    except Exception as e:
        logger.error(f"Failed to load model: {str(e)}")
        model = None

def train_model():
    global model
    try:
        if len(training_data) < 10:
            raise ValueError("At least 10 samples required for training")
            
        X = np.array(training_data)
        model = IsolationForest(
            n_estimators=100,
            contamination=0.1,
            random_state=42
        )
        model.fit(X)
        save_model()
        logger.info(f"Model trained with {len(training_data)} samples")
    except Exception as e:
        logger.error(f"Training failed: {str(e)}")
        raise

# Initialize on startup
load_training_data()
load_model()

@app.route('/api/ml/train_model', methods=['POST'])
def handle_training():
    try:
        data = request.get_json()
        point = validate_data_point(data)
        training_data.append(point)
        save_training_data()
        
        # Train after every 10 samples
        if len(training_data) % 10 == 0:
            train_model()
        
        return jsonify(make_response(
            success=True,
            data=point,
            message=f"Training sample added. Total: {len(training_data)}"
        ))
    except Exception as e:
        return jsonify(make_response(
            success=False,
            error=str(e),
            message="Training failed"
        )), 400

@app.route('/api/ml/check', methods=['POST'])
def check_anomaly():
    try:
        if not model:
            raise ValueError("Model not trained")
            
        data = request.get_json()
        point = validate_data_point(data.get('data'))
        
        prediction = model.predict([point])[0]
        is_anomaly = prediction == -1
        
        return jsonify(make_response(
            success=True,
            data={
                "is_anomaly": bool(is_anomaly),
                "values": point,
                "prediction": int(prediction)
            },
            message="Anomaly check completed"
        ))
    except Exception as e:
        return jsonify(make_response(
            success=False,
            error=str(e),
            message="Anomaly check failed"
        )), 400

@app.route('/api/ml/get_all_data', methods=['GET'])
def get_all_data():
    try:
        return jsonify(make_response(
            success=True,
            data={
                "samples": training_data,
                "count": len(training_data),
                "model_trained": model is not None
            },
            message="Training data retrieved"
        ))
    except Exception as e:
        return jsonify(make_response(
            success=False,
            error=str(e),
            message="Failed to retrieve training data"
        )), 500

@app.route('/api/ml/reset', methods=['POST'])
def reset_system():
    global training_data, model
    try:
        training_data = []
        model = None
        if os.path.exists(DATA_FILE):
            os.remove(DATA_FILE)
        if os.path.exists(MODEL_FILE):
            os.remove(MODEL_FILE)
        
        return jsonify(make_response(
            success=True,
            message="System reset complete"
        ))
    except Exception as e:
        return jsonify(make_response(
            success=False,
            error=str(e),
            message="Reset failed"
        )), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)