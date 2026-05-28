import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import { connectDb } from '../config/db';
import { ConstructionSite } from '../models/ConstructionSite';

interface SeedSite {
  code: string;
  name: string;
}

async function seedSites(): Promise<void> {
  const dataPath = path.join(__dirname, 'data', 'constructionSites.json');
  const raw = fs.readFileSync(dataPath, 'utf-8');
  const data: SeedSite[] = JSON.parse(raw);

  await connectDb();

  const wipe = process.env.WIPE === '1';
  if (wipe) {
    const result = await ConstructionSite.deleteMany({});
    console.log(`[seed] wiped ${result.deletedCount} existing site(s)`);
  }

  let created = 0;
  let skipped = 0;
  for (const s of data) {
    const existing = await ConstructionSite.findOne({ code: s.code });
    if (existing) {
      skipped++;
      continue;
    }
    await ConstructionSite.create({ code: s.code, name: s.name });
    created++;
  }
  console.log(`[seed] created ${created} site(s), skipped ${skipped} (already existed)`);

  await mongoose.disconnect();
}

seedSites()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('[seed] failed:', err);
    process.exit(1);
  });
