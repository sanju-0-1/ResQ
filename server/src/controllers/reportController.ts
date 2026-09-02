import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { Report } from '../models/Report';
import { sendSuccess, sendError } from '../utils/response';

export const createReport = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return sendError(res, 'Unauthenticated', 401);

    const { reportedUserId, incidentId, reason, description, evidence } = req.body;

    const report = new Report({
      reporterId: req.user.userId,
      reportedUserId,
      incidentId,
      reason,
      description,
      evidence: evidence || [],
      status: 'pending',
    });

    await report.save();

    return sendSuccess(res, 'Report submitted successfully. Our safety team will review it immediately.', report, 201);
  } catch (error) {
    return sendError(res, 'Failed to submit report', 500, error);
  }
};
