import { Schema, model, Document, Types } from 'mongoose';

export interface ITrustedContact extends Document {
  userId: Types.ObjectId;
  name: string;
  phone: string;
  relationship: string;
  isPrimary: boolean;
  notifyOnEmergency: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const trustedContactSchema = new Schema<ITrustedContact>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    relationship: { type: String, required: true, trim: true },
    isPrimary: { type: Boolean, default: false },
    notifyOnEmergency: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

export const TrustedContact = model<ITrustedContact>('TrustedContact', trustedContactSchema);
