import os
import torch
import numpy as np
import cv2
from torchvision import transforms
from PIL import Image
from mobilefacenet import MobileFaceNet  # your copied backbone

# Pick GPU if available
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# -- INSERT THESE LINES AT THE TOP: -----------------------
# base dir is the folder containing this file (embed.py)
_BASE_DIR = os.path.dirname(__file__)
MODEL_PATH = os.path.join(_BASE_DIR, "models", "MFN_AdaArcDistill_backbone.pth")
if not os.path.isfile(MODEL_PATH):
    raise FileNotFoundError(f"Model file not found at {MODEL_PATH!r}")
# -----------------------------------------------------------

# Build model & load the AdaArcDistill weights
model = MobileFaceNet(input_size=(112,112), embedding_size=512, output_name="GDC").to(device)

# now load from the absolute path
ckpt = torch.load(MODEL_PATH, map_location=device)

# strip any "module." prefixes if needed
state = {k.replace("module.",""): v for k, v in ckpt.items()}
model.load_state_dict(state)
model.eval()

# Preprocessing: to tensor and normalize to [-1,1]
_preprocess = transforms.Compose([
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.5]*3, std=[0.5]*3),
])

def get_embedding(face_bgr: np.ndarray) -> np.ndarray:
    """
    face_bgr: uint8 H×W×3 BGR numpy array (112×112)
    Returns: 512-d L2-normalized embedding (float32 numpy)
    """
    # BGR→RGB
    face_rgb = cv2.cvtColor(face_bgr, cv2.COLOR_BGR2RGB)
    img = Image.fromarray(face_rgb)  # PIL expects H×W×3 RGB uint8
    x = _preprocess(img).unsqueeze(0).to(device)  # [1,3,112,112]
    with torch.no_grad():
        emb = model(x)                          # [1,512]
    emb = emb.cpu().numpy().flatten()
    emb /= np.linalg.norm(emb)
    return emb
