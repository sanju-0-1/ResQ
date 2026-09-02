import { Schema, model, Document, Types } from 'mongoose';
import { IGeoJSONPoint } from './ResponderProfile';

export type EmergencyStatus =
  | 'active'
  | 'responder_found'
  | 'assistance_in_progress'
  | 'resolved'
  | 'cancelled'
  | 'expired';

export type EmergencySeverity = 'low' | 'medium' | 'high' | 'critical';

export interface IEmergency extends Document {
  requesterId: Types.ObjectId;
  location: IGeoJSONPoint;
  addressDescription?: string;
  status: EmergencyStatus;
  severity: EmergencySeverity;
  description?: string;
  respondersNotified: Types.ObjectId[];
  respondersAccepted: Types.ObjectId[];
  responderId?: Types.ObjectId; // Primary accepted responder
  evidence: Array<{
    type: 'photo' | 'video' | 'audio' | 'text';
    url?: string;
    description?: string;
    createdAt: Date;
  }>;
  witnesses: Array<{
    name?: string;
    phone?: string;
    notes?: string;
  }>;
  cancelledAt?: Date;
  resolvedAt?: Date;
  expiredAt?: Date;
  safeMeetingPoint?: {
    type: 'Point';
    coordinates: [number, number];
    name?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const emergencySchema = new Schema<IEmergency>(
  {
    requesterId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
    addressDescription: { type: String, default: '' },
    status: {
      type: String,
      enum: ['active', 'responder_found', 'assistance_in_progress', 'resolved', 'cancelled', 'expired'],
      default: 'active',
      index: true,
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'high',
    },
    description: { type: String, default: 'Physical harassment or emergency assistance needed.' },
    respondersNotified: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    respondersAccepted: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    responderId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    evidence: [
      {
        type: { type: String, enum: ['photo', 'video', 'audio', 'text'], required: true },
        url: { type: String },
        description: { type: String },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    witnesses: [
      {
        name: { type: String },
        phone: { type: String },
        notes: { type: String },
      },
    ],
    cancelledAt: { type: Date },
    resolvedAt: { type: Date },
    expiredAt: { type: Date },
    safeMeetingPoint: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number] },
      name: { type: String },
    },
  },
  {
    timestamps: true,
  }
);

emergencySchema.index({ location: '2dsphere' });
emergencySchema.index({ requesterId: 1, status: 1 });

export const Emergency = model<IEmergency>('Emergency', emergencySchema);
