import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS, DIMENSIONS } from '../utils/constants';

interface GradientButtonProps {
  title: string;
  onPress: () => void;
  colors?: string[];
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const GradientButton: React.FC<GradientButtonProps> = ({
  title,
  onPress,
  colors = [COLORS.primary, COLORS.secondary],
  disabled = false,
  loading = false,
  icon,
  style,
  textStyle,
}) => {
  return (
    <TouchableOpacity
      style={[styles.buttonContainer, style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}>
      <LinearGradient
        colors={disabled ? ['#666', '#666'] : colors}
        style={styles.gradientButton}>
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <View style={styles.buttonContent}>
            {icon && <Icon name={icon} size={20} color="#fff" style={styles.buttonIcon} />}
            <Text style={[styles.buttonText, textStyle]}>{title}</Text>
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  visible,
  message = 'Loading...',
}) => {
  if (!visible) return null;

  return (
    <View style={styles.loadingOverlay}>
      <View style={styles.loadingContent}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>{message}</Text>
      </View>
    </View>
  );
};

interface StatusCardProps {
  title: string;
  subtitle?: string;
  icon: string;
  iconColor: string;
  backgroundColor: string;
  onPress?: () => void;
}

export const StatusCard: React.FC<StatusCardProps> = ({
  title,
  subtitle,
  icon,
  iconColor,
  backgroundColor,
  onPress,
}) => {
  const CardComponent = onPress ? TouchableOpacity : View;

  return (
    <CardComponent
      style={[styles.statusCard, { backgroundColor }]}
      onPress={onPress}
      activeOpacity={onPress ? 0.8 : 1}>
      <Icon name={icon} size={40} color={iconColor} />
      <Text style={styles.statusTitle}>{title}</Text>
      {subtitle && <Text style={styles.statusSubtitle}>{subtitle}</Text>}
    </CardComponent>
  );
};

interface HeaderProps {
  title: string;
  onBackPress?: () => void;
  rightComponent?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  onBackPress,
  rightComponent,
}) => {
  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        {onBackPress && (
          <TouchableOpacity style={styles.backButton} onPress={onBackPress}>
            <Icon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
        )}
      </View>
      <Text style={styles.headerTitle}>{title}</Text>
      <View style={styles.headerRight}>{rightComponent}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  // Button styles
  buttonContainer: {
    borderRadius: DIMENSIONS.borderRadius,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  gradientButton: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: DIMENSIONS.buttonHeight,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIcon: {
    marginRight: 10,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },

  // Loading overlay styles
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: DIMENSIONS.borderRadius,
    padding: 30,
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 15,
  },

  // Status card styles
  statusCard: {
    padding: 20,
    borderRadius: DIMENSIONS.borderRadius,
    alignItems: 'center',
    marginVertical: 10,
    minHeight: 120,
    justifyContent: 'center',
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 10,
    textAlign: 'center',
  },
  statusSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 5,
    textAlign: 'center',
  },

  // Header styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    height: DIMENSIONS.headerHeight,
  },
  headerLeft: {
    width: 40,
  },
  headerRight: {
    width: 40,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
});