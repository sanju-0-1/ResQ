import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useAuth } from '../store/AuthContext';
import { CustomInput } from '../components/CustomInput';
import { CustomButton } from '../components/CustomButton';
import { COLORS, SPACING, RADIUS } from '../utils/theme';

export const RegisterScreen = ({ navigation }: any) => {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !username || !email || !phone || !password) {
      Alert.alert('Incomplete Form', 'Please fill in all required fields.');
      return;
    }

    setIsLoading(true);
    try {
      await register({
        name,
        username,
        email,
        phone,
        password,
        role: 'resq',
      });
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Could not register account. Check server connection.';
      Alert.alert('Registration Failed', errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.headerTitle}>Create Account</Text>
      <Text style={styles.headerSubtitle}>Join ResQ as a Verified Volunteer Responder — Community Safety for Everyone</Text>

      <View style={styles.formCard}>
        <CustomInput label="Full Name" placeholder="e.g. Alex Doe" value={name} onChangeText={setName} />
        <CustomInput label="Username" placeholder="e.g. alexdoe" value={username} onChangeText={setUsername} autoCapitalize="none" />
        <CustomInput label="Email Address" placeholder="e.g. alex@example.com" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        <CustomInput label="Phone Number" placeholder="e.g. +1 555 123 4567" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        <CustomInput label="Password" placeholder="Minimum 6 characters" secureTextEntry value={password} onChangeText={setPassword} />

        <View style={{ marginTop: SPACING.sm }}>
          <CustomButton title="REGISTER AS VOLUNTEER RESPONDER" onPress={handleRegister} isLoading={isLoading} />
        </View>

        <TouchableOpacity onPress={() => navigation.navigate('Login')} style={{ marginTop: SPACING.md }}>
          <Text style={styles.loginLink}>Already have an account? Sign In</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgDark },
  content: { padding: SPACING.md },
  headerTitle: { color: COLORS.white, fontSize: 28, fontWeight: '900', marginTop: SPACING.lg },
  headerSubtitle: { color: COLORS.textSecondary, fontSize: 13, marginBottom: SPACING.md },
  formCard: {
    backgroundColor: COLORS.cardDark,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
  },
  loginLink: { color: COLORS.trustBlueLight, fontSize: 13, textAlign: 'center', fontWeight: '700' },
});
