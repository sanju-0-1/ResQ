import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { User } from '../models/User';
import { ResponderProfile } from '../models/ResponderProfile';
import { Verification } from '../models/Verification';
import { Emergency } from '../models/Emergency';
import { Report } from '../models/Report';
import { AuditLog } from '../models/AuditLog';
import { sendSuccess, sendError } from '../utils/response';

export const getDashboardStats = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const totalUsers = await User.countDocuments();
    const verifiedRespondersCount = await ResponderProfile.countDocuments({ verificationStatus: 'approved' });
    const pendingVerifications = await Verification.countDocuments({ status: 'pending' });
    const activeEmergencies = await Emergency.countDocuments({ status: { $in: ['active', 'responder_found', 'assistance_in_progress'] } });
    const resolvedEmergencies = await Emergency.countDocuments({ status: 'resolved' });
    const pendingReports = await Report.countDocuments({ status: 'pending' });
    const suspendedUsers = await User.countDocuments({ status: { $in: ['suspended', 'banned'] } });

    return sendSuccess(res, 'Admin stats retrieved successfully', {
      totalUsers,
      verifiedResponders: verifiedRespondersCount,
      verifiedResqResponders: verifiedRespondersCount,
      verifiedHomegirls: verifiedRespondersCount,
      pendingVerifications,
      activeEmergencies,
      resolvedEmergencies,
      pendingReports,
      suspendedUsers,
    });
  } catch (error) {
    return sendError(res, 'Failed to fetch admin stats', 500, error);
  }
};

export const getVerificationQueue = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const verifications = await Verification.find({ status: 'pending' })
      .populate('userId', 'name username email phone profilePhoto createdAt')
      .sort({ createdAt: -1 });

    return sendSuccess(res, 'Verification queue retrieved', verifications);
  } catch (error) {
    return sendError(res, 'Failed to fetch verification queue', 500, error);
  }
};

export const reviewVerification = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, adminNotes, rejectionReason } = req.body; // status: 'approved' | 'rejected'

    const verification = await Verification.findById(id);
    if (!verification) return sendError(res, 'Verification record not found', 404);

    verification.status = status;
    verification.adminNotes = adminNotes || '';
    if (status === 'rejected') {
      verification.rejectionReason = rejectionReason || 'Information provided did not pass safety verification.';
    }
    await verification.save();

    // Update ResponderProfile & User
    await ResponderProfile.findOneAndUpdate(
      { userId: verification.userId },
      {
        verificationStatus: status,
        reviewedBy: req.user?.userId,
        reviewedAt: new Date(),
      }
    );

    await User.findByIdAndUpdate(verification.userId, {
      isVerifiedResponder: status === 'approved',
    });

    // Audit log
    await AuditLog.create({
      actorId: req.user?.userId,
      action: `VERIFICATION_${status.toUpperCase()}`,
      targetType: 'User',
      targetId: verification.userId,
      details: { verificationId: id, adminNotes },
    });

    return sendSuccess(res, `Responder verification set to "${status}"`, verification);
  } catch (error) {
    return sendError(res, 'Failed to review verification application', 500, error);
  }
};

export const getReports = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const reports = await Report.find()
      .populate('reporterId', 'name username profilePhoto')
      .populate('reportedUserId', 'name username email phone status')
      .populate('incidentId')
      .sort({ createdAt: -1 });

    return sendSuccess(res, 'Reports list retrieved', reports);
  } catch (error) {
    return sendError(res, 'Failed to fetch reports', 500, error);
  }
};

export const handleUserModeration = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const { status, reason } = req.body; // status: 'active' | 'suspended' | 'banned'

    const user = await User.findById(userId);
    if (!user) return sendError(res, 'User not found', 404);

    user.status = status;
    await user.save();

    if (status === 'banned' || status === 'suspended') {
      // Deactivate responder profile if applicable
      await ResponderProfile.findOneAndUpdate(
        { userId: user._id },
        { isAvailable: false, verificationStatus: status }
      );
    }

    await AuditLog.create({
      actorId: req.user?.userId,
      action: `USER_MODERATION_${status.toUpperCase()}`,
      targetType: 'User',
      targetId: user._id,
      details: { reason },
    });

    return sendSuccess(res, `User status updated to ${status}`, user);
  } catch (error) {
    return sendError(res, 'Failed to moderate user', 500, error);
  }
};
