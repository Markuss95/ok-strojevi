export interface Machine {
  _id: string;
  name: string;
  inv: string;
  category?: string;
}

export interface SiteLocation {
  address?: string;
  lat: number;
  lng: number;
}

export interface ConstructionSite {
  _id: string;
  code: string;
  name: string;
  location?: SiteLocation;
}

export interface Lubricant {
  izmjena?: number;
  dopuna?: number;
}

export interface WorkLogParams {
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

export interface WorkLog {
  _id: string;
  date: string;
  machineName: string;
  machineInv: string;
  siteCode: string;
  siteName: string;
  createdByName: string;
  opisUcinak?: string;
  opisRezija?: string;
  params: WorkLogParams;
  maziva: {
    motUlje: Lubricant;
    hidraol: Lubricant;
    at: Lubricant;
    ostalo: Lubricant;
  };
  createdAt: string;
}
