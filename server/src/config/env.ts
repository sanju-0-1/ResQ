import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  PORT: process.env.PORT || '5000',
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/resq',
  JWT_SECRET: process.env.JWT_SECRET || 'resq_super_secret_jwt_key_2026',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'resq_super_secret_refresh_key_2026',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  DEFAULT_EMERGENCY_RADIUS_METERS: Number(process.env.DEFAULT_EMERGENCY_RADIUS_METERS) || 5000,
  EMERGENCY_EXPIRATION_MINUTES: Number(process.env.EMERGENCY_EXPIRATION_MINUTES) || 30,
  EMERGENCY_COOLDOWN_SECONDS: Number(process.env.EMERGENCY_COOLDOWN_SECONDS) || 60,
};
