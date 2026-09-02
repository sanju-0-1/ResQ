import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, RADIUS, SPACING } from '../utils/theme';

interface StatusBadgeProps {
  status: string;
  type?: 'availability' | 'verification' | 'emergency';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type = 'verification' }) => {
  let bgColor = COLORS.cardDarkElevated;
  let textColor = COLORS.textSecondary;
  let label = status.toUpperCase();

  if (type === 'availability') {
    if (status === 'available' || status === 'true') {
      bgColor = 'rgba(76, 175, 80, 0.15)';
      textColor = COLORS.statusGreen;
      label = '🟢 AVAILABLE';
    } else {
      bgColor = 'rgba(229, 57, 53, 0.15)';
      textColor = COLORS.emergencyRed;
      label = '🔴 OFFLINE';
    }
  } else if (type === 'verification') {
    switch (status) {
      case 'approved':
        bgColor = 'rgba(30, 136, 229, 0.15)';
        textColor = COLORS.trustBlueLight;
        label = '✓ VERIFIED RESQ RESPONDER';
        break;
      case 'pending':
        bgColor = 'rgba(255, 179, 0, 0.15)';
        textColor = COLORS.statusGold;
        label = '⏳ VERIFICATION PENDING';
        break;
      case 'rejected':
      case 'suspended':
        bgColor = 'rgba(229, 57, 53, 0.15)';
        textColor = COLORS.emergencyRed;
        label = `✖ ${status.toUpperCase()}`;
        break;
      default:
        label = 'UNVERIFIED';
    }
  } else if (type === 'emergency') {
    switch (status) {
      case 'active':
        bgColor = 'rgba(229, 57, 53, 0.2)';
        textColor = COLORS.emergencyRedBright;
        label = '🚨 ACTIVE EMERGENCY';
        break;
      case 'responder_found':
        bgColor = 'rgba(255, 179, 0, 0.2)';
        textColor = COLORS.statusGold;
        label = '🛡️ RESPONDER EN ROUTE';
        break;
      case 'assistance_in_progress':
        bgColor = 'rgba(30, 136, 229, 0.2)';
        textColor = COLORS.trustBlueLight;
        label = '🤝 ASSISTANCE IN PROGRESS';
        break;
      case 'resolved':
        bgColor = 'rgba(76, 175, 80, 0.2)';
        textColor = COLORS.statusGreen;
        label = '✅ RESOLVED';
        break;
      default:
        label = status.toUpperCase();
    }
  }

  return (
    <View style={[styles.badge, { backgroundColor: bgColor }]}>
      <Text style={[styles.text, { color: textColor }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: SPACING.sm + 4,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  text: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
