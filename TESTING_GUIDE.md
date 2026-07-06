# BookHaven Library — Manual Testing Guide

This guide is generated directly from the source code in this repository (backend Express/MongoDB API + Next.js frontend). Every route, field name, button label, and credential below was verified by reading the actual source files referenced in each section. Where the UI is mocked/non-functional, this is called out explicitly rather than presented as a working feature.

---

## 1. SETUP

### Prerequisites
- MongoDB must be running locally and reachable at the connection string used by the backend. Per `backend/src/config/config.ts` and `backend/.env.example`, the default is:
  ```
  mongodb://localhost:27017/bookhaven   (.env.example)
  mongodb://127.0.0.1:27017/bookhaven   (fallback default in config.ts and seed.ts if MONGO_URI is unset)
  ```
  Start MongoDB (`mongod`) before running the backend or the seed script.

### Backend setup (`backend/`)
```bash
cd backend
npm install
```
Create `backend/.env` from `backend/.env.example`. Exact variables defined in `.env.example`:
```
MONGO_URI=mongodb://localhost:27017/bookhaven
JWT_SECRET=your_super_secret_jwt_key_min_32_characters_here
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-specific-password
KHALTI_SECRET_KEY=your_khalti_secret_key
KHALTI_PUBLIC_KEY=your_khalti_public_key
ESEWA_SECRET_KEY=8gBm/:&EnhH.1/q
ESEWA_PRODUCT_CODE=EPAYTEST
ESEWA_BASE_URL=https://rc-epay.esewa.com.np
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000
```
Note: `ESEWA_SECRET_KEY`, `ESEWA_PRODUCT_CODE`, and `ESEWA_BASE_URL` already have working sandbox/test defaults in `config.ts` even if unset, since eSewa's RC (test) environment is hardcoded as the default `baseUrl`. Khalti requires a real (test-mode) `KHALTI_SECRET_KEY`/`KHALTI_PUBLIC_KEY` from a Khalti merchant test account or the Khalti flow will fail.

Seed the database (clears and recreates Users, Books, Rentals — see `backend/src/utils/seed.ts`, run via `npm run seed` which maps to `ts-node src/utils/seed.ts` in `backend/package.json`):
```bash
npm run seed
```

Run the backend dev server (`"dev": "ts-node-dev --respawn --transpile-only src/server.ts"`):
```bash
npm run dev
```
Server listens on `PORT` from config, default **5000** (`http://localhost:5000`, API base path `/api`).

### Frontend setup (`frontend/`)
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on the Next.js default port **3000** (`http://localhost:3000`). It talks to the backend via `NEXT_PUBLIC_API_URL`, defaulting to `http://127.0.0.1:5000/api` per `frontend/src/lib/api.ts`. Set `NEXT_PUBLIC_API_URL` in `frontend/.env.local` if the backend isn't on the default host/port.

### Seeded credentials

From `backend/src/utils/seed.ts`:

| Role | Name | Email | Password | Membership |
|---|---|---|---|---|
| admin | Admin User | `admin@bookhaven.com` | `Admin@123` | (none set — admin role has no membership tier) |
| member | Anisha Sah | `member@bookhaven.com` | `Member@123` | Basic |

**No librarian account is seeded.** The `User` model (`backend/src/models/User.ts`) does define `role: { type: String, enum: ['admin', 'librarian', 'member'], default: 'member' } }`, so the role exists in the schema and is enforced by `authorize('admin', 'librarian')` middleware on some routes (see Section 2), but `seed.ts` never creates a user with `role: 'librarian'`. There is also no API endpoint that lets anyone (including admin) create a user with an arbitrary role — `POST /api/auth/register` always creates `role: 'member'` (registration does not accept a `role` field), and there is no admin "create user" endpoint, only `PATCH /api/users/:id/suspend` and `DELETE /api/users/:id`.

To manually test librarian behavior, create the account directly in MongoDB:
1. Register a normal account via the UI (`/register`), e.g. email `librarian@bookhaven.com`.
2. Flip its role directly in MongoDB:
   ```js
   use bookhaven
   db.users.updateOne(
     { email: "librarian@bookhaven.com" },
     { $set: { role: "librarian" } }
   )
   ```
3. Log out and log back in with that account so a new JWT is issued with `role: "librarian"` (the JWT payload embeds `role` at login time — see `backend/src/middleware/auth.ts` `JwtPayload`).

---

## 2. FEATURE CHECKLIST BY ROLE

### MEMBER

| Feature | Page/Route | Steps to Trigger | Expected Result | Pass/Fail |
|---|---|---|---|---|
| Registration | `/register` | Fill Full Name, Email, Password, Confirm Password → click **REGISTER** | `POST /api/auth/register`; on success auto-logs in and redirects (member → `/dashboard`, per `AuthContext.login`) | |
| Login | `/login` | Enter email/password → click **LOGIN** | `POST /api/auth/login`; shows "Login Successful!" popup with role badge, animated progress bar, then redirects to `/dashboard` (member) or `/admin` (admin role) | |
| Browse catalog | `/browse` | Click genre tabs (All, Fiction, Non-Fiction, Science, History, Academic, Technology, Biography) | Calls `GET /api/books/search?q=&filter=All[&genre=...]`; grid re-renders with filtered books | |
| Search | Navbar search bar (any page) → `/search` | Type query, pick filter dropdown (All/Title/Author/Genre/ISBN), click search icon or press Enter | Navigates to `/search?q=...&filter=...` | |
| Book detail view | `/books/[id]` | Click any book card from Browse/Search/New Arrivals | `GET /api/books/:id`; shows cover, hard copy/e-book/audio availability dots, rating, description, RENT and Read Now buttons | |
| Renting a book | `/books/[id]` → **RENT** button | Click RENT → fill From/To dates (pre-filled today→+7 days), optional Purpose → submit | `POST /api/rentals` with `{ bookId, serialNumber, fromDate, toDate, purpose }`. On success shows "Process Completed" dialog. **Caveat:** if the API call fails, the frontend catches the error and fakes success anyway (see `books/[id]/page.tsx` `handleRent` catch block — it explicitly simulates success on API failure), so a green success screen does **not** guarantee the rental was created server-side — always cross-check `/my-library` or the DB. | |
| Tier/stock enforcement on rent | `/books/[id]` | Attempt to rent when `hardCopyCount <= 0`, or beyond your tier's `maxBooks`, or with `toDate <= fromDate` | Backend (`RentalService.rentBook`) returns 400 with messages: "No hard copies available", "Return date must be after borrow date", or "Your {tier} plan allows maximum {n} books at a time..." — but per the row above, the UI will still show a fake success dialog unless you inspect network responses or `/my-library` | |
| My Library / active rentals | `/my-library` | Navigate via Navbar/account dropdown or directly | `GET /api/rentals/my`; tabs: All Books, Wishlist, Rented Books, E-Books, Audio Books, Articles & Journals (only "All Books" and "Rented Books" actually filter — others are static labels, see Known Gaps) | |
| Returning a book | `/my-library`, non-eBook active rental card | Click **Return** button on a rental card | **Known gap:** the Return button has no `onClick` handler in `frontend/src/app/my-library/page.tsx` — clicking it does nothing. The real endpoint `POST /api/rentals/return` (body `{ rentalId, serialNumber }`) exists and works if called directly (e.g. via curl/Postman), restoring `hardCopyCount` and setting rental `status: 'returned'`, but there is no wired UI control for it. | |
| Fines/payments — Khalti | `/payments`, Pending Dues tab → Pay Now → choose **Khalti** | Click Pay Now on an overdue rental → select Khalti → confirm | `POST /api/payments/khalti/initiate` → redirects browser to Khalti `payment_url`; after Khalti redirect back with `?khalti=success&pidx=...`, frontend calls `POST /api/payments/khalti/verify` | |
| Fines/payments — eSewa | `/payments` → Pay Now → **eSewa** | Same flow | `POST /api/payments/esewa/initiate` returns `paymentUrl` + `formData`; a hidden auto-submitting POST form redirects to eSewa; return URL carries `?esewa=success&data=...`, verified via `POST /api/payments/esewa/verify` | |
| Fines/payments — Card | `/payments` → Pay Now → **Card** | Fill mock card fields (Card Number, Cardholder Name, MM/YY, CVV — purely cosmetic, not validated/sent) → click "Pay Rs.X with Card" | `POST /api/payments/card` `{ rentalId, amount }`; backend completes it synchronously (no real gateway) and shows "Payment Successful!" | |
| Fines/payments — Account Credit | `/payments` → Pay Now → **Account Credit** | Click "Pay Rs.X with Account Credit" | `POST /api/payments/credit` `{ rentalId }`; defers payment, shows "Payment Successful!" with note that it goes to account balance | |
| Payment history | `/payments`, **Payment History** tab | Click tab | `GET /api/payments/history`; lists transaction id, method, amount, status (Completed/Pending/Failed/Refunded), date | |
| Notifications | Navbar bell icon dropdown | Click bell icon | **Known gap:** dropdown content in `Navbar.tsx` is fully hardcoded (3 static notifications, "3 New" badge, "Mark all as read" button with no handler) — it does NOT call `GET /api/notifications`, `GET /api/notifications/unread-count`, or `PUT /api/notifications/read-all`, even though those endpoints exist and work server-side | |
| E-reader | `/read/[id]` (via "Read Now" on book detail or My Library) | Click Read Now | **Important:** the page does not check `book.eBookAvailable` at all. It always shows a "Purchase to Read" paywall ($9.99 hardcoded, fake Card/Khalti mock form) regardless of whether the book has `eBookAvailable: true` or whether the user already owns/rented it. Submitting the mock payment form just sets local `hasPaid` state after a 1.5s fake delay — no backend call. Once "paid," it renders an iframe pointing at `book.pdfUrl` or falls back to `/sample.pdf` (present at `frontend/public/sample.pdf`) | |
| Recommendations | Dashboard/home | Load `/dashboard` | Public endpoint `GET /api/books/recommended` — verify recommended section renders | |
| New Arrivals | `/new-arrivals` | Navbar → "New Arrival" | `GET /api/books/new-arrivals` (public) | |
| Account: profile edit | `/account`, "Account Setting" tab | Edit Full Name, Address, Phone, Bio (Email is read-only/`readOnly`) → click **Update Profile** | Only `name` and `avatar` are actually sent (`updateProfile({ name, avatar })` in `account/page.tsx`) via `PUT /api/users/profile`; Address/Phone/Bio fields are local-only UI state and are **not persisted** to the backend despite being editable | |
| Account: notification toggles | `/account`, "Notifications" tab | Toggle switches for Restock Alerts, Reservation Confirmations, Due Date Reminders, New Arrivals, Weekly Digest | **Known gap:** toggles are uncontrolled (`defaultChecked` only) with no onChange handler — flipping them does nothing and never calls `PUT /api/users/notifications`, even though that endpoint exists and the `User` model has a matching `notificationPreferences` object (`restock`, `reservation`, `dueReminder`, `newArrivals`, `weeklyDigest`) | |
| Account: dark mode / theme | `/account`, "Interface" tab | Click Light / Dark / System swatches | Only "Dark" actually does anything: it toggles the `dark` class on `<html>` via a `useEffect`. Language, Timezone, Reduce Motion, High Contrast controls are decorative only (no effect, not persisted) | |
| Wishlist | `/wishlist` (also linked from Navbar avatar dropdown and My Library tab) | Navigate to Wishlist | **Known gap — not a real feature.** Per a code comment in `frontend/src/app/wishlist/page.tsx`: "In a real app, wishlist would be fetched from backend... Mocking wishlist data fetch - reusing new arrivals logic." It calls `GET /api/books/all?limit=3` and displays whatever 3 books come back as if they were wishlisted. There is no `wishlist` field anywhere in the `User` or `Book` models, and no `/api/users/wishlist` endpoint exists. The heart/"Add to Wishlist" buttons on Browse and Book Detail pages only toggle local component state — nothing is saved server-side. | |

### LIBRARIAN

Per `backend/src/routes/rentals.ts`, the only routes gated specifically to include the librarian role (via `authorize('admin', 'librarian')`) are:
- `GET /api/rentals/all` — view all rentals
- `GET /api/rentals/stats` — rental statistics

All other authenticated routes (`books`, `users`, `payments`, `notifications`) either require `admin` only or no role restriction beyond being logged in. There is no `authorize('librarian')`-only route anywhere in the codebase.

| Feature | Page/Route | Steps to Trigger | Expected Result | Pass/Fail |
|---|---|---|---|---|
| Librarian dashboard shell | `/librarian` | Log in as a user with `role: 'librarian'` (see Section 1 for how to create one), navigate to `/librarian` | Renders a "Librarian Portal" sidebar with "Stock Management" and "Returns" nav items. **Important:** this page is entirely static/hardcoded mock data — the stock table shows two hardcoded rows (`Don't Make Me Think` / `The Design of Everyday Things`) regardless of actual DB contents, "Search" and "Update Stock" buttons have no handlers, and "Returns" nav item is a dead `href="#"` link. No API calls are made from this page at all. | |
| View all rentals (API-level) | N/A (no dedicated librarian UI page consumes this) | As librarian or admin, call `GET /api/rentals/all` directly (e.g. via curl with Bearer token) | Returns paginated list of all rentals across all users | |
| View rental stats (API-level) | N/A | `GET /api/rentals/stats` as librarian/admin | Returns `{ total, active, overdue, returned, ... }` counts | |
| Route protection | N/A | Log in as a `member`, attempt `GET /api/rentals/all` and `GET /api/rentals/stats` | Returns 403 `{ success: false, message: 'Access forbidden. Insufficient permissions.' }` | |

**Note:** Librarian has no distinct, functional UI beyond the static `/librarian` shell described above. There is no real librarian-specific book/stock-management capability wired to the backend (book create/update/delete is `admin`-only per `backend/src/routes/books.ts`). If your test plan requires a librarian to actually manage stock, that functionality does not exist yet — flag it rather than trying to force a pass.

### ADMIN

| Feature | Page/Route | Steps to Trigger | Expected Result | Pass/Fail |
|---|---|---|---|---|
| Admin dashboard shell | `/admin` | Log in as `admin@bookhaven.com` / `Admin@123`, land on `/admin` (auto-redirect from login) | **Important:** dashboard is fully static mock data — "Total Books: 1,245", "Active Members: 842", "Current Rentals: 156", "Revenue: ₹12,450" and the "Recent Activity" feed are hardcoded strings in `frontend/src/app/admin/page.tsx`, not fetched from any API. Sidebar nav items (Overview, All Books, All Members, All Rentals, Reports) are dead `href="#"` links — clicking them does nothing. | |
| Catalog stats (API-level) | N/A (no UI wired) | `GET /api/books/stats` as admin | `authorize('admin')`-gated; returns book stats from `BookController.getStats` | |
| Book CRUD — create | N/A (no UI wired) | `POST /api/books` as admin with book fields (title, author, year, isbn13, category, buyPrice, rentPrice, serialNumber, pages, etc. — see `backend/src/models/Book.ts` for full required field list) | `authorize('admin')`-gated; creates book | |
| Book CRUD — update | N/A (no UI wired) | `PUT /api/books/:id` as admin | `authorize('admin')`-gated | |
| Book CRUD — delete | N/A (no UI wired) | `DELETE /api/books/:id` as admin | `authorize('admin')`-gated | |
| View all rentals | N/A (no UI wired) | `GET /api/rentals/all` as admin | Works (shared with librarian role) | |
| View all rentals stats | N/A (no UI wired) | `GET /api/rentals/stats` as admin | Works | |
| User management — list all users | N/A (no UI wired) | `GET /api/users/all` as admin | `authorize('admin')`-gated; `UserController.getAllUsers` | |
| User management — user stats | N/A (no UI wired) | `GET /api/users/stats` as admin | `authorize('admin')`-gated | |
| User management — suspend | N/A (no UI wired) | `PATCH /api/users/:id/suspend` as admin | `authorize('admin')`-gated; `UserController.suspendUser` flips `isActive` | |
| User management — delete | N/A (no UI wired) | `DELETE /api/users/:id` as admin | `authorize('admin')`-gated; `UserController.deleteUser` | |
| User management — activate | N/A | No separate "activate" endpoint exists — only the single `PATCH /api/users/:id/suspend` toggle in `backend/src/routes/users.ts`. Verify whether calling it twice toggles `isActive` back to `true`, since there is no dedicated reactivation route. | |

**Important overall finding for Admin and Librarian:** every backend route listed above for these two roles is real and enforced server-side, but **no admin or librarian frontend page actually calls them.** The `/admin` and `/librarian` pages you can click to in the browser are static design mockups with hardcoded numbers and dead links. To genuinely test admin/librarian-gated functionality you must call the API directly (curl/Postman/Thunder Client) with a Bearer token from an admin or librarian login.

---

## 3. CROSS-ROLE EDGE CASES TO TEST

### Tier limit enforcement (renting beyond Basic tier's maxBooks)
Tiers are defined in `backend/src/config/config.ts`:
```
Basic:   maxBooks: 3,  maxDays: 14, discount: 0
Student: maxBooks: 5,  maxDays: 21, discount: 0.15
Premium: maxBooks: 10, maxDays: 30, discount: 0, freeReservations: true
```
1. Log in as `member@bookhaven.com` (membership = `Basic`, `maxBooks: 3`). The seed already creates 2 active rentals for this user.
2. Rent one more book via `/books/[id]` → RENT to reach 3 active rentals (the tier limit).
3. Attempt to rent a 4th book.
4. Expected: `POST /api/rentals` returns 400 with message `"Your Basic plan allows maximum 3 books at a time (exceeds active rental limit)"` (from `RentalService.rentBook`). **Caveat:** because the frontend silently swallows rent API errors and shows a fake success dialog (see Member table above), you must check the Network tab or `/my-library`/DB to confirm the 4th rental was actually rejected, not just trust the on-screen "Process Completed" message.

### Overdue fine calculation
The penalty rate is `config.rental.penaltyPerDay = 0.5` (per `backend/src/config/config.ts`), applied in `calculatePenalty()` (`backend/src/utils/helpers.ts`) and mirrored client-side in `payments/page.tsx`'s `getPenaltyAmount`.

1. Find an active rental's `_id` (the seed data already includes one overdue-by-5-days rental for `member@bookhaven.com` against ISBN `9780465050659`/"The Design of Everyday Things" — you can use that directly, or backdate another rental):
   ```js
   use bookhaven
   db.rentals.find({ status: "active" }, { _id: 1, toDate: 1, user: 1 })
   ```
2. To backdate a rental's due date to force/extend an overdue state, update the `toDate` field (exact field name per `backend/src/models/Rental.ts`):
   ```js
   db.rentals.updateOne(
     { _id: ObjectId("PASTE_RENTAL_ID") },
     { $set: { toDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } // 7 days overdue
   )
   ```
3. Log in as the rental's owner, go to `/payments` → **Pending Dues** tab.
4. Expected: the rental appears with "Overdue" days count and "Penalty: Rs.X.XX" where X = `overdueDays * 0.5` (e.g. 7 days overdue → Rs.3.50). Click **Pay Now** to confirm the modal shows the same amount, then complete payment via Card or Credit to verify `POST /api/payments/card` or `/credit` succeeds and the rental disappears from Pending Dues after returning (note: payment alone does not mark the rental `returned` — only `POST /api/rentals/return` does that, which has no wired UI button, see Section 2).

### Stock hitting zero
1. Pick a book with low `hardCopyCount` (seed creates several with `hardCopyCount: 1` via `i % 3 === 0` and some with `0` via `i % 5 === 0` in the "Dummy Book" generation loop), or directly set it:
   ```js
   db.books.updateOne({ isbn13: "9780321965516" }, { $set: { hardCopyCount: 1 } })
   ```
2. Rent that book's last copy as a member (`/books/[id]` → RENT). `RentalService.rentBook` calls `bookRepo.decrementHardCopy` and, when the count reaches 0, sets the book's `status` to `'borrowed'`.
3. Confirm via `GET /api/books/:id` (or `db.books.findOne(...)`) that `hardCopyCount` is now `0` and `status` is `"borrowed"`.
4. Reload the book detail page (`/books/[id]`) and confirm the "Hard Copy" row shows "Unavailable" with a red dot (per the `book.hardCopyCount > 0` conditional in `books/[id]/page.tsx`).
5. Attempt to rent again — expect backend 400 `"No hard copies available"` (again, verify via network tab since the rent-error UI is faked into a success screen).

### Role-gating — admin-only route hit by a logged-in member
1. Log in as `member@bookhaven.com` via `/login` (or `POST /api/auth/login`) and copy the JWT from the response (`data.token`) or from `localStorage.getItem('token')` in devtools.
2. From a terminal, hit an admin-only route, e.g. `GET /api/users/all`:
   ```bash
   curl -X GET http://localhost:5000/api/users/all \
     -H "Authorization: Bearer <MEMBER_JWT>"
   ```
3. Expected: HTTP 403 with body `{"success":false,"message":"Access forbidden. Insufficient permissions."}` (from `authorize()` in `backend/src/middleware/auth.ts`). Confirm the request never reaches `UserController.getAllUsers`.
4. As a secondary check, also try the same call with no `Authorization` header at all — expect HTTP 401 `{"success":false,"message":"Access denied. No token provided."}`.

---

## 4. KNOWN GAPS TO EXPECT

These are pre-existing, previously-audited limitations of the prototype. Encountering them during testing is expected behavior, not a new bug to file:

- No cancel/undo for an in-progress rental once submitted.
- No tier-based restriction on the date picker in the rent dialog (a Basic-tier user can pick a `toDate` far beyond their tier's `maxDays`; the UI does not clamp the date range even though `config.rental.tiers[...].maxDays` exists server-side and is never enforced in `RentalService.rentBook`).
- No help/FAQ/tooltips anywhere in the app (note: a `/support` page does exist with a contact form, but it is not linked from the Navbar or any in-app entry point, so most users will never discover it).
- Browse page genre filter (`activeGenre` state) is not persisted across navigation — leaving and returning to `/browse` resets to "All".
- No reading progress bar/percentage indicator on the e-reader (`/read/[id]`) — only a static "Page 1 / {book.pages}" label that never updates.
- No loading feedback/spinner during the Khalti or eSewa external redirect (`window.location.href = payment_url` and the auto-submitting hidden eSewa form both navigate away with no visible "redirecting..." state).
- Inconsistent icon button sizing across pages (e.g. notification bell, heart/wishlist icons, share/notes icons vary in size and padding between Navbar, Book Detail, and Browse).
- Scattered/inconsistent filter and sort UI patterns between Browse, Search, and My Library (different tab styles, no shared component).
- No confirmation dialog before destructive/state-changing actions like return or cancel (moot for Return specifically right now since its button has no handler at all — see Member table).
- Inconsistent use of loading skeletons — some pages show a spinner + text ("Loading payments..."), others show plain "Loading..." text, others show nothing during fetch.
- No visual distinction between "low stock" (e.g. `hardCopyCount: 1`) and "out of stock" (`hardCopyCount: 0`) — both states only differ by the displayed number; there's no Von-Restorff-style warning color/badge for low stock specifically (only a binary green/red dot for available/unavailable).
- The book-detail rental dialog (`/books/[id]` RENT button) does not pre-check `hardCopyCount` client-side before opening the form — a user can fill out the entire rent form for an out-of-stock book and only find out it's rejected after submitting (and even then, the UI fakes a success screen regardless, per the Member table caveat above).

### Additional gaps discovered during this audit (beyond the pre-existing list above)
- **No librarian account is seeded**, and there is no UI or API path for self-service librarian account creation — must be done via direct MongoDB edit (see Section 1).
- **Admin (`/admin`) and Librarian (`/librarian`) dashboards are entirely static mockups** — none of their displayed stats or nav links are wired to real API calls, despite the corresponding backend endpoints (`/books/stats`, `/users/all`, `/users/stats`, `/rentals/all`, `/rentals/stats`, book CRUD, user suspend/delete) being fully implemented and role-gated correctly server-side.
- **Wishlist is entirely fake** — no backend model field, no API endpoint; the `/wishlist` page mock-fetches 3 arbitrary books from `/books/all` and presents them as saved wishlist items; heart-icon toggles elsewhere in the app (Browse, Book Detail) are local-only and never persisted.
- **The "Return" button on `/my-library`** has no click handler — the real `POST /api/rentals/return` endpoint works but nothing in the UI calls it.
- **The e-reader (`/read/[id]`) ignores `book.eBookAvailable`** entirely and always gates access behind a fake $9.99 paywall with a mock payment form that never calls any backend endpoint — it just sets local state after a timeout.
- **The rent dialog silently fakes success on API failure** (`books/[id]/page.tsx`'s `handleRent` catch block explicitly simulates success), so testers must verify rentals via `/my-library` or the database rather than trusting the on-screen confirmation.
- **Account Setting profile fields (Address, Phone, Bio) are editable in the UI but not persisted** — only `name` and `avatar` are sent to `PUT /api/users/profile`.
- **Notification preference toggles on `/account` are non-functional** (uncontrolled `defaultChecked` inputs, no save action), despite a working `PUT /api/users/notifications` endpoint and a matching `notificationPreferences` schema on the `User` model.
- **The Navbar notification bell dropdown is hardcoded** and never calls `GET /api/notifications`, `GET /api/notifications/unread-count`, or `PUT /api/notifications/read-all`.
- **User management has no "activate" endpoint** distinct from `suspend` — verify whether `PATCH /api/users/:id/suspend` toggles `isActive` or only ever sets it to `false`, since there is no separate reactivation route in `backend/src/routes/users.ts`.
