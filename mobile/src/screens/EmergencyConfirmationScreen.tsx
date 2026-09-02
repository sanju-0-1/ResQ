import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useEmergency } from '../store/EmergencyContext';
import { TopHeader } from '../components/TopHeader';
import { CustomButton } from '../components/CustomButton';
import { CustomInput } from '../components/CustomInput';
import { SafetyCard } from '../components/SafetyCard';
import { COLORS, SPACING, RADIUS } from '../utils/theme';
import { showAlert } from '../utils/alert';

export const EmergencyConfirmationScreen = ({ navigation }: any) => {
  const { triggerSOS, isTriggering } = useEmergency();
  const [description, setDescription] = useState('Harassment or physical safety threat. Immediate assistance requested.');

  const handleConfirmSOS = async () => {
    try {
      await triggerSOS(description);
      navigation.navigate('ActiveEmergency');
    } catch (err: any) {
      const msg = err.message || 'Unable to trigger emergency request.';
      if (msg.includes('already have an active emergency')) {
        showAlert(
          'Active Emergency Exists',
          'You already have an active emergency request in progress. Directing you to your active emergency session.',
          () => navigation.navigate('ActiveEmergency')
        );
      } else {
        showAlert('Emergency Dispatch Failed', msg);
      }
    }
  };

  return (
    <View style={styles.container}>
      <TopHeader title="Confirm Emergency Request" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.alertCard}>
          <Text style={styles.alertIcon}>🚨</Text>
          <Text style={styles.alertTitle}>YOU ARE ABOUT TO DISPATCH AN EMERGENCY ALERT</Text>
          <Text style={styles.alertSub}>
            This will broadcast your location to verified nearby volunteer responders and notify your trusted contacts.
          </Text>
        </View>

        <View style={styles.inputCard}>
          <CustomInput
            label="Situation Description (Optional)"
            placeholder="e.g. Followed near bus stop by unknown individual"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
          />
        </View>

        <SafetyCard />

        <View style={styles.buttonGroup}>
          <CustomButton
            title="🆘 HOLD 1.5s TO BROADCAST EMERGENCY"
            variant="danger"
            onPress={() => {}}
            onLongPress={handleConfirmSOS}
            delayLongPress={1500}
            isLoading={isTriggering}
            subtitle="PRESS AND HOLD TO DISPATCH ALERT"
          />
          <CustomButton
            title="CANCEL"
            variant="secondary"
            onPress={() => navigation.goBack()}
            disabled={isTriggering}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgDark },
  content: { padding: SPACING.md },
  alertCard: {
    backgroundColor: 'rgba(229, 57, 53, 0.15)',
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.emergencyRed,
    marginBottom: SPACING.md,
  },
  alertIcon: { fontSize: 40, marginBottom: 8 },
  alertTitle: { color: COLORS.emergencyRedBright, fontSize: 15, fontWeight: '900', textAlign: 'center', marginBottom: 4 },
  alertSub: { color: COLORS.textSecondary, fontSize: 12, textAlign: 'center', lineHeight: 18 },
  inputCard: {
    backgroundColor: COLORS.cardDark,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
    marginBottom: SPACING.sm,
  },
  buttonGroup: { marginTop: SPACING.md },
});
