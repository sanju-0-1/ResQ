import { z } from 'zod';

export const applyResponderSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  idType: z.enum(['national_id', 'driver_license', 'passport', 'other']),
  idNumberOrHash: z.string().min(3, 'ID document reference is required'),
  selfieUrl: z.string().optional(),
  emergencyRadiusMeters: z.number().min(500).max(20000).default(5000),
});

export const updateAvailabilitySchema = z.object({
  isAvailable: z.boolean(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
});

export const updateLocationSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});
