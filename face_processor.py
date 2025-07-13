import torch
import numpy as np
import cv2
from facenet_pytorch import MTCNN
from models.MobileFaceNet import MobileFaceNet

# --- 1. Alignment function (from the professor's reference) ---
def align_face(img, landmarks):
    """
    Performs a geometric alignment of the face based on 5 key landmarks.
    """
    # Standard coordinates for a 112x112 aligned face
    M = np.array([
        [38.2946, 51.6963], [73.5318, 51.5014], [56.0252, 71.7366],
        [41.5493, 92.3655], [70.7299, 92.2041]
    ], dtype=np.float32)
    
    tform = cv2.estimateAffinePartial2D(landmarks, M, method=cv2.LMEDS)[0]
    return cv2.warpAffine(img, tform, (112, 112))

# --- 2. The main processing class ---
class FaceProcessor:
    def __init__(self):
        self.device = 'cuda' if torch.cuda.is_available() else 'cpu'
        print(f"--- Initializing models on device: {self.device} ---")
        
        # Load MTCNN for detection and landmarks
        self.mtcnn = MTCNN(
            image_size=112, 
            margin=0, 
            min_face_size=20,
            thresholds=[0.6, 0.7, 0.7], 
            factor=0.709, 
            post_process=True,
            device=self.device,
            select_largest=True # Focus on the most prominent face
        )

        # Load MobileFaceNet for template extraction
        self.fr_model = MobileFaceNet(512).to(self.device)
        self.fr_model.load_state_dict(torch.load("MFN_AdaArcDistill_backbone.pth", map_location=self.device), strict=False)
        self.fr_model.eval()
        print("--- All models initialized successfully ---")

    def get_template(self, image_bgr):
        """
        Takes a BGR image (from cv2), detects, aligns, and extracts a face template.
        """
        # MTCNN expects an RGB image
        image_rgb = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2RGB)
        
        # Detect face and landmarks
        boxes, _, landmarks = self.mtcnn.detect(image_rgb, landmarks=True)
        
        # If no face is detected, return None
        if landmarks is None:
            return None, None
            
        # The landmarks array contains one set of 5 points for each face. We use the first one.
                # The landmarks array contains one set of 5 points for each face. We use the first one.
        face_landmarks = landmarks[0]
        
        # *** THIS IS THE FIX: Convert landmarks to the correct data type for OpenCV ***
        face_landmarks_np = np.array(face_landmarks, dtype=np.float32)

        # Align the face using the provided function
        aligned_face_rgb = align_face(image_rgb, face_landmarks_np)
        
        # Convert the aligned face to a tensor for the model
        face_tensor = torch.from_numpy(aligned_face_rgb.transpose((2, 0, 1))).float()
        face_tensor = (face_tensor - 127.5) / 128.0
        face_tensor = face_tensor.unsqueeze(0).to(self.device)
        
        # Extract the template (feature vector)
        with torch.no_grad():
            feature_vector = self.fr_model(face_tensor)
            
        # Return the template and the bounding box for drawing
        bbox = boxes[0] 
        return feature_vector.cpu().numpy(), bbox
