import { Schema, model, Document, Types } from 'mongoose';

export type VerificationStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

export interface IGeoJSONPoint {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

export interface IResponderProfile extends Document {
  userId: Types.ObjectId;
  verificationStatus: VerificationStatus;
  isAvailable: boolean;
  currentLocation: IGeoJSONPoint;
  governmentIdRef?: string; // encrypted or internal hash identifier - never exposed publicly
  verificationNotes?: string;
  reviewedBy?: Types.ObjectId;
  reviewedAt?: Date;
  emergencyRadiusMeters: number;
  totalAssists: number;
  rating?: number;
  createdAt: Date;
  updatedAt: Date;
}

const responderProfileSchema = new Schema<IResponderProfile>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    verificationStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'suspended'],
      default: 'pending',
      index: true,
    },
    isAvailable: { type: Boolean, default: false, index: true },
    currentLocation: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0],
      },
    },
    governmentIdRef: { type: String, select: false }, // Keep hidden by default
    verificationNotes: { type: String, default: '' },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: { type: Date },
    emergencyRadiusMeters: { type: Number, default: 5000 },
    totalAssists: { type: Number, default: 0 },
    rating: { type: Number, default: 5.0 },
  },
  {
    timestamps: true,
  }
);

responderProfileSchema.index({ currentLocation: '2dsphere' });

export const ResponderProfile = model<IResponderProfile>('ResponderProfile', responderProfileSchema);
