import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import { connectDb } from '../config/db';
import { ConstructionSite } from '../models/ConstructionSite';
import { runSeed } from './seedHelpers';

interface LocationRow {
  code: string;
  lat: number;
  lng: number;
}

/**
 * Backfills the `location` field on existing gradilišta from a code→coordinate
 * list (see data/siteLocations.json). Matches by `code`; codes with no matching
 * site are reported and skipped (e.g. material-source/quarry entries that are
 * not construction sites).
 */
async function seedSiteLocations(): Promise<void> {
  const dataPath = path.join(__dirname, 'data', 'siteLocations.json');
  const rows = JSON.parse(fs.readFileSync(dataPath, 'utf-8')) as LocationRow[];

  await connectDb();

  const updated: string[] = [];
  const unmatched: string[] = [];

  for (const row of rows) {
    const res = await ConstructionSite.updateOne(
      { code: row.code },
      { $set: { location: { lat: row.lat, lng: row.lng } } }
    );
    if (res.matchedCount > 0) updated.push(row.code);
    else unmatched.push(row.code);
  }

  console.log(`[seed] set location on ${updated.length} gradilište record(s).`);
  if (unmatched.length > 0) {
    console.log(
      `[seed] ${unmatched.length} code(s) had no matching gradilište (skipped):\n  - ${unmatched.join(
        '\n  - '
      )}`
    );
  }

  await mongoose.disconnect();
}

runSeed(seedSiteLocations);
