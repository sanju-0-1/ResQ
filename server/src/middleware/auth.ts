import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, TokenPayload } from '../utils/jwt';
import { sendError } from '../utils/response';
import { User } from '../models/User';

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

export const authenticateJWT = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 'Access token is missing or invalid', 401);
    }

    const token = authHeader.split(' ')[1];
    const payload = verifyAccessToken(token);

    // Check user account status
    const dbUser = await User.findById(payload.userId).select('status role');
    if (!dbUser) {
      return sendError(res, 'User account no longer exists', 401);
    }

    if (dbUser.status === 'banned') {
      return sendError(res, 'Your account has been banned due to safety policy violations.', 403);
    }

    if (dbUser.status === 'suspended') {
      return sendError(res, 'Your account is currently suspended. Please contact support.', 403);
    }

    req.user = {
      userId: payload.userId,
      role: dbUser.role,
      email: payload.email,
    };

    next();
  } catch (error) {
    return sendError(res, 'Invalid or expired access token', 401, error);
  }
};
