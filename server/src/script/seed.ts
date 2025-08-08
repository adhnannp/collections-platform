import mongoose from 'mongoose';
import { User } from '../models/user.model';
import { Account } from '../models/account.model';
import { Payment } from '../models/payment.model';
import { Activity } from '../models/activity.model';
import { connectDB } from '../config/database';
import { faker } from '@faker-js/faker';

async function seed() {
  await connectDB();

  const users = Array.from({ length: 100000 }, () => ({
    email: faker.internet.email(),
    password: 'password123',
    role: faker.helpers.arrayElement(['Admin', 'Manager', 'Agent', 'Viewer']),
  }));

  const insertedUsers = await User.insertMany(users);

  const accounts = insertedUsers.map(user => ({
    userId: user._id,
    name: faker.company.name(),
    balance: faker.number.float({ min: 0, max: 10000 }),
    status: faker.helpers.arrayElement(['active', 'inactive', 'delinquent']),
  }));

  const insertedAccounts = await Account.insertMany(accounts);

  const payments = insertedAccounts.flatMap(account => Array.from({ length: 5 }, () => ({
    accountId: account._id,
    amount: faker.number.float({ min: 100, max: 1000 }),
    status: faker.helpers.arrayElement(['pending', 'completed', 'failed']),
  })));

  await Payment.insertMany(payments);

  const activities = insertedAccounts.flatMap(account => Array.from({ length: 10 }, () => ({
    accountId: account._id,
    type: faker.helpers.arrayElement(['call', 'email', 'note']),
    description: faker.lorem.sentence(),
  })));

  await Activity.insertMany(activities);

  console.log('Database seeded');
  await mongoose.connection.close();
}

seed().catch(console.error);