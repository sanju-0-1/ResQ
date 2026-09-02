import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Linking, TouchableOpacity } from 'react-native';
import { useEmergency } from '../store/EmergencyContext';
import { TopHeader } from '../components/TopHeader';
import { StatusBadge } from '../components/StatusBadge';
import { CustomButton } from '../components/CustomButton';
import { SafetyCard } from '../components/SafetyCard';
import { LocationMapView } from '../components/LocationMapView';
import { COLORS, SPACING, RADIUS } from '../utils/theme';
import { EMERGENCY_NUMBERS } from '../utils/constants';
import { showConfirm, showAlert } from '../utils/alert';

export const ActiveAssistanceScreen = ({ navigation }: any) => {
  const { activeEmergency, resolveEmergency, refreshActiveEmergency } = useEmergency();

  useEffect(() => {
    const interval = setInterval(() => {
      refreshActiveEmergency();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  if (!activeEmergency) {
    return (
      <View style={styles.container}>
        <TopHeader title="Active Assistance" onBack={() => navigation.navigate('HomegirlDashboard')} />
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No active assistance session.</Text>
          <CustomButton title="RETURN TO DASHBOARD" onPress={() => navigation.navigate('HomegirlDashboard')} />
        </View>
      </View>
    );
  }

  const requester = activeEmergency.requesterId;
  const coords = activeEmergency.location?.coordinates; // [lng, lat]
  const lng = coords ? coords[0] : 0;
  const lat = coords ? coords[1] : 0;
  const address = activeEmergency.addressDescription || `Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}`;

  const handleOpenNavigationMap = () => {
    if (!lat || !lng) {
      showAlert('Location Error', 'Coordinates are unavailable for this emergency request.');
      return;
    }
    const mapUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    Linking.openURL(mapUrl);
  };

  const handleResolve = () => {
    showConfirm(
      'Complete Assistance',
      'Confirm that the victim is in a safe location and no further immediate assistance is needed.',
      async () => {
        try {
          await resolveEmergency(activeEmergency._id);
          navigation.navigate('HomegirlDashboard');
        } catch (err: any) {
          showAlert('Error', err.message || 'Could not resolve emergency.');
        }
      },
      'MARK RESOLVED',
      'Not Completed'
    );
  };

  const handleCallPolice = () => {
    Linking.openURL(`tel:${EMERGENCY_NUMBERS[0].number}`);
  };

  return (
    <View style={styles.container}>
      <TopHeader title="Active Assistance Mission" onBack={() => navigation.navigate('HomegirlDashboard')} />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.statusRow}>
          <StatusBadge status={activeEmergency.status} type="emergency" />
          <Text style={styles.incidentTag}>Incident #{activeEmergency._id.slice(-6).toUpperCase()}</Text>
        </View>

        <View style={styles.requesterCard}>
          <Text style={styles.cardLabel}>ASSISTING USER</Text>
          <Text style={styles.requesterName}>{requester?.name || 'Requester'}</Text>
          <Text style={styles.requesterSub}>
            @{requester?.username} • Phone: {requester?.phone || 'Hidden for privacy'}
          </Text>
        </View>

        <View style={styles.locationCard}>
          <Text style={styles.locationHeader}>📍 VICTIM EXACT LOCATION & LIVE MAP</Text>
          <Text style={styles.addressText}>{address}</Text>
          <Text style={styles.coordsText}>
            GPS Coordinates: {lat.toFixed(6)}, {lng.toFixed(6)}
          </Text>

          <LocationMapView
            latitude={lat}
            longitude={lng}
            title={requester?.name ? `Victim: ${requester.name}` : 'Victim Location'}
            description={address}
            height={200}
          />

          <TouchableOpacity style={styles.mapBtn} onPress={handleOpenNavigationMap}>
            <Text style={styles.mapBtnText}>🗺️ OPEN DIRECTIONS IN GOOGLE MAPS</Text>
          </TouchableOpacity>
        </View>

        <SafetyCard />

        <View style={styles.actionsBox}>
          <CustomButton
            title="💬 OPEN TEMPORARY EMERGENCY CHAT"
            onPress={() => navigation.navigate('EmergencyChat')}
          />
          <CustomButton
            title="📞 CALL OFFICIAL EMERGENCY SERVICES (911/112)"
            variant="danger"
            onPress={handleCallPolice}
          />
          <CustomButton
            title="✅ MARK ASSISTANCE AS COMPLETED & RESOLVED"
            onPress={handleResolve}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgDark },
  content: { padding: SPACING.md },
  empty: { flex: 1, padding: SPACING.lg, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: COLORS.white, fontSize: 16, marginBottom: SPACING.md },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
  incidentTag: { color: COLORS.textMuted, fontSize: 12, fontWeight: '700' },
  requesterCard: {
    backgroundColor: COLORS.cardDark,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.trustBlue,
  },
  cardLabel: { color: COLORS.trustBlueLight, fontSize: 11, fontWeight: '900', marginBottom: 4 },
  requesterName: { color: COLORS.white, fontSize: 18, fontWeight: '800' },
  requesterSub: { color: COLORS.textSecondary, fontSize: 12, marginTop: 2 },
  locationCard: {
    backgroundColor: COLORS.cardDark,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1.5,
    borderColor: COLORS.statusGold,
  },
  locationHeader: { color: COLORS.statusGold, fontSize: 12, fontWeight: '900', marginBottom: 4 },
  addressText: { color: COLORS.white, fontSize: 14, fontWeight: '700', marginBottom: 4, lineHeight: 20 },
  coordsText: { color: COLORS.textSecondary, fontSize: 11, marginBottom: SPACING.sm },
  mapBtn: {
    backgroundColor: COLORS.trustBlue,
    borderRadius: RADIUS.sm,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    marginTop: 4,
  },
  mapBtnText: { color: COLORS.white, fontSize: 12, fontWeight: '900' },
  actionsBox: { marginTop: SPACING.md },
});
