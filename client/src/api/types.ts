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
