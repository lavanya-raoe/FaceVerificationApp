# align.py
import cv2
import numpy as np
import torch
# vendored MTCNN lives under python/facenet_pytorch/mtcnn.py
from facenet_pytorch import MTCNN

mtcnn = MTCNN(image_size=112, margin=0)

def align_face(src):
    if isinstance(src, str):
        img = cv2.imread(src)
        if img is None:
            raise FileNotFoundError(f"Cannot read {src}")
    else:
        img = src
    aligned = mtcnn(img)
    if aligned is None:
        raise RuntimeError("No face detected")
    if isinstance(aligned, torch.Tensor):
        arr = aligned.permute(1,2,0).cpu().numpy()
        arr = (arr*255).round().astype(np.uint8)
    else:
        arr = np.asarray(aligned)
    return cv2.cvtColor(arr, cv2.COLOR_RGB2BGR)
