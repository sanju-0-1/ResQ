import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { useAuth } from '../store/AuthContext';
import { useEmergency } from '../store/EmergencyContext';
import { EmergencyButton } from '../components/EmergencyButton';
import { SafetyCard } from '../components/SafetyCard';
import { StatusBadge } from '../components/StatusBadge';
import { TopHeader } from '../components/TopHeader';
import { COLORS, SPACING, RADIUS } from '../utils/theme';
import { EMERGENCY_NUMBERS } from '../utils/constants';
import { showConfirm, showAlert } from '../utils/alert';

export const HomeScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const { activeEmergency, isTriggering, triggerSOS } = useEmergency();

  const isRequester =
    !activeEmergency ||
    activeEmergency.requesterId === user?._id ||
    (activeEmergency.requesterId as any)?._id === user?._id;

  const handleSOSPress = async () => {
    if (activeEmergency) {
      navigation.navigate(isRequester ? 'ActiveEmergency' : 'ActiveAssistance');
      return;
    }

    try {
      await triggerSOS('Harassment or physical safety threat. Immediate assistance requested.');
      navigation.navigate('ActiveEmergency');
    } catch (err: any) {
      const msg = err.message || 'Unable to trigger emergency request.';
      if (msg.includes('already have an active emergency')) {
        navigation.navigate(isRequester ? 'ActiveEmergency' : 'ActiveAssistance');
      } else {
        showAlert('Emergency Dispatch Failed', msg);
      }
    }
  };

  const handleCallEmergencyServices = () => {
    const number = EMERGENCY_NUMBERS[0].number;
    showConfirm(
      'Official Emergency Services',
      `Call ${number} (Police / Medical / Fire)?`,
      () => {
        Linking.openURL(`tel:${number}`);
      },
      'CALL NOW',
      'Cancel'
    );
  };

  return (
    <View style={styles.container}>
      <TopHeader
        title="Community Safety Hub"
        subtitle={`Emergency safety for everyone • Welcome, ${user?.name || 'User'}`}
        rightAction={
          user?.isVerifiedResponder ? (
            <StatusBadge status="approved" type="verification" />
          ) : undefined
        }
      />

      <ScrollView contentContainerStyle={styles.content}>
        {activeEmergency ? (
          <TouchableOpacity
            style={styles.activeBanner}
            onPress={() => navigation.navigate(isRequester ? 'ActiveEmergency' : 'ActiveAssistance')}
          >
            <Text style={styles.activeBannerIcon}>🚨</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.activeBannerTitle}>ACTIVE EMERGENCY IN PROGRESS</Text>
              <Text style={styles.activeBannerSub}>Tap to open live status & map</Text>
            </View>
            <StatusBadge status={activeEmergency.status} type="emergency" />
          </TouchableOpacity>
        ) : null}

        <View style={styles.sosContainer}>
          <EmergencyButton onPress={handleSOSPress} isLoading={isTriggering} />
        </View>

        <View style={styles.quickActionsRow}>
          <TouchableOpacity style={styles.actionCard} onPress={handleCallEmergencyServices}>
            <Text style={styles.actionIcon}>📞</Text>
            <Text style={styles.actionTitle}>CALL 911 / 112</Text>
            <Text style={styles.actionSub}>Official Emergency</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('ContactsTab')}>
            <Text style={styles.actionIcon}>👥</Text>
            <Text style={styles.actionTitle}>CONTACTS</Text>
            <Text style={styles.actionSub}>Notify Trusted List</Text>
          </TouchableOpacity>
        </View>

        <SafetyCard />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgDark },
  content: { padding: SPACING.md, alignItems: 'center' },
  activeBanner: {
    width: '100%',
    backgroundColor: 'rgba(229, 57, 53, 0.15)',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.emergencyRed,
  },
  activeBannerIcon: { fontSize: 24, marginRight: SPACING.sm },
  activeBannerTitle: { color: COLORS.emergencyRedBright, fontSize: 13, fontWeight: '900' },
  activeBannerSub: { color: COLORS.textSecondary, fontSize: 11 },
  sosContainer: { marginVertical: SPACING.xl, alignItems: 'center' },
  quickActionsRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: SPACING.md },
  actionCard: {
    flex: 0.48,
    backgroundColor: COLORS.cardDark,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderDark,
  },
  actionIcon: { fontSize: 28, marginBottom: 4 },
  actionTitle: { color: COLORS.white, fontSize: 12, fontWeight: '800' },
  actionSub: { color: COLORS.textSecondary, fontSize: 10 },
});
