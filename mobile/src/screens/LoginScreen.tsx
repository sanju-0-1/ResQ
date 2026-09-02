import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useAuth } from '../store/AuthContext';
import { CustomInput } from '../components/CustomInput';
import { CustomButton } from '../components/CustomButton';
import { COLORS, SPACING, RADIUS } from '../utils/theme';

export const LoginScreen = ({ navigation }: any) => {
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!identifier || !password) {
      Alert.alert('Required Fields', 'Please fill in both email/username and password.');
      return;
    }

    setIsLoading(true);
    try {
      await login(identifier, password);
    } catch (err: any) {
      Alert.alert('Login Failed', err.response?.data?.message || 'Invalid credentials or server unavailable.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerBox}>
        <Text style={styles.logoIcon}>🛡️</Text>
        <Text style={styles.appName}>ResQ</Text>
        <Text style={styles.tagline}>Emergency Safety & De-escalation Network for Everyone</Text>
      </View>

      <View style={styles.formCard}>
        <Text style={styles.formTitle}>Sign In</Text>

        <CustomInput
          label="Email, Phone, or Username"
          placeholder="e.g. alex@example.com or alex_r"
          value={identifier}
          onChangeText={setIdentifier}
          autoCapitalize="none"
        />

        <CustomInput
          label="Password"
          placeholder="••••••••"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
          <Text style={styles.forgotText}>Forgot Password?</Text>
        </TouchableOpacity>

        <CustomButton title="SIGN IN" onPress={handleLogin} isLoading={isLoading} />

        <View style={styles.registerRow}>
          <Text style={styles.registerPrompt}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.registerLink}>Register Now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgDark },
  content: { padding: SPACING.md, justifyContent: 'center', minHeight: '100%' },
  headerBox: { alignItems: 'center', marginBottom: SPACING.xl },
  logoIcon: { fontSize: 56, marginBottom: 8 },
  appName: { color: COLORS.white, fontSize: 32, fontWeight: '900', letterSpacing: 1 },
  tagline: { color: COLORS.textSecondary, fontSize: 13, textAlign: 'center', marginTop: 4 },
  formCard: {
    backgroundColor: COLORS.cardDark,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
  },
  formTitle: { color: COLORS.white, fontSize: 20, fontWeight: '800', marginBottom: SPACING.md },
  forgotText: { color: COLORS.trustBlueLight, fontSize: 12, textAlign: 'right', marginVertical: SPACING.xs },
  registerRow: { flexDirection: 'row', justifyContent: 'center', marginTop: SPACING.md },
  registerPrompt: { color: COLORS.textSecondary, fontSize: 13 },
  registerLink: { color: COLORS.trustBlueLight, fontSize: 13, fontWeight: '700' },
});
