export type RootStackParamList = {
  Home: undefined;
  Enrollment: undefined;
  Verification: undefined;
};

export interface VerificationResult {
  match: string;
  confidence?: number;
  verified: boolean;
  message?: string;
}

export interface EnrollmentData {
  name: string;
  image: string;
}

export interface ApiResponse {
  success: boolean;
  message: string;
  data?: any;
}

export interface CapturePhotoResult {
  uri: string;
  base64: string;
  fileName?: string;
  fileSize?: number;
}