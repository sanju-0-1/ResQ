import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Linking } from 'react-native';
import { useAuth } from '../store/AuthContext';
import { useEmergency } from '../store/EmergencyContext';
import { TopHeader } from '../components/TopHeader';
import { StatusBadge } from '../components/StatusBadge';
import { CustomButton } from '../components/CustomButton';
import { LocationMapView } from '../components/LocationMapView';
import { COLORS, SPACING, RADIUS } from '../utils/theme';
import { EMERGENCY_NUMBERS } from '../utils/constants';
import { showConfirm, showAlert } from '../utils/alert';

export const ActiveEmergencyScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const { activeEmergency, cancelEmergency, resolveEmergency, refreshActiveEmergency } = useEmergency();

  const currentUserId = user?._id || (user as any)?.id;
  const isRequester =
    !activeEmergency ||
    activeEmergency.requesterId === currentUserId ||
    (activeEmergency.requesterId as any)?._id === currentUserId;

  useEffect(() => {
    if (activeEmergency && !isRequester) {
      navigation.replace('ActiveAssistance');
    }
  }, [activeEmergency, isRequester]);

  useEffect(() => {
    const interval = setInterval(() => {
      refreshActiveEmergency();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  if (!activeEmergency) {
    return (
      <View style={styles.container}>
        <TopHeader title="Active Emergency" onBack={() => navigation.goBack()} />
        <View style={styles.emptyContent}>
          <Text style={styles.emptyIcon}>✅</Text>
          <Text style={styles.emptyTitle}>No Active Emergency</Text>
          <Text style={styles.emptySub}>You do not currently have any active emergency requests in progress.</Text>
          <CustomButton title="RETURN TO HOME" onPress={() => navigation.navigate('Main')} />
        </View>
      </View>
    );
  }

  const isResponderFound = activeEmergency.status === 'responder_found' || activeEmergency.status === 'assistance_in_progress';
  const responder = activeEmergency.responderId;

  const handleCancel = () => {
    showConfirm(
      'Cancel Emergency Alert',
      'Are you sure you want to cancel this emergency request?',
      async () => {
        try {
          await cancelEmergency(activeEmergency._id);
          navigation.navigate('Main');
        } catch (err: any) {
          showAlert('Cancel Failed', err.message || 'Could not cancel emergency request.');
        }
      },
      'Yes, Cancel Request',
      'No, Keep Active'
    );
  };

  const handleResolve = () => {
    showConfirm(
      'Resolve Emergency',
      'Have you reached safety?',
      async () => {
        try {
          await resolveEmergency(activeEmergency._id);
          navigation.navigate('Main');
        } catch (err: any) {
          showAlert('Resolve Failed', err.message || 'Could not resolve emergency request.');
        }
      },
      'I Am Safe (Resolve)',
      'Not Yet'
    );
  };

  const handleCall911 = () => {
    Linking.openURL(`tel:${EMERGENCY_NUMBERS[0].number}`);
  };

  return (
    <View style={styles.container}>
      <TopHeader title="Active Emergency Session" onBack={() => navigation.navigate('Main')} />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.statusBox}>
          <StatusBadge status={activeEmergency.status} type="emergency" />
          <Text style={styles.incidentIdText}>Incident #{activeEmergency._id.slice(-6).toUpperCase()}</Text>
        </View>

        {isResponderFound ? (
          <View style={styles.responderCard}>
            <Text style={styles.responderHeader}>
              🛡️ {activeEmergency.respondersAccepted?.length || 1} VERIFIED RESPONDER(S) ACCEPTED & EN ROUTE
            </Text>
            {activeEmergency.respondersAccepted && activeEmergency.respondersAccepted.length > 0 ? (
              activeEmergency.respondersAccepted.map((resp: any, index: number) => (
                <View key={resp._id || index} style={styles.responderRow}>
                  <View style={styles.avatarCircle}>
                    <Text style={styles.avatarInitial}>{resp.name ? resp.name[0] : 'H'}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.responderName}>{resp.name || 'Verified Responder'}</Text>
                    <Text style={styles.responderStatus}>Verified Responder • En Route to assist you</Text>
                  </View>
                </View>
              ))
            ) : responder ? (
              <View style={styles.responderRow}>
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarInitial}>{responder.name ? responder.name[0] : 'H'}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.responderName}>{responder.name}</Text>
                  <Text style={styles.responderStatus}>Verified Responder • En Route to assist you</Text>
                </View>
              </View>
            ) : null}

            <CustomButton
              title="💬 OPEN TEMPORARY EMERGENCY CHAT"
              onPress={() => navigation.navigate('EmergencyChat')}
            />
          </View>
        ) : (
          <View style={styles.searchingCard}>
            <Text style={styles.searchIcon}>📡</Text>
            <Text style={styles.searchTitle}>SEARCHING FOR NEARBY VERIFIED RESPONDERS</Text>
            <Text style={styles.searchSub}>
              Alerts dispatched to active verified responders within 5km radius. Keep your phone accessible.
            </Text>
          </View>
        )}

        <View style={styles.locationBox}>
          <Text style={styles.locationHeader}>📍 BROADCASTED EMERGENCY LOCATION & MAP</Text>
          <Text style={styles.locationAddress}>{activeEmergency.addressDescription || 'Current GPS Location'}</Text>
          {activeEmergency.location?.coordinates ? (
            <>
              <Text style={styles.locationCoords}>
                GPS: {activeEmergency.location.coordinates[1].toFixed(6)}, {activeEmergency.location.coordinates[0].toFixed(6)}
              </Text>
              <LocationMapView
                latitude={activeEmergency.location.coordinates[1]}
                longitude={activeEmergency.location.coordinates[0]}
                title="Your Emergency Broadcast Location"
                description={activeEmergency.addressDescription}
                height={180}
              />
            </>
          ) : null}
        </View>

        <View style={styles.emergencyCallBox}>
          <Text style={styles.callBoxTitle}>IMMEDIATE DANGER?</Text>
          <Text style={styles.callBoxSub}>If you are in immediate physical danger, contact official emergency services directly.</Text>
          <CustomButton title="📞 CALL 911 / 112 DIRECTLY" variant="danger" onPress={handleCall911} />
        </View>

        <View style={styles.actionRow}>
          {isResponderFound ? (
            <CustomButton title="✅ I AM SAFE (RESOLVE)" onPress={handleResolve} />
          ) : null}
          <CustomButton title="❌ CANCEL EMERGENCY ALERT" variant="secondary" onPress={handleCancel} />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgDark },
  content: { padding: SPACING.md },
  emptyContent: { padding: SPACING.lg, alignItems: 'center', justifyContent: 'center', flex: 1 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { color: COLORS.white, fontSize: 20, fontWeight: '800' },
  emptySub: { color: COLORS.textSecondary, fontSize: 13, textAlign: 'center', marginVertical: SPACING.md },
  statusBox: { alignItems: 'center', marginVertical: SPACING.sm },
  incidentIdText: { color: COLORS.textMuted, fontSize: 11, marginTop: 4 },
  responderCard: {
    backgroundColor: COLORS.cardDark,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1.5,
    borderColor: COLORS.trustBlue,
    marginVertical: SPACING.md,
  },
  responderHeader: { color: COLORS.trustBlueLight, fontSize: 12, fontWeight: '900', marginBottom: SPACING.sm },
  responderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.trustBlue,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  avatarInitial: { color: COLORS.white, fontSize: 20, fontWeight: '800' },
  responderName: { color: COLORS.white, fontSize: 16, fontWeight: '800' },
  responderStatus: { color: COLORS.textSecondary, fontSize: 12 },
  searchingCard: {
    backgroundColor: COLORS.cardDark,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    alignItems: 'center',
    marginVertical: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
  },
  searchIcon: { fontSize: 36, marginBottom: 8 },
  searchTitle: { color: COLORS.statusGold, fontSize: 13, fontWeight: '900', textAlign: 'center', marginBottom: 4 },
  searchSub: { color: COLORS.textSecondary, fontSize: 12, textAlign: 'center', lineHeight: 18 },
  emergencyCallBox: {
    backgroundColor: 'rgba(229, 57, 53, 0.1)',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginVertical: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.emergencyRed,
  },
  locationBox: {
    backgroundColor: COLORS.cardDark,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginVertical: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.trustBlue,
  },
  locationHeader: { color: COLORS.trustBlueLight, fontSize: 11, fontWeight: '900', marginBottom: 4 },
  locationAddress: { color: COLORS.white, fontSize: 13, fontWeight: '700' },
  locationCoords: { color: COLORS.textSecondary, fontSize: 11, marginTop: 2 },
  callBoxTitle: { color: COLORS.emergencyRedBright, fontSize: 13, fontWeight: '900' },
  callBoxSub: { color: COLORS.textSecondary, fontSize: 11, marginVertical: 4 },
  actionRow: { marginTop: SPACING.md },
});
