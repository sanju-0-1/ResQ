import React from 'react';
import { View, StyleSheet, Text, Platform } from 'react-native';
import MapView, { Marker, UrlTile } from 'react-native-maps';
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

  return (
    <View style={[styles.container, { height }]}>
      <MapView
        style={{ width: '100%', height, borderRadius: RADIUS.md }}
        initialRegion={{
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        mapType={Platform.OS === 'android' ? 'none' : 'standard'}
      >
        <UrlTile
          urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          maximumZ={19}
          flipY={false}
        />
        <Marker
          coordinate={{ latitude, longitude }}
          title={title}
          description={description}
        />
      </MapView>
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
