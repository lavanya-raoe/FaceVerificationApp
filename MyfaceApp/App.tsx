import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'react-native';
import EnrollmentScreen from './src/Screens/EnrollmentScreen';
import VerificationScreen from './src/Screens/VerificationScreen';
import HomeScreen from './src/Screens/HomeScreen';

export type RootStackParamList = {
  Home: undefined;
  Enrollment: undefined;
  Verification: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerShown: false,
            cardStyle: { backgroundColor: '#1a1a2e' },
            gestureEnabled: true,
            animationEnabled: true,
          }}>
          <Stack.Screen 
            name="Home" 
            component={HomeScreen}
            options={{
              animationTypeForReplace: 'push',
            }}
          />
          <Stack.Screen 
            name="Enrollment" 
            component={EnrollmentScreen}
            options={{
              animationTypeForReplace: 'push',
            }}
          />
          <Stack.Screen 
            name="Verification" 
            component={VerificationScreen}
            options={{
              animationTypeForReplace: 'push',
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}