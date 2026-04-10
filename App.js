import React, { useContext } from 'react';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import TabNavigator from './src/navigation/TabNavigator';
import { ListProvider } from './src/context/ListContext';
import { AlertsProvider } from './src/context/AlertsContext';
import { ActivityProvider } from './src/context/ActivityContext';
import { AuthProvider, AuthContext } from './src/context/AuthContext';
import LoginScreen from './src/screens/LoginScreen';

function MainApp() {
  const { user, isLoading } = useContext(AuthContext);

  if (isLoading) return <View style={{ flex: 1, backgroundColor: '#1E3A8A' }} />;

  if (!user) {
    return <LoginScreen />;
  }

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
