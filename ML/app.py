from flask import Flask, request, jsonify
from sklearn.ensemble import IsolationForest
import pickle
import os
from collections import deque

app = Flask(__name__)

training_data = []
model = None
data_file = "training_data.pkl"

# Load existing training data from file (if exists)
if os.path.exists(data_file):
    with open(data_file, "rb") as f:
        training_data = pickle.load(f)

@app.route("/api/ml/train_model", methods=["POST"])
def train_model():
    global training_data, model
    try:
        req_data = request.get_json()
        print("req data is", req_data)

        # Parse and convert to float
        data_point = [float(x) for x in req_data["data"][0]]
        training_data.append(data_point)

        # Save data to pickle file
        with open(data_file, "wb") as f:
            pickle.dump(training_data, f)

        # Train the IsolationForest model
        model = IsolationForest(contamination=0.1, random_state=42)
        model.fit(training_data)

        return jsonify({
            "message": "Training data received and model updated",
            "data_point": data_point
        })
    except Exception as e:
        print("❌ ERROR:", e)
        return jsonify({"error": str(e)}), 500

import requests

previous_point = None  # Global to track last received point

# Moving window to store last N sensor points
trend_window = deque(maxlen=5)
anomaly_count = 0
anomaly_threshold = 3  # if 3/5 recent points are anomalies => potential failure

@app.route("/api/ml/check", methods=["POST"])
def check_anomaly():
    global model, previous_point, trend_window, anomaly_count
    try:
        if not model:
            return jsonify({"error": "Model not trained yet"}), 400

        req_data = request.get_json()
        data_point = [float(x) for x in req_data["data"][0]]
        trend_window.append(data_point)

        # Detect sudden increase
        alert_triggered = False
        if previous_point:
            for curr, prev in zip(data_point, previous_point):
                increase = curr - prev
                if 5 <= increase <= 10:
                    alert_triggered = True
                    break

        if alert_triggered:
            print("🚨 ALERT: Sudden increase detected! Sending alert...")
            try:
                requests.post("http://localhost:8000/alert", json={
                    "alert": "Sudden increase detected",
                    "data_point": data_point
                })
            except Exception as alert_err:
                print("❌ Failed to send alert:", alert_err)

        previous_point = data_point  # Save for next

        # Predict anomaly using IsolationForest
        prediction = model.predict([data_point])[0]
        is_anomaly = prediction == -1

        # Update anomaly count over recent samples
        if is_anomaly:
            anomaly_count += 1
        if len(trend_window) == trend_window.maxlen:
            # Check how many anomalies in recent samples
            recent_preds = model.predict(list(trend_window))
            anomaly_count = sum(1 for p in recent_preds if p == -1)

        predicted_failure = anomaly_count >= anomaly_threshold

        return jsonify({
            "data": data_point,
            "safe": not (is_anomaly or predicted_failure),
            "predicted_failure": predicted_failure,
            "anomaly": is_anomaly,
            "alert_sent": alert_triggered
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500



@app.route("/api/ml/get_all_data", methods=["GET"])
def get_all_data():
    try:
        # Return data from pickle in raw format (as model expects)
        with open(data_file, "rb") as f:
            saved_data = pickle.load(f)
        return jsonify({"data": saved_data})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(port=5000)
