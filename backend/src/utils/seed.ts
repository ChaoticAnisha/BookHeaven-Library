import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../models/User';
import { Book } from '../models/Book';
import { Rental } from '../models/Rental';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/bookhaven';

const seedData = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Book.deleteMany({});
    await Rental.deleteMany({});

    // Create Users
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@bookhaven.com',
      password: 'Admin@123',
      role: 'admin',
    });

    const anisha = await User.create({
      name: 'Anisha Sah',
      email: 'member@bookhaven.com',
      password: 'Member@123',
      role: 'member',
      membership: 'Basic',
      address: 'Kathmandu',
      phone: '+977 9823456789',
      bio: "I'm a Student",
    });

    // Create Books (10 Specific Prototype Books + 40 Additional)
    const books = [
      {
        title: "Don't Make Me Think",
        author: 'Steve Krug',
        year: 2000,
        edition: 'Second Edition',
        isbn13: '9780321965516',
        coverUrl: 'https://covers.openlibrary.org/b/isbn/9780321965516-M.jpg',
        category: 'Academic',
        subCategory: 'UX Design',
        buyPrice: 14.99,
        rentPrice: 3.99,
        condition: 'good',
        rating: 5.0,
        ratingCount: 120,
        serialNumber: '88082023',
        publisher: 'New Riders Press',
        language: 'English',
        pages: 216,
        publishedIn: 'United States',
        hardCopyCount: 3,
        eBookAvailable: true,
        audioBookAvailable: true,
        locationCode: 'CS A-15',
        status: 'in-shelf',
        description: 'A Common Sense Approach to Web Usability',
      },
      {
        title: 'The Design of Everyday Things',
        author: 'Don Norman',
        year: 1988,
        isbn13: '9780465050659',
        coverUrl: 'https://covers.openlibrary.org/b/isbn/9780465050659-M.jpg',
        category: 'Academic',
        subCategory: 'UX Design',
        buyPrice: 19.99,
        rentPrice: 4.99,
        condition: 'good',
        rating: 4.5,
        ratingCount: 85,
        serialNumber: 'SN-002',
        pages: 368,
        hardCopyCount: 2,
        eBookAvailable: true,
        audioBookAvailable: false,
        status: 'borrowed',
      },
      {
        title: 'Sprint',
        author: 'Jake Knapp',
        year: 2000,
        isbn13: '9781501121746',
        coverUrl: 'https://covers.openlibrary.org/b/isbn/9781501121746-M.jpg',
        category: 'Self-Help',
        subCategory: 'Business',
        buyPrice: 18.00,
        rentPrice: 3.50,
        condition: 'good',
        rating: 4.5,
        ratingCount: 60,
        serialNumber: 'SN-003',
        pages: 288,
        hardCopyCount: 4,
        eBookAvailable: true,
        audioBookAvailable: true,
        status: 'in-shelf',
      },
      {
        title: 'Lean UX',
        author: 'Jeff Gothelf',
        year: 2016,
        isbn13: '9781491953174',
        coverUrl: 'https://covers.openlibrary.org/b/isbn/9781491953174-M.jpg',
        category: 'Academic',
        subCategory: 'UX Design',
        buyPrice: 20.00,
        rentPrice: 4.00,
        condition: 'good',
        rating: 4.5,
        ratingCount: 50,
        serialNumber: 'SN-004',
        pages: 200,
        hardCopyCount: 1,
        eBookAvailable: true,
        audioBookAvailable: false,
        status: 'in-shelf',
      },
      {
        title: 'The Road to React',
        author: 'Robin Wieruch',
        year: 2008,
        isbn13: '9781720043997',
        coverUrl: 'https://covers.openlibrary.org/b/isbn/9781720043997-M.jpg',
        category: 'Science',
        subCategory: 'Programming',
        buyPrice: 25.00,
        rentPrice: 5.00,
        condition: 'good',
        rating: 4.3,
        ratingCount: 40,
        serialNumber: 'SN-005',
        pages: 190,
        hardCopyCount: 3,
        eBookAvailable: true,
        audioBookAvailable: false,
        status: 'in-shelf',
      },
      {
        title: 'Rich Dad Poor Dad',
        author: 'Robert T. Kiyosaki',
        year: 1997,
        isbn13: '9781612680194',
        coverUrl: 'https://covers.openlibrary.org/b/isbn/9781612680194-M.jpg',
        category: 'Non-Fiction',
        subCategory: 'Financial MGMT',
        buyPrice: 15.00,
        rentPrice: 3.00,
        condition: 'good',
        rating: 5.0,
        ratingCount: 200,
        serialNumber: 'SN-006',
        pages: 336,
        hardCopyCount: 5,
        eBookAvailable: true,
        audioBookAvailable: true,
        status: 'in-shelf',
      },
      {
        title: "Harry Potter and the Philosopher's Stone",
        author: 'J.K. Rowling',
        year: 2002,
        isbn13: '9780439708180',
        coverUrl: 'https://covers.openlibrary.org/b/isbn/9780439708180-M.jpg',
        category: 'Fiction',
        subCategory: 'Fantasy',
        buyPrice: 22.00,
        rentPrice: 4.50,
        condition: 'good',
        rating: 4.9,
        ratingCount: 300,
        serialNumber: 'SN-007',
        pages: 320,
        hardCopyCount: 6,
        eBookAvailable: true,
        audioBookAvailable: true,
        status: 'in-shelf',
      },
      {
        title: "You Don't Know JS: Scope & Closures",
        author: 'Kyle Simpson',
        year: 2014,
        isbn13: '9781449335588',
        coverUrl: 'https://covers.openlibrary.org/b/isbn/9781449335588-M.jpg',
        category: 'Science',
        subCategory: 'Programming',
        buyPrice: 18.00,
        rentPrice: 3.50,
        condition: 'good',
        rating: 4.8,
        ratingCount: 90,
        serialNumber: 'SN-008',
        pages: 98,
        hardCopyCount: 2,
        eBookAvailable: true,
        audioBookAvailable: false,
        status: 'in-shelf',
      },
      {
        title: 'Holy Bible King James Version',
        author: 'Various',
        year: 1611,
        isbn13: '9780310434313',
        coverUrl: 'https://covers.openlibrary.org/b/isbn/9780310434313-M.jpg',
        category: 'Non-Fiction',
        subCategory: 'Religion',
        buyPrice: 10.00,
        rentPrice: 2.00,
        condition: 'good',
        rating: 4.7,
        ratingCount: 150,
        serialNumber: 'SN-009',
        pages: 1200,
        hardCopyCount: 8,
        eBookAvailable: true,
        audioBookAvailable: true,
        status: 'in-shelf',
      },
      {
        title: 'Java Script Scope and Closures',
        author: 'Kyle Simpson',
        year: 2014,
        isbn13: '9781449335502',
        coverUrl: 'https://covers.openlibrary.org/b/isbn/9781449335588-M.jpg',
        category: 'Science',
        subCategory: 'Programming',
        buyPrice: 18.00,
        rentPrice: 3.50,
        condition: 'good',
        rating: 4.6,
        ratingCount: 40,
        serialNumber: 'SN-010',
        pages: 120,
        hardCopyCount: 1,
        eBookAvailable: true,
        audioBookAvailable: false,
        status: 'borrowed',
      },
    ];

    // Add 40 more dummy books to reach 50+
    for (let i = 11; i <= 50; i++) {
      const categories = ['Fiction', 'Non-Fiction', 'Science', 'History', 'Self-Help', 'Academic', 'Biography', 'Children'];
      const cat = categories[Math.floor(Math.random() * categories.length)];
      books.push({
        title: `Dummy Book ${i}`,
        author: `Author ${i}`,
        year: 2000 + (i % 20),
        isbn13: `9780000000${i.toString().padStart(3, '0')}`,
        coverUrl: `https://covers.openlibrary.org/b/isbn/9780321965516-M.jpg`, // Placeholder
        category: cat,
        subCategory: 'General',
        buyPrice: 10 + (i % 20),
        rentPrice: 2 + (i % 5),
        condition: 'good',
        rating: 3 + (i % 3),
        ratingCount: 10 + i,
        serialNumber: `SN-${i.toString().padStart(3, '0')}`,
        pages: 100 + (i * 10),
        hardCopyCount: i % 5 === 0 ? 0 : (i % 3 === 0 ? 1 : 3), // Ensure some out-of-stock and low-stock
        eBookAvailable: i % 2 === 0,
        audioBookAvailable: i % 3 === 0,
        status: i % 5 === 0 ? 'borrowed' : 'in-shelf',
      });
    }

    const createdBooks = await Book.insertMany(books);

    // Rentals for Anisha
    const bookToRent1 = createdBooks.find(b => b.isbn13 === '9780465050659');
    const bookToRent2 = createdBooks.find(b => b.isbn13 === '9781449335502');

    if (bookToRent1 && bookToRent2) {
      const fromDate1 = new Date();
      fromDate1.setDate(fromDate1.getDate() - 20);
      const toDate1 = new Date();
      toDate1.setDate(toDate1.getDate() - 5); // Overdue by 5 days

      await Rental.create({
        user: anisha._id,
        book: bookToRent1._id,
        serialNumber: bookToRent1.serialNumber,
        fromDate: fromDate1,
        toDate: toDate1,
        status: 'active', // Overdue will be computed/updated
      });

      const fromDate2 = new Date();
      fromDate2.setDate(fromDate2.getDate() - 2);
      const toDate2 = new Date();
      toDate2.setDate(toDate2.getDate() + 12); // Due in 12 days

      await Rental.create({
        user: anisha._id,
        book: bookToRent2._id,
        serialNumber: bookToRent2.serialNumber,
        fromDate: fromDate2,
        toDate: toDate2,
        status: 'active',
      });
    }

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedData();
