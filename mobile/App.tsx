import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/store/AuthContext';
import { EmergencyProvider } from './src/store/EmergencyContext';
import { RootNavigator } from './src/navigation/RootNavigator';

export default function App() {
  return (
    <NavigationContainer>
      <AuthProvider>
        <EmergencyProvider>
          <StatusBar style="light" backgroundColor="#121824" />
          <RootNavigator />
        </EmergencyProvider>
      </AuthProvider>
    </NavigationContainer>
  );
}
