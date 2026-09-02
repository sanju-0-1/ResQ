import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../store/AuthContext';
import { useEmergency } from '../store/EmergencyContext';
import { TopHeader } from '../components/TopHeader';
import { COLORS, SPACING, RADIUS } from '../utils/theme';
import { api } from '../services/api';

export const EmergencyChatScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const { activeEmergency, messages, sendMessage } = useEmergency();
  const [inputContent, setInputContent] = useState('');
  const [initialMessages, setInitialMessages] = useState<any[]>([]);

  useEffect(() => {
    if (activeEmergency?._id) {
      api
        .get(`/emergencies/${activeEmergency._id}/messages`)
        .then((res) => {
          if (res.data?.success && Array.isArray(res.data.data)) {
            setInitialMessages(res.data.data);
          }
        })
        .catch((err) => console.warn('[EmergencyChatScreen] Failed to load messages:', err));
    }
  }, [activeEmergency]);

  const allMessages = [
    ...(initialMessages || []),
    ...(messages || []).filter((m) => m?._id && !(initialMessages || []).some((im) => im?._id === m._id)),
  ];

  const handleSend = async () => {
    if (!inputContent.trim()) return;
    const text = inputContent.trim();
    setInputContent('');
    await sendMessage(text);
  };

  const handleReportUser = () => {
    Alert.alert(
      'Report / Block Participant',
      'If you feel unsafe or experience abusive behavior, you can submit a safety report immediately.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Report Misuse',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Report Submitted', 'Our safety moderation team has been notified.');
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <TopHeader
        title="Emergency Live Chat"
        subtitle="Temporary Encrypted Session"
        onBack={() => navigation.goBack()}
        rightAction={
          <TouchableOpacity style={styles.reportBtn} onPress={handleReportUser}>
            <Text style={styles.reportBtnText}>⚠️ Report</Text>
          </TouchableOpacity>
        }
      />

      <View style={styles.deescalationBanner}>
        <Text style={styles.bannerText}>
          🛡️ Maintain safety. Do NOT physically confront any individual.
        </Text>
      </View>

      <FlatList
        data={allMessages}
        keyExtractor={(item, idx) => item._id || idx.toString()}
        contentContainerStyle={styles.chatList}
        renderItem={({ item }) => {
          const isMe = item.senderId?._id === user?._id || item.senderId === user?._id;
          const isSystem = item.type === 'system';

          if (isSystem) {
            return (
              <View style={styles.systemBubble}>
                <Text style={styles.systemText}>{item.content}</Text>
              </View>
            );
          }

          return (
            <View style={[styles.msgRow, isMe ? styles.myMsgRow : styles.theirMsgRow]}>
              <View style={[styles.msgBubble, isMe ? styles.myBubble : styles.theirBubble]}>
                <Text style={styles.senderName}>{item.senderId?.name || (isMe ? 'You' : 'Responder')}</Text>
                <Text style={styles.msgText}>{item.content}</Text>
                <Text style={styles.msgTime}>
                  {new Date(item.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            </View>
          );
        }}
      />

      <View style={styles.inputBar}>
        <TextInput
          style={styles.textInput}
          placeholder="Type emergency message..."
          placeholderTextColor={COLORS.textMuted}
          value={inputContent}
          onChangeText={setInputContent}
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
          <Text style={styles.sendIcon}>➔</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgDark },
  reportBtn: { backgroundColor: 'rgba(229, 57, 53, 0.15)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: RADIUS.sm },
  reportBtnText: { color: COLORS.emergencyRedBright, fontSize: 11, fontWeight: '700' },
  deescalationBanner: {
    backgroundColor: COLORS.cardDarkElevated,
    paddingVertical: 6,
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderDark,
  },
  bannerText: { color: COLORS.trustBlueLight, fontSize: 11, textAlign: 'center', fontWeight: '700' },
  chatList: { padding: SPACING.md, paddingBottom: 20 },
  systemBubble: {
    backgroundColor: 'rgba(255, 179, 0, 0.12)',
    padding: SPACING.sm,
    borderRadius: RADIUS.md,
    alignSelf: 'center',
    marginVertical: SPACING.xs,
    maxWidth: '90%',
    borderWidth: 1,
    borderColor: 'rgba(255, 179, 0, 0.3)',
  },
  systemText: { color: COLORS.statusGold, fontSize: 11, textAlign: 'center', fontWeight: '600' },
  msgRow: { marginVertical: 4, flexDirection: 'row' },
  myMsgRow: { justifyContent: 'flex-end' },
  theirMsgRow: { justifyContent: 'flex-start' },
  msgBubble: { padding: SPACING.sm + 2, borderRadius: RADIUS.md, maxWidth: '75%' },
  myBubble: { backgroundColor: COLORS.trustBlue, borderBottomRightRadius: 2 },
  theirBubble: { backgroundColor: COLORS.cardDarkElevated, borderBottomLeftRadius: 2 },
  senderName: { color: 'rgba(255, 255, 255, 0.7)', fontSize: 10, fontWeight: '700', marginBottom: 2 },
  msgText: { color: COLORS.white, fontSize: 14 },
  msgTime: { color: 'rgba(255, 255, 255, 0.5)', fontSize: 9, textAlign: 'right', marginTop: 4 },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm,
    backgroundColor: COLORS.cardDark,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderDark,
  },
  textInput: {
    flex: 1,
    height: 44,
    backgroundColor: COLORS.bgDark,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    color: COLORS.white,
    marginRight: SPACING.sm,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.trustBlue,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendIcon: { color: COLORS.white, fontSize: 18, fontWeight: '800' },
});
