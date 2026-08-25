
export type PantryType = 'food' | 'clothing' | 'resource' | 'library';
export type RepeatingType = 'one-time' | 'daily' | 'weekly' | 'weekendly' | 'monthly' | 'idk';

export interface Pantry {
  id: number;
  name: string;
  address: string;
  country?: string;
  state?: string;
  notes: string;
  lat: number;
  lng: number;
  hours: string;
  type: PantryType;
  repeating: RepeatingType;
  deleted: 0 | 1;
}

export interface Politician {
  id: number;
  name: string;
  office: 'House' | 'Senate';
  state: string;
  district: number | null;
  party: string;
  term_end_date: string;
  lat: number;
  lng: number;
}

export interface Candidate {
  id: number;
  name: string;
  office: 'House' | 'Senate';
  state: string;
  district: number | null;
  party: string;
  lat: number;
  lng: number;
}
