import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Alert } from 'react-native';
import { TopHeader } from '../components/TopHeader';
import { CustomButton } from '../components/CustomButton';
import { COLORS, SPACING, RADIUS } from '../utils/theme';
import { api } from '../services/api';

export const ReportsQueueScreen = ({ navigation }: any) => {
  const [reports, setReports] = useState<any[]>([]);

  const fetchReports = async () => {
    try {
      const res = await api.get('/admin/reports');
      if (res.data?.success) {
        setReports(res.data.data);
      }
    } catch (e) {
      console.warn('Failed to fetch reports queue', e);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleBanUser = async (userId: string) => {
    try {
      await api.patch(`/admin/users/${userId}/moderation`, {
        status: 'banned',
        reason: 'Violated safety and anti-abuse policies.',
      });
      Alert.alert('User Banned', 'Account has been permanently banned.');
      fetchReports();
    } catch (e) {
      Alert.alert('Error', 'Failed to update user moderation status.');
    }
  };

  return (
    <View style={styles.container}>
      <TopHeader title="Safety & Abuse Reports" onBack={() => navigation.goBack()} />

      <FlatList
        data={reports}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No reported safety incidents.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.reasonTag}>Reason: {item.reason.toUpperCase()}</Text>
            <Text style={styles.reporter}>Reported By: {item.reporterId?.name || 'User'}</Text>
            <Text style={styles.target}>Target User: {item.reportedUserId?.name} (@{item.reportedUserId?.username})</Text>
            <Text style={styles.desc}>"{item.description}"</Text>

            <View style={styles.actionRow}>
              <CustomButton
                title="🚫 BAN TARGET USER"
                variant="danger"
                onPress={() => handleBanUser(item.reportedUserId?._id)}
              />
            </View>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgDark },
  list: { padding: SPACING.md },
  card: {
    backgroundColor: COLORS.cardDark,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
  },
  reasonTag: { color: COLORS.emergencyRedBright, fontSize: 13, fontWeight: '900', marginBottom: 4 },
  reporter: { color: COLORS.textSecondary, fontSize: 12 },
  target: { color: COLORS.white, fontSize: 13, fontWeight: '700', marginVertical: 2 },
  desc: { color: COLORS.textPrimary, fontSize: 13, fontStyle: 'italic', marginVertical: 6 },
  actionRow: { marginTop: SPACING.xs },
  empty: { padding: SPACING.xl, alignItems: 'center' },
  emptyText: { color: COLORS.textSecondary, fontSize: 14 },
});
