import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { useAuth } from '../store/AuthContext';
import { useEmergency } from '../store/EmergencyContext';
import { TopHeader } from '../components/TopHeader';
import { StatusBadge } from '../components/StatusBadge';
import { SafetyCard } from '../components/SafetyCard';
import { CustomButton } from '../components/CustomButton';
import { COLORS, SPACING, RADIUS } from '../utils/theme';
import { api } from '../services/api';
import { showConfirm, showAlert } from '../utils/alert';

export const HomegirlDashboardScreen = ({ navigation }: any) => {
  const { responderProfile, refreshProfile } = useAuth();
  const { nearbyRequests, fetchNearbyRequests, acceptRequest } = useEmergency();
  const [isAvailable, setIsAvailable] = useState<boolean>(responderProfile?.isAvailable || false);
  const [isToggling, setIsToggling] = useState(false);

  useEffect(() => {
    setIsAvailable(responderProfile?.isAvailable || false);
  }, [responderProfile]);

  useEffect(() => {
    if (isAvailable) {
      fetchNearbyRequests();
    }
  }, [isAvailable]);

  const handleToggleAvailability = async () => {
    if (responderProfile?.verificationStatus !== 'approved') {
      showAlert('Verification Required', 'Your ResQ responder application must be approved by admin before going online.');
      return;
    }

    setIsToggling(true);
    try {
      const nextState = !isAvailable;
      const res = await api.patch('/responders/availability', {
        isAvailable: nextState,
        latitude: 40.748817,
        longitude: -73.98513,
      });

      if (res.data?.success) {
        setIsAvailable(nextState);
        await refreshProfile();
        if (nextState) {
          await fetchNearbyRequests();
        }
      }
    } catch (err: any) {
      showAlert('Status Error', err.response?.data?.message || 'Could not update status.');
    } finally {
      setIsToggling(false);
    }
  };

  const handleAcceptCard = async (incidentId: string) => {
    showConfirm(
      'Accept Emergency Request',
      'Safety Reminder: Do NOT physically confront attackers or carry weapons. Maintain a safe distance and act as a witness.',
      async () => {
        try {
          await acceptRequest(incidentId);
          navigation.navigate('ActiveAssistance');
        } catch (err: any) {
          showAlert('Error', err.response?.data?.message || 'Could not accept emergency request.');
        }
      },
      'I ACCEPT (PROVIDE ASSISTANCE)',
      'Decline'
    );
  };

  return (
    <View style={styles.container}>
      <TopHeader
        title="Community Responder Portal"
        subtitle="Volunteer Safety Dashboard for Everyone"
        rightAction={<StatusBadge status={responderProfile?.verificationStatus || 'pending'} type="verification" />}
      />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.availabilityCard}>
          <View style={styles.availHeader}>
            <Text style={styles.availTitle}>Responder Availability</Text>
            <StatusBadge status={isAvailable ? 'available' : 'offline'} type="availability" />
          </View>
          <Text style={styles.availSub}>
            {isAvailable
              ? 'You are currently ONLINE. You will receive real-time emergency requests within 5km.'
              : 'You are OFFLINE. Toggle online to start receiving nearby emergency alerts.'}
          </Text>
          <CustomButton
            title={isAvailable ? '🔴 GO OFFLINE' : '🟢 GO ONLINE (AVAILABLE)'}
            variant={isAvailable ? 'secondary' : 'primary'}
            onPress={handleToggleAvailability}
            isLoading={isToggling}
          />
        </View>

        <SafetyCard />

        <View style={styles.requestsSection}>
          <Text style={styles.sectionHeader}>🚨 Nearby Emergency Requests ({nearbyRequests.length})</Text>

          {!isAvailable ? (
            <View style={styles.offlineBox}>
              <Text style={styles.offlineText}>You are currently offline. Turn availability ON to see live nearby alerts.</Text>
            </View>
          ) : nearbyRequests.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>No active emergency requests in your area right now. Thank you for standing by!</Text>
            </View>
          ) : (
            nearbyRequests.map((req) => {
              const coords = req.location?.coordinates;
              const address = req.addressDescription || (coords ? `Lat: ${coords[1].toFixed(5)}, Lng: ${coords[0].toFixed(5)}` : '');
              const acceptedCount = (req as any).respondersCount || (req as any).respondersAccepted?.length || 0;
              return (
                <View key={req._id} style={styles.emergencyCard}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.emergencyTitle}>🚨 Emergency Assistance Needed</Text>
                    <Text style={styles.distanceTag}>📍 {req.approximateDistance || 'Nearby'}</Text>
                  </View>
                  <Text style={styles.descText}>{req.description}</Text>
                  {address ? <Text style={styles.addressText}>📍 Location: {address}</Text> : null}
                  <Text style={styles.acceptedCountText}>👥 Responders Accepted: {acceptedCount}</Text>
                  <Text style={styles.timeText}>Created: {new Date(req.createdAt).toLocaleTimeString()}</Text>

                  <View style={styles.cardActions}>
                    <TouchableOpacity
                      style={[styles.btn, styles.acceptBtn]}
                      onPress={() => handleAcceptCard(req._id)}
                    >
                      <Text style={styles.acceptBtnText}>ACCEPT ASSISTANCE</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgDark },
  content: { padding: SPACING.md },
  availabilityCard: {
    backgroundColor: COLORS.cardDark,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
  },
  availHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.xs },
  availTitle: { color: COLORS.white, fontSize: 16, fontWeight: '800' },
  availSub: { color: COLORS.textSecondary, fontSize: 12, lineHeight: 18, marginVertical: SPACING.xs },
  requestsSection: { marginTop: SPACING.md },
  sectionHeader: { color: COLORS.white, fontSize: 16, fontWeight: '800', marginBottom: SPACING.sm },
  offlineBox: { backgroundColor: COLORS.cardDark, padding: SPACING.lg, borderRadius: RADIUS.md, alignItems: 'center' },
  offlineText: { color: COLORS.textSecondary, fontSize: 13, textAlign: 'center' },
  emptyBox: { backgroundColor: COLORS.cardDark, padding: SPACING.lg, borderRadius: RADIUS.md, alignItems: 'center' },
  emptyText: { color: COLORS.statusGreen, fontSize: 13, textAlign: 'center', fontWeight: '600' },
  emergencyCard: {
    backgroundColor: COLORS.cardDarkElevated,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1.5,
    borderColor: COLORS.emergencyRed,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  emergencyTitle: { color: COLORS.emergencyRedBright, fontSize: 14, fontWeight: '900' },
  distanceTag: { color: COLORS.statusGold, fontSize: 12, fontWeight: '800' },
  descText: { color: COLORS.white, fontSize: 13, marginBottom: 6 },
  addressText: { color: COLORS.trustBlueLight, fontSize: 12, fontWeight: '700', marginBottom: 4 },
  acceptedCountText: { color: COLORS.statusGold, fontSize: 11, fontWeight: '800', marginBottom: 4 },
  timeText: { color: COLORS.textMuted, fontSize: 10, marginBottom: SPACING.sm },
  cardActions: { flexDirection: 'row', justifyContent: 'flex-end' },
  btn: { paddingHorizontal: SPACING.md, paddingVertical: 10, borderRadius: RADIUS.sm },
  acceptBtn: { backgroundColor: COLORS.trustBlue },
  acceptBtnText: { color: COLORS.white, fontSize: 12, fontWeight: '800' },
});
