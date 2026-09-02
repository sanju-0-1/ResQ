import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth';
import { Emergency } from '../models/Emergency';
import { sendError } from '../utils/response';
import { ENV } from '../config/env';

export const checkEmergencyCooldown = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return sendError(res, 'Unauthenticated request', 401);
    }

    const userId = req.user.userId;

    // Check for existing active/in-progress emergency
    const activeEmergency = await Emergency.findOne({
      requesterId: userId,
      status: { $in: ['active', 'responder_found', 'assistance_in_progress'] },
    });

    if (activeEmergency) {
      return sendError(
        res,
        'You already have an active emergency request in progress.',
        400,
        { activeEmergencyId: activeEmergency._id }
      );
    }

    // Check cooldown since last emergency created
    const recentEmergency = await Emergency.findOne({
      requesterId: userId,
    }).sort({ createdAt: -1 });

    if (recentEmergency) {
      const secondsSinceLast = Math.floor(
        (Date.now() - new Date(recentEmergency.createdAt).getTime()) / 1000
      );
      if (secondsSinceLast < ENV.EMERGENCY_COOLDOWN_SECONDS) {
        const remaining = ENV.EMERGENCY_COOLDOWN_SECONDS - secondsSinceLast;
        return sendError(
          res,
          `Please wait ${remaining} seconds before initiating another emergency request.`,
          429
        );
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};
