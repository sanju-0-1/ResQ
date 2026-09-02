import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Linking } from 'react-native';
import { TopHeader } from '../components/TopHeader';
import { CustomInput } from '../components/CustomInput';
import { CustomButton } from '../components/CustomButton';
import { COLORS, SPACING, RADIUS } from '../utils/theme';
import { api } from '../services/api';

export const TrustedContactsScreen = ({ navigation }: any) => {
  const [contacts, setContacts] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [relationship, setRelationship] = useState('');

  const fetchContacts = async () => {
    try {
      const res = await api.get('/trusted-contacts');
      if (res.data?.success) {
        setContacts(res.data.data);
      }
    } catch (e) {
      console.warn('Could not fetch trusted contacts', e);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleAdd = async () => {
    if (!name || !phone || !relationship) {
      Alert.alert('Required Fields', 'Please fill in name, phone, and relationship.');
      return;
    }
    try {
      const res = await api.post('/trusted-contacts', {
        name,
        phone,
        relationship,
        isPrimary: contacts.length === 0,
      });
      if (res.data?.success) {
        setName('');
        setPhone('');
        setRelationship('');
        setShowAddModal(false);
        fetchContacts();
      }
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to add contact');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/trusted-contacts/${id}`);
      fetchContacts();
    } catch (e) {
      Alert.alert('Error', 'Failed to delete contact');
    }
  };

  return (
    <View style={styles.container}>
      <TopHeader
        title="Trusted Emergency Contacts"
        subtitle="Notified instantly during SOS emergencies"
        onBack={() => navigation.goBack()}
        rightAction={
          <TouchableOpacity style={styles.addBtn} onPress={() => setShowAddModal(!showAddModal)}>
            <Text style={styles.addBtnText}>{showAddModal ? 'Close' : '+ Add'}</Text>
          </TouchableOpacity>
        }
      />

      {showAddModal ? (
        <View style={styles.addFormCard}>
          <Text style={styles.formTitle}>Add Trusted Contact</Text>
          <CustomInput label="Name" placeholder="e.g. Mom / Roommate" value={name} onChangeText={setName} />
          <CustomInput label="Phone Number" placeholder="e.g. +1555123456" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
          <CustomInput label="Relationship" placeholder="e.g. Sister, Best Friend" value={relationship} onChangeText={setRelationship} />
          <CustomButton title="SAVE TRUSTED CONTACT" onPress={handleAdd} />
        </View>
      ) : null}

      <FlatList
        data={contacts}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>👥</Text>
            <Text style={styles.emptyText}>No trusted emergency contacts configured yet.</Text>
            <Text style={styles.emptySub}>Add family members or close friends who will be notified during emergency requests.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.contactCard}>
            <View style={{ flex: 1 }}>
              <View style={styles.row}>
                <Text style={styles.contactName}>{item.name}</Text>
                {item.isPrimary ? <Text style={styles.primaryBadge}>PRIMARY</Text> : null}
              </View>
              <Text style={styles.contactPhone}>{item.phone} • {item.relationship}</Text>
            </View>

            <TouchableOpacity style={styles.callBtn} onPress={() => Linking.openURL(`tel:${item.phone}`)}>
              <Text style={styles.callBtnText}>📞 CALL</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item._id)}>
              <Text style={styles.deleteBtnText}>🗑️</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgDark },
  addBtn: { backgroundColor: COLORS.trustBlue, paddingHorizontal: 12, paddingVertical: 6, borderRadius: RADIUS.sm },
  addBtnText: { color: COLORS.white, fontSize: 12, fontWeight: '700' },
  addFormCard: {
    backgroundColor: COLORS.cardDark,
    margin: SPACING.md,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
  },
  formTitle: { color: COLORS.white, fontSize: 16, fontWeight: '800', marginBottom: SPACING.xs },
  list: { padding: SPACING.md },
  contactCard: {
    backgroundColor: COLORS.cardDark,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  contactName: { color: COLORS.white, fontSize: 15, fontWeight: '800', marginRight: 8 },
  primaryBadge: { color: COLORS.trustBlueLight, fontSize: 9, fontWeight: '900', backgroundColor: 'rgba(30, 136, 229, 0.2)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  contactPhone: { color: COLORS.textSecondary, fontSize: 12, marginTop: 2 },
  callBtn: { backgroundColor: 'rgba(76, 175, 80, 0.15)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: RADIUS.sm, marginRight: 8 },
  callBtnText: { color: COLORS.statusGreen, fontSize: 11, fontWeight: '800' },
  deleteBtn: { padding: 6 },
  deleteBtnText: { fontSize: 14 },
  empty: { padding: SPACING.xl, alignItems: 'center' },
  emptyIcon: { fontSize: 40, marginBottom: 8 },
  emptyText: { color: COLORS.white, fontSize: 15, fontWeight: '700', textAlign: 'center' },
  emptySub: { color: COLORS.textSecondary, fontSize: 12, textAlign: 'center', marginTop: 4 },
});
