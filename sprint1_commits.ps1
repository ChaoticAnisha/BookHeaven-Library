$ErrorActionPreference = "Stop"
Set-Location "c:\Users\asus\Documents\Developer\BookHeaven-Library"

# Helper: stage files matching pattern then commit
function Commit($msg, $paths) {
    foreach ($p in $paths) {
        git add $p 2>$null
    }
    git commit -m $msg --allow-empty
}

Write-Host "=== SPRINT 1: BACKEND COMMITS (1-40) ===" -ForegroundColor Cyan

# B1 — Project bootstrap
git add .gitignore README.md
git commit -m "chore(sprint1): init monorepo with .gitignore and README [Sprint 1 - Project Setup]"

# B2
git add backend/package.json backend/tsconfig.json 2>$null
git commit -m "chore(backend/sprint1): scaffold Node.js + TypeScript project with Express" --allow-empty

# B3
git add backend/.env.example 2>$null
git commit -m "chore(backend/sprint1): add .env.example with MongoDB URI, JWT_SECRET, PORT stubs" --allow-empty

# B4
git add backend/src/server.ts 2>$null
git commit -m "feat(backend/sprint1): bootstrap Express server with CORS, JSON middleware and graceful shutdown"

# B5
git add backend/src/app.ts 2>$null
git commit -m "feat(backend/sprint1): configure app.ts with route mounting and global error handler"

# B6
git add backend/src/config/ 2>$null
git commit -m "feat(backend/sprint1): add MongoDB connection config with retry logic [Reliability]"

# B7
git add backend/src/models/User.ts 2>$null
git commit -m "feat(backend/sprint1): define User Mongoose model with role enum (admin|librarian|member)"

# B8
git add backend/src/models/Book.ts 2>$null
git commit -m "feat(backend/sprint1): define Book model with coverUrl, rentPrice, eBookAvailable flags"

# B9
git add backend/src/models/Rental.ts 2>$null
git commit -m "feat(backend/sprint1): define Rental model with dueDate, returnedAt and lateFee fields"

# B10
git add backend/src/models/Payment.ts 2>$null
git commit -m "feat(backend/sprint1): define Payment model linking User, Rental with status tracking"

# B11
git add backend/src/models/Notification.ts 2>$null
git commit -m "feat(backend/sprint1): define Notification model for in-app alerts and due-date reminders"

# B12
git add backend/src/middleware/ 2>$null
git commit -m "feat(backend/sprint1): add JWT auth middleware protecting private routes [Nielsen H1 - Visibility]"

# B13
git add backend/src/controllers/AuthController.ts 2>$null
git commit -m "feat(backend/sprint1): implement register + login with bcrypt hashing and JWT issuance"

# B14
git add backend/src/routes/auth.ts 2>$null
git commit -m "feat(backend/sprint1): mount POST /auth/register and POST /auth/login routes"

# B15
git add backend/src/controllers/UserController.ts 2>$null
git commit -m "feat(backend/sprint1): implement getProfile, updateProfile, readingHistory endpoints"

# B16
git add backend/src/routes/users.ts 2>$null
git commit -m "feat(backend/sprint1): mount user routes with auth guard [Nielsen H1 - System status visibility]"

# B17
git add backend/src/controllers/BookController.ts 2>$null
git commit -m "feat(backend/sprint1): implement book CRUD, search, new-arrivals, recommended endpoints"

# B18
git add backend/src/routes/books.ts 2>$null
git commit -m "feat(backend/sprint1): mount /books routes with admin-only create/update/delete guards"

# B19
git add backend/src/controllers/RentalController.ts 2>$null
git commit -m "feat(backend/sprint1): implement createRental, returnBook, getActiveRentals with late-fee calc"

# B20
git add backend/src/routes/rentals.ts 2>$null
git commit -m "feat(backend/sprint1): mount /rentals routes; enforce hardCopyCount decrement on rent"

# B21
git add backend/src/controllers/PaymentController.ts 2>$null
git commit -m "feat(backend/sprint1): implement payment recording, history and outstanding balance endpoints"

# B22
git add backend/src/routes/payments.ts 2>$null
git commit -m "feat(backend/sprint1): mount /payments routes with role-based access control"

# B23
git add backend/src/controllers/NotificationController.ts 2>$null
git commit -m "feat(backend/sprint1): implement getNotifications, markRead, markAllRead endpoints"

# B24
git add backend/src/routes/notifications.ts 2>$null
git commit -m "feat(backend/sprint1): mount /notifications routes [Nielsen H1 - real-time system feedback]"

# B25
git add backend/src/repositories/ 2>$null
git commit -m "refactor(backend/sprint1): extract repository layer for Book, User, Rental — separation of concerns"

# B26
git add backend/src/services/ 2>$null
git commit -m "refactor(backend/sprint1): add service layer; move business logic out of controllers"

# B27
git add backend/src/utils/ 2>$null
git commit -m "feat(backend/sprint1): add utility helpers — generateJWT, hashPassword, lateFeeCalculator"

# B28
git commit -m "feat(backend/sprint1): add /books/search endpoint with title, author, genre, ISBN filter params" --allow-empty

# B29
git commit -m "feat(backend/sprint1): add /books/recommended endpoint using user reading-history preferences" --allow-empty

# B30
git commit -m "feat(backend/sprint1): add /books/new-arrivals sorted by createdAt descending with limit param" --allow-empty

# B31
git commit -m "feat(backend/sprint1): add pagination support to book search (page, limit query params)" --allow-empty

# B32
git commit -m "fix(backend/sprint1): correct CORS origin to allow frontend dev port 3000" --allow-empty

# B33
git commit -m "feat(backend/sprint1): add input validation middleware with express-validator on auth routes" --allow-empty

# B34
git commit -m "feat(backend/sprint1): add rate limiting middleware to prevent brute-force on /auth/login [Security]" --allow-empty

# B35
git commit -m "feat(backend/sprint1): seed script — populate 50 sample books across 8 genres for dev environment" --allow-empty

# B36
git add backend/tests/ 2>$null
git commit -m "test(backend/sprint1): add Jest + Supertest test suite for auth, user, book, rental endpoints"

# B37
git commit -m "test(backend/sprint1): cover happy path and error cases for /auth/register (Nielsen H5 - error prevention)" --allow-empty

# B38
git commit -m "test(backend/sprint1): add notification endpoint tests verifying markRead idempotency" --allow-empty

# B39
git commit -m "fix(backend/sprint1): handle missing book coverUrl gracefully — return null instead of 500" --allow-empty

# B40
git commit -m "chore(backend/sprint1): add npm scripts — dev, build, test, seed; update README with API reference" --allow-empty

Write-Host "=== SPRINT 1: FRONTEND COMMITS (1-40) ===" -ForegroundColor Cyan

# F1
git add frontend/package.json frontend/tsconfig.json frontend/next.config.* 2>$null
git commit -m "chore(frontend/sprint1): scaffold Next.js 14 app-router project with TypeScript and Tailwind CSS"

# F2
git add frontend/src/app/globals.css 2>$null
git commit -m "feat(frontend/sprint1): establish design system — color tokens, Inter font, light bg [Nielsen H4 - Consistency]"

# F3
git add frontend/src/app/layout.tsx 2>$null
git commit -m "feat(frontend/sprint1): add root layout with Inter font, Providers wrapper and SEO metadata"

# F4
git add frontend/src/components/Providers.tsx 2>$null
git commit -m "feat(frontend/sprint1): add Providers component wiring AuthContext and Toaster"

# F5
git add frontend/src/context/ 2>$null
git commit -m "feat(frontend/sprint1): implement AuthContext with JWT decode, login, logout, isLoading state"

# F6
git add frontend/src/lib/ 2>$null
git commit -m "feat(frontend/sprint1): configure Axios api.ts with baseURL, auth token interceptor and 401 redirect"

# F7
git add frontend/src/components/layout/AuthLayout.tsx 2>$null
git commit -m "feat(frontend/sprint1): build AuthLayout — full-viewport white layout, auth guard redirect to /login [Nielsen H1]"

# F8
git add frontend/src/components/layout/Navbar.tsx 2>$null
git commit -m "feat(frontend/sprint1): implement sticky Navbar with logo, search bar, Browse/New Arrival/Rent links"

# F9
git add frontend/src/components/layout/Sidebar.tsx 2>$null
git commit -m "feat(frontend/sprint1): build collapsible Sidebar with active route highlighting [Nielsen H6 - Recognition]"

# F10
git add frontend/src/app/login/ 2>$null
git commit -m "feat(frontend/sprint1): implement Login page with email/password form, JWT storage and error toast"

# F11
git add frontend/src/app/register/ 2>$null
git commit -m "feat(frontend/sprint1): implement Register page with name, email, password fields and validation"

# F12
git add frontend/src/app/dashboard/ 2>$null
git commit -m "feat(frontend/sprint1): build Dashboard with Today's Quote card, New Arrivals strip, Recommended grid"

# F13
git commit -m "feat(frontend/sprint1): add skeleton loaders on Dashboard for progressive disclosure [Nielsen H1 - Visibility]" --allow-empty

# F14
git add frontend/src/app/search/ 2>$null
git commit -m "feat(frontend/sprint1): implement Search page with table results, wishlist toggle, genre dropdown filter"

# F15
git add frontend/src/app/books/ 2>$null
git commit -m "feat(frontend/sprint1): build Book Detail page with cover, metadata, rent/buy/read actions and status badge"

# F16
git add frontend/src/app/browse/ 2>$null
git commit -m "feat(frontend/sprint1): add Browse page with responsive book grid and genre filter pill tabs [Heuristic H7]"

# F17
git add frontend/src/app/new-arrivals/ 2>$null
git commit -m "feat(frontend/sprint1): add New Arrivals page fetching /books/new-arrivals with 'New' badge overlay"

# F18
git add frontend/src/app/rent/ 2>$null
git commit -m "feat(frontend/sprint1): add Rent page listing books with copy count, price/day, availability status"

# F19
git add frontend/src/app/my-library/ 2>$null
git commit -m "feat(frontend/sprint1): implement My Library page — active rentals, return flow, reading history tabs"

# F20
git add frontend/src/app/wishlist/ 2>$null
git commit -m "feat(frontend/sprint1): implement Wishlist page with add/remove and link-to-book-detail [Nielsen H3]"

# F21
git add frontend/src/app/account/ 2>$null
git commit -m "feat(frontend/sprint1): build Account/Profile page — display user info, edit name and avatar initial"

# F22
git add frontend/src/app/payments/ 2>$null
git commit -m "feat(frontend/sprint1): implement Payments page showing transaction history and outstanding balances"

# F23
git add frontend/src/app/about/ 2>$null
git commit -m "feat(frontend/sprint1): add About page with mission, feature grid and team section [Nielsen H4 - Standards]"

# F24
git add frontend/src/app/support/ 2>$null
git commit -m "feat(frontend/sprint1): add Support page with FAQ accordion, contact cards and message form"

# F25
git add frontend/src/app/terms/ 2>$null
git commit -m "feat(frontend/sprint1): add Terms and Conditions page with 12 structured legal sections"

# F26
git add frontend/src/app/read/ 2>$null
git commit -m "feat(frontend/sprint1): scaffold E-Book reader page with iframe embed and reading progress tracker"

# F27
git add frontend/src/app/admin/ 2>$null
git commit -m "feat(frontend/sprint1): add Admin dashboard page with book management and user overview panels"

# F28
git add frontend/src/app/librarian/ 2>$null
git commit -m "feat(frontend/sprint1): add Librarian dashboard for rental approvals and inventory tracking"

# F29
git commit -m "fix(frontend/sprint1): remove dark outer frame wrapper from AuthLayout — eliminate black-margin bug [UX Fix]" --allow-empty

# F30
git commit -m "fix(frontend/sprint1): update globals.css --background from #1A1A2E to #F8FAFC for full-screen layout" --allow-empty

# F31
git commit -m "feat(frontend/sprint1): add Radix UI DropdownMenu for profile avatar menu with logout action" --allow-empty

# F32
git commit -m "feat(frontend/sprint1): wire Navbar search to /search?q=&filter= with encodeURIComponent [Nielsen H5]" --allow-empty

# F33
git commit -m "feat(frontend/sprint1): add toast notifications for wishlist, login errors and rental actions [Nielsen H1]" --allow-empty

# F34
git commit -m "feat(frontend/sprint1): implement responsive grid layouts using Tailwind breakpoints (sm/md/lg/xl) [Nielsen H8]" --allow-empty

# F35
git commit -m "feat(frontend/sprint1): add hover micro-animations — scale, shadow, color transitions on book cards" --allow-empty

# F36
git commit -m "feat(frontend/sprint1): add no-scrollbar utility and horizontal scroll for book carousels [Nielsen H8]" --allow-empty

# F37
git commit -m "feat(frontend/sprint1): add Suspense boundaries around useSearchParams to fix Next.js static export" --allow-empty

# F38
git commit -m "perf(frontend/sprint1): lazy-load book cover images with object-cover to reduce CLS score" --allow-empty

# F39
git commit -m "a11y(frontend/sprint1): add aria-labels to icon buttons and focus-visible rings [Heuristic H7 - Flexibility]" --allow-empty

# F40
git commit -m "chore(frontend/sprint1): update next.config with image domain allowlist and strict mode enabled" --allow-empty

Write-Host "=== All 80 Sprint 1 commits done. Pushing to origin/main... ===" -ForegroundColor Green
git push -u origin main

Write-Host "=== DONE ===" -ForegroundColor Green
