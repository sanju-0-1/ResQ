import { Schema, model, Document, Types } from 'mongoose';

export type MessageType = 'text' | 'system' | 'location_share' | 'deescalation_warning';

export interface IEmergencyMessage extends Document {
  incidentId: Types.ObjectId;
  senderId: Types.ObjectId;
  type: MessageType;
  content: string;
  readBy: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const emergencyMessageSchema = new Schema<IEmergencyMessage>(
  {
    incidentId: { type: Schema.Types.ObjectId, ref: 'Emergency', required: true, index: true },
    senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: ['text', 'system', 'location_share', 'deescalation_warning'],
      default: 'text',
    },
    content: { type: String, required: true, trim: true },
    readBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  {
    timestamps: true,
  }
);

emergencyMessageSchema.index({ incidentId: 1, createdAt: 1 });

export const EmergencyMessage = model<IEmergencyMessage>('EmergencyMessage', emergencyMessageSchema);
