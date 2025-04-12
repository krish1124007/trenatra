from sklearn.ensemble import IsolationForest
import numpy as np

def train_model(data):
    X = np.array(data)
    model = IsolationForest(contamination=0.1, random_state=42)
    model.fit(X)
    return model
