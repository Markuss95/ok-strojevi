import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import { connectDb } from '../config/db';
import { Machine } from '../models/Machine';

interface SeedMachine {
  name: string;
  inv: string;
  category?: string | null;
}

async function seedMachines(): Promise<void> {
  const dataPath = path.join(__dirname, 'data', 'machines.json');
  const raw = fs.readFileSync(dataPath, 'utf-8');
  const data: SeedMachine[] = JSON.parse(raw);

  await connectDb();

  // Drop any legacy unique index on `name` from the previous schema, if present.
  try {
    const indexes = await Machine.collection.indexes();
    if (indexes.some((i) => i.name === 'name_1')) {
      await Machine.collection.dropIndex('name_1');
      console.log('[seed] dropped legacy unique index name_1');
    }
  } catch (err) {
    console.warn('[seed] index inspection skipped:', err);
  }

  const wipe = process.env.WIPE === '1';
  if (wipe) {
    const result = await Machine.deleteMany({});
    console.log(`[seed] wiped ${result.deletedCount} existing machine(s)`);
  }

  let created = 0;
  let skipped = 0;
  for (const m of data) {
    const existing = await Machine.findOne({ inv: m.inv });
    if (existing) {
      skipped++;
      continue;
    }
    await Machine.create({
      name: m.name,
      inv: m.inv,
      category: m.category ?? undefined,
    });
    created++;
  }
  console.log(`[seed] created ${created} machine(s), skipped ${skipped} (already existed)`);

  await mongoose.disconnect();
}

seedMachines()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('[seed] failed:', err);
    process.exit(1);
  });
