# BookHeaven Frontend

Next.js frontend using Tailwind CSS for a premium, digital-first experience.

## Layout Structure
- Root Layout loads the `Inter` font.
- Auth Layout provides the #1A1A2E outer frame and the #F8FAFC inner container.
- Navbar and Sidebar remain sticky on all authenticated pages.

## Key Screens & Features
- **Splash Screen (/)**: 2.5s animation before redirecting to login.
- **Login/Register**: Wave gradients and clean inputs.
- **Dashboard (/dashboard)**: Quote card with gradient, horizontal scroll for new arrivals and recommendations.
- **Search (/search)**: Table view of books with availability dots and immediate wishlist toggling.
- **Book Details (/books/[id])**: Rich 3-column layout. Rent modal with date picking and serial code scanning.
- **My Library (/my-library)**: Grid view of rentals. Red dot indicator for overdue books.
- **Payments (/payments)**: Pending payments table. Modal supports Visa (mock) and Khalti (live test) payments.
- **Read Now (/read/[id])**: Simulated e-book reader with 70/30 split for reading and note-taking.

## Running Locally
```bash
npm install
npm run dev
```

The app will be available at http://localhost:3000.
