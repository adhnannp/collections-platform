import mongoose from 'mongoose';
import { User } from '../models/user.model';
import { Account } from '../models/account.model';
import { Payment } from '../models/payment.model';
import { Activity } from '../models/activity.model';
import { connectDB } from '../config/database';
import { faker } from '@faker-js/faker';

async function insertInBatches(model: any, data: any[], batchSize = 10000) {
  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);
    await model.insertMany(batch, { ordered: false });
    console.log(`✅ Inserted batch ${i / batchSize + 1} of ${model.modelName}`);
  }
}

async function seed() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await connectDB();
    console.log('✅ Connected to MongoDB');

    console.log('👤 Creating users...');
    const emailSet = new Set<string>();
    const users = [];

    while (users.length < 100_000) {
      const email = faker.internet.email();
      if (!emailSet.has(email)) {
        emailSet.add(email);
        users.push({
          email,
          password: 'password123',
          role: faker.helpers.arrayElement(['Admin', 'Manager', 'Agent']),
        });
      }
    }

    const insertedUsers = await User.insertMany(users, { ordered: false });
    console.log(`✅ Inserted ${insertedUsers.length} users`);

    console.log('🏦 Creating accounts...');
    const accounts = insertedUsers.map(user => ({
      userId: user._id,
      name: faker.company.name(),
      mobileNumber: faker.phone.number(),
      address: faker.location.streetAddress(),
      balance: faker.number.float({ min: 0, max: 10000 }),
      status: faker.helpers.arrayElement(['active', 'inactive', 'delinquent']),
    }));

    const insertedAccounts = await Account.insertMany(accounts, { ordered: false });
    console.log(`✅ Inserted ${insertedAccounts.length} accounts`);

    console.log('💳 Creating payments...');
    const payments = [];
    for (const account of insertedAccounts) {
      for (let i = 0; i < 5; i++) {
        payments.push({
          accountId: account._id,
          amount: faker.number.float({ min: 100, max: 1000 }),
          status: faker.helpers.arrayElement(['pending', 'completed', 'failed']),
        });
      }
    }
    await insertInBatches(Payment, payments);
    console.log(`✅ Inserted ${payments.length} payments`);

    console.log('📝 Creating activities...');
    const activities = [];
    for (const account of insertedAccounts) {
      for (let i = 0; i < 10; i++) {
        activities.push({
          accountId: account._id,
          type: faker.helpers.arrayElement(['call', 'email', 'note']),
          description: faker.lorem.sentence(),
        });
      }
    }
    await insertInBatches(Activity, activities);
    console.log(`✅ Inserted ${activities.length} activities`);

    console.log('🎉 Seeding complete!');
  } catch (err) {
    console.error('❌ Seeding failed:', err);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
  }
}

seed();
