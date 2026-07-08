/**
 * One-time seed: creates the first administrator account.
 * Usage: tsx scripts/seed.ts
 * Reads MONGO_URI from environment (set it before running).
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { env } from '../config/env.js';

async function seed() {
  if (!env.mongoUri) {
    console.error('MONGO_URI is not set');
    process.exit(1);
  }

  await mongoose.connect(env.mongoUri);
  console.log('connected to mongo');

  // Import model after connection
  const { User } = await import('../models/User.js');

  const existing = await User.findOne({ role: 'admin' });
  if (existing) {
    console.log('Admin user already exists:', existing.email);
    await mongoose.disconnect();
    return;
  }

  const passwordHash = await bcrypt.hash('Admin1234!', 12);
  const admin = await User.create({
    name: 'Administrator',
    email: 'admin@example.com',
    passwordHash,
    role: 'admin',
  });

  console.log(`Created admin user: ${admin.email} / Admin1234!`);
  console.log('CHANGE THIS PASSWORD immediately after first login.');
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
