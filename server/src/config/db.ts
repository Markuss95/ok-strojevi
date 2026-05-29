import mongoose from 'mongoose';
import { env } from './env';

// Default toJSON: strip the internal `__v` version key from every model.
// Schemas that need to remove additional fields (e.g. `passwordHash` on User)
// override this with their own `schema.set('toJSON', ...)`.
mongoose.set('toJSON', {
  transform: (_doc, ret) => {
    const obj = ret as unknown as Record<string, unknown>;
    delete obj.__v;
    return obj;
  },
});

export async function connectDb(): Promise<void> {
  mongoose.set('strictQuery', true);
  await mongoose.connect(env.mongoUri);
  console.log('[db] connected to MongoDB');
}
