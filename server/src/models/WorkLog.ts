import mongoose, { Schema, Document, Model, Types } from 'mongoose';

/** One lubricant row: amount changed (izmjena) and topped up (dopuna), in kg. */
export interface ILubricant {
  izmjena?: number;
  dopuna?: number;
}

export interface IWorkLogParams {
  motobrojilo?: number;
  pocetno?: number;
  zavrsno?: number;
  ukupno?: number;
  odrzavanje?: number;
  selLabudicom?: number;
  samohodno?: number;
  visaSila?: number;
  cekanje?: number;
  razlog?: string;
  ostvarenoSati?: number;
  stroj?: number;
  strojar?: number;
}

export interface IWorkLog extends Document {
  date: string; // ISO yyyy-mm-dd as entered in the form
  machine: Types.ObjectId;
  site: Types.ObjectId;
  createdBy: Types.ObjectId;
  // Denormalized snapshots so reports stay readable even if the referenced
  // machine/site/user is later renamed or removed.
  machineName: string;
  machineInv: string;
  siteCode: string;
  siteName: string;
  createdByName: string;
  opisUcinak?: string;
  opisRezija?: string;
  params: IWorkLogParams;
  maziva: {
    motUlje: ILubricant;
    hidraol: ILubricant;
    at: ILubricant;
    ostalo: ILubricant;
  };
  createdAt: Date;
  updatedAt: Date;
}

const lubricantSchema = new Schema<ILubricant>(
  {
    izmjena: { type: Number },
    dopuna: { type: Number },
  },
  { _id: false }
);

const paramsSchema = new Schema<IWorkLogParams>(
  {
    motobrojilo: { type: Number },
    pocetno: { type: Number },
    zavrsno: { type: Number },
    ukupno: { type: Number },
    odrzavanje: { type: Number },
    selLabudicom: { type: Number },
    samohodno: { type: Number },
    visaSila: { type: Number },
    cekanje: { type: Number },
    razlog: { type: String, trim: true },
    ostvarenoSati: { type: Number },
    stroj: { type: Number },
    strojar: { type: Number },
  },
  { _id: false }
);

const workLogSchema = new Schema<IWorkLog>(
  {
    date: { type: String, required: true },
    machine: { type: Schema.Types.ObjectId, ref: 'Machine', required: true },
    site: { type: Schema.Types.ObjectId, ref: 'ConstructionSite', required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    machineName: { type: String, required: true },
    machineInv: { type: String, required: true },
    siteCode: { type: String, required: true },
    siteName: { type: String, required: true },
    createdByName: { type: String, required: true },
    opisUcinak: { type: String, trim: true },
    opisRezija: { type: String, trim: true },
    params: { type: paramsSchema, default: {} },
    maziva: {
      motUlje: { type: lubricantSchema, default: {} },
      hidraol: { type: lubricantSchema, default: {} },
      at: { type: lubricantSchema, default: {} },
      ostalo: { type: lubricantSchema, default: {} },
    },
  },
  { timestamps: true }
);

export const WorkLog: Model<IWorkLog> =
  mongoose.models.WorkLog || mongoose.model<IWorkLog>('WorkLog', workLogSchema);
