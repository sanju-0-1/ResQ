import { Schema, model, Document, Types } from 'mongoose';

export interface IAuditLog extends Document {
  actorId: Types.ObjectId;
  action: string;
  targetType: string;
  targetId?: Types.ObjectId;
  ipAddress?: string;
  details?: Record<string, any>;
  createdAt: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    actorId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    action: { type: String, required: true },
    targetType: { type: String, required: true },
    targetId: { type: Schema.Types.ObjectId },
    ipAddress: { type: String },
    details: { type: Schema.Types.Mixed },
  },
  {
    timestamps: true,
  }
);

export const AuditLog = model<IAuditLog>('AuditLog', auditLogSchema);
