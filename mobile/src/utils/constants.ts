import { Platform } from 'react-native';
import Constants from 'expo-constants';

const getHostIp = () => {
  if (Platform.OS === 'web') {
    return 'localhost';
  }
  const rawHost = Constants.expoConfig?.hostUri || Constants.experienceUrl || '';
  const cleanHost = rawHost.replace(/^[a-z]+:\/\//i, '');
  const ip = cleanHost.split(':')[0];
  return ip && ip !== 'http' && ip !== 'https' ? ip : 'localhost';
};

const hostIp = getHostIp();

export const API_BASE_URL = `http://${hostIp}:5000/api`;
export const SOCKET_URL = `http://${hostIp}:5000`;

export const EMERGENCY_NUMBERS = [
  { country: 'United States / Canada', number: '911' },
  { country: 'European Union / UK', number: '112' },
  { country: 'India', number: '112' },
  { country: 'Australia', number: '000' },
];

export const SAFETY_WARNINGS = [
  'Do NOT put yourself in physical danger.',
  'Do NOT physically confront an attacker or carry weapons.',
  'Maintain a safe distance and observe as a witness.',
  'Help the victim relocate safely to a well-lit, public location.',
  'If there is an immediate physical threat, call official emergency services immediately.',
];
