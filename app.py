from pathlib import Path
import logging
import joblib
import numpy as np
from flask import Flask, jsonify, render_template, request

ROOT = Path(__file__).resolve().parent
MODEL_PATH = ROOT / "models" / "email_spam_simple_model.pkl"
logging.basicConfig(level=logging.INFO)
app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = 1 * 1024 * 1024

try:
    bundle = joblib.load(MODEL_PATH)
    model = bundle["model"]
    vectorizer = bundle["vectorizer"]
except Exception:
    logging.exception("Could not load the trained model bundle.")
    raise

def clean_email(text: str) -> str:
    # Matches the notebook's basic_clean(): strip and lowercase.
    return text.strip().lower()

@app.get("/")
def home():
    return render_template("index.html")

@app.get("/api/health")
def health():
    return jsonify({"status": "ok", "model": type(model).__name__,
                    "vectorizer": type(vectorizer).__name__})

@app.post("/api/predict")
def predict():
    if not request.is_json:
        return jsonify({"error": "Send a JSON request."}), 415
    payload = request.get_json(silent=True) or {}
    subject = payload.get("subject", "")
    message = payload.get("message", "")
    if not isinstance(subject, str) or not isinstance(message, str):
        return jsonify({"error": "Subject and message must be text."}), 400
    combined = "\n".join(part.strip() for part in (subject, message) if part.strip())
    if not combined.strip():
        return jsonify({"error": "Enter an email subject or message to analyze."}), 400
    if len(combined) > 50000:
        return jsonify({"error": "Email is too long. Maximum length is 50,000 characters."}), 413
    try:
        features = vectorizer.transform([clean_email(combined)])
        prediction = int(model.predict(features)[0])
        label = "SPAM" if prediction == 1 else "NOT SPAM"
        response = {"prediction": label, "class_id": prediction,
                    "message": "This email was classified as spam." if prediction else
                               "This email was classified as not spam.",
                    "analyzed_characters": len(combined)}
        if hasattr(model, "predict_proba"):
            probs = model.predict_proba(features)[0]
            classes = list(model.classes_)
            spam_index = classes.index(1) if 1 in classes else None
            if spam_index is not None:
                response["spam_probability"] = round(float(probs[spam_index]), 4)
                response["confidence"] = round(float(np.max(probs)), 4)
        return jsonify(response)
    except Exception:
        logging.exception("Prediction failed.")
        return jsonify({"error": "The model could not analyze this email. Check server logs."}), 500

@app.errorhandler(413)
def too_large(_):
    return jsonify({"error": "Request too large. Maximum request size is 1 MB."}), 413

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=False)
