import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, RADIUS, SPACING } from '../utils/theme';
import { SAFETY_WARNINGS } from '../utils/constants';

export const SafetyCard: React.FC = () => {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.headerIcon}>🛡️</Text>
        <Text style={styles.headerTitle}>SAFETY & DE-ESCALATION FIRST</Text>
      </View>
      <Text style={styles.subtitle}>
        Volunteer responders are community witnesses focused on safety and de-escalation for everyone:
      </Text>
      {SAFETY_WARNINGS.map((warning, index) => (
        <View key={index} style={styles.warningRow}>
          <Text style={styles.bullet}>•</Text>
          <Text style={styles.warningText}>{warning}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.cardDark,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.trustBlue,
    marginVertical: SPACING.sm,
    borderColor: COLORS.borderDark,
    borderWidth: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  headerIcon: {
    fontSize: 18,
    marginRight: SPACING.xs,
  },
  headerTitle: {
    color: COLORS.trustBlueLight,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginBottom: SPACING.sm,
  },
  warningRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  bullet: {
    color: COLORS.trustBlueLight,
    fontSize: 14,
    marginRight: 6,
    lineHeight: 18,
  },
  warningText: {
    color: COLORS.textPrimary,
    fontSize: 12,
    flex: 1,
    lineHeight: 18,
  },
});
