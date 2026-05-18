import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

export const ROLES = ['admin', 'control', 'user'] as const;
export type Role = (typeof ROLES)[number];

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
  setPassword(plain: string): Promise<void>;
  comparePassword(plain: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ROLES,
      default: 'user',
      required: true,
    },
  },
  { timestamps: true }
);

userSchema.methods.setPassword = async function (plain: string): Promise<void> {
  this.passwordHash = await bcrypt.hash(plain, 10);
};

userSchema.methods.comparePassword = function (plain: string): Promise<boolean> {
  return bcrypt.compare(plain, this.passwordHash);
};

userSchema.set('toJSON', {
  transform: (_doc, ret) => {
    const obj = ret as unknown as Record<string, unknown>;
    delete obj.passwordHash;
    delete obj.__v;
    return obj;
  },
});

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', userSchema);
