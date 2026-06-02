import request from 'supertest';
import app from '../src/app';
import { connectTestDB, clearTestDB, closeTestDB } from './setup/db';
import { Notification } from '../src/models/Notification';

let memberToken: string;
let memberId: string;
let dummyNotif: any;

beforeAll(async () => {
  await connectTestDB();
});

beforeEach(async () => {
  await clearTestDB();

  const memberRes = await request(app).post('/api/auth/register').send({
    name: 'Anisha Sah',
    email: 'anisha_test@example.com',
    password: 'password123',
    confirmPassword: 'password123',
  });
  memberToken = memberRes.body.data.token;
  memberId = memberRes.body.data.user._id;

  dummyNotif = await Notification.create({
    user: memberId,
    type: 'restock',
    title: 'Book Restocked',
    message: 'Lean UX has been restocked.',
  });
});

afterAll(async () => {
  await closeTestDB();
});

describe('Notification Endpoints', () => {
  it('should fetch all notifications for a user', async () => {
    const res = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${memberToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].title).toBe('Book Restocked');
  });

  it('should fetch unread notifications count', async () => {
    const res = await request(app)
      .get('/api/notifications/unread-count')
      .set('Authorization', `Bearer ${memberToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.count).toBe(1);
  });

  it('should mark a specific notification as read', async () => {
    const res = await request(app)
      .put(`/api/notifications/${dummyNotif._id.toString()}/read`)
      .set('Authorization', `Bearer ${memberToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.isRead).toBe(true);

    const countRes = await request(app)
      .get('/api/notifications/unread-count')
      .set('Authorization', `Bearer ${memberToken}`);
    expect(countRes.body.data.count).toBe(0);
  });

  it('should mark all notifications as read', async () => {
    // Add another unread notification first
    await Notification.create({
      user: memberId,
      type: 'reservation',
      title: 'Reservation Ready',
      message: 'Your reserved book is ready for pick-up.',
    });

    const res = await request(app)
      .put('/api/notifications/read-all')
      .set('Authorization', `Bearer ${memberToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const countRes = await request(app)
      .get('/api/notifications/unread-count')
      .set('Authorization', `Bearer ${memberToken}`);
    expect(countRes.body.data.count).toBe(0);
  });
});
