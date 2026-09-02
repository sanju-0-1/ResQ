import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, StyleSheet } from 'react-native';
import { useAuth } from '../store/AuthContext';

// Screens
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { ForgotPasswordScreen } from '../screens/ForgotPasswordScreen';

import { HomeScreen } from '../screens/HomeScreen';
import { EmergencyConfirmationScreen } from '../screens/EmergencyConfirmationScreen';
import { ActiveEmergencyScreen } from '../screens/ActiveEmergencyScreen';
import { EmergencyChatScreen } from '../screens/EmergencyChatScreen';
import { EmergencyHistoryScreen } from '../screens/EmergencyHistoryScreen';
import { TrustedContactsScreen } from '../screens/TrustedContactsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';

import { HomegirlDashboardScreen } from '../screens/HomegirlDashboardScreen';
import { ActiveAssistanceScreen } from '../screens/ActiveAssistanceScreen';
import { VerificationFlowScreen } from '../screens/VerificationFlowScreen';

import { AdminDashboardScreen } from '../screens/AdminDashboardScreen';
import { VerificationQueueScreen } from '../screens/VerificationQueueScreen';
import { ReportsQueueScreen } from '../screens/ReportsQueueScreen';

import { COLORS } from '../utils/theme';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.cardDark,
          borderTopColor: COLORS.borderDark,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: COLORS.trustBlueLight,
        tabBarInactiveTintColor: COLORS.textMuted,
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          tabBarLabel: 'SOS Hub',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>🆘</Text>,
        }}
      />
      <Tab.Screen
        name="ContactsTab"
        component={TrustedContactsScreen}
        options={{
          tabBarLabel: 'Contacts',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>👥</Text>,
        }}
      />
      <Tab.Screen
        name="HistoryTab"
        component={EmergencyHistoryScreen}
        options={{
          tabBarLabel: 'Logs',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>📋</Text>,
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>👤</Text>,
        }}
      />
    </Tab.Navigator>
  );
};

export const RootNavigator = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingIcon}>🛡️</Text>
        <Text style={styles.loadingText}>Initializing Community Safety Network for Everyone...</Text>
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="Main" component={MainTabNavigator} />
          <Stack.Screen name="EmergencyConfirmation" component={EmergencyConfirmationScreen} />
          <Stack.Screen name="ActiveEmergency" component={ActiveEmergencyScreen} />
          <Stack.Screen name="EmergencyChat" component={EmergencyChatScreen} />
          <Stack.Screen name="HomegirlDashboard" component={HomegirlDashboardScreen} />
          <Stack.Screen name="ActiveAssistance" component={ActiveAssistanceScreen} />
          <Stack.Screen name="VerificationFlow" component={VerificationFlowScreen} />
          <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
          <Stack.Screen name="VerificationQueue" component={VerificationQueueScreen} />
          <Stack.Screen name="ReportsQueue" component={ReportsQueueScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.bgDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingIcon: { fontSize: 64, marginBottom: 16 },
  loadingText: { color: COLORS.textSecondary, fontSize: 14, fontWeight: '700' },
});
