import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { ResponderProfile } from '../models/ResponderProfile';
import { Verification } from '../models/Verification';
import { User } from '../models/User';
import { sendSuccess, sendError } from '../utils/response';
import bcrypt from 'bcryptjs';

export const applyAsResponder = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return sendError(res, 'Unauthenticated', 401);

    const { fullName, idType, idNumberOrHash, selfieUrl, emergencyRadiusMeters } = req.body;

    const user = await User.findById(req.user.userId);
    if (!user) return sendError(res, 'User not found', 404);

    // Hash the ID document reference for user privacy
    const salt = await bcrypt.genSalt(8);
    const idHash = await bcrypt.hash(idNumberOrHash, salt);

    // Create or update Verification document
    await Verification.findOneAndUpdate(
      { userId: user._id },
      {
        fullName,
        idType,
        idDocumentHash: idHash,
        selfieVerificationUrl: selfieUrl || '',
        status: 'pending',
        submittedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    // Create or update ResponderProfile
    const profile = await ResponderProfile.findOneAndUpdate(
      { userId: user._id },
      {
        verificationStatus: 'pending',
        isAvailable: false,
        emergencyRadiusMeters: emergencyRadiusMeters || 5000,
      },
      { upsert: true, new: true }
    );

    // Update user role to 'resq'
    user.role = 'resq';
    await user.save();

    return sendSuccess(res, 'Responder application submitted successfully. Pending admin review.', {
      status: profile.verificationStatus,
      profile,
    });
  } catch (error) {
    return sendError(res, 'Failed to submit responder application', 500, error);
  }
};

export const getResponderStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return sendError(res, 'Unauthenticated', 401);

    const profile = await ResponderProfile.findOne({ userId: req.user.userId });
    if (!profile) {
      return sendSuccess(res, 'Not applied as responder yet', { verificationStatus: 'not_applied' });
    }

    return sendSuccess(res, 'Responder status retrieved', {
      verificationStatus: profile.verificationStatus,
      isAvailable: profile.isAvailable,
      emergencyRadiusMeters: profile.emergencyRadiusMeters,
      totalAssists: profile.totalAssists,
      rating: profile.rating,
    });
  } catch (error) {
    return sendError(res, 'Failed to fetch responder status', 500, error);
  }
};

export const updateAvailability = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return sendError(res, 'Unauthenticated', 401);

    const { isAvailable, latitude, longitude } = req.body;

    const profile = await ResponderProfile.findOne({ userId: req.user.userId });
    if (!profile) {
      return sendError(res, 'Responder profile not found. Please apply first.', 404);
    }

    if (profile.verificationStatus !== 'approved') {
      return sendError(res, `Cannot change availability while verification status is "${profile.verificationStatus}". Must be approved by admin.`, 403);
    }

    profile.isAvailable = Boolean(isAvailable);

    if (latitude !== undefined && longitude !== undefined) {
      profile.currentLocation = {
        type: 'Point',
        coordinates: [longitude, latitude],
      };
    }

    await profile.save();

    return sendSuccess(res, `Availability updated to ${profile.isAvailable ? 'AVAILABLE (🟢)' : 'OFFLINE (🔴)'}`, {
      isAvailable: profile.isAvailable,
      currentLocation: profile.currentLocation,
    });
  } catch (error) {
    return sendError(res, 'Failed to update availability', 500, error);
  }
};

export const updateLocation = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return sendError(res, 'Unauthenticated', 401);

    const { latitude, longitude } = req.body;

    const profile = await ResponderProfile.findOneAndUpdate(
      { userId: req.user.userId },
      {
        currentLocation: {
          type: 'Point',
          coordinates: [longitude, latitude],
        },
      },
      { new: true }
    );

    return sendSuccess(res, 'Location updated successfully', {
      currentLocation: profile?.currentLocation,
    });
  } catch (error) {
    return sendError(res, 'Failed to update location', 500, error);
  }
};
