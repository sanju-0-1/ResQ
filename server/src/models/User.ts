import { Schema, model, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export type UserRole = 'normal' | 'resq' | 'homegirl' | 'admin';
export type UserAccountStatus = 'active' | 'suspended' | 'banned';

export interface IUser extends Document {
  name: string;
  username: string;
  email: string;
  phone: string;
  password?: string;
  dateOfBirth?: Date;
  role: UserRole;
  profilePhoto?: string;
  isVerifiedResponder: boolean;
  status: UserAccountStatus;
  isPhoneVerified: boolean;
  isEmailVerified: boolean;
  lastActiveAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    username: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    phone: { type: String, required: true, unique: true, trim: true, index: true },
    password: { type: String, required: true, select: false },
    dateOfBirth: { type: Date },
    role: { type: String, enum: ['normal', 'resq', 'homegirl', 'admin'], default: 'resq', index: true },
    profilePhoto: { type: String, default: '' },
    isVerifiedResponder: { type: Boolean, default: false, index: true },
    status: { type: String, enum: ['active', 'suspended', 'banned'], default: 'active', index: true },
    isPhoneVerified: { type: Boolean, default: false },
    isEmailVerified: { type: Boolean, default: false },
    lastActiveAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = model<IUser>('User', userSchema);
