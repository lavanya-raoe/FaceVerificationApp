# FaceAuth - Mobile Face Recognition App

A React Native mobile app with Flask backend for secure face enrollment and verification.

## Quick Start

### Backend Setup
```bash
# Clone and navigate to backend
cd FaceVerificationApp

# Create virtual environment
python -m venv face_env
source face_env/bin/activate  # Linux/Mac
# or
face_env\Scripts\activate     # Windows

# Install dependencies
pip install -r requirements.txt 

# Run server
python api_server.py
```

### Frontend Setup
```bash
# Navigate to frontend
cd MyfaceApp

# Install dependencies
npm install

# Update IP address in screens (replace 192.168.0.105 with your IP)

# Run app
npx run android
```

## Features
- Dark Modern UI - Clean iOS-style interface  
- Face Enrollment - 3-step guided enrollment process  
- Face Verification - Real-time identity verification  
- AI Recognition - MobileFaceNet + MTCNN models  
- Detailed Results - Confidence scores and similarity metrics  

## Project Structure
```
FaceAuth/
├── frontend/                 # React Native App
│   ├── screens/
│   │   ├── HomeScreen.tsx
│   │   ├── EnrollmentScreen.tsx
│   │   └── VerificationScreen.tsx
│   └── utils/
│
├── backend/                  # Flask API
│   ├── api_server.py        # Main server
│   ├── face_processor.py    # Face processing
│   └── models/
│
└── README.md
```

## API Endpoints

### Enroll User
**POST** `/enroll`  
**Content-Type:** `application/json`
```json
{
  "name": "User Name",
  "image": "data:image/jpeg;base64,..."
}
```

### Verify Face
**POST** `/verify`  
**Content-Type:** `application/json`
```json
{
  "image": "data:image/jpeg;base64,..."
}
```

### Server Status
**GET** `/status`

## ⚙️ Configuration

**Similarity Threshold (in `api_server.py`):**
```python
THRESHOLD = 0.55  # Adjust 0.0-1.0 (higher = stricter)
```

**Server IP (in React Native screens):**
```ts
const API_URL = 'http://YOUR_IP:5000';
```

## Requirements

### Backend
- Python 3.8+
- PyTorch
- OpenCV
- Flask
- NumPy
- facenet-pytorch

### Frontend
- Node.js 16+
- React Native CLI
- Android Studio/Xcode

## Usage
- **Enroll:** Enter name → Capture photo → Confirm  
- **Verify:** Capture photo → View results with confidence scores  
- **Results:** See match status, similarity score, and threshold info  

## Security
- Templates stored as 512D vectors (not images)  
- L2 normalized embeddings  
- Configurable similarity thresholds  
- Local processing only  



## Team
- **Amrit Khadka** 
- **Lavanya Rao** 
- **HICML Project 2025 | Face Recognition System**
