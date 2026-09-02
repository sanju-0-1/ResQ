import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { TopHeader } from '../components/TopHeader';
import { CustomButton } from '../components/CustomButton';
import { COLORS, SPACING, RADIUS } from '../utils/theme';
import { api } from '../services/api';

export const VerificationQueueScreen = ({ navigation }: any) => {
  const [queue, setQueue] = useState<any[]>([]);

  const fetchQueue = async () => {
    try {
      const res = await api.get('/admin/verifications');
      if (res.data?.success) {
        setQueue(res.data.data);
      }
    } catch (e) {
      console.warn('Failed to fetch verification queue', e);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleReview = async (id: string, status: 'approved' | 'rejected') => {
    try {
      await api.patch(`/admin/verifications/${id}`, {
        status,
        adminNotes: `Reviewed and ${status} by admin portal.`,
      });
      Alert.alert('Status Updated', `Application has been marked as ${status.toUpperCase()}.`);
      fetchQueue();
    } catch (e) {
      Alert.alert('Error', 'Failed to update verification status.');
    }
  };

  return (
    <View style={styles.container}>
      <TopHeader title="Verification Applications" onBack={() => navigation.goBack()} />

      <FlatList
        data={queue}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No pending responder applications in queue.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.applicantName}>{item.fullName}</Text>
            <Text style={styles.applicantSub}>
              User: @{item.userId?.username || 'Unknown'} • Email: {item.userId?.email}
            </Text>
            <Text style={styles.docType}>Document Type: {item.idType.toUpperCase()}</Text>

            <View style={styles.actionRow}>
              <CustomButton
                title="✓ APPROVE"
                onPress={() => handleReview(item._id, 'approved')}
              />
              <CustomButton
                title="✖ REJECT"
                variant="danger"
                onPress={() => handleReview(item._id, 'rejected')}
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
  applicantName: { color: COLORS.white, fontSize: 16, fontWeight: '800' },
  applicantSub: { color: COLORS.textSecondary, fontSize: 12, marginVertical: 2 },
  docType: { color: COLORS.trustBlueLight, fontSize: 12, fontWeight: '700', marginBottom: SPACING.sm },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: SPACING.xs },
  empty: { padding: SPACING.xl, alignItems: 'center' },
  emptyText: { color: COLORS.textSecondary, fontSize: 14 },
});
