import { Schema, model, Document, Types } from 'mongoose';

export interface IVerification extends Document {
  userId: Types.ObjectId;
  fullName: string;
  idDocumentHash: string; // Hashed string for privacy
  idType: 'national_id' | 'driver_license' | 'passport' | 'other';
  selfieVerificationUrl?: string;
  submittedAt: Date;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  adminNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const verificationSchema = new Schema<IVerification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    fullName: { type: String, required: true, trim: true },
    idDocumentHash: { type: String, required: true, select: false }, // Never expose publicly
    idType: {
      type: String,
      enum: ['national_id', 'driver_license', 'passport', 'other'],
      required: true,
    },
    selfieVerificationUrl: { type: String, select: false },
    submittedAt: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },
    rejectionReason: { type: String, default: '' },
    adminNotes: { type: String, default: '' },
  },
  {
    timestamps: true,
  }
);

export const Verification = model<IVerification>('Verification', verificationSchema);
