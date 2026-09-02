import { Schema, model, Document, Types } from 'mongoose';

export type ReportReason =
  | 'fake_emergency'
  | 'harassment'
  | 'abuse'
  | 'threats'
  | 'stalking'
  | 'inappropriate_behavior'
  | 'false_responder'
  | 'misuse_system';

export type ReportStatus = 'pending' | 'under_review' | 'resolved' | 'dismissed';

export interface IReport extends Document {
  reporterId: Types.ObjectId;
  reportedUserId: Types.ObjectId;
  incidentId?: Types.ObjectId;
  reason: ReportReason;
  description: string;
  evidence: string[];
  status: ReportStatus;
  adminNotes?: string;
  actionTaken?: 'none' | 'warning' | 'suspension' | 'ban';
  reviewedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const reportSchema = new Schema<IReport>(
  {
    reporterId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    reportedUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    incidentId: { type: Schema.Types.ObjectId, ref: 'Emergency' },
    reason: {
      type: String,
      enum: [
        'fake_emergency',
        'harassment',
        'abuse',
        'threats',
        'stalking',
        'inappropriate_behavior',
        'false_responder',
        'misuse_system',
      ],
      required: true,
    },
    description: { type: String, required: true, trim: true },
    evidence: [{ type: String }],
    status: {
      type: String,
      enum: ['pending', 'under_review', 'resolved', 'dismissed'],
      default: 'pending',
      index: true,
    },
    adminNotes: { type: String, default: '' },
    actionTaken: {
      type: String,
      enum: ['none', 'warning', 'suspension', 'ban'],
      default: 'none',
    },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
  }
);

export const Report = model<IReport>('Report', reportSchema);
