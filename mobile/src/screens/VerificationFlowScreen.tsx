import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useAuth } from '../store/AuthContext';
import { TopHeader } from '../components/TopHeader';
import { CustomInput } from '../components/CustomInput';
import { CustomButton } from '../components/CustomButton';
import { COLORS, SPACING, RADIUS } from '../utils/theme';
import { api } from '../services/api';

export const VerificationFlowScreen = ({ navigation }: any) => {
  const { refreshProfile } = useAuth();
  const [fullName, setFullName] = useState('');
  const [idType, setIdType] = useState<'national_id' | 'driver_license' | 'passport' | 'other'>('national_id');
  const [idNumber, setIdNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!fullName || !idNumber) {
      Alert.alert('Incomplete Form', 'Please provide your full legal name and ID document reference.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.post('/responders/apply', {
        fullName,
        idType,
        idNumberOrHash: idNumber,
        emergencyRadiusMeters: 5000,
      });

      if (res.data?.success) {
        await refreshProfile();
        Alert.alert(
          'Application Submitted',
          'Your volunteer responder verification application has been submitted to admin moderators for review.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      }
    } catch (err: any) {
      Alert.alert('Application Failed', err.response?.data?.message || 'Could not submit verification.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TopHeader title="Volunteer Verification" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.privacyBox}>
          <Text style={styles.privacyIcon}>🔒</Text>
          <Text style={styles.privacyTitle}>STRICT PRIVACY GUARANTEE</Text>
          <Text style={styles.privacySub}>
            Your government ID and identity documents are hashed and kept encrypted. They will NEVER be publicly displayed or shared.
          </Text>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Volunteer Application Details (Safety for Everyone)</Text>

          <CustomInput
            label="Full Legal Name"
            placeholder="As shown on government identification"
            value={fullName}
            onChangeText={setFullName}
          />

          <Text style={styles.label}>ID Document Type</Text>
          <View style={styles.typeRow}>
            {[
              { key: 'national_id', label: 'National ID' },
              { key: 'driver_license', label: "Driver's License" },
              { key: 'passport', label: 'Passport' },
            ].map((item) => (
              <TouchableOpacity
                key={item.key}
                style={[styles.typeOption, idType === item.key && styles.typeSelected]}
                onPress={() => setIdType(item.key as any)}
              >
                <Text style={[styles.typeText, idType === item.key && styles.typeTextSelected]}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <CustomInput
            label="ID Reference Number"
            placeholder="e.g. A12345678"
            value={idNumber}
            onChangeText={setIdNumber}
            secureTextEntry
          />

          <CustomButton title="SUBMIT FOR ADMIN VERIFICATION" onPress={handleSubmit} isLoading={isLoading} />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgDark },
  content: { padding: SPACING.md },
  privacyBox: {
    backgroundColor: 'rgba(30, 136, 229, 0.15)',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.trustBlue,
  },
  privacyIcon: { fontSize: 32, marginBottom: 4 },
  privacyTitle: { color: COLORS.trustBlueLight, fontSize: 13, fontWeight: '900', textAlign: 'center' },
  privacySub: { color: COLORS.textSecondary, fontSize: 11, textAlign: 'center', marginTop: 4, lineHeight: 16 },
  formCard: {
    backgroundColor: COLORS.cardDark,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
  },
  formTitle: { color: COLORS.white, fontSize: 16, fontWeight: '800', marginBottom: SPACING.sm },
  label: { color: COLORS.textSecondary, fontSize: 13, fontWeight: '600', marginTop: SPACING.xs, marginBottom: 6 },
  typeRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.md },
  typeOption: {
    flex: 0.31,
    paddingVertical: 10,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.cardDarkElevated,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderDark,
  },
  typeSelected: { borderColor: COLORS.trustBlue, backgroundColor: 'rgba(30, 136, 229, 0.2)' },
  typeText: { color: COLORS.textSecondary, fontSize: 11, fontWeight: '700' },
  typeTextSelected: { color: COLORS.trustBlueLight },
});
