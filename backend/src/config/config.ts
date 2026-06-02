import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/bookhaven',
  jwtSecret: process.env.JWT_SECRET || 'bookhaven_secret_key_32chars_min!',
  jwtExpiresIn: '1h',
  bcryptRounds: 10,
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  khalti: {
    secretKey: process.env.KHALTI_SECRET_KEY || '',
    publicKey: process.env.KHALTI_PUBLIC_KEY || '',
    baseUrl: 'https://a.khalti.com/api/v2',
  },
  rateLimits: {
    auth: { windowMs: 15 * 60 * 1000, max: 5 },
    general: { windowMs: 15 * 60 * 1000, max: 100 },
  },
  rental: {
    penaltyPerDay: 0.5,
    tiers: {
      Basic: { maxBooks: 3, maxDays: 14, discount: 0 },
      Student: { maxBooks: 5, maxDays: 21, discount: 0.15 },
      Premium: { maxBooks: 10, maxDays: 30, discount: 0, freeReservations: true },
    },
  },
};
