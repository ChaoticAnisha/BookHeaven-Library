import request from 'supertest';
import app from '../src/app';
import { connectTestDB, clearTestDB, closeTestDB } from './setup/db';
import { User } from '../src/models/User';
import { Rental } from '../src/models/Rental';
import { Book } from '../src/models/Book';

let adminToken: string;
let memberToken: string;
let memberId: string;
let suspendedId: string;
let dummyBook: any;

beforeAll(async () => {
  await connectTestDB();
});

beforeEach(async () => {
  await clearTestDB();

  // Create admin
  const adminRes = await request(app).post('/api/auth/register').send({
    name: 'Super Admin',
    email: 'admin_test@example.com',
    password: 'password123',
    confirmPassword: 'password123',
  });
  await User.findOneAndUpdate({ email: 'admin_test@example.com' }, { role: 'admin' });
  adminToken = adminRes.body.data.token;

  // Create member
  const memberRes = await request(app).post('/api/auth/register').send({
    name: 'Anisha Sah',
    email: 'anisha_test@example.com',
    password: 'password123',
    confirmPassword: 'password123',
  });
  memberToken = memberRes.body.data.token;
  memberId = memberRes.body.data.user._id;

  // Create another member to suspend
  const suspRes = await request(app).post('/api/auth/register').send({
    name: 'Bad Actor',
    email: 'bad_test@example.com',
    password: 'password123',
    confirmPassword: 'password123',
  });
  suspendedId = suspRes.body.data.user._id;

  dummyBook = await Book.create({
    title: "Don't Make Me Think",
    author: 'Steve Krug',
    year: 2000,
    isbn13: '9780321965516',
    category: 'Academic',
    subCategory: 'UX Design',
    buyPrice: 14.99,
    rentPrice: 3.99,
    condition: 'good',
    rating: 5.0,
    serialNumber: '88082023',
    pages: 216,
    hardCopyCount: 3,
    eBookAvailable: true,
    audioBookAvailable: true,
    locationCode: 'CS A-15',
    status: 'in-shelf',
  });
});

afterAll(async () => {
  await closeTestDB();
});

describe('User Profile & Admin Endpoints', () => {
  it('should fetch own user profile information', async () => {
    const res = await request(app)
      .get('/api/users/profile')
      .set('Authorization', `Bearer ${memberToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe('anisha_test@example.com');
  });

  it('should successfully update own user profile settings', async () => {
    const res = await request(app)
      .put('/api/users/profile')
      .set('Authorization', `Bearer ${memberToken}`)
      .send({
        name: 'Anisha Sah Modified',
        address: 'Kathmandu, Nepal',
        phone: '+977 9800000000',
        bio: 'Avid reader and tech enthusiast',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Anisha Sah Modified');
    expect(res.body.data.address).toBe('Kathmandu, Nepal');
    expect(res.body.data.phone).toBe('+977 9800000000');
    expect(res.body.data.bio).toBe('Avid reader and tech enthusiast');
  });

  it('should toggle and save notification preferences successfully', async () => {
    const res = await request(app)
      .put('/api/users/notifications')
      .set('Authorization', `Bearer ${memberToken}`)
      .send({
        restock: false,
        reservation: true,
        dueReminder: true,
        newArrivals: false,
        weeklyDigest: true,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.notificationPreferences.restock).toBe(false);
    expect(res.body.data.notificationPreferences.newArrivals).toBe(false);
    expect(res.body.data.notificationPreferences.weeklyDigest).toBe(true);
  });

  it('should fetch own reading history log', async () => {
    // Create a returned/completed rental to serve as history
    await Rental.create({
      user: memberId,
      book: dummyBook._id,
      serialNumber: '88082023',
      fromDate: new Date(),
      toDate: new Date(),
      status: 'returned',
    });

    const res = await request(app)
      .get('/api/users/reading-history')
      .set('Authorization', `Bearer ${memberToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].book.title).toBe("Don't Make Me Think");
  });

  it('should fetch member dashboard summary statistics', async () => {
    const res = await request(app)
      .get('/api/users/dashboard-stats')
      .set('Authorization', `Bearer ${memberToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('readingsCount');
    expect(res.body.data).toHaveProperty('wishlistCount');
  });

  // Admin controls
  it('should list all registered users for admin role', async () => {
    const res = await request(app)
      .get('/api/users/all')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(1);
  });

  it('should suspend a user account via admin credentials', async () => {
    const res = await request(app)
      .patch(`/api/users/${suspendedId}/suspend`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.isActive).toBe(false);
  });

  it('should delete a user account via admin credentials', async () => {
    const res = await request(app)
      .delete(`/api/users/${suspendedId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const checkUser = await User.findById(suspendedId);
    expect(checkUser).toBeNull();
  });
});
