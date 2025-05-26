from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import joblib
from collections import Counter
import os

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

model_dir = "models"

# Load models
knn_pipeline = joblib.load(os.path.join(model_dir, "knn_pipeline.pkl"))
dt_model = joblib.load(os.path.join(model_dir, "decision_tree.pkl"))
xgb_model = joblib.load(os.path.join(model_dir, "xgb_model.pkl"))
le = joblib.load(os.path.join(model_dir, "label_encoder.pkl"))

models = [knn_pipeline, dt_model, xgb_model]

def extract_features(coords):
    coords = np.array(coords)
    if len(coords) < 2:
        return np.array([0, 0, 0, 0, 0, 0])

    deltas = np.diff(coords, axis=0)
    segment_lengths = np.linalg.norm(deltas, axis=1)
    length = np.sum(segment_lengths)
    duration = len(coords)

    min_x, min_y = np.min(coords, axis=0)
    max_x, max_y = np.max(coords, axis=0)
    bounding_box_area = (max_x - min_x) * (max_y - min_y)

    start_to_end_dist = np.linalg.norm(coords[0] - coords[-1])
    mean_speed = length / duration

    angles = np.arctan2(deltas[:, 1], deltas[:, 0])
    angle_changes = np.diff(angles)
    angle_changes = (angle_changes + np.pi) % (2 * np.pi) - np.pi
    std_angle_change = np.std(angle_changes)

    return np.array([length, duration, bounding_box_area, start_to_end_dist, mean_speed, std_angle_change])


@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json()
    coords = data.get("gesture")

    if not coords or len(coords) < 2:
        return jsonify({"error": "Invalid or empty gesture"}), 400

    features = extract_features(coords).reshape(1, -1)

    predictions = [model.predict(features)[0] for model in models]
    majority_vote = Counter(predictions).most_common(1)[0][0]

    return jsonify({
        "predictions": [str(p) for p in predictions],
        "majority_vote": str(majority_vote)
    })


if __name__ == "__main__":
    app.run(port=5050, debug=True)
