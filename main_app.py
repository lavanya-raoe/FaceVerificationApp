import cv2
from sklearn.metrics.pairwise import cosine_similarity
from face_processor import FaceProcessor
import time

def run_the_app():
    # --- 1. INITIALIZATION ---
    processor = FaceProcessor()
    print("--- All models initialized successfully. ---")
    
    # This will hold our "database" in memory
    enrolled_template = None
    enrolled_user = ""

    # --- 2. ENROLLMENT PHASE ---
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("--- ERROR: Could not open webcam. ---")
        return

    print("\n" + "="*50)
    print("       STEP 1: ENROLLMENT")
    print("="*50)
    
    user_name = input("Please enter the user's name and press Enter: ")
    enrolled_user = user_name
    
    print(f"\nEnrolling '{enrolled_user}'. Please look at the camera.")
    print("The app will now try to find a high-quality face.")
    print("Please hold still...")
    
    start_time = time.time()
    while time.time() - start_time < 10: # Try for 10 seconds
        ret, frame = cap.read()
        if not ret: continue

        # Show a countdown on the frame
        countdown = 10 - int(time.time() - start_time)
        cv2.putText(frame, f"Look at the camera: {countdown}", (50, 50), cv2.FONT_HERSHEY_DUPLEX, 1, (0, 0, 255), 2)
        cv2.imshow("Enrollment", frame)
        cv2.waitKey(1)

        # Try to get a template every second
        if int(time.time()) % 2 == 0:
            try:
                template, _ = processor.get_template(frame)
                if template is not None:
                    enrolled_template = template
                    print("\n--- FACE CAPTURED SUCCESSFULLY! ---")
                    cv2.imwrite(f"enrolled_{enrolled_user}.jpg", frame)
                    print(f"Reference image 'enrolled_{enrolled_user}.jpg' saved.")
                    break
            except Exception:
                continue
    
    cv2.destroyAllWindows()

    if enrolled_template is None:
        print("\n--- ENROLLMENT FAILED: Could not detect a clear face. Please restart the app. ---")
        cap.release()
        return

    # --- 3. VERIFICATION PHASE ---
    print("\n" + "="*50)
    print("       STEP 2: VERIFICATION")
    print("="*50)
    print("Enrollment complete. The app will now verify your identity.")
    print("Position your face in the frame and press [SPACEBAR].")
    print("Press [q] to quit.")
    print("="*50)

    while True:
        ret, frame = cap.read()
        if not ret: break

        cv2.imshow("Verification - Press [SPACE] to test", frame)
        key = cv2.waitKey(1) & 0xFF

        if key == ord('q'):
            break

        if key == ord(' '):
            print("\nVerifying...")
            try:
                live_template, _ = processor.get_template(frame)
                if live_template is not None:
                    score = cosine_similarity(enrolled_template, live_template)[0][0]
                    
                    print("\n" + "-"*30)
                    print("      VERIFICATION RESULT")
                    print("-"*30)
                    print(f"Similarity Score: {score:.4f}")
                    
                    if score > 0.3:
                        print(f"Match: {enrolled_user}")
                        print("--- ACCESS GRANTED ---")
                    else:
                        print("Match: Unknown")
                        print("--- ACCESS DENIED ---")
                    print("-"*30)
                else:
                    print("--- VERIFICATION FAILED: No face detected. ---")
            except Exception:
                print("--- VERIFICATION FAILED: An error occurred. ---")

    cap.release()
    cv2.destroyAllWindows()
    print("\n--- Application finished. ---")


if __name__ == "__main__":
    run_the_app()