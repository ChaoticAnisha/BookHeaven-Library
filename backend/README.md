# BookHeaven Backend API

Express/TypeScript REST API for the BookHeaven library system.

## API Endpoints

### Auth
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get logged in user profile

### Books
- `GET /api/books/search` - Search books
- `GET /api/books/new-arrivals` - Get new arrivals
- `GET /api/books/recommended` - Get recommendations
- `GET /api/books/:id` - Get book details
- `POST /api/books` (Admin/Librarian) - Add book
- `PUT /api/books/:id` (Admin/Librarian) - Update book
- `DELETE /api/books/:id` (Admin) - Delete book

### Rentals
- `POST /api/rentals` - Rent a book
- `POST /api/rentals/return` - Return a book
- `GET /api/rentals/my` - Get my rentals
- `GET /api/rentals/all` (Admin/Librarian) - Get all rentals

### Payments (Khalti)
- `POST /api/payments/khalti/initiate` - Initiate Khalti payment
- `POST /api/payments/khalti/verify` - Verify Khalti payment
- `POST /api/payments/card` - Pay via mock card
- `POST /api/payments/credit` - Defer to credit
- `GET /api/payments/pending` - Get pending payments

## Environment Variables
Create a `.env` file from `.env.example`.
- `MONGO_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT
- `KHALTI_PUBLIC_KEY`: Khalti public key for test env
- `KHALTI_SECRET_KEY`: Khalti secret key for test env

## Khalti Integration
1. User clicks Pay with Khalti.
2. Frontend calls `/api/payments/khalti/initiate`.
3. Backend calls Khalti ePayment API, returns `pidx` and `payment_url`.
4. User redirected to Khalti, completes payment.
5. On success redirect, frontend calls `/api/payments/khalti/verify` with `pidx`.
6. Backend verifies with Khalti and marks payment Complete.
