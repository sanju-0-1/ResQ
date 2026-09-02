import * as Location from 'expo-location';
import { Platform } from 'react-native';

const fetchIpLocation = async (): Promise<{ latitude: number; longitude: number } | null> => {
  try {
    const res = await fetch('https://ipapi.co/json/');
    const data = await res.json();
    if (data && typeof data.latitude === 'number' && typeof data.longitude === 'number') {
      console.log('[LocationService] Acquired location from IP lookup:', data.city, data.latitude, data.longitude);
      return { latitude: data.latitude, longitude: data.longitude };
    }
  } catch (e) {
    console.warn('[LocationService] IP location lookup error:', e);
  }
  return null;
};

export const locationService = {
  async requestLocationPermission(): Promise<boolean> {
    if (Platform.OS === 'web') return true;
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      return status === 'granted';
    } catch (e) {
      console.error('Error requesting location permission:', e);
      return false;
    }
  },

  async getCurrentCoordinates(): Promise<{ latitude: number; longitude: number }> {
    // 1. Try Browser HTML5 Geolocation (for Web)
    if (Platform.OS === 'web' && typeof window !== 'undefined' && navigator?.geolocation) {
      const coords = await new Promise<{ latitude: number; longitude: number } | null>((resolve) => {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            console.log('[LocationService] Web Browser GPS acquired:', pos.coords.latitude, pos.coords.longitude);
            resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
          },
          async (err) => {
            console.warn('[LocationService] Web Geolocation failed/denied:', err.message);
            const ipCoords = await fetchIpLocation();
            resolve(ipCoords);
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      });

      if (coords) return coords;
    }

    // 2. Try Native Expo Location (for iOS / Android)
    try {
      const hasPermission = await this.requestLocationPermission();
      if (hasPermission) {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Highest,
        });
        return {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };
      }
    } catch (e) {
      console.warn('[LocationService] Mobile GPS error:', e);
    }

    // 3. Fallback to IP-based Geographic Location
    const ipCoords = await fetchIpLocation();
    if (ipCoords) return ipCoords;

    // 4. Final Fallback
    return { latitude: 40.748817, longitude: -73.98513 };
  },

  async getAddressFromCoordinates(latitude: number, longitude: number): Promise<string> {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`, {
        headers: { 'User-Agent': 'ResQSafetyApp/1.0' },
      });
      const data = await res.json();
      if (data && data.display_name) {
        return data.display_name;
      }
    } catch (e) {
      console.warn('Reverse geocoding error:', e);
    }
    return `Lat: ${latitude.toFixed(5)}, Lng: ${longitude.toFixed(5)}`;
  },
};
