import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IConstructionSite extends Document {
  code: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

const constructionSiteSchema = new Schema<IConstructionSite>(
  {
    code: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

constructionSiteSchema.set('toJSON', {
  transform: (_doc, ret) => {
    const obj = ret as unknown as Record<string, unknown>;
    delete obj.__v;
    return obj;
  },
});

export const ConstructionSite: Model<IConstructionSite> =
  mongoose.models.ConstructionSite ||
  mongoose.model<IConstructionSite>('ConstructionSite', constructionSiteSchema);
