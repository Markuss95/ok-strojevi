import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMachine extends Document {
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

const machineSchema = new Schema<IMachine>(
  {
    name: { type: String, required: true, unique: true, trim: true },
  },
  { timestamps: true }
);

machineSchema.set('toJSON', {
  transform: (_doc, ret) => {
    const obj = ret as unknown as Record<string, unknown>;
    delete obj.__v;
    return obj;
  },
});

export const Machine: Model<IMachine> =
  mongoose.models.Machine || mongoose.model<IMachine>('Machine', machineSchema);
