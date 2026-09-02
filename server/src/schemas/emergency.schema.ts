import { z } from 'zod';

export const createEmergencySchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  addressDescription: z.string().optional(),
  description: z.string().optional(),
  severity: z.enum(['low', 'medium', 'high', 'critical']).default('high'),
  radiusMeters: z.number().positive().optional(),
});

export const updateEmergencyStatusSchema = z.object({
  status: z.enum(['assistance_in_progress', 'resolved', 'cancelled']),
  reason: z.string().optional(),
});

export const addEvidenceSchema = z.object({
  type: z.enum(['photo', 'video', 'audio', 'text']),
  url: z.string().optional(),
  description: z.string().optional(),
});

export const addWitnessSchema = z.object({
  name: z.string().optional(),
  phone: z.string().optional(),
  notes: z.string().optional(),
});
