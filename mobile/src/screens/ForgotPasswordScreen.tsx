import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { CustomInput } from '../components/CustomInput';
import { CustomButton } from '../components/CustomButton';
import { COLORS, SPACING, RADIUS } from '../utils/theme';
import { TopHeader } from '../components/TopHeader';

export const ForgotPasswordScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!email) {
      Alert.alert('Required', 'Please enter your registered email address.');
      return;
    }
    setSubmitted(true);
  };

  return (
    <View style={styles.container}>
      <TopHeader title="Reset Password" onBack={() => navigation.goBack()} />
      <View style={styles.content}>
        {submitted ? (
          <View style={styles.successCard}>
            <Text style={styles.successIcon}>✉️</Text>
            <Text style={styles.successTitle}>Password Reset Sent</Text>
            <Text style={styles.successBody}>
              Instructions to reset your password have been sent to {email}.
            </Text>
            <CustomButton title="RETURN TO LOGIN" onPress={() => navigation.navigate('Login')} />
          </View>
        ) : (
          <View style={styles.card}>
            <Text style={styles.title}>Forgot Your Password?</Text>
            <Text style={styles.subtitle}>
              Enter your account email address. We will send a secure verification code to reset your password.
            </Text>
            <CustomInput
              label="Email Address"
              placeholder="e.g. sarah@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <CustomButton title="SEND RESET INSTRUCTIONS" onPress={handleSubmit} />
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgDark },
  content: { padding: SPACING.md, justifyContent: 'center', flex: 1 },
  card: {
    backgroundColor: COLORS.cardDark,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
  },
  successCard: {
    backgroundColor: COLORS.cardDark,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    alignItems: 'center',
  },
  title: { color: COLORS.white, fontSize: 20, fontWeight: '800', marginBottom: SPACING.xs },
  subtitle: { color: COLORS.textSecondary, fontSize: 13, marginBottom: SPACING.md, lineHeight: 18 },
  successIcon: { fontSize: 48, marginBottom: SPACING.sm },
  successTitle: { color: COLORS.white, fontSize: 20, fontWeight: '800', marginBottom: SPACING.xs },
  successBody: { color: COLORS.textSecondary, fontSize: 13, textAlign: 'center', marginBottom: SPACING.md },
});
