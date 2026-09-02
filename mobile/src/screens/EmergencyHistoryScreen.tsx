import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { TopHeader } from '../components/TopHeader';
import { StatusBadge } from '../components/StatusBadge';
import { COLORS, SPACING, RADIUS } from '../utils/theme';

export const EmergencyHistoryScreen = ({ navigation }: any) => {
  const dummyHistory = [
    {
      _id: 'EM-109283',
      date: '2026-08-15',
      status: 'resolved',
      description: 'Physical safety assistance near Metro station.',
      responderName: 'Elena (Verified ResQ Responder)',
    },
  ];

  return (
    <View style={styles.container}>
      <TopHeader title="Emergency Incident Logs" subtitle="Past Assistance History" />

      <FlatList
        data={dummyHistory}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No past emergency incidents recorded.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.headerRow}>
              <Text style={styles.incidentId}>{item._id}</Text>
              <StatusBadge status={item.status} type="emergency" />
            </View>
            <Text style={styles.desc}>{item.description}</Text>
            <Text style={styles.meta}>Responder: {item.responderName}</Text>
            <Text style={styles.meta}>Date: {item.date}</Text>
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
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  incidentId: { color: COLORS.white, fontSize: 14, fontWeight: '800' },
  desc: { color: COLORS.textPrimary, fontSize: 13, marginBottom: 8 },
  meta: { color: COLORS.textSecondary, fontSize: 11 },
  empty: { padding: SPACING.xl, alignItems: 'center' },
  emptyText: { color: COLORS.textSecondary, fontSize: 14 },
});
