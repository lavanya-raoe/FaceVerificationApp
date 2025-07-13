import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  TextInput,
  Alert,
  ActivityIndicator,
  Animated,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { capturePhoto } from '../utils/capturePhoto';
import axios from 'axios';
import { RootStackParamList } from '../../App';

type EnrollmentScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Enrollment'>;

const { width } = Dimensions.get('window');

export default function EnrollmentScreen() {
  const navigation = useNavigation<EnrollmentScreenNavigationProp>();
  const [userName, setUserName] = useState('');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const successModalAnim = useRef(new Animated.Value(0)).current;
  const successScaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [step]);

  useEffect(() => {
    if (showSuccessModal) {
      Animated.parallel([
        Animated.timing(successModalAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(successScaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      successModalAnim.setValue(0);
      successScaleAnim.setValue(0.8);
    }
  }, [showSuccessModal]);

  const handleCapturePhoto = async () => {
    try {
      const result = await capturePhoto();
      if (result) {
        setCapturedImage(result);
        setStep(3);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to capture photo');
    }
  };

  const handleEnrollment = async () => {
    if (!userName.trim()) {
      Alert.alert('Error', 'Please enter a name');
      return;
    }

    if (!capturedImage) {
      Alert.alert('Error', 'Please capture a photo');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('http://192.168.0.105:5000/enroll', {
        name: userName,
        image: capturedImage,
      });
      
      setShowSuccessModal(true);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to enroll user');
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    setTimeout(() => {
      navigation.goBack();
    }, 200);
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}>
        <Icon name="arrow-back" size={24} color="#007AFF" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Face Enrollment</Text>
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

  const renderNameInput = () => (
    <Animated.View style={[styles.stepContainer, { opacity: fadeAnim }]}>
      <View style={styles.stepHeader}>
        <Text style={styles.stepTitle}>What's your name?</Text>
        <Text style={styles.stepSubtitle}>This will be used to identify you</Text>
      </View>

      <View style={styles.inputSection}>
        <Text style={styles.inputLabel}>Full Name</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Enter your full name"
          placeholderTextColor="#8E8E93"
          value={userName}
          onChangeText={setUserName}
          autoCapitalize="words"
          autoFocus
        />
      </View>

      <TouchableOpacity
        style={[styles.primaryButton, !userName.trim() && styles.disabledButton]}
        onPress={() => setStep(2)}
        disabled={!userName.trim()}>
        <Text style={[styles.buttonText, !userName.trim() && styles.disabledButtonText]}>
          Continue
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderPhotoCapture = () => (
    <Animated.View style={[styles.stepContainer, { opacity: fadeAnim }]}>
      <View style={styles.stepHeader}>
        <Text style={styles.stepTitle}>Take your photo</Text>
        <Text style={styles.stepSubtitle}>Position your face clearly in the frame</Text>
      </View>

      <View style={styles.captureSection}>
        <TouchableOpacity
          style={styles.captureButton}
          onPress={handleCapturePhoto}>
          <View style={styles.captureFrame}>
            <Icon name="camera-alt" size={40} color="#007AFF" />
            <Text style={styles.captureText}>Tap to capture</Text>
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

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => setStep(1)}>
        <Text style={styles.secondaryButtonText}>Back</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderReview = () => (
    <Animated.View style={[styles.stepContainer, { opacity: fadeAnim }]}>
      <View style={styles.stepHeader}>
        <Text style={styles.stepTitle}>Review & Confirm</Text>
        <Text style={styles.stepSubtitle}>Make sure everything looks good</Text>
      </View>

      <View style={styles.reviewSection}>
        <View style={styles.reviewCard}>
          <Text style={styles.reviewLabel}>Name</Text>
          <Text style={styles.reviewValue}>{userName}</Text>
        </View>

        {capturedImage && (
          <View style={styles.photoPreview}>
            <Image source={{ uri: capturedImage }} style={styles.previewImage} />
            <TouchableOpacity
              style={styles.retakeButton}
              onPress={() => setStep(2)}>
              <Icon name="refresh" size={20} color="#007AFF" />
              <Text style={styles.retakeText}>Retake</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => setStep(2)}>
          <Text style={styles.secondaryButtonText}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.primaryButton, styles.flexButton]}
          onPress={handleEnrollment}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Enroll Face</Text>
          )}
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  const renderSuccessModal = () => (
    <Modal
      visible={showSuccessModal}
      transparent
      animationType="none"
      onRequestClose={handleSuccessModalClose}>
      <Animated.View
        style={[
          styles.modalOverlay,
          { opacity: successModalAnim }
        ]}>
        <Animated.View
          style={[
            styles.modalContent,
            {
              opacity: successModalAnim,
              transform: [{ scale: successScaleAnim }]
            }
          ]}>
          {/* Success Icon */}
          <View style={styles.successIconContainer}>
            <View style={styles.successIconCircle}>
              <Icon name="check" size={40} color="#FFFFFF" />
            </View>
          </View>

          {/* Success Message */}
          <Text style={styles.successTitle}>Enrollment Successful!</Text>
          <Text style={styles.successMessage}>
            <Text style={styles.userName}>{userName}</Text> has been enrolled successfully.
            You can now use face verification to authenticate.
          </Text>

          {/* Enrolled Photo */}
          {capturedImage && (
            <View style={styles.enrolledPhotoContainer}>
              <Image source={{ uri: capturedImage }} style={styles.enrolledPhoto} />
              <View style={styles.enrolledPhotoBadge}>
                <Icon name="verified" size={16} color="#FFFFFF" />
              </View>
            </View>
          )}

          {/* Success Details */}
          <View style={styles.successDetails}>
            <View style={styles.successDetailItem}>
              <Icon name="person" size={20} color="#34C759" />
              <Text style={styles.successDetailText}>Face template saved</Text>
            </View>
            <View style={styles.successDetailItem}>
              <Icon name="security" size={20} color="#34C759" />
              <Text style={styles.successDetailText}>Ready for verification</Text>
            </View>
          </View>

          {/* Action Button */}
          <TouchableOpacity
            style={styles.successButton}
            onPress={handleSuccessModalClose}>
            <Text style={styles.successButtonText}>Continue</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </Modal>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <SafeAreaView style={styles.safeArea}>
        {renderHeader()}
        {renderProgressBar()}
        
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          {step === 1 && renderNameInput()}
          {step === 2 && renderPhotoCapture()}
          {step === 3 && renderReview()}
        </ScrollView>
      </SafeAreaView>

      {renderSuccessModal()}
    </KeyboardAvoidingView>
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
  },
  stepSubtitle: {
    fontSize: 16,
    color: '#8E8E93',
    lineHeight: 22,
  },
  inputSection: {
    marginBottom: 40,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  textInput: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  captureSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  captureButton: {
    width: 200,
    height: 200,
    marginBottom: 32,
  },
  captureFrame: {
    flex: 1,
    backgroundColor: '#1C1C1E',
    borderRadius: 100,
    borderWidth: 3,
    borderColor: '#007AFF',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureText: {
    fontSize: 16,
    color: '#007AFF',
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
  reviewSection: {
    flex: 1,
    marginBottom: 40,
  },
  reviewCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  reviewLabel: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
    marginBottom: 4,
  },
  reviewValue: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  photoPreview: {
    alignItems: 'center',
  },
  previewImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  retakeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  retakeText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  flexButton: {
    flex: 1,
  },
  disabledButton: {
    backgroundColor: '#2C2C2E',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  disabledButtonText: {
    color: '#8E8E93',
  },
  secondaryButton: {
    paddingVertical: 16,
    alignItems: 'center',
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  secondaryButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalContent: {
    backgroundColor: '#1C1C1E',
    borderRadius: 20,
    padding: 32,
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  successIconContainer: {
    marginBottom: 24,
  },
  successIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#34C759',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  userName: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  enrolledPhotoContainer: {
    position: 'relative',
    marginBottom: 24,
  },
  enrolledPhoto: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#34C759',
  },
  enrolledPhotoBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#34C759',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#1C1C1E',
  },
  successDetails: {
    width: '100%',
    marginBottom: 32,
    gap: 12,
  },
  successDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  successDetailText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  successButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    width: '100%',
    alignItems: 'center',
  },
  successButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});