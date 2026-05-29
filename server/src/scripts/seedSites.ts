import { ConstructionSite } from '../models/ConstructionSite';
import { runSeed, seedCollection } from './seedHelpers';

runSeed(() =>
  seedCollection({
    model: ConstructionSite,
    dataFile: 'constructionSites.json',
    uniqueKey: 'code',
  })
);
