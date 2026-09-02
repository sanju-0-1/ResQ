import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { User } from '../models/User';
import { ResponderProfile } from '../models/ResponderProfile';
import { sendSuccess, sendError } from '../utils/response';

export const getMe = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return sendError(res, 'Unauthenticated', 401);

    const user = await User.findById(req.user.userId);
    if (!user) return sendError(res, 'User not found', 404);

    let responderProfile = null;
    if (user.role === 'resq' || user.role === 'homegirl' || user.isVerifiedResponder) {
      responderProfile = await ResponderProfile.findOne({ userId: user._id });
    }

    return sendSuccess(res, 'Profile retrieved successfully', {
      user,
      responderProfile,
    });
  } catch (error) {
    return sendError(res, 'Failed to fetch user profile', 500, error);
  }
};

export const updateMe = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return sendError(res, 'Unauthenticated', 401);

    const { name, phone, profilePhoto, dateOfBirth } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId,
      {
        ...(name && { name }),
        ...(phone && { phone }),
        ...(profilePhoto && { profilePhoto }),
        ...(dateOfBirth && { dateOfBirth }),
      },
      { new: true, runValidators: true }
    );

    return sendSuccess(res, 'Profile updated successfully', updatedUser);
  } catch (error) {
    return sendError(res, 'Failed to update profile', 500, error);
  }
};

export const getUserPublicProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Retrieve only safe public fields
    const user = await User.findById(id).select('name username profilePhoto role isVerifiedResponder createdAt');
    if (!user) return sendError(res, 'User not found', 404);

    let responderStats = null;
    if (user.role === 'resq' || user.role === 'homegirl' || user.isVerifiedResponder) {
      responderStats = await ResponderProfile.findOne({ userId: id }).select('totalAssists rating verificationStatus');
    }

    return sendSuccess(res, 'Public profile retrieved', {
      user,
      responderStats,
    });
  } catch (error) {
    return sendError(res, 'Failed to retrieve user public profile', 500, error);
  }
};
