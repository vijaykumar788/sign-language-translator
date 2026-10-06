from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

# Minimal ASL-like gesture recognition for demonstration.
# Expand this mapping later with a trained model for more gestures.
def finger_is_extended(landmarks, finger_name):
    thumb = 4
    index_tip = 8
    index_pip = 6
    middle_tip = 12
    middle_pip = 10
    ring_tip = 16
    ring_pip = 14
    pinky_tip = 20
    pinky_pip = 18

    if finger_name == "thumb":
        return landmarks[thumb]["x"] < landmarks[3]["x"] and landmarks[thumb]["x"] < landmarks[2]["x"]

    if finger_name == "index":
        return landmarks[index_tip]["y"] < landmarks[index_pip]["y"]

    if finger_name == "middle":
        return landmarks[middle_tip]["y"] < landmarks[middle_pip]["y"]

    if finger_name == "ring":
        return landmarks[ring_tip]["y"] < landmarks[ring_pip]["y"]

    if finger_name == "pinky":
        return landmarks[pinky_tip]["y"] < landmarks[pinky_pip]["y"]

    return False


def predict_letter(landmarks):
    if len(landmarks) < 21:
        return "?"

    fingers = {
        "thumb": finger_is_extended(landmarks, "thumb"),
        "index": finger_is_extended(landmarks, "index"),
        "middle": finger_is_extended(landmarks, "middle"),
        "ring": finger_is_extended(landmarks, "ring"),
        "pinky": finger_is_extended(landmarks, "pinky"),
    }

    # A: all fingers closed into a fist
    if not any(fingers.values()):
        return "A"

    # B: all fingers extended
    if all(fingers.values()):
        return "B"

    # L: thumb extended + index extended, remaining fingers closed
    if fingers["thumb"] and fingers["index"] and not fingers["middle"] and not fingers["ring"] and not fingers["pinky"]:
        return "L"

    # V: index + middle extended, others closed
    if fingers["index"] and fingers["middle"] and not fingers["ring"] and not fingers["pinky"] and not fingers["thumb"]:
        return "V"

    return "?"


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/predict", methods=["POST"])
def api_predict():
    data = request.get_json(force=True, silent=True) or {}
    landmarks = data.get("landmarks")

    if not landmarks or len(landmarks) < 21:
        return jsonify({"letter": "?", "error": "Invalid hand landmarks"}), 400

    try:
        prediction = predict_letter(landmarks)
        return jsonify({"letter": prediction})
    except Exception:
        return jsonify({"letter": "?", "error": "Prediction failed"}), 500


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
