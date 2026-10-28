import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../server.js';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';

let mongoServer;
let tokenUserA;
let tokenUserB;
let userAId;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.disconnect();
  await mongoose.connect(uri);

  // Create User A
  const resA = await request(app).post('/api/auth/register').send({
    name: 'User Alpha',
    email: 'alpha@fintrack.test',
    password: 'Password123!',
  });
  tokenUserA = resA.body.token;
  userAId = resA.body.user.id;

  // Create User B
  const resB = await request(app).post('/api/auth/register').send({
    name: 'User Beta',
    email: 'beta@fintrack.test',
    password: 'Password123!',
  });
  tokenUserB = resB.body.token;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await Transaction.deleteMany({});
});

describe('Transaction API & Authorization Tests', () => {
  it('should create an income transaction for User A', async () => {
    const res = await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${tokenUserA}`)
      .send({
        type: 'income',
        amount: 50000,
        category: 'Salary',
        description: 'Monthly Salary Credit',
        paymentMethod: 'Bank Transfer',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.transaction.amount).toBe(50000);
    expect(res.body.transaction.user).toBe(userAId);
  });

  it('should prevent User B from viewing or modifying User A transaction', async () => {
    // 1. User A creates a transaction
    const createRes = await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${tokenUserA}`)
      .send({
        type: 'expense',
        amount: 3200,
        category: 'Food & Dining',
        description: 'Dinner at Italian Trattoria',
      });

    const txId = createRes.body.transaction._id;

    // 2. User B tries to fetch User A's transaction
    const getRes = await request(app)
      .get(`/api/transactions/${txId}`)
      .set('Authorization', `Bearer ${tokenUserB}`);

    expect(getRes.statusCode).toBe(404);

    // 3. User B tries to delete User A's transaction
    const delRes = await request(app)
      .delete(`/api/transactions/${txId}`)
      .set('Authorization', `Bearer ${tokenUserB}`);

    expect(delRes.statusCode).toBe(404);

    // 4. Ensure User A's transaction is untouched
    const verifyRes = await request(app)
      .get(`/api/transactions/${txId}`)
      .set('Authorization', `Bearer ${tokenUserA}`);

    expect(verifyRes.statusCode).toBe(200);
    expect(verifyRes.body.transaction.amount).toBe(3200);
  });

  it('should reject transaction with negative or zero amount', async () => {
    const res = await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${tokenUserA}`)
      .send({
        type: 'expense',
        amount: -500,
        category: 'Shopping',
        description: 'Invalid negative test',
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
