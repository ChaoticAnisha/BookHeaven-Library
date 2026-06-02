import request from 'supertest';
import app from '../src/app';
import { connectTestDB, clearTestDB, closeTestDB } from './setup/db';
import { User } from '../src/models/User';
import { Book } from '../src/models/Book';
import { Rental } from '../src/models/Rental';
import { Payment } from '../src/models/Payment';

let memberToken: string;
let memberId: string;
let dummyBook: any;
let dummyRental: any;

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

  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - 10);
  const toDate = new Date();
  toDate.setDate(toDate.getDate() - 5); // 5 days overdue -> ₹2.50

  dummyRental = await Rental.create({
    user: memberId,
    book: dummyBook._id,
    serialNumber: '88082023',
    fromDate,
    toDate,
    status: 'active',
    penaltyAmount: 2.50,
  });
});

afterAll(async () => {
  await closeTestDB();
});

describe('Payment Endpoints', () => {
  it('should initiate a Khalti payment successfully', async () => {
    const res = await request(app)
      .post('/api/payments/khalti/initiate')
      .set('Authorization', `Bearer ${memberToken}`)
      .send({
        rentalId: dummyRental._id.toString(),
        amount: 2.50,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('pidx');
    expect(res.body.data).toHaveProperty('payment_url');
    expect(res.body.data.payment.status).toBe('pending');
  });

  it('should mock verify a pending Khalti payment', async () => {
    const initRes = await request(app)
      .post('/api/payments/khalti/initiate')
      .set('Authorization', `Bearer ${memberToken}`)
      .send({
        rentalId: dummyRental._id.toString(),
        amount: 2.50,
      });

    const pidx = initRes.body.data.pidx;

    const res = await request(app)
      .post('/api/payments/khalti/verify')
      .set('Authorization', `Bearer ${memberToken}`)
      .send({ pidx });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('completed');

    // Rental penalty should be marked paid
    const updatedRental = await Rental.findById(dummyRental._id);
    expect(updatedRental?.penaltyPaid).toBe(true);
  });

  it('should complete a credit card payment successfully', async () => {
    const res = await request(app)
      .post('/api/payments/card')
      .set('Authorization', `Bearer ${memberToken}`)
      .send({
        rentalId: dummyRental._id.toString(),
        amount: 2.50,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('completed');
    expect(res.body.data.method).toBe('card');

    const updatedRental = await Rental.findById(dummyRental._id);
    expect(updatedRental?.penaltyPaid).toBe(true);
  });

  it('should defer penalty payment to credit account balance', async () => {
    const res = await request(app)
      .post('/api/payments/credit')
      .set('Authorization', `Bearer ${memberToken}`)
      .send({
        rentalId: dummyRental._id.toString(),
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('completed');
    expect(res.body.data.method).toBe('credit');

    const updatedRental = await Rental.findById(dummyRental._id);
    expect(updatedRental?.penaltyPaid).toBe(true);
  });

  it('should list pending payments for user', async () => {
    // Generate a pending payment
    await Payment.create({
      user: memberId,
      rental: dummyRental._id,
      amount: 2.50,
      amountInPaisa: 250,
      method: 'khalti',
      status: 'pending',
      khaltiPidx: 'some_pidx',
      purchaseOrderId: 'order-123',
      purchaseOrderName: 'Late Fee',
    });

    const res = await request(app)
      .get('/api/payments/pending')
      .set('Authorization', `Bearer ${memberToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(1);
  });

  it('should list historical payments for user', async () => {
    // Complete a card payment first
    await request(app)
      .post('/api/payments/card')
      .set('Authorization', `Bearer ${memberToken}`)
      .send({
        rentalId: dummyRental._id.toString(),
        amount: 2.50,
      });

    const res = await request(app)
      .get('/api/payments/history')
      .set('Authorization', `Bearer ${memberToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].status).toBe('completed');
  });
});
