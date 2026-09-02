import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useAuth } from '../store/AuthContext';
import { TopHeader } from '../components/TopHeader';
import { StatusBadge } from '../components/StatusBadge';
import { CustomButton } from '../components/CustomButton';
import { COLORS, SPACING, RADIUS } from '../utils/theme';

export const ProfileScreen = ({ navigation }: any) => {
  const { user, responderProfile, logout } = useAuth();

  return (
    <View style={styles.container}>
      <TopHeader title="My Profile" subtitle="Account & Safety Settings" />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.profileHeaderCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{user?.name ? user.name[0].toUpperCase() : 'U'}</Text>
          </View>
          <Text style={styles.userName}>{user?.name}</Text>
          <Text style={styles.userUsername}>@{user?.username}</Text>
          <View style={styles.badgeRow}>
            <StatusBadge status={user?.role || 'normal'} type="verification" />
          </View>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Account Information</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email:</Text>
            <Text style={styles.infoVal}>{user?.email}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Phone:</Text>
            <Text style={styles.infoVal}>{user?.phone}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Role:</Text>
            <Text style={styles.infoVal}>{user?.role.toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Community Volunteer Status</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Verification Status:</Text>
            <StatusBadge status={responderProfile?.verificationStatus || 'pending'} type="verification" />
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Total Assists:</Text>
            <Text style={styles.infoVal}>{responderProfile?.totalAssists || 0}</Text>
          </View>
          {responderProfile?.verificationStatus !== 'approved' ? (
            <View style={{ marginTop: SPACING.sm }}>
              <CustomButton
                title="COMPLETE ID VERIFICATION"
                onPress={() => navigation.navigate('VerificationFlow')}
              />
            </View>
          ) : null}
          <View style={{ marginTop: SPACING.sm }}>
            <CustomButton
              title="GO TO RESPONDER DASHBOARD"
              onPress={() => navigation.navigate('HomegirlDashboard')}
            />
          </View>
        </View>

        <View style={{ marginTop: SPACING.lg }}>
          <CustomButton title="LOG OUT" variant="danger" onPress={logout} />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgDark },
  content: { padding: SPACING.md },
  profileHeaderCard: {
    backgroundColor: COLORS.cardDark,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    alignItems: 'center',
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.trustBlue,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  avatarText: { color: COLORS.white, fontSize: 32, fontWeight: '800' },
  userName: { color: COLORS.white, fontSize: 20, fontWeight: '800' },
  userUsername: { color: COLORS.textSecondary, fontSize: 13, marginBottom: SPACING.xs },
  badgeRow: { marginTop: 4 },
  infoCard: {
    backgroundColor: COLORS.cardDark,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
  },
  sectionTitle: { color: COLORS.white, fontSize: 15, fontWeight: '800', marginBottom: SPACING.sm },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: COLORS.borderDark },
  infoLabel: { color: COLORS.textSecondary, fontSize: 13 },
  infoVal: { color: COLORS.textPrimary, fontSize: 13, fontWeight: '600' },
  responderApplyCard: {
    backgroundColor: 'rgba(30, 136, 229, 0.12)',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.trustBlue,
    marginBottom: SPACING.md,
  },
  applyTitle: { color: COLORS.trustBlueLight, fontSize: 14, fontWeight: '900', marginBottom: 4 },
  applySub: { color: COLORS.textSecondary, fontSize: 12, lineHeight: 18, marginBottom: SPACING.md },
});
