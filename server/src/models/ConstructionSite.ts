import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISiteLocation {
  address?: string;
  lat: number;
  lng: number;
}

export interface IConstructionSite extends Document {
  code: string;
  name: string;
  location?: ISiteLocation;
  createdAt: Date;
  updatedAt: Date;
}

const locationSchema = new Schema<ISiteLocation>(
  {
    address: { type: String, trim: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  { _id: false }
);

const constructionSiteSchema = new Schema<IConstructionSite>(
  {
    code: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    location: { type: locationSchema, required: false },
  },
  { timestamps: true }
);

export const ConstructionSite: Model<IConstructionSite> =
  mongoose.models.ConstructionSite ||
  mongoose.model<IConstructionSite>('ConstructionSite', constructionSiteSchema);
