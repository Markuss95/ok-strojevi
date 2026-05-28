export interface Machine {
  _id: string;
  name: string;
  inv: string;
  category?: string;
}

export interface ConstructionSite {
  _id: string;
  code: string;
  name: string;
}
