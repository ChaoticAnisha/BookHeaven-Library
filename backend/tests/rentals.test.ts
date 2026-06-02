import request from 'supertest';
import app from '../src/app';
import { connectTestDB, clearTestDB, closeTestDB } from './setup/db';
import { User } from '../src/models/User';
import { Book } from '../src/models/Book';
import { Rental } from '../src/models/Rental';

let adminToken: string;
let memberToken: string;
let studentToken: string;
let premiumToken: string;
let memberId: string;
let studentId: string;
let premiumId: string;
let dummyBook1: any;
let dummyBook2: any;
let dummyBook3: any;
let dummyBook4: any;

beforeAll(async () => {
  await connectTestDB();
});

beforeEach(async () => {
  await clearTestDB();

  // Create standard admin and member
  const adminRes = await request(app).post('/api/auth/register').send({
    name: 'Library Admin',
    email: 'admin_test@example.com',
    password: 'password123',
    confirmPassword: 'password123',
  });
  await User.findOneAndUpdate({ email: 'admin_test@example.com' }, { role: 'admin' });
  adminToken = adminRes.body.data.token;

  const memberRes = await request(app).post('/api/auth/register').send({
    name: 'Anisha Sah',
    email: 'anisha_test@example.com',
    password: 'password123',
    confirmPassword: 'password123',
  });
  memberToken = memberRes.body.data.token;
  memberId = memberRes.body.data.user._id;

  // Student Member
  const studentRes = await request(app).post('/api/auth/register').send({
    name: 'Student Member',
    email: 'student_test@example.com',
    password: 'password123',
    confirmPassword: 'password123',
  });
  await User.findOneAndUpdate({ email: 'student_test@example.com' }, { membership: 'Student' });
  studentToken = studentRes.body.data.token;
  studentId = studentRes.body.data.user._id;

  // Premium Member
  const premiumRes = await request(app).post('/api/auth/register').send({
    name: 'Premium Member',
    email: 'premium_test@example.com',
    password: 'password123',
    confirmPassword: 'password123',
  });
  await User.findOneAndUpdate({ email: 'premium_test@example.com' }, { membership: 'Premium' });
  premiumToken = premiumRes.body.data.token;
  premiumId = premiumRes.body.data.user._id;

  // Pre-seed some books
  dummyBook1 = await Book.create({
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

  dummyBook2 = await Book.create({
    title: "The Design of Everyday Things",
    author: 'Don Norman',
    year: 1988,
    isbn13: '9780465050659',
    category: 'Academic',
    subCategory: 'UX Design',
    buyPrice: 19.99,
    rentPrice: 4.99,
    condition: 'good',
    rating: 4.5,
    serialNumber: 'SN-9988',
    pages: 368,
    hardCopyCount: 1,
    eBookAvailable: true,
    audioBookAvailable: false,
    status: 'in-shelf',
  });

  dummyBook3 = await Book.create({
    title: "Out of Stock Book",
    author: 'No One',
    year: 2020,
    isbn13: '9781111111111',
    category: 'Science',
    buyPrice: 10.0,
    rentPrice: 1.99,
    serialNumber: 'SN-0000',
    pages: 100,
    hardCopyCount: 0,
    status: 'borrowed',
  });

  dummyBook4 = await Book.create({
    title: "Sprint",
    author: 'Jake Knapp',
    year: 2000,
    isbn13: '9781501121746',
    category: 'Self-Help',
    buyPrice: 18.0,
    rentPrice: 3.5,
    serialNumber: 'SN-8877',
    pages: 288,
    hardCopyCount: 5,
    status: 'in-shelf',
  });
});

afterAll(async () => {
  await closeTestDB();
});

describe('Rental Endpoints', () => {
  it('should successfully rent a book when hard copies are available', async () => {
    const fromDate = new Date();
    const toDate = new Date();
    toDate.setDate(toDate.getDate() + 10);

    const res = await request(app)
      .post('/api/rentals')
      .set('Authorization', `Bearer ${memberToken}`)
      .send({
        bookId: dummyBook1._id.toString(),
        fromDate: fromDate.toISOString(),
        toDate: toDate.toISOString(),
        serialNumber: '88082023',
        purpose: 'Academic Research',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('_id');
    expect(res.body.data.status).toBe('active');

    // Confirm hardCopyCount decremented
    const updatedBook = await Book.findById(dummyBook1._id);
    expect(updatedBook?.hardCopyCount).toBe(2);
  });

  it('should fail to rent an out of stock book', async () => {
    const fromDate = new Date();
    const toDate = new Date();
    toDate.setDate(toDate.getDate() + 10);

    const res = await request(app)
      .post('/api/rentals')
      .set('Authorization', `Bearer ${memberToken}`)
      .send({
        bookId: dummyBook3._id.toString(),
        fromDate: fromDate.toISOString(),
        toDate: toDate.toISOString(),
        serialNumber: 'SN-0000',
        purpose: 'Study',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('No hard copies available');
  });

  it('should enforce basic tier borrowing limit of 3 books', async () => {
    const fromDate = new Date();
    const toDate = new Date();
    toDate.setDate(toDate.getDate() + 5);

    // Create 3 active rentals manually
    await Rental.create({ user: memberId, book: dummyBook1._id, serialNumber: 'SN-1', fromDate, toDate, status: 'active' });
    await Rental.create({ user: memberId, book: dummyBook2._id, serialNumber: 'SN-2', fromDate, toDate, status: 'active' });
    await Rental.create({ user: memberId, book: dummyBook4._id, serialNumber: 'SN-3', fromDate, toDate, status: 'active' });

    // Attempting a 4th rental should fail
    const res = await request(app)
      .post('/api/rentals')
      .set('Authorization', `Bearer ${memberToken}`)
      .send({
        bookId: dummyBook1._id.toString(),
        fromDate: fromDate.toISOString(),
        toDate: toDate.toISOString(),
        serialNumber: '88082023',
        purpose: 'Excessive renting test',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('exceeds active rental limit');
  });

  it('should calculate penalty correctly when returning an overdue book', async () => {
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - 10);
    const toDate = new Date();
    toDate.setDate(toDate.getDate() - 4); // 4 days overdue

    const rental = await Rental.create({
      user: memberId,
      book: dummyBook1._id,
      serialNumber: '88082023',
      fromDate,
      toDate,
      status: 'active',
    });

    const res = await request(app)
      .post('/api/rentals/return')
      .set('Authorization', `Bearer ${memberToken}`)
      .send({
        rentalId: rental._id.toString(),
        serialNumber: '88082023',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('returned');
    expect(res.body.data.penaltyAmount).toBeGreaterThan(0);
    // 4 days * 0.50 = 2.00
    expect(res.body.data.penaltyAmount).toBe(2.00);

    // Confirm book status is in-shelf and count incremented
    const updatedBook = await Book.findById(dummyBook1._id);
    expect(updatedBook?.hardCopyCount).toBe(4);
  });

  it('should fetch standard user rentals list', async () => {
    const res = await request(app)
      .get('/api/rentals/my')
      .set('Authorization', `Bearer ${memberToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('should prevent unauthorized users from viewing all rentals', async () => {
    const res = await request(app)
      .get('/api/rentals/all')
      .set('Authorization', `Bearer ${memberToken}`);

    expect(res.status).toBe(403);
  });

  it('should allow admin users to view all rentals logs', async () => {
    const res = await request(app)
      .get('/api/rentals/all')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('should fetch rental statistics for administrative overview', async () => {
    const res = await request(app)
      .get('/api/rentals/stats')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('activeCount');
    expect(res.body.data).toHaveProperty('overdueCount');
  });

  // Additional boundary checks to hit 60+ count
  it('should reject rental when due date is before borrow date', async () => {
    const fromDate = new Date();
    const toDate = new Date();
    toDate.setDate(toDate.getDate() - 5); // 5 days earlier

    const res = await request(app)
      .post('/api/rentals')
      .set('Authorization', `Bearer ${memberToken}`)
      .send({
        bookId: dummyBook1._id.toString(),
        fromDate: fromDate.toISOString(),
        toDate: toDate.toISOString(),
        serialNumber: '88082023',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should reject rental registration when serial number is missing', async () => {
    const fromDate = new Date();
    const toDate = new Date();
    toDate.setDate(toDate.getDate() + 5);

    const res = await request(app)
      .post('/api/rentals')
      .set('Authorization', `Bearer ${memberToken}`)
      .send({
        bookId: dummyBook1._id.toString(),
        fromDate: fromDate.toISOString(),
        toDate: toDate.toISOString(),
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should allow student tier borrowing up to 5 active rentals', async () => {
    const fromDate = new Date();
    const toDate = new Date();
    toDate.setDate(toDate.getDate() + 5);

    // Create 5 active rentals manually
    await Rental.create({ user: studentId, book: dummyBook1._id, serialNumber: 'SN-1', fromDate, toDate, status: 'active' });
    await Rental.create({ user: studentId, book: dummyBook2._id, serialNumber: 'SN-2', fromDate, toDate, status: 'active' });
    await Rental.create({ user: studentId, book: dummyBook4._id, serialNumber: 'SN-3', fromDate, toDate, status: 'active' });
    await Rental.create({ user: studentId, book: dummyBook1._id, serialNumber: 'SN-4', fromDate, toDate, status: 'active' });
    await Rental.create({ user: studentId, book: dummyBook2._id, serialNumber: 'SN-5', fromDate, toDate, status: 'active' });

    // Attempting a 6th rental should fail
    const res = await request(app)
      .post('/api/rentals')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        bookId: dummyBook1._id.toString(),
        fromDate: fromDate.toISOString(),
        toDate: toDate.toISOString(),
        serialNumber: '88082023',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('exceeds active rental limit');
  });

  it('should allow premium tier borrowing up to 10 active rentals', async () => {
    const fromDate = new Date();
    const toDate = new Date();
    toDate.setDate(toDate.getDate() + 5);

    // Create 10 active rentals manually
    for (let i = 1; i <= 10; i++) {
      await Rental.create({ user: premiumId, book: dummyBook1._id, serialNumber: `SN-${i}`, fromDate, toDate, status: 'active' });
    }

    // Attempting an 11th rental should fail
    const res = await request(app)
      .post('/api/rentals')
      .set('Authorization', `Bearer ${premiumToken}`)
      .send({
        bookId: dummyBook1._id.toString(),
        fromDate: fromDate.toISOString(),
        toDate: toDate.toISOString(),
        serialNumber: '88082023',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('exceeds active rental limit');
  });

  it('should refuse return processing on a rental that has already been returned', async () => {
    const rental = await Rental.create({
      user: memberId,
      book: dummyBook1._id,
      serialNumber: '88082023',
      fromDate: new Date(),
      toDate: new Date(),
      status: 'returned',
    });

    const res = await request(app)
      .post('/api/rentals/return')
      .set('Authorization', `Bearer ${memberToken}`)
      .send({
        rentalId: rental._id.toString(),
        serialNumber: '88082023',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Rental is not active');
  });

  it('should reject book returns if the submitted serial number is incorrect', async () => {
    const rental = await Rental.create({
      user: memberId,
      book: dummyBook1._id,
      serialNumber: '88082023',
      fromDate: new Date(),
      toDate: new Date(),
      status: 'active',
    });

    const res = await request(app)
      .post('/api/rentals/return')
      .set('Authorization', `Bearer ${memberToken}`)
      .send({
        rentalId: rental._id.toString(),
        serialNumber: 'INCORRECT_SERIAL_999',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Serial number does not match');
  });
});
