import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { TopHeader } from '../components/TopHeader';
import { CustomButton } from '../components/CustomButton';
import { COLORS, SPACING, RADIUS } from '../utils/theme';
import { api } from '../services/api';

export const AdminDashboardScreen = ({ navigation }: any) => {
  const [stats, setStats] = useState<any>(null);

  const fetchStats = async () => {
    try {
      const res = await api.get('/admin/stats');
      if (res.data?.success) {
        setStats(res.data.data);
      }
    } catch (e) {
      console.warn('Could not fetch admin stats', e);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <View style={styles.container}>
      <TopHeader title="Admin Moderation Portal" subtitle="System Oversight & Verification" />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.grid}>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>{stats?.totalUsers || 0}</Text>
            <Text style={styles.statLabel}>Total Users</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNum, { color: COLORS.trustBlueLight }]}>{stats?.verifiedResqResponders ?? stats?.verifiedHomegirls ?? 0}</Text>
            <Text style={styles.statLabel}>Verified Responders</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNum, { color: COLORS.statusGold }]}>{stats?.pendingVerifications || 0}</Text>
            <Text style={styles.statLabel}>Pending Verification</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNum, { color: COLORS.emergencyRedBright }]}>{stats?.activeEmergencies || 0}</Text>
            <Text style={styles.statLabel}>Active Emergencies</Text>
          </View>
        </View>

        <View style={styles.menuSection}>
          <CustomButton
            title="⏳ REVIEW VERIFICATION QUEUE"
            onPress={() => navigation.navigate('VerificationQueue')}
          />
          <CustomButton
            title="⚠️ REVIEW SAFETY & ABUSE REPORTS"
            variant="secondary"
            onPress={() => navigation.navigate('ReportsQueue')}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgDark },
  content: { padding: SPACING.md },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: SPACING.md },
  statCard: {
    width: '48%',
    backgroundColor: COLORS.cardDark,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderDark,
  },
  statNum: { color: COLORS.white, fontSize: 24, fontWeight: '900' },
  statLabel: { color: COLORS.textSecondary, fontSize: 11, marginTop: 4, textAlign: 'center' },
  menuSection: { marginTop: SPACING.md },
});
