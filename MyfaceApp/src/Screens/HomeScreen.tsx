import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { RootStackParamList } from '../../App';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

const { width, height } = Dimensions.get('window');

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleButtonPress = (screen: 'Enrollment' | 'Verification') => {
    navigation.navigate(screen);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <SafeAreaView style={styles.safeArea}>
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}>
          
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <View style={styles.logoCircle}>
                <Icon name="face" size={32} color="#007AFF" />
              </View>
            </View>
            <Text style={styles.title}>FaceAuth</Text>
            <Text style={styles.subtitle}>Secure facial authentication</Text>
          </View>

          {/* Main Content */}
          <View style={styles.mainContent}>
            <TouchableOpacity
              style={[styles.actionCard, styles.enrollCard]}
              onPress={() => handleButtonPress('Enrollment')}
              activeOpacity={0.95}>
              <View style={styles.cardIcon}>
                <Icon name="person-add" size={28} color="#007AFF" />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>Enroll Face</Text>
                <Text style={styles.cardSubtitle}>Register your face for secure access</Text>
              </View>
              <Icon name="arrow-forward-ios" size={20} color="#8E8E93" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, styles.verifyCard]}
              onPress={() => handleButtonPress('Verification')}
              activeOpacity={0.95}>
              <View style={styles.cardIcon}>
                <Icon name="face-retouching-natural" size={28} color="#34C759" />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>Verify Identity</Text>
                <Text style={styles.cardSubtitle}>Authenticate using your face</Text>
              </View>
              <Icon name="arrow-forward-ios" size={20} color="#8E8E93" />
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>- HICML Project</Text>
            <Text style={styles.footerSubtext}>Amrit Khadka • Lavanya Rao</Text>
          </View>
        </Animated.View>
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
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 80,
  },
  logoContainer: {
    marginBottom: 24,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1C1C1E',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 17,
    color: '#8E8E93',
    fontWeight: '400',
  },
  mainContent: {
    flex: 1,
    gap: 16,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  enrollCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  verifyCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#34C759',
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2C2C2E',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 15,
    color: '#8E8E93',
    fontWeight: '400',
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 32,
    marginTop: 40,
  },
  footerText: {
    fontSize: 15,
    color: '#8E8E93',
    fontWeight: '500',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 13,
    color: '#636366',
    fontWeight: '400',
  },
});  