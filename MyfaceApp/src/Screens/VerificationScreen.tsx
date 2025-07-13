import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  Alert,
  ActivityIndicator,
  Animated,
  StatusBar,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { capturePhoto } from '../utils/capturePhoto';
import axios from 'axios';
import { RootStackParamList } from '../../App';

type VerificationScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Verification'>;

interface VerificationResult {
  match: string;
  confidence: number;
  cosine_similarity: number;
  threshold: number;
  verified: boolean;
  message?: string;
}

export default function VerificationScreen() {
  const navigation = useNavigation<VerificationScreenNavigationProp>();
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [step, setStep] = useState(1); // 1: Capture, 2: Processing, 3: Results
  
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [step]);

  const handleCapturePhoto = async () => {
    try {
      const photoResult = await capturePhoto();
      if (photoResult) {
        setCapturedImage(photoResult);
        setStep(2);
        handleVerification(photoResult);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to capture photo');
    }
  };

  const handleVerification = async (imageData: string) => {
    setLoading(true);
    setResult(null);
    
    try {
      const response = await axios.post('http://192.168.0.105:5000/verify', {
        image: imageData,
      });
      
      const verificationResult: VerificationResult = {
        match: response.data.match || 'Unknown',
        confidence: response.data.confidence || 0,
        cosine_similarity: response.data.cosine_similarity || 0,
        threshold: response.data.threshold || 0.55,
        verified: response.data.verified || false,
        message: response.data.message,
      };
      
      setResult(verificationResult);
      setStep(3);
    } catch (error: any) {
      console.error('Verification error:', error);
      Alert.alert('Error', error.response?.data?.error || 'Failed to verify user');
      setStep(1);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setStep(1);
    setCapturedImage(null);
    setResult(null);
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}>
        <Icon name="arrow-back" size={24} color="#007AFF" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Face Verification</Text>
      <View style={styles.headerSpacer} />
    </View>
  );

  const renderProgressBar = () => (
    <View style={styles.progressContainer}>
      <View style={styles.progressBar}>
        <View 
          style={[
            styles.progressFill, 
            { width: `${(step / 3) * 100}%` }
          ]} 
        />
      </View>
      <Text style={styles.progressText}>Step {step} of 3</Text>
    </View>
  );

  const renderCaptureStep = () => (
    <Animated.View style={[styles.stepContainer, { opacity: fadeAnim }]}>
      <View style={styles.stepHeader}>
        <Text style={styles.stepTitle}>Verify your identity</Text>
        <Text style={styles.stepSubtitle}>Position your face clearly in the frame</Text>
      </View>

      <View style={styles.captureSection}>
        <TouchableOpacity
          style={styles.captureButton}
          onPress={handleCapturePhoto}>
          <View style={styles.captureFrame}>
            <Icon name="face-retouching-natural" size={40} color="#34C759" />
            <Text style={styles.captureText}>Tap to verify</Text>
          </View>
        </TouchableOpacity>
        
        <View style={styles.captureInstructions}>
          <View style={styles.instructionItem}>
            <Icon name="visibility" size={20} color="#8E8E93" />
            <Text style={styles.instructionText}>Look directly at the camera</Text>
          </View>
          <View style={styles.instructionItem}>
            <Icon name="wb-sunny" size={20} color="#8E8E93" />
            <Text style={styles.instructionText}>Ensure good lighting</Text>
          </View>
          <View style={styles.instructionItem}>
            <Icon name="face" size={20} color="#8E8E93" />
            <Text style={styles.instructionText}>Keep your face in the frame</Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );

  const renderProcessingStep = () => (
    <Animated.View style={[styles.stepContainer, { opacity: fadeAnim }]}>
      <View style={styles.stepHeader}>
        <Text style={styles.stepTitle}>Processing...</Text>
        <Text style={styles.stepSubtitle}>Analyzing your face using AI technology</Text>
      </View>

      <View style={styles.processingSection}>
        {capturedImage && (
          <View style={styles.processingImageContainer}>
            <Image source={{ uri: capturedImage }} style={styles.processingImage} />
            <View style={styles.processingOverlay}>
              <ActivityIndicator size="large" color="#007AFF" />
            </View>
          </View>
        )}

        <View style={styles.processingSteps}>
          <View style={styles.processingStep}>
            <View style={styles.processingStepIcon}>
              <Icon name="face-retouching-natural" size={24} color="#007AFF" />
            </View>
            <Text style={styles.processingStepText}>Face Detection</Text>
          </View>
          
          <View style={styles.processingStep}>
            <View style={styles.processingStepIcon}>
              <Icon name="fingerprint" size={24} color="#007AFF" />
            </View>
            <Text style={styles.processingStepText}>Feature Extraction</Text>
          </View>
          
          <View style={styles.processingStep}>
            <View style={styles.processingStepIcon}>
              <Icon name="compare" size={24} color="#007AFF" />
            </View>
            <Text style={styles.processingStepText}>Matching</Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return '#34C759'; // Green
    if (confidence >= 0.6) return '#FF9500'; // Orange
    return '#FF3B30'; // Red
  };

  const getConfidenceLevel = (confidence: number) => {
    if (confidence >= 0.8) return 'High';
    if (confidence >= 0.6) return 'Medium';
    return 'Low';
  };

  const renderResultStep = () => (
    <Animated.View style={[styles.stepContainer, { opacity: fadeAnim }]}>
      <View style={styles.stepHeader}>
        <Text style={[styles.stepTitle, result?.verified ? styles.successText : styles.failureText]}>
          {result?.verified ? 'Verification Successful' : 'Verification Failed'}
        </Text>
        <Text style={styles.stepSubtitle}>
          {result?.verified ? 'Identity confirmed' : 'Please try again'}
        </Text>
      </View>

      <View style={styles.resultSection}>
        {capturedImage && (
          <View style={styles.resultImageContainer}>
            <Image source={{ uri: capturedImage }} style={styles.resultImage} />
            <View style={[
              styles.resultBadge, 
              result?.verified ? styles.successBadge : styles.failureBadge
            ]}>
              <Icon 
                name={result?.verified ? "check-circle" : "cancel"} 
                size={24} 
                color="#FFFFFF" 
              />
            </View>
          </View>
        )}

        <View style={styles.resultDetails}>
          <View style={styles.resultCard}>
            <Text style={styles.resultLabel}>Matched User</Text>
            <Text style={[
              styles.resultValue, 
              result?.verified ? styles.successText : styles.failureText
            ]}>
              {result?.match || 'Unknown'}
            </Text>
          </View>

          <View style={styles.resultCard}>
            <Text style={styles.resultLabel}>Confidence Level</Text>
            <View style={styles.confidenceContainer}>
              <Text style={[
                styles.resultValue,
                { color: getConfidenceColor(result?.confidence || 0) }
              ]}>
                {((result?.confidence || 0) * 100).toFixed(1)}%
              </Text>
              <Text style={[
                styles.confidenceLevel,
                { color: getConfidenceColor(result?.confidence || 0) }
              ]}>
                {getConfidenceLevel(result?.confidence || 0)}
              </Text>
            </View>
          </View>

          <View style={styles.resultCard}>
            <Text style={styles.resultLabel}>Cosine Similarity</Text>
            <Text style={[
              styles.resultValue,
              { color: getConfidenceColor(result?.cosine_similarity || 0) }
            ]}>
              {(result?.cosine_similarity || 0).toFixed(4)}
            </Text>
            <Text style={styles.resultDescription}>
              Range: -1.0 to 1.0 (higher is better)
            </Text>
          </View>

          <View style={styles.resultCard}>
            <Text style={styles.resultLabel}>Threshold</Text>
            <Text style={styles.resultValue}>
              {(result?.threshold || 0).toFixed(2)}
            </Text>
            <Text style={styles.resultDescription}>
              Minimum similarity required for verification
            </Text>
          </View>

          <View style={styles.resultCard}>
            <Text style={styles.resultLabel}>Status</Text>
            <View style={styles.statusContainer}>
              <View style={[
                styles.statusIndicator,
                result?.verified ? styles.successIndicator : styles.failureIndicator
              ]} />
              <Text style={[
                styles.resultValue,
                result?.verified ? styles.successText : styles.failureText
              ]}>
                {result?.verified ? 'Verified' : 'Not Verified'}
              </Text>
            </View>
          </View>

          {result?.message && (
            <View style={styles.messageCard}>
              <Text style={styles.messageText}>{result.message}</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.resultButtons}>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleRetry}>
          <Text style={styles.secondaryButtonText}>Try Again</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>Done</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <SafeAreaView style={styles.safeArea}>
        {renderHeader()}
        {renderProgressBar()}
        
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          {step === 1 && renderCaptureStep()}
          {step === 2 && renderProcessingStep()}
          {step === 3 && renderResultStep()}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1C1C1E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    flex: 1,
  },
  headerSpacer: {
    width: 40,
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#2C2C2E',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  stepContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
  },
  stepHeader: {
    marginBottom: 40,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  stepSubtitle: {
    fontSize: 16,
    color: '#8E8E93',
    lineHeight: 22,
    textAlign: 'center',
  },
  captureSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButton: {
    width: 200,
    height: 200,
    marginBottom: 40,
  },
  captureFrame: {
    flex: 1,
    backgroundColor: '#1C1C1E',
    borderRadius: 100,
    borderWidth: 3,
    borderColor: '#34C759',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureText: {
    fontSize: 16,
    color: '#34C759',
    fontWeight: '600',
    marginTop: 8,
  },
  captureInstructions: {
    gap: 16,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  instructionText: {
    fontSize: 15,
    color: '#8E8E93',
  },
  processingSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingImageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    marginBottom: 40,
    position: 'relative',
  },
  processingImage: {
    width: '100%',
    height: '100%',
  },
  processingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingSteps: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    gap: 20,
  },
  processingStep: {
    alignItems: 'center',
    flex: 1,
  },
  processingStepIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1C1C1E',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  processingStepText: {
    fontSize: 13,
    color: '#8E8E93',
    textAlign: 'center',
    fontWeight: '500',
  },
  resultSection: {
    flex: 1,
    alignItems: 'center',
  },
  resultImageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    marginBottom: 32,
    position: 'relative',
  },
  resultImage: {
    width: '100%',
    height: '100%',
  },
  resultBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#000',
  },
  successBadge: {
    backgroundColor: '#34C759',
  },
  failureBadge: {
    backgroundColor: '#FF3B30',
  },
  resultDetails: {
    width: '100%',
    marginBottom: 40,
    gap: 16,
  },
  resultCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  resultLabel: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
    marginBottom: 8,
  },
  resultValue: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  resultDescription: {
    fontSize: 12,
    color: '#636366',
    marginTop: 4,
    fontStyle: 'italic',
  },
  confidenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  confidenceLevel: {
    fontSize: 14,
    fontWeight: '500',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  successIndicator: {
    backgroundColor: '#34C759',
  },
  failureIndicator: {
    backgroundColor: '#FF3B30',
  },
  successText: {
    color: '#34C759',
  },
  failureText: {
    color: '#FF3B30',
  },
  messageCard: {
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  messageText: {
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 20,
  },
  resultButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  secondaryButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
});