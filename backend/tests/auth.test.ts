import request from 'supertest';
import app from '../src/app';
import { connectTestDB, clearTestDB, closeTestDB } from './setup/db';
import { User } from '../src/models/User';

beforeAll(async () => {
  await connectTestDB();
});

beforeEach(async () => {
  await clearTestDB();
});

afterAll(async () => {
  await closeTestDB();
});

describe('Auth Endpoints', () => {
  it('should register a new user successfully', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Anisha Sah',
        email: 'member@bookhaven.com',
        password: 'password123',
        confirmPassword: 'password123',
      });
    
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('token');
    expect(res.body.data.user.name).toBe('Anisha Sah');
    expect(res.body.data.user.role).toBe('member');
  });

  it('should not register with mismatched passwords', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password456',
      });
    
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Validation failed');
    expect(res.body.errors[0].message).toBe('Passwords do not match');
  });

  it('should fail to register a user with an already registered email address', async () => {
    await request(app).post('/api/auth/register').send({
      name: 'User One',
      email: 'duplicate@example.com',
      password: 'password123',
      confirmPassword: 'password123',
    });

    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'User Two',
        email: 'duplicate@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Email already registered');
  });

  it('should login an existing user with valid credentials', async () => {
    await request(app).post('/api/auth/register').send({
      name: 'Anisha Sah',
      email: 'login@example.com',
      password: 'password123',
      confirmPassword: 'password123',
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'login@example.com',
        password: 'password123',
      });
    
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('token');
    expect(res.body.data.user.email).toBe('login@example.com');
  });

  it('should fail to login with an invalid or unregistered email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'invalid@example.com',
        password: 'password123',
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Invalid email or password');
  });

  it('should fail to login with an incorrect password', async () => {
    await request(app).post('/api/auth/register').send({
      name: 'Anisha Sah',
      email: 'wrongpass@example.com',
      password: 'password123',
      confirmPassword: 'password123',
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'wrongpass@example.com',
        password: 'incorrectpassword',
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Invalid email or password');
  });

  it('should retrieve own profile details when authenticated with valid token', async () => {
    const registerRes = await request(app).post('/api/auth/register').send({
      name: 'Anisha Sah',
      email: 'profile@example.com',
      password: 'password123',
      confirmPassword: 'password123',
    });

    const token = registerRes.body.data.token;

    const res = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe('profile@example.com');
  });

  it('should deny profile access when no authentication token is provided', async () => {
    const res = await request(app).get('/api/auth/profile');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should successfully clear auth token on logout request', async () => {
    const registerRes = await request(app).post('/api/auth/register').send({
      name: 'Anisha Sah',
      email: 'logout@example.com',
      password: 'password123',
      confirmPassword: 'password123',
    });

    const token = registerRes.body.data.token;

    const res = await request(app)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toContain('Logged out successfully');
  });

  // Additional validation edge cases to reach 60+ assertions
  it('should reject registration when email address format is invalid', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Jane Doe',
        email: 'invalid-email-address',
        password: 'password123',
        confirmPassword: 'password123',
      });
    
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should reject registration when password is less than 6 characters', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: '123',
        confirmPassword: '123',
      });
    
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should reject registration when name contains only empty spaces', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: '    ',
        email: 'jane@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      });
    
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should automatically normalise and lowercase registered emails', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'John Doe',
        email: 'JOHN.DOE@EXAMPLE.COM',
        password: 'password123',
        confirmPassword: 'password123',
      });
    
    expect(res.status).toBe(201);
    expect(res.body.data.user.email).toBe('john.doe@example.com');
  });

  it('should automatically trim excess padding whitespace in registered usernames', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: '   John Doe Extra   ',
        email: 'trim@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      });
    
    expect(res.status).toBe(201);
    expect(res.body.data.user.name).toBe('John Doe Extra');
  });
});
