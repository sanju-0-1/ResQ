import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { Emergency } from '../models/Emergency';
import { EmergencyMessage } from '../models/EmergencyMessage';
import { ResponderProfile } from '../models/ResponderProfile';
import { GeoService } from '../services/geoService';
import { NotificationService } from '../services/notificationService';
import { sendSuccess, sendError } from '../utils/response';
import { calculateDistanceMeters, formatDistance } from '../utils/geo';

export const createEmergency = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return sendError(res, 'Unauthenticated', 401);

    const { latitude, longitude, addressDescription, description, severity, radiusMeters } = req.body;

    const newEmergency = new Emergency({
      requesterId: req.user.userId,
      location: {
        type: 'Point',
        coordinates: [longitude, latitude],
      },
      addressDescription: addressDescription || '',
      description: description || '🆘 EMERGENCY: Harassment or safety threat reported.',
      severity: severity || 'high',
      status: 'active',
    });

    // Find nearby available verified ResQ responders
    const nearbyResponders = await GeoService.findNearbyResponders(
      longitude,
      latitude,
      radiusMeters || 5000
    );

    const notifiedUserIds = nearbyResponders.map((r) => r.userId._id.toString());
    newEmergency.respondersNotified = notifiedUserIds as any;

    await newEmergency.save();

    // Trigger push notifications & socket broadcasts to nearby responders
    await NotificationService.sendPushOrSocketAlert(
      notifiedUserIds,
      '🚨 EMERGENCY ASSISTANCE NEEDED',
      description || `A user near you needs immediate emergency assistance. Tap to review.`,
      { incidentId: newEmergency._id, requesterId: req.user.userId.toString() }
    );

    const populatedEmergency = await newEmergency.populate('requesterId', 'name username profilePhoto phone');

    return sendSuccess(res, 'Emergency request created successfully.', {
      emergency: populatedEmergency,
      respondersNotifiedCount: notifiedUserIds.length,
      safetyNotice: 'Maintain a safe distance. Contact official emergency services (911/112) if physical threat is present.',
    }, 201);
  } catch (error) {
    return sendError(res, 'Failed to create emergency request', 500, error);
  }
};

export const getMyActiveEmergency = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return sendError(res, 'Unauthenticated', 401);

    const activeEmergency = await Emergency.findOne({
      $or: [
        { requesterId: req.user.userId },
        { responderId: req.user.userId },
        { respondersAccepted: req.user.userId },
      ],
      status: { $in: ['active', 'responder_found', 'assistance_in_progress'] },
    })
      .populate('requesterId', 'name username profilePhoto phone')
      .populate('responderId', 'name username profilePhoto phone')
      .populate('respondersAccepted', 'name username profilePhoto phone');

    return sendSuccess(res, 'Active emergency status fetched', activeEmergency || null);
  } catch (error) {
    return sendError(res, 'Failed to fetch active emergency', 500, error);
  }
};

export const getNearbyEmergencies = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return sendError(res, 'Unauthenticated', 401);

    const responderProfile = await ResponderProfile.findOne({ userId: req.user.userId });
    if (!responderProfile || responderProfile.verificationStatus !== 'approved') {
      return sendError(res, 'Only approved ResQ responders can view nearby emergency requests.', 403);
    }

    if (!responderProfile.isAvailable) {
      return sendError(res, 'You are currently offline. Change status to "Available" to receive nearby emergency requests.', 400);
    }

    const [respLng, respLat] = responderProfile.currentLocation.coordinates;

    // Find active emergencies within responder's configured emergency radius
    const activeEmergencies = await Emergency.find({
      status: { $in: ['active', 'responder_found'] },
      location: {
        $nearSphere: {
          $geometry: {
            type: 'Point',
            coordinates: [respLng, respLat],
          },
          $maxDistance: responderProfile.emergencyRadiusMeters || 5000,
        },
      },
    })
      .populate('requesterId', 'name username profilePhoto')
      .populate('respondersAccepted', 'name username profilePhoto');

    // Format output with approximate distance for location privacy
    const sanitizedEmergencies = activeEmergencies.map((em) => {
      const distanceMeters = calculateDistanceMeters(
        [respLng, respLat],
        em.location.coordinates as [number, number]
      );
      const isAcceptedByMe = em.responderId?.toString() === req.user?.userId || em.respondersAccepted?.some((r: any) => r._id?.toString() === req.user?.userId);

      return {
        _id: em._id,
        status: em.status,
        severity: em.severity,
        description: em.description,
        addressDescription: em.addressDescription,
        approximateDistance: formatDistance(distanceMeters),
        distanceMeters,
        createdAt: em.createdAt,
        respondersCount: em.respondersAccepted ? em.respondersAccepted.length : (em.responderId ? 1 : 0),
        respondersAccepted: em.respondersAccepted || [],
        requester: {
          name: (em.requesterId as any)?.name || 'Anonymous Requester',
          username: (em.requesterId as any)?.username,
          profilePhoto: (em.requesterId as any)?.profilePhoto,
        },
        // Reveal exact coordinates ONLY if the responder has accepted
        exactLocation: isAcceptedByMe ? em.location : undefined,
      };
    });

    return sendSuccess(res, 'Nearby emergency requests retrieved', sanitizedEmergencies);
  } catch (error) {
    return sendError(res, 'Failed to fetch nearby emergencies', 500, error);
  }
};

export const getEmergencyById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const emergency = await Emergency.findById(id)
      .populate('requesterId', 'name username profilePhoto phone')
      .populate('responderId', 'name username profilePhoto phone')
      .populate('respondersAccepted', 'name username profilePhoto');

    if (!emergency) return sendError(res, 'Emergency incident not found', 404);

    const isRequester = emergency.requesterId._id.toString() === req.user?.userId;
    const isAcceptedResponder = emergency.responderId?._id.toString() === req.user?.userId;
    const isAdmin = req.user?.role === 'admin';

    // Privacy rule: Only requester, accepted responder, or admin can see exact coordinates and phone number
    if (!isRequester && !isAcceptedResponder && !isAdmin) {
      const sanitized = emergency.toObject();
      delete (sanitized.requesterId as any).phone;
      (sanitized as any).location = { type: 'Point', coordinates: [0, 0] }; // Masked coordinates
      return sendSuccess(res, 'Incident summary retrieved', sanitized);
    }

    return sendSuccess(res, 'Emergency details retrieved', emergency);
  } catch (error) {
    return sendError(res, 'Failed to fetch emergency incident', 500, error);
  }
};

export const acceptEmergency = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return sendError(res, 'Unauthenticated', 401);

    const { id } = req.params;
    const responderId = req.user.userId;

    let responderProfile = await ResponderProfile.findOne({ userId: responderId });

    if (!responderProfile && process.env.NODE_ENV === 'development') {
      responderProfile = await ResponderProfile.create({
        userId: responderId,
        verificationStatus: 'approved',
        isAvailable: true,
        currentLocation: { type: 'Point', coordinates: [-73.98513, 40.748817] },
      });
    } else if (responderProfile && responderProfile.verificationStatus !== 'approved' && process.env.NODE_ENV === 'development') {
      responderProfile.verificationStatus = 'approved';
      responderProfile.isAvailable = true;
      await responderProfile.save();
    }

    if (!responderProfile || responderProfile.verificationStatus !== 'approved') {
      return sendError(res, 'Verification Required: Only approved ResQ responders can accept emergency requests.', 403);
    }

    const emergency = await Emergency.findById(id);
    if (!emergency) return sendError(res, 'Emergency request not found', 404);

    if (['resolved', 'cancelled', 'expired'].includes(emergency.status)) {
      return sendError(res, `Cannot accept emergency. Incident status is already "${emergency.status}".`, 400);
    }

    // Set primary responder and update status
    emergency.responderId = responderId as any;
    if (!emergency.respondersAccepted.includes(responderId as any)) {
      emergency.respondersAccepted.push(responderId as any);
    }
    emergency.status = 'responder_found';
    await emergency.save();

    // Create system message in emergency chat
    await EmergencyMessage.create({
      incidentId: emergency._id,
      senderId: responderId,
      type: 'system',
      content: '🚨 A verified ResQ responder has accepted the emergency request and is en route to your location. Stay safe!',
    });

    // Notify requester via push/socket
    await NotificationService.sendPushOrSocketAlert(
      [emergency.requesterId.toString()],
      '🛡️ RESPONDER ON THE WAY',
      'A verified ResQ responder has accepted your emergency request.',
      { incidentId: emergency._id }
    );

    const updatedEmergency = await emergency.populate([
      { path: 'requesterId', select: 'name username profilePhoto phone' },
      { path: 'responderId', select: 'name username profilePhoto phone' },
      { path: 'respondersAccepted', select: 'name username profilePhoto phone' },
    ]);

    return sendSuccess(res, 'Emergency accepted successfully.', {
      emergency: updatedEmergency,
      safetyInstructions: [
        'Maintain a safe distance.',
        'Do NOT physically confront an attacker or use weapons.',
        'If immediate danger escalates, call official emergency services (911/112).',
        'Help the victim move to a safe, well-lit public space.',
      ],
    });
  } catch (error) {
    return sendError(res, 'Failed to accept emergency request', 500, error);
  }
};

export const updateEmergencyStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;

    const emergency = await Emergency.findById(id);
    if (!emergency) return sendError(res, 'Emergency not found', 404);

    const isRequester = emergency.requesterId.toString() === req.user?.userId;
    const isResponder = emergency.responderId?.toString() === req.user?.userId;
    const isAdmin = req.user?.role === 'admin';

    if (!isRequester && !isResponder && !isAdmin) {
      return sendError(res, 'Unauthorized to update status of this emergency', 403);
    }

    emergency.status = status;
    if (status === 'resolved') {
      emergency.resolvedAt = new Date();
      // Increment total assists for responder
      if (emergency.responderId) {
        await ResponderProfile.findOneAndUpdate(
          { userId: emergency.responderId },
          { $inc: { totalAssists: 1 } }
        );
      }
    } else if (status === 'cancelled') {
      emergency.cancelledAt = new Date();
    }

    await emergency.save();

    // Create system log message
    await EmergencyMessage.create({
      incidentId: emergency._id,
      senderId: req.user?.userId,
      type: 'system',
      content: `Emergency status updated to: ${status.toUpperCase()} ${reason ? `(${reason})` : ''}`,
    });

    return sendSuccess(res, `Emergency status updated to "${status}"`, emergency);
  } catch (error) {
    return sendError(res, 'Failed to update emergency status', 500, error);
  }
};

export const cancelEmergency = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const emergency = await Emergency.findById(id);

    if (!emergency) return sendError(res, 'Emergency incident not found', 404);

    if (emergency.requesterId.toString() !== req.user?.userId && req.user?.role !== 'admin') {
      return sendError(res, 'Only the requester can cancel the emergency', 403);
    }

    emergency.status = 'cancelled';
    emergency.cancelledAt = new Date();
    await emergency.save();

    await EmergencyMessage.create({
      incidentId: emergency._id,
      senderId: req.user?.userId,
      type: 'system',
      content: '❌ Requester cancelled the emergency assistance request.',
    });

    if (emergency.respondersNotified && emergency.respondersNotified.length > 0) {
      const notifiedUserIds = emergency.respondersNotified.map((nId: any) => nId.toString());
      await NotificationService.sendPushOrSocketAlert(
        notifiedUserIds,
        'Emergency Cancelled',
        'The requester has cancelled their emergency assistance request.',
        { incidentId: emergency._id, status: 'cancelled' }
      );
    }

    return sendSuccess(res, 'Emergency cancelled successfully', emergency);
  } catch (error) {
    return sendError(res, 'Failed to cancel emergency', 500, error);
  }
};

export const getEmergencyMessages = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const messages = await EmergencyMessage.find({ incidentId: id })
      .sort({ createdAt: 1 })
      .populate('senderId', 'name username profilePhoto role');

    return sendSuccess(res, 'Emergency messages retrieved', messages);
  } catch (error) {
    return sendError(res, 'Failed to fetch messages', 500, error);
  }
};

export const sendEmergencyMessage = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { content, type } = req.body;

    const message = await EmergencyMessage.create({
      incidentId: id,
      senderId: req.user?.userId,
      content,
      type: type || 'text',
      readBy: [req.user?.userId],
    });

    const populated = await message.populate('senderId', 'name username profilePhoto role');
    return sendSuccess(res, 'Message sent successfully', populated, 201);
  } catch (error) {
    return sendError(res, 'Failed to send message', 500, error);
  }
};
