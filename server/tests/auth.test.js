import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../server.js';
import User from '../models/User.js';

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.disconnect();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await User.deleteMany({});
});

describe('Authentication API Endpoints', () => {
  it('should successfully register a new user and return a JWT', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Arjun Sharma',
        email: 'arjun@fintrack.test',
        password: 'Password123!',
        currency: 'INR',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe('arjun@fintrack.test');
  });

  it('should reject registration with duplicate email address', async () => {
    await User.create({
      name: 'Existing User',
      email: 'arjun@fintrack.test',
      password: 'Password123!',
    });

    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Second User',
        email: 'arjun@fintrack.test',
        password: 'Password456!',
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should login an existing user with correct credentials', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Pooja Verma',
        email: 'pooja@fintrack.test',
        password: 'SecurePassword123',
      });

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'pooja@fintrack.test',
        password: 'SecurePassword123',
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.name).toBe('Pooja Verma');
  });

  it('should reject login with incorrect password', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Pooja Verma',
        email: 'pooja@fintrack.test',
        password: 'SecurePassword123',
      });

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'pooja@fintrack.test',
        password: 'WrongPassword!',
      });

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
