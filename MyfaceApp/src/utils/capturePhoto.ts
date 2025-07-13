import { launchCamera, ImagePickerResponse, MediaType } from 'react-native-image-picker';
import { Alert, PermissionsAndroid, Platform } from 'react-native';

export const capturePhoto = (): Promise<string | null> => {
  return new Promise((resolve) => {
    const options = {
      mediaType: 'photo' as MediaType,
      quality: 0.8,
      maxWidth: 800,
      maxHeight: 600,
      includeBase64: true,
      storageOptions: {
        skipBackup: true,
        path: 'images',
      },
    };

    const requestCameraPermission = async () => {
      if (Platform.OS === 'android') {
        try {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.CAMERA,
            {
              title: 'Camera Permission',
              message: 'This app needs access to camera to take photos.',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            }
          );
          return granted === PermissionsAndroid.RESULTS.GRANTED;
        } catch (err) {
          console.warn(err);
          return false;
        }
      }
      return true;
    };

    const openCamera = async () => {
      const hasPermission = await requestCameraPermission();
      
      if (!hasPermission) {
        Alert.alert(
          'Permission Required',
          'Camera permission is required to take photos.',
          [{ text: 'OK', onPress: () => resolve(null) }]
        );
        return;
      }

      launchCamera(options, (response: ImagePickerResponse) => {
        if (response.didCancel) {
          console.log('User cancelled camera');
          resolve(null);
        } else if (response.errorMessage) {
          console.log('Camera Error: ', response.errorMessage);
          Alert.alert('Error', response.errorMessage);
          resolve(null);
        } else if (response.assets && response.assets[0]) {
          const asset = response.assets[0];
          if (asset.base64) {
            resolve(`data:image/jpeg;base64,${asset.base64}`);
          } else {
            Alert.alert('Error', 'Failed to get image data');
            resolve(null);
          }
        } else {
          Alert.alert('Error', 'No image captured');
          resolve(null);
        }
      });
    };

    openCamera();
  });
};