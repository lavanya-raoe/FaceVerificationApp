# app.py
import cv2
import base64
import requests
import numpy as np

SERVER_URL = "http://127.0.0.1:5000"   


def capture_frame(cam):
    """
    Live-preview the webcam feed.
    SPACE  -> snap & return the frame
    ESC    -> cancel / return None
    """
    while True:
        ok, frame = cam.read()
        if not ok:
            print("❌  Could not grab frame from the camera.")
            return None

        cv2.imshow("Press SPACE to capture ‖ ESC to cancel", frame)
        key = cv2.waitKey(1) & 0xFF
        if key == 27:          # ESC
            return None
        if key == 32:          # SPACE
            cv2.destroyAllWindows()
            return frame


def encode_image_b64(img_bgr: np.ndarray) -> str:
    """
    JPEG-encode and Base64-stringify a BGR image, adding the data-URI header
    so api_server.py’s decode_image() can split on the first comma.
    """
    ok, buf = cv2.imencode(".jpg", img_bgr)
    if not ok:
        raise RuntimeError("Could not encode image as JPEG")
    img_b64 = base64.b64encode(buf).decode("utf-8")
    return f"data:image/jpeg;base64,{img_b64}"


# ---------- enrollment & verification ----------
def enroll(cam):
    username = input("Enter a user name to enroll: ").strip()
    if not username:
        print("Name cannot be empty.")
        return

    print("Align yourself in the frame, then press SPACE …")
    frame = capture_frame(cam)
    if frame is None:
        print("Enrollment cancelled.")
        return

    payload = {
        "name": username,
        "image": encode_image_b64(frame)
    }

    try:
        r = requests.post(f"{SERVER_URL}/enroll", json=payload, timeout=15)
        print("Server response:", r.json())
    except requests.exceptions.RequestException as e:
        print("❌  Could not reach the API server:", e)


def verify(cam):
    print("Press SPACE to capture an image for verification …")
    frame = capture_frame(cam)
    if frame is None:
        print("Verification cancelled.")
        return

    payload = {
        "image": encode_image_b64(frame)
    }

    try:
        r = requests.post(f"{SERVER_URL}/verify", json=payload, timeout=15)
        print("Server response:", r.json())
    except requests.exceptions.RequestException as e:
        print("❌  Could not reach the API server:", e)


# ---------- main menu loop ----------
def main():
    cam = cv2.VideoCapture(0)
    if not cam.isOpened():
        print("❌  Cannot open webcam. Check that it is not used by another app.")
        return

    try:
        while True:
            print("\n=== Face-Verification Tester ===")
            print("[E]nroll  |  [V]erify  |  [Q]uit")
            choice = input("Select an option: ").strip().lower()

            if choice == "e":
                enroll(cam)
            elif choice == "v":
                verify(cam)
            elif choice == "q":
                break
            else:
                print("Please type E, V, or Q.")
    finally:
        cam.release()
        cv2.destroyAllWindows()


if __name__ == "__main__":
    main()
