# face_module.py

import os
import base64
import json
import numpy as np
import cv2
from align import align_face
from embed import get_embedding

# Path inside your Android app’s private storage:
DB_PATH = "/data/user/0/com.myfaceapp/files/face_db.json"


def _load_db() -> dict:
    try:
        with open(DB_PATH, "r") as f:
            return json.load(f)
    except:
        return {}


def _save_db(db: dict):
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    with open(DB_PATH, "w") as f:
        json.dump(db, f)


def enroll(user_id: str, name: str, image_b64: str) -> str:
    # Decode image
    data = base64.b64decode(image_b64)
    arr = np.frombuffer(data, dtype=np.uint8)
    img = cv2.imdecode(arr, cv2.IMREAD_COLOR)

    # Align & embed
    face = align_face(img)
    emb = get_embedding(face).tolist()

    # Save to DB
    db = _load_db()
    db[user_id] = {"name": name, "embedding": emb}
    _save_db(db)

    return json.dumps({"status": "ok", "id": user_id})


def verify(image_b64: str, threshold: float = 0.3) -> str:
    """
    Compare against every enrolled user. Returns JSON:
      {
        "status":"ok",
        "verified": bool,
        "cosine_similarity": best_score,
        "threshold": threshold,
        "match": best_name
      }
    """
    db = _load_db()
    if not db:
        return json.dumps({"status": "error", "message": "no users enrolled"})

    # Decode & embed probe
    data = base64.b64decode(image_b64)
    arr = np.frombuffer(data, dtype=np.uint8)
    img = cv2.imdecode(arr, cv2.IMREAD_COLOR)
    face = align_face(img)
    probe = get_embedding(face)

    # Find best match
    best_score = -1.0
    best_name = None
    best_uid = None
    for uid, rec in db.items():
        target = np.array(rec["embedding"], dtype=np.float32)
        cos = float(np.dot(probe, target) /
                    (np.linalg.norm(probe) * np.linalg.norm(target)))
        if cos > best_score:
            best_score = cos
            best_uid = uid
            best_name = rec["name"]

    verified = best_score > threshold
    return json.dumps({
        "status": "ok",
        "verified": verified,
        "cosine_similarity": best_score,
        "threshold": threshold,
        "match": best_name,
        "id": best_uid
    })


def clear_all() -> str:
    """
    Deletes the entire enrollment database.
    """
    try:
        if os.path.isfile(DB_PATH):
            os.remove(DB_PATH)
        return json.dumps({"status": "ok"})
    except Exception as e:
        return json.dumps({"status": "error", "message": str(e)})


def list_all() -> str:
    """
    Lists all enrolled users:
      [{"id": "...", "name": "..."} , ...]
    """
    db = _load_db()
    out = [{"id": uid, "name": rec["name"]} for uid, rec in db.items()]
    return json.dumps(out)
