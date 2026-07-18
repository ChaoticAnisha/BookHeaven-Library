import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../models/User';
import { Book } from '../models/Book';
import { Rental } from '../models/Rental';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/bookhaven';

type BookSpec = {
  title: string;
  author: string;
  year: number;
  edition?: string;
  isbn13: string;
  category: string;
  subCategory?: string;
  pages: number;
  publisher?: string;
  publishedIn?: string;
  description?: string;
  eBookAvailable: boolean;
  audioBookAvailable: boolean;
  eBookUrl?: string;
  audioUrl?: string;
};

// Reliable placeholder — loads locally, no network dependency.
const PLACEHOLDER_PDF = '/sample.pdf';

const CONDITIONS = ['new', 'good', 'fair', 'poor'] as const;

const specs: BookSpec[] = [
  // ── ACADEMIC ──────────────────────────────────────────────────────
  {
    title: "Don't Make Me Think",
    author: 'Steve Krug',
    year: 2000,
    edition: 'Second Edition',
    isbn13: '9780321965516',
    category: 'Academic',
    subCategory: 'UX Design',
    pages: 216,
    publisher: 'New Riders Press',
    publishedIn: 'United States',
    description: 'A Common Sense Approach to Web Usability',
    eBookAvailable: true,
    audioBookAvailable: true,
    eBookUrl: PLACEHOLDER_PDF,
  },
  {
    title: 'The Design of Everyday Things',
    author: 'Don Norman',
    year: 1988,
    isbn13: '9780465050659',
    category: 'Academic',
    subCategory: 'UX Design',
    pages: 368,
    description: 'A powerful primer on how — and why — some products satisfy customers while others only frustrate them.',
    eBookAvailable: true,
    audioBookAvailable: false,
    eBookUrl: PLACEHOLDER_PDF,
  },
  {
    title: 'Lean UX',
    author: 'Jeff Gothelf',
    year: 2016,
    isbn13: '9781491953174',
    category: 'Academic',
    subCategory: 'UX Design',
    pages: 200,
    description: 'Applying Lean Principles to Improve User Experience',
    eBookAvailable: true,
    audioBookAvailable: false,
    eBookUrl: PLACEHOLDER_PDF,
  },
  {
    title: 'Meditations',
    author: 'Marcus Aurelius',
    year: 180,
    isbn13: '9780486298238',
    category: 'Academic',
    subCategory: 'Philosophy',
    pages: 256,
    publishedIn: 'Rome',
    description: 'Personal writings by the Roman Emperor recording his private notes on Stoic philosophy.',
    eBookAvailable: true,
    audioBookAvailable: false,
    eBookUrl: 'https://www.gutenberg.org/cache/epub/2680/pg2680-images.html',
  },
  {
    title: 'Clean Code',
    author: 'Robert C. Martin',
    year: 2008,
    isbn13: '9780132350884',
    category: 'Academic',
    subCategory: 'Software Engineering',
    pages: 464,
    description: 'A Handbook of Agile Software Craftsmanship',
    eBookAvailable: true,
    audioBookAvailable: false,
    eBookUrl: PLACEHOLDER_PDF,
  },
  {
    title: 'Introduction to Algorithms',
    author: 'Thomas H. Cormen',
    year: 2009,
    edition: 'Third Edition',
    isbn13: '9780262033848',
    category: 'Academic',
    subCategory: 'Computer Science',
    pages: 1312,
    description: 'The definitive guide to algorithms, covering a broad range of topics in depth.',
    eBookAvailable: false,
    audioBookAvailable: false,
  },

  // ── FICTION ───────────────────────────────────────────────────────
  {
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    year: 1813,
    isbn13: '9780141439518',
    category: 'Fiction',
    subCategory: 'Classic Literature',
    pages: 432,
    publishedIn: 'United Kingdom',
    description: 'A witty exploration of manners, marriage, and morality in Regency England.',
    eBookAvailable: true,
    audioBookAvailable: true,
    eBookUrl: 'https://www.gutenberg.org/cache/epub/1342/pg1342-images.html',
    audioUrl: 'https://archive.org/download/pride_and_prejudice_librivox/prideandprejudice_01-03_austen.mp3',
  },
  {
    title: 'Frankenstein',
    author: 'Mary Shelley',
    year: 1818,
    isbn13: '9780486282114',
    category: 'Fiction',
    subCategory: 'Gothic Horror',
    pages: 280,
    publishedIn: 'United Kingdom',
    description: 'The Modern Prometheus — a scientist creates a sapient creature in an unorthodox experiment.',
    eBookAvailable: true,
    audioBookAvailable: true,
    eBookUrl: 'https://www.gutenberg.org/cache/epub/84/pg84-images.html',
    audioUrl: 'https://archive.org/download/frankenstein_cs_librivox/frankenstein_01_shelley.mp3',
  },
  {
    title: 'Dracula',
    author: 'Bram Stoker',
    year: 1897,
    isbn13: '9780486411095',
    category: 'Fiction',
    subCategory: 'Gothic Horror',
    pages: 418,
    publishedIn: 'Ireland',
    description: 'The count who feeds on the blood of the living, told through letters and diary entries.',
    eBookAvailable: true,
    audioBookAvailable: true,
    eBookUrl: 'https://www.gutenberg.org/cache/epub/345/pg345-images.html',
    audioUrl: 'https://archive.org/download/dracula_librivox/dracula_01_stoker.mp3',
  },
  {
    title: 'The Adventures of Sherlock Holmes',
    author: 'Arthur Conan Doyle',
    year: 1892,
    isbn13: '9781503275927',
    category: 'Fiction',
    subCategory: 'Mystery',
    pages: 307,
    publishedIn: 'United Kingdom',
    description: 'Twelve classic short stories featuring the famous detective of 221B Baker Street.',
    eBookAvailable: true,
    audioBookAvailable: true,
    eBookUrl: 'https://www.gutenberg.org/cache/epub/1661/pg1661-images.html',
    audioUrl: 'https://archive.org/download/adventures_sherlockholmes_1007_librivox/adventuresherlockholmes_01_doyle.mp3',
  },
  {
    title: 'A Christmas Carol',
    author: 'Charles Dickens',
    year: 1843,
    isbn13: '9780486268651',
    category: 'Fiction',
    subCategory: 'Classic Literature',
    pages: 96,
    publishedIn: 'United Kingdom',
    description: 'Ebenezer Scrooge is visited by three spirits on Christmas Eve.',
    eBookAvailable: true,
    audioBookAvailable: true,
    eBookUrl: 'https://www.gutenberg.org/cache/epub/46/pg46-images.html',
    audioUrl: 'https://archive.org/download/christmas_carol_1212_librivox/a_christmas_carol_01_dickens.mp3',
  },
  {
    title: 'Moby Dick',
    author: 'Herman Melville',
    year: 1851,
    isbn13: '9781503280786',
    category: 'Fiction',
    subCategory: 'Classic Literature',
    pages: 720,
    publishedIn: 'United States',
    description: "Captain Ahab's obsessive quest for revenge against the white whale.",
    eBookAvailable: true,
    audioBookAvailable: false,
    eBookUrl: 'https://www.gutenberg.org/cache/epub/2701/pg2701-images.html',
  },
  {
    title: "Harry Potter and the Philosopher's Stone",
    author: 'J.K. Rowling',
    year: 1997,
    isbn13: '9780439708180',
    category: 'Fiction',
    subCategory: 'Fantasy',
    pages: 320,
    publishedIn: 'United Kingdom',
    description: 'A young boy discovers he is a wizard on his eleventh birthday.',
    eBookAvailable: true,
    audioBookAvailable: false,
    eBookUrl: PLACEHOLDER_PDF,
  },

  // ── CHILDREN ──────────────────────────────────────────────────────
  {
    title: "Alice's Adventures in Wonderland",
    author: 'Lewis Carroll',
    year: 1865,
    isbn13: '9780486275437',
    category: 'Children',
    subCategory: 'Fantasy',
    pages: 200,
    publishedIn: 'United Kingdom',
    description: 'Alice falls through a rabbit hole into a world of curious creatures.',
    eBookAvailable: true,
    audioBookAvailable: true,
    eBookUrl: 'https://www.gutenberg.org/cache/epub/11/pg11-images.html',
    audioUrl: 'https://archive.org/download/alice_in_wonderland_librivox/wonderland_ch_01_64kb.mp3',
  },
  {
    title: 'The Wonderful Wizard of Oz',
    author: 'L. Frank Baum',
    year: 1900,
    isbn13: '9780486204913',
    category: 'Children',
    subCategory: 'Fantasy',
    pages: 259,
    publishedIn: 'United States',
    description: "Dorothy's journey down the yellow brick road to see the Wizard.",
    eBookAvailable: true,
    audioBookAvailable: true,
    eBookUrl: 'https://www.gutenberg.org/cache/epub/55/pg55-images.html',
    audioUrl: 'https://archive.org/download/wizard_of_oz/wizardofoz_01_baum.mp3',
  },
  {
    title: 'Peter Pan',
    author: 'J.M. Barrie',
    year: 1911,
    isbn13: '9780486450741',
    category: 'Children',
    subCategory: 'Fantasy',
    pages: 200,
    publishedIn: 'United Kingdom',
    description: 'The boy who never grew up takes the Darling children to Neverland.',
    eBookAvailable: true,
    audioBookAvailable: false,
    eBookUrl: 'https://www.gutenberg.org/cache/epub/16/pg16-images.html',
  },
  {
    title: 'The Secret Garden',
    author: 'Frances Hodgson Burnett',
    year: 1911,
    isbn13: '9780486408510',
    category: 'Children',
    subCategory: 'Classic Literature',
    pages: 279,
    publishedIn: 'United Kingdom',
    description: 'A lonely girl discovers a hidden, neglected garden on her uncle\'s estate.',
    eBookAvailable: true,
    audioBookAvailable: true,
    eBookUrl: 'https://www.gutenberg.org/cache/epub/113/pg113-images.html',
    audioUrl: 'https://archive.org/download/secret_garden_1105_librivox/secretgarden_01_burnett.mp3',
  },
  {
    title: 'The Adventures of Tom Sawyer',
    author: 'Mark Twain',
    year: 1876,
    isbn13: '9780486400778',
    category: 'Children',
    subCategory: 'Classic Literature',
    pages: 274,
    publishedIn: 'United States',
    description: 'A mischievous boy growing up along the Mississippi River.',
    eBookAvailable: true,
    audioBookAvailable: true,
    eBookUrl: 'https://www.gutenberg.org/cache/epub/74/pg74-images.html',
    audioUrl: 'https://archive.org/download/adventures_of_tom_sawyer_1402_librivox/adventuresoftomsawyer_01_twain.mp3',
  },
  {
    title: "Charlotte's Web",
    author: 'E.B. White',
    year: 1952,
    isbn13: '9780064400558',
    category: 'Children',
    subCategory: 'Classic Literature',
    pages: 184,
    publishedIn: 'United States',
    description: 'A pig named Wilbur and a spider named Charlotte form an unlikely friendship.',
    eBookAvailable: true,
    audioBookAvailable: false,
    eBookUrl: PLACEHOLDER_PDF,
  },

  // ── NON-FICTION ───────────────────────────────────────────────────
  {
    title: 'Rich Dad Poor Dad',
    author: 'Robert T. Kiyosaki',
    year: 1997,
    isbn13: '9781612680194',
    category: 'Non-Fiction',
    subCategory: 'Personal Finance',
    pages: 336,
    description: "What the rich teach their kids about money that the poor and middle class do not.",
    eBookAvailable: true,
    audioBookAvailable: true,
    eBookUrl: PLACEHOLDER_PDF,
  },
  {
    title: 'Holy Bible: King James Version',
    author: 'Various',
    year: 1611,
    isbn13: '9780310434313',
    category: 'Non-Fiction',
    subCategory: 'Religion',
    pages: 1200,
    description: 'The classic English translation of the Christian scriptures.',
    eBookAvailable: true,
    audioBookAvailable: false,
    eBookUrl: PLACEHOLDER_PDF,
  },
  {
    title: 'Sapiens: A Brief History of Humankind',
    author: 'Yuval Noah Harari',
    year: 2011,
    isbn13: '9780062316097',
    category: 'Non-Fiction',
    subCategory: 'Anthropology',
    pages: 443,
    description: 'How Homo sapiens came to dominate the world.',
    eBookAvailable: false,
    audioBookAvailable: false,
  },
  {
    title: 'Freakonomics',
    author: 'Steven D. Levitt',
    year: 2005,
    isbn13: '9780060731328',
    category: 'Non-Fiction',
    subCategory: 'Economics',
    pages: 320,
    description: 'A rogue economist explores the hidden side of everything.',
    eBookAvailable: false,
    audioBookAvailable: false,
  },
  {
    title: 'Outliers: The Story of Success',
    author: 'Malcolm Gladwell',
    year: 2008,
    isbn13: '9780316017930',
    category: 'Non-Fiction',
    subCategory: 'Sociology',
    pages: 309,
    description: 'What makes high-achievers different.',
    eBookAvailable: false,
    audioBookAvailable: false,
  },
  {
    title: 'The Tipping Point',
    author: 'Malcolm Gladwell',
    year: 2000,
    isbn13: '9780316346627',
    category: 'Non-Fiction',
    subCategory: 'Sociology',
    pages: 301,
    description: 'How little things can make a big difference.',
    eBookAvailable: false,
    audioBookAvailable: false,
  },

  // ── SCIENCE ───────────────────────────────────────────────────────
  {
    title: 'The Road to React',
    author: 'Robin Wieruch',
    year: 2018,
    isbn13: '9781720043997',
    category: 'Science',
    subCategory: 'Programming',
    pages: 190,
    description: 'Your journey to master plain yet pragmatic React.js.',
    eBookAvailable: true,
    audioBookAvailable: false,
    eBookUrl: PLACEHOLDER_PDF,
  },
  {
    title: "You Don't Know JS: Scope & Closures",
    author: 'Kyle Simpson',
    year: 2014,
    isbn13: '9781449335588',
    category: 'Science',
    subCategory: 'Programming',
    pages: 98,
    description: "Dives deep into JavaScript's core mechanisms of scope and closures.",
    eBookAvailable: true,
    audioBookAvailable: false,
    eBookUrl: PLACEHOLDER_PDF,
  },
  {
    title: 'A Brief History of Time',
    author: 'Stephen Hawking',
    year: 1988,
    isbn13: '9780553380163',
    category: 'Science',
    subCategory: 'Physics',
    pages: 256,
    description: 'From the Big Bang to black holes, a landmark volume in science writing.',
    eBookAvailable: true,
    audioBookAvailable: false,
    eBookUrl: PLACEHOLDER_PDF,
  },
  {
    title: 'The Time Machine',
    author: 'H.G. Wells',
    year: 1895,
    isbn13: '9780486284729',
    category: 'Science',
    subCategory: 'Science Fiction',
    pages: 118,
    publishedIn: 'United Kingdom',
    description: 'A Victorian scientist builds a machine that lets him travel through time.',
    eBookAvailable: true,
    audioBookAvailable: true,
    eBookUrl: 'https://www.gutenberg.org/cache/epub/35/pg35-images.html',
    audioUrl: 'https://archive.org/download/time_machine_0805_librivox/timemachinewells_01_ae.mp3',
  },
  {
    title: 'The Selfish Gene',
    author: 'Richard Dawkins',
    year: 1976,
    isbn13: '9780198788607',
    category: 'Science',
    subCategory: 'Biology',
    pages: 360,
    description: 'A gene-centred view of evolution.',
    eBookAvailable: false,
    audioBookAvailable: false,
  },
  {
    title: 'Cosmos',
    author: 'Carl Sagan',
    year: 1980,
    isbn13: '9780345539434',
    category: 'Science',
    subCategory: 'Astronomy',
    pages: 384,
    description: "A journey through the universe and humanity's place within it.",
    eBookAvailable: false,
    audioBookAvailable: false,
  },
  {
    title: 'On the Origin of Species',
    author: 'Charles Darwin',
    year: 1859,
    isbn13: '9781441432225',
    category: 'Science',
    subCategory: 'Biology',
    pages: 502,
    publishedIn: 'United Kingdom',
    description: 'The foundational text of evolutionary biology.',
    eBookAvailable: true,
    audioBookAvailable: false,
    eBookUrl: 'https://www.gutenberg.org/cache/epub/1228/pg1228-images.html',
  },

  // ── HISTORY ───────────────────────────────────────────────────────
  {
    title: 'The Art of War',
    author: 'Sun Tzu',
    year: -500,
    isbn13: '9781599869773',
    category: 'History',
    subCategory: 'Military History',
    pages: 273,
    publishedIn: 'China',
    description: 'An ancient Chinese military treatise on strategy and tactics.',
    eBookAvailable: true,
    audioBookAvailable: true,
    eBookUrl: 'https://www.gutenberg.org/cache/epub/132/pg132-images.html',
    audioUrl: 'https://archive.org/download/art_war_ps_librivox/artofwar_01_sun.mp3',
  },
  {
    title: "A People's History of the United States",
    author: 'Howard Zinn',
    year: 1980,
    isbn13: '9780062397348',
    category: 'History',
    subCategory: 'American History',
    pages: 729,
    description: 'American history told from the perspective of ordinary people.',
    eBookAvailable: false,
    audioBookAvailable: false,
  },
  {
    title: 'Guns, Germs, and Steel',
    author: 'Jared Diamond',
    year: 1997,
    isbn13: '9780393317558',
    category: 'History',
    subCategory: 'World History',
    pages: 480,
    description: 'The fates of human societies, explained through geography and ecology.',
    eBookAvailable: false,
    audioBookAvailable: false,
  },
  {
    title: 'The Guns of August',
    author: 'Barbara Tuchman',
    year: 1962,
    isbn13: '9780345476098',
    category: 'History',
    subCategory: 'Military History',
    pages: 511,
    description: 'The outbreak and first month of World War I.',
    eBookAvailable: false,
    audioBookAvailable: false,
  },
  {
    title: '1776',
    author: 'David McCullough',
    year: 2005,
    isbn13: '9780743226721',
    category: 'History',
    subCategory: 'American History',
    pages: 386,
    description: 'The story of the year America claimed its independence.',
    eBookAvailable: false,
    audioBookAvailable: false,
  },
  {
    title: 'The Rise and Fall of the Third Reich',
    author: 'William L. Shirer',
    year: 1960,
    isbn13: '9781451651683',
    category: 'History',
    subCategory: 'World History',
    pages: 1280,
    description: 'A comprehensive history of Nazi Germany.',
    eBookAvailable: false,
    audioBookAvailable: false,
  },

  // ── SELF-HELP ─────────────────────────────────────────────────────
  {
    title: 'Sprint',
    author: 'Jake Knapp',
    year: 2016,
    isbn13: '9781501121746',
    category: 'Self-Help',
    subCategory: 'Business',
    pages: 288,
    description: 'How to solve big problems and test new ideas in just five days.',
    eBookAvailable: true,
    audioBookAvailable: true,
    eBookUrl: PLACEHOLDER_PDF,
  },
  {
    title: 'Atomic Habits',
    author: 'James Clear',
    year: 2018,
    isbn13: '9780735211292',
    category: 'Self-Help',
    subCategory: 'Productivity',
    pages: 320,
    description: 'An easy and proven way to build good habits and break bad ones.',
    eBookAvailable: false,
    audioBookAvailable: false,
  },
  {
    title: 'The 7 Habits of Highly Effective People',
    author: 'Stephen R. Covey',
    year: 1989,
    isbn13: '9780743269513',
    category: 'Self-Help',
    subCategory: 'Productivity',
    pages: 381,
    description: 'Powerful lessons in personal change.',
    eBookAvailable: false,
    audioBookAvailable: false,
  },
  {
    title: 'The Power of Now',
    author: 'Eckhart Tolle',
    year: 1997,
    isbn13: '9781577314806',
    category: 'Self-Help',
    subCategory: 'Mindfulness',
    pages: 236,
    description: 'A guide to spiritual enlightenment.',
    eBookAvailable: false,
    audioBookAvailable: false,
  },
  {
    title: 'Deep Work',
    author: 'Cal Newport',
    year: 2016,
    isbn13: '9781455586691',
    category: 'Self-Help',
    subCategory: 'Productivity',
    pages: 296,
    description: 'Rules for focused success in a distracted world.',
    eBookAvailable: false,
    audioBookAvailable: false,
  },
  {
    title: 'Thinking, Fast and Slow',
    author: 'Daniel Kahneman',
    year: 2011,
    isbn13: '9780374533557',
    category: 'Self-Help',
    subCategory: 'Psychology',
    pages: 499,
    description: 'The two systems that drive the way we think.',
    eBookAvailable: false,
    audioBookAvailable: false,
  },

  // ── BIOGRAPHY ─────────────────────────────────────────────────────
  {
    title: 'Steve Jobs',
    author: 'Walter Isaacson',
    year: 2011,
    isbn13: '9781451648539',
    category: 'Biography',
    subCategory: 'Business',
    pages: 656,
    description: 'The exclusive biography of Apple co-founder Steve Jobs.',
    eBookAvailable: false,
    audioBookAvailable: false,
  },
  {
    title: 'Educated: A Memoir',
    author: 'Tara Westover',
    year: 2018,
    isbn13: '9780399590504',
    category: 'Biography',
    subCategory: 'Memoir',
    pages: 334,
    description: 'A woman who leaves her survivalist family and earns a PhD from Cambridge.',
    eBookAvailable: false,
    audioBookAvailable: false,
  },
  {
    title: 'Long Walk to Freedom',
    author: 'Nelson Mandela',
    year: 1994,
    isbn13: '9780316548182',
    category: 'Biography',
    subCategory: 'Memoir',
    pages: 656,
    description: "Mandela's own account of his life and the struggle against apartheid.",
    eBookAvailable: false,
    audioBookAvailable: false,
  },
  {
    title: 'The Diary of a Young Girl',
    author: 'Anne Frank',
    year: 1947,
    isbn13: '9780553296983',
    category: 'Biography',
    subCategory: 'Memoir',
    pages: 283,
    publishedIn: 'Netherlands',
    description: "A young girl's diary written while hiding during the Nazi occupation.",
    eBookAvailable: true,
    audioBookAvailable: false,
    eBookUrl: PLACEHOLDER_PDF,
  },
  {
    title: 'Born a Crime',
    author: 'Trevor Noah',
    year: 2016,
    isbn13: '9780399588174',
    category: 'Biography',
    subCategory: 'Memoir',
    pages: 304,
    description: 'Stories from a South African childhood.',
    eBookAvailable: false,
    audioBookAvailable: false,
  },
  {
    title: 'Alexander Hamilton',
    author: 'Ron Chernow',
    year: 2004,
    isbn13: '9780143034759',
    category: 'Biography',
    subCategory: 'American History',
    pages: 818,
    description: 'The definitive biography of the founding father.',
    eBookAvailable: false,
    audioBookAvailable: false,
  },
];

const buildBooks = () => {
  return specs.map((spec, i) => {
    const condition = CONDITIONS[i % CONDITIONS.length];
    const rating = Math.min(5, 3.5 + (i % 4) * 0.5);
    const rentPrice = 5 + (i % 4) * 5;
    const buyPrice = 50 + (i % 4) * 50;
    const hardCopyCount = 1 + (i % 5);
    const categoryPrefix = spec.category.slice(0, 3).toUpperCase();
    const shelf = String.fromCharCode(65 + (i % 6)); // A-F
    return {
      title: spec.title,
      author: spec.author,
      year: spec.year,
      edition: spec.edition,
      isbn13: spec.isbn13,
      coverUrl: `https://covers.openlibrary.org/b/isbn/${spec.isbn13}-L.jpg`,
      category: spec.category,
      subCategory: spec.subCategory,
      buyPrice,
      rentPrice,
      condition,
      rating,
      ratingCount: 20 + i * 7,
      serialNumber: `SN-${(101 + i).toString()}`,
      publisher: spec.publisher,
      language: 'English',
      pages: spec.pages,
      publishedIn: spec.publishedIn,
      hardCopyCount,
      eBookAvailable: spec.eBookAvailable,
      audioBookAvailable: spec.audioBookAvailable,
      eBookUrl: spec.eBookUrl,
      audioUrl: spec.audioUrl,
      locationCode: `${categoryPrefix} ${shelf}-${10 + (i % 40)}`,
      status: i % 9 === 0 ? 'borrowed' : 'in-shelf',
      description: spec.description,
      currentlyReading: 1 + (i % 15),
      haveRead: 10 + (i % 200),
    };
  });
};

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

    await User.create({
      name: 'Library Staff',
      email: 'librarian@bookhaven.com',
      password: 'Librarian@123',
      role: 'librarian',
      membership: 'Basic',
      address: 'Kathmandu',
      phone: '+977 9800000001',
      bio: 'BookHeaven Librarian',
    });

    // Create Books — 50 titles across 8 genres
    const books = buildBooks();
    const createdBooks = await Book.insertMany(books);

    // Rentals for Anisha
    const bookToRent1 = createdBooks.find(b => b.isbn13 === '9780465050659'); // The Design of Everyday Things
    const bookToRent2 = createdBooks.find(b => b.isbn13 === '9780141439518'); // Pride and Prejudice

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

    console.log(`Seeding completed successfully! ${createdBooks.length} books created.`);
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedData();
