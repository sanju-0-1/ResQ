import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { COLORS, RADIUS } from '../utils/theme';

interface LocationMapViewProps {
  latitude: number;
  longitude: number;
  title?: string;
  description?: string;
  height?: number;
}

export const LocationMapView: React.FC<LocationMapViewProps> = ({
  latitude,
  longitude,
  title = 'Emergency Location',
  description,
  height = 220,
}) => {
  if (!latitude || !longitude) {
    return (
      <View style={[styles.placeholder, { height }]}>
        <Text style={styles.placeholderText}>📍 Location map unavailable</Text>
      </View>
    );
  }

  const embedUrl = `https://maps.google.com/maps?q=${latitude},${longitude}&z=15&output=embed`;

  return (
    <View style={[styles.container, { height }]}>
      {/* @ts-ignore iframe is valid HTML element in React DOM for web */}
      <iframe
        title={title}
        width="100%"
        height={height}
        style={{ border: 0, borderRadius: RADIUS.md }}
        loading="lazy"
        allowFullScreen
        src={embedUrl}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.trustBlue,
    backgroundColor: COLORS.cardDark,
    marginVertical: 8,
  },
  placeholder: {
    width: '100%',
    backgroundColor: COLORS.cardDark,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderDark,
    marginVertical: 8,
  },
  placeholderText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
});
