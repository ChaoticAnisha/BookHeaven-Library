import request from 'supertest';
import app from '../src/app';
import { connectTestDB, clearTestDB, closeTestDB } from './setup/db';
import { User } from '../src/models/User';
import { Book } from '../src/models/Book';

let adminToken: string;
let memberToken: string;
let dummyBook1: any;
let dummyBook2: any;
let dummyBook3: any;

beforeAll(async () => {
  await connectTestDB();
});

beforeEach(async () => {
  await clearTestDB();

  // Create admin
  const adminRes = await request(app).post('/api/auth/register').send({
    name: 'Book Admin',
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

  // Seed books
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
    serialNumber: 'SN-002',
    pages: 368,
    hardCopyCount: 2,
    eBookAvailable: true,
    audioBookAvailable: false,
    status: 'borrowed',
  });

  dummyBook3 = await Book.create({
    title: "Sprint",
    author: 'Jake Knapp',
    year: 2000,
    isbn13: '9781501121746',
    category: 'Self-Help',
    subCategory: 'Business',
    buyPrice: 18.00,
    rentPrice: 3.50,
    condition: 'good',
    rating: 4.5,
    serialNumber: 'SN-003',
    pages: 288,
    hardCopyCount: 4,
    eBookAvailable: true,
    audioBookAvailable: true,
    status: 'in-shelf',
  });
});

afterAll(async () => {
  await closeTestDB();
});

describe('Book Endpoints', () => {
  it('should fetch new arrivals limit to 5 books', async () => {
    const res = await request(app).get('/api/books/new-arrivals');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeLessThanOrEqual(5);
  });

  it('should search books with no filter query (matches all)', async () => {
    const res = await request(app)
      .get('/api/books/search')
      .query({ q: 'Design' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.books.length).toBe(1);
    expect(res.body.data.books[0].title).toBe("The Design of Everyday Things");
  });

  it('should search books with Genre/Category filter', async () => {
    const res = await request(app)
      .get('/api/books/search')
      .query({ genre: 'Self-Help' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.books.length).toBe(1);
    expect(res.body.data.books[0].title).toBe("Sprint");
  });

  it('should search books specifically by ISBN', async () => {
    const res = await request(app)
      .get('/api/books/search')
      .query({ q: '9780321965516', filter: 'ISBN' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.books.length).toBe(1);
    expect(res.body.data.books[0].title).toBe("Don't Make Me Think");
  });

  it('should fetch recommendations tailored for authenticated users', async () => {
    const res = await request(app)
      .get('/api/books/recommended')
      .set('Authorization', `Bearer ${memberToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('should fetch a single book details by database id', async () => {
    const res = await request(app).get(`/api/books/${dummyBook1._id.toString()}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe("Don't Make Me Think");
  });

  it('should allow admins to add a new book to the library', async () => {
    const res = await request(app)
      .post('/api/books')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Lean UX',
        author: 'Jeff Gothelf',
        year: 2016,
        isbn13: '9781491953174',
        category: 'Academic',
        subCategory: 'UX Design',
        buyPrice: 20.00,
        rentPrice: 4.00,
        condition: 'good',
        rating: 4.5,
        serialNumber: 'SN-004',
        pages: 200,
        hardCopyCount: 1,
        eBookAvailable: true,
        audioBookAvailable: false,
        status: 'in-shelf',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('Lean UX');
  });

  it('should allow admins to update details of an existing book', async () => {
    const res = await request(app)
      .put(`/api/books/${dummyBook1._id.toString()}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: "Don't Make Me Think - Revised Edition",
        hardCopyCount: 10,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe("Don't Make Me Think - Revised Edition");
    expect(res.body.data.hardCopyCount).toBe(10);
  });

  it('should allow admins to delete a book from circulation', async () => {
    const res = await request(app)
      .delete(`/api/books/${dummyBook3._id.toString()}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const check = await Book.findById(dummyBook3._id);
    expect(check).toBeNull();
  });

  it('should fetch library catalog inventory stats for administrator dashboard', async () => {
    const res = await request(app)
      .get('/api/books/stats')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('totalBooks');
    expect(res.body.data).toHaveProperty('totalCopies');
    expect(res.body.data).toHaveProperty('categoriesCount');
  });

  // Additional edge cases to exceed test targets
  it('should paginate search query with 12 results per page maximum', async () => {
    const res = await request(app)
      .get('/api/books/search')
      .query({ page: 1, limit: 12 });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.pagination.page).toBe(1);
    expect(res.body.data.pagination.limit).toBe(12);
  });

  it('should search books specifically by UX Design subCategory', async () => {
    const res = await request(app)
      .get('/api/books/search')
      .query({ q: 'UX Design', filter: 'subCategory' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.books.length).toBe(2);
  });

  it('should reject book creation by admin when pages is negative', async () => {
    const res = await request(app)
      .post('/api/books')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Invalid Pages Book',
        author: 'Author',
        year: 2016,
        isbn13: '9781491953999',
        category: 'Academic',
        pages: -200,
        hardCopyCount: 1,
        serialNumber: 'SN-005',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should reject book updates with invalid rating details', async () => {
    const res = await request(app)
      .put(`/api/books/${dummyBook1._id.toString()}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        rating: 6.5, // Max 5.0 in validation
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should forbid standard members from creating books', async () => {
    const res = await request(app)
      .post('/api/books')
      .set('Authorization', `Bearer ${memberToken}`)
      .send({
        title: 'Intruder Book',
        author: 'Intruder',
        year: 2024,
        isbn13: '9781491953000',
        category: 'Fiction',
        serialNumber: 'SN-INTRUDE',
      });

    expect(res.status).toBe(403);
  });

  it('should forbid standard members from deleting books', async () => {
    const res = await request(app)
      .delete(`/api/books/${dummyBook1._id.toString()}`)
      .set('Authorization', `Bearer ${memberToken}`);

    expect(res.status).toBe(403);
  });
});
