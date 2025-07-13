"""
api_server.py
-------------
Flask backend for enrolling and verifying faces with MobileFaceNet
embeddings produced by FaceProcessor.

* No extra libraries needed beyond what FaceProcessor already uses.
  Cosine similarity is computed with pure-NumPy.
* Embeddings are L2-normalised once before storage/comparison.
* Database is a simple pickle file (`face_database.pkl`) in the
  current working directory.

Run with:
    python api_server.py
"""

from flask import Flask, request, jsonify
import cv2
import numpy as np
import base64
import pickle
import os
from face_processor import FaceProcessor   # your existing class

# ------------------------------------------------------------------
# initialisation
# ------------------------------------------------------------------
app = Flask(__name__)
processor = FaceProcessor()                # loads MTCNN + MobileFaceNet
DB_PATH = "face_database.pkl"
THRESHOLD = 0.55                           # adjust as you like (0–1)

# ------------------------------------------------------------------
# utility helpers
# ------------------------------------------------------------------
def cosine_sim(a: np.ndarray, b: np.ndarray) -> float:
    """
    Pure-NumPy cosine similarity for two 1-D vectors.
    Returns a float in [-1, 1], where 1.0 means identical.
    """
    a = a.flatten()
    b = b.flatten()
    return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)))

def l2_normalise(vec: np.ndarray) -> np.ndarray:
    """Return a unit-length copy of the vector."""
    norm = np.linalg.norm(vec)
    if norm == 0:
        return vec
    return vec / norm

def load_database() -> dict:
    """Load pickled DB or return empty dict."""
    if os.path.exists(DB_PATH):
        with open(DB_PATH, "rb") as f:
            return pickle.load(f)
    return {}

def save_database(db: dict) -> None:
    """Persist DB to disk."""
    with open(DB_PATH, "wb") as f:
        pickle.dump(db, f)

def decode_image(data_uri: str) -> np.ndarray:
    """
    Convert a data-URI base64 string ("data:image/jpeg;base64,...")
    to a BGR OpenCV image.
    """
    header, b64data = data_uri.split(",", 1)
    img_data = base64.b64decode(b64data)
    nparr = np.frombuffer(img_data, np.uint8)
    return cv2.imdecode(nparr, cv2.IMREAD_COLOR)

# ------------------------------------------------------------------
# API endpoints
# ------------------------------------------------------------------
@app.route("/enroll", methods=["POST"])
def enroll():
    data = request.get_json(force=True) or {}
    user_name = data.get("name")
    image_b64 = data.get("image")

    if not user_name or not image_b64:
        return jsonify({"error": "Missing name or image"}), 400

    try:
        frame = decode_image(image_b64)
        template, _ = processor.get_template(frame)

        if template is None:
            return jsonify({"error": "No face detected"}), 400

        template = l2_normalise(template)           # ensure unit length

        db = load_database()
        db[user_name] = {"template": template}
        save_database(db)

        print(f"[ENROLL] {user_name} stored.")
        return jsonify({
            "success": True,
            "message": f"User '{user_name}' enrolled successfully."
        })
    except Exception as e:
        print(f"[ENROLL ERROR] {str(e)}")
        return jsonify({"error": str(e)}), 500


@app.route("/verify", methods=["POST"])
def verify():
    data = request.get_json(force=True) or {}
    image_b64 = data.get("image")

    if not image_b64:
        return jsonify({"error": "Missing image"}), 400

    try:
        frame = decode_image(image_b64)
        live_template, _ = processor.get_template(frame)

        if live_template is None:
            return jsonify({
                "match": "No face detected",
                "confidence": 0.0,
                "cosine_similarity": 0.0,
                "threshold": THRESHOLD,
                "verified": False,
                "message": "No face detected in the image"
            })

        live_template = l2_normalise(live_template)

        db = load_database()
        if not db:
            return jsonify({
                "error": "No users enrolled yet",
                "match": "Unknown",
                "confidence": 0.0,
                "cosine_similarity": 0.0,
                "threshold": THRESHOLD,
                "verified": False
            }), 400

        best_name = "Unknown"
        best_score = -1.0

        # Find the best match
        for name, user_data in db.items():
            enrolled_template = user_data["template"]
            similarity_score = cosine_sim(live_template, enrolled_template)

            if similarity_score > best_score:
                best_score = similarity_score
                if similarity_score >= THRESHOLD:
                    best_name = name

        # Determine if verification passed
        is_verified = best_score >= THRESHOLD and best_name != "Unknown"
        
        # Convert cosine similarity to confidence percentage (0-1 scale)
        confidence_score = max(0.0, min(1.0, best_score))

        result = {
            "match": best_name if is_verified else "No match found",
            "confidence": confidence_score,
            "cosine_similarity": best_score,
            "threshold": THRESHOLD,
            "verified": is_verified,
            "message": f"Best match: {best_name} with similarity {best_score:.4f}" if is_verified 
                      else f"No sufficient match found. Best similarity: {best_score:.4f}"
        }

        print(f"[VERIFY] Result: {best_name} (similarity: {best_score:.4f}, verified: {is_verified})")
        return jsonify(result)

    except Exception as e:
        print(f"[VERIFY ERROR] {str(e)}")
        return jsonify({"error": str(e)}), 500


@app.route("/status", methods=["GET"])
def status():
    """Health check endpoint"""
    db = load_database()
    return jsonify({
        "status": "running",
        "enrolled_users": len(db),
        "threshold": THRESHOLD,
        "users": list(db.keys()) if db else []
    })


# ------------------------------------------------------------------
# run
# ------------------------------------------------------------------
if __name__ == "__main__":
    print("Starting Face Recognition API Server...")
    print(f"Cosine similarity threshold: {THRESHOLD}")
    print("Endpoints available:")
    print("  POST /enroll - Enroll a new face")
    print("  POST /verify - Verify a face")
    print("  GET /status - Check server status")
    
    # host='0.0.0.0' makes it reachable on your LAN; change to 127.0.0.1
    # if you only need local access.
    app.run(host="0.0.0.0", port=5000, debug=True)