import fs from 'fs';
import path from 'path';
import mongoose, { Model } from 'mongoose';
import { connectDb } from '../config/db';

interface SeedCollectionOptions<T> {
  /** Mongoose model to seed into. */
  model: Model<T>;
  /** Filename inside `server/src/scripts/data/`, e.g. 'machines.json'. */
  dataFile: string;
  /** Field used to dedupe existing rows, e.g. 'inv' or 'code'. */
  uniqueKey: keyof T & string;
  /** Optional hook run after DB connect, before insertion (e.g. drop a legacy index). */
  preSeed?: () => Promise<void>;
}

/**
 * Loads a JSON array of documents and inserts the missing ones in bulk:
 *   1. Optionally wipes the collection if `WIPE=1` is set in the environment.
 *   2. Runs the optional `preSeed` hook (used by seedMachines to drop a stale
 *      `name_1` unique index left over from an earlier schema).
 *   3. Pre-fetches existing documents by `uniqueKey` in one round-trip.
 *   4. `insertMany`s the new ones (`ordered: false` so a single duplicate
 *      doesn't abort the rest).
 */
export async function seedCollection<T>({
  model,
  dataFile,
  uniqueKey,
  preSeed,
}: SeedCollectionOptions<T>): Promise<void> {
  const dataPath = path.join(__dirname, 'data', dataFile);
  const docs = JSON.parse(fs.readFileSync(dataPath, 'utf-8')) as Partial<T>[];

  await connectDb();
  if (preSeed) await preSeed();

  if (process.env.WIPE === '1') {
    const { deletedCount } = await model.deleteMany({});
    console.log(`[seed] wiped ${deletedCount} existing ${model.modelName} record(s)`);
  }

  const keys = docs.map((d) => (d as Record<string, unknown>)[uniqueKey]);
  const existing = await model
    .find({ [uniqueKey]: { $in: keys } } as Record<string, unknown>)
    .select({ [uniqueKey]: 1 });
  const existingSet = new Set(
    existing.map((e) => (e as unknown as Record<string, unknown>)[uniqueKey])
  );

  const toInsert = docs.filter(
    (d) => !existingSet.has((d as Record<string, unknown>)[uniqueKey])
  );
  if (toInsert.length > 0) {
    await model.insertMany(toInsert, { ordered: false });
  }
  console.log(
    `[seed] created ${toInsert.length} ${model.modelName} record(s), skipped ${
      docs.length - toInsert.length
    } (already existed)`
  );

  await mongoose.disconnect();
}

/**
 * Standard wrapper for one-shot seed scripts: run the function, exit 0 on
 * success, log and exit 1 on failure.
 */
export function runSeed(fn: () => Promise<void>): void {
  fn()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('[seed] failed:', err);
      process.exit(1);
    });
}
