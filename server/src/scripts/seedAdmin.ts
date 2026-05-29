import mongoose from 'mongoose';
import { connectDb } from '../config/db';
import { User } from '../models/User';
import { runSeed } from './seedHelpers';

async function seedAdmin(): Promise<void> {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME ?? 'Administrator';

  if (!email || !password) {
    throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must be set');
  }

  await connectDb();

  const normalizedEmail = email.toLowerCase();
  let user = await User.findOne({ email: normalizedEmail });

  if (user) {
    user.name = name;
    user.role = 'admin';
    await user.setPassword(password);
    await user.save();
    console.log(`[seed] updated existing admin user: ${normalizedEmail}`);
  } else {
    user = new User({ name, email: normalizedEmail, role: 'admin' });
    await user.setPassword(password);
    await user.save();
    console.log(`[seed] created admin user: ${normalizedEmail}`);
  }

  await mongoose.disconnect();
}

runSeed(seedAdmin);
