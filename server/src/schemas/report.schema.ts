import { z } from 'zod';

export const createReportSchema = z.object({
  reportedUserId: z.string().min(1, 'Reported user ID is required'),
  incidentId: z.string().optional(),
  reason: z.enum([
    'fake_emergency',
    'harassment',
    'abuse',
    'threats',
    'stalking',
    'inappropriate_behavior',
    'false_responder',
    'misuse_system',
  ]),
  description: z.string().min(5, 'Detailed description is required'),
  evidence: z.array(z.string()).optional(),
});
