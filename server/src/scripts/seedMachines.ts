import { Machine } from '../models/Machine';
import { runSeed, seedCollection } from './seedHelpers';

runSeed(() =>
  seedCollection({
    model: Machine,
    dataFile: 'machines.json',
    uniqueKey: 'inv',
    // The previous schema had `unique: true` on `name`, which Mongoose
    // materialised as a `name_1` index. The new schema allows duplicate
    // names — drop the leftover index before inserting.
    preSeed: async () => {
      const indexes = await Machine.collection.indexes();
      if (indexes.some((i) => i.name === 'name_1')) {
        await Machine.collection.dropIndex('name_1');
        console.log('[seed] dropped legacy unique index name_1');
      }
    },
  })
);
