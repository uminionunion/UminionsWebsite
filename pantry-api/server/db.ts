import fs from 'fs';
import path from 'path';
import { Kysely, SqliteDialect } from 'kysely';
import Database from 'better-sqlite3';
import type { Pantry, Politician, Candidate } from './types.js';


interface DatabaseSchema {
  pantries: PantryTable;
  politicians: PoliticianTable;
  candidates: CandidateTable;
}

interface PantryTable {
  id: number;
  name: string;
  address: string;
  country: string;
  state: string;
  notes: string;
  lat: number;
  lng: number;
  hours: string;
  type: 'food' | 'clothing' | 'resource' | 'library';
  repeating: 'one-time' | 'daily' | 'weekly' | 'weekendly' | 'monthly' | 'idk';
  deleted: 0 | 1;
}

interface PoliticianTable {
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

interface CandidateTable {
  id: number;
  name: string;
  office: string;
  state: string;
  district: number | null;
  party: string;
  lat: number;
  lng: number;
  country: string | null;
  website: string | null;
  image_url: string | null;
  user_id: number | null;
  username: string | null;
  show_on_map: number;
  created_at: string;
}

const DATA_DIRECTORY = process.env.DATA_DIRECTORY || path.join(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIRECTORY)) {
  fs.mkdirSync(DATA_DIRECTORY, { recursive: true });
}

const DB_FILE = path.join(DATA_DIRECTORY, 'database.sqlite');

const dialect = new SqliteDialect({
  database: new Database(DB_FILE),
});

export const db = new Kysely<DatabaseSchema>({
  dialect,
  log: ['query', 'error'],
});
