import React, { useContext, useState, useEffect } from 'react';
import { View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import TabNavigator from './src/navigation/TabNavigator';
import { ListProvider } from './src/context/ListContext';
import { AlertsProvider } from './src/context/AlertsContext';
import { ActivityProvider } from './src/context/ActivityContext';
import { AuthProvider, AuthContext } from './src/context/AuthContext';
import LoginScreen from './src/screens/LoginScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import { colors, useAppColors } from './src/theme/colors';



function MainApp() {
  const { user, isLoading: isAuthLoading } = useContext(AuthContext);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(null);
  const activeColors = useAppColors();
  const styles = getStyles(activeColors);

  useEffect(() => {
    async function checkOnboarding() {
      try {
        const value = await AsyncStorage.getItem('@has_seen_onboarding');
        if (value !== null) {
          setHasSeenOnboarding(true);
        } else {
          setHasSeenOnboarding(false);
        }
      } catch (err) {
        setHasSeenOnboarding(false);
      }
    }
    checkOnboarding();
  }, []);

  const finishOnboarding = async () => {
    await AsyncStorage.setItem('@has_seen_onboarding', 'true');
    setHasSeenOnboarding(true);
  };

  // Pantallas de Carga Iniciales
  if (isAuthLoading || hasSeenOnboarding === null) {
    return <View style={styles.container} />;
  }

  // Si primera vez -> Onboarding
  if (!hasSeenOnboarding) {
    return <OnboardingScreen onFinish={finishOnboarding} />;
  }

  // Si no está logueado
  if (!user) {
    return <LoginScreen />;
  }

  // Si todo esta okay -> App Principal
  return (
    <ActivityProvider>
      <ListProvider>
        <AlertsProvider>
          <NavigationContainer>
            <StatusBar style="auto" />
            <TabNavigator />
          </NavigationContainer>
        </AlertsProvider>
      </ListProvider>
    </ActivityProvider>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const getStyles = (colors) => ({
  container: { flex: 1, backgroundColor: colors.background }
});
