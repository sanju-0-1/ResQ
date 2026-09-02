import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { TrustedContact } from '../models/TrustedContact';
import { sendSuccess, sendError } from '../utils/response';

export const getTrustedContacts = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return sendError(res, 'Unauthenticated', 401);

    const contacts = await TrustedContact.find({ userId: req.user.userId }).sort({ isPrimary: -1, createdAt: -1 });
    return sendSuccess(res, 'Trusted contacts retrieved', contacts);
  } catch (error) {
    return sendError(res, 'Failed to fetch trusted contacts', 500, error);
  }
};

export const addTrustedContact = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return sendError(res, 'Unauthenticated', 401);

    const { name, phone, relationship, isPrimary, notifyOnEmergency } = req.body;

    if (isPrimary) {
      // Unset previous primary contact
      await TrustedContact.updateMany({ userId: req.user.userId }, { isPrimary: false });
    }

    const contact = new TrustedContact({
      userId: req.user.userId,
      name,
      phone,
      relationship,
      isPrimary: isPrimary || false,
      notifyOnEmergency: notifyOnEmergency !== undefined ? notifyOnEmergency : true,
    });

    await contact.save();

    return sendSuccess(res, 'Trusted contact added successfully', contact, 201);
  } catch (error) {
    return sendError(res, 'Failed to add trusted contact', 500, error);
  }
};

export const deleteTrustedContact = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return sendError(res, 'Unauthenticated', 401);

    const { id } = req.params;
    const contact = await TrustedContact.findOneAndDelete({ _id: id, userId: req.user.userId });

    if (!contact) return sendError(res, 'Trusted contact not found', 404);

    return sendSuccess(res, 'Trusted contact removed successfully');
  } catch (error) {
    return sendError(res, 'Failed to delete trusted contact', 500, error);
  }
};
