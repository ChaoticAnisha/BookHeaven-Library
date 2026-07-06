# BookHeaven Library Management System

A smart, digital-first bookstore and library management system. Built autonomously, adhering to strict design guidelines and usability heuristics.

## Tech Stack
- **Frontend**: Next.js (App Router), React, Tailwind CSS, Framer Motion, Radix UI, Lucide Icons, Axios, Zustand
- **Backend**: Node.js, Express.js, TypeScript, MongoDB (Mongoose), JWT Auth, Khalti Payment Integration

## UX Laws Applied (Nielsen's 10 Heuristics)
1. **Visibility of system status**: Spinners during loading, "Processing..." on buttons, toast notifications on success/error.
2. **Match between system and real world**: Using words like "Rent", "My Library", "Overdue", and familiar icons (Heart for Wishlist).
3. **User control and freedom**: "Back" buttons on detail pages, "Undo" toasts for wishlist removal.
4. **Consistency and standards**: Same Sidebar/Navbar on all authenticated pages. Uniform card styles and button layouts.
5. **Error prevention**: Disabled buttons during submission, form validation, date validation (return date > borrow date).
6. **Recognition rather than recall**: Dropdowns for search filters and genres, recent readings, visual cues for overdue books.
7. **Flexibility and efficiency of use**: Quick actions for adding to wishlist, one-click preview, keyboard navigable tabs.
8. **Aesthetic and minimalist design**: Deep blue/purple gradients (#1A1A2E background) to make content pop in the #F8FAFC inner frame. Max 3-5 options visible.
9. **Help users recognize, diagnose, and recover from errors**: Clear empty states ("No books found", "Try different keyword").
10. **Help and documentation**: Tooltips (mocked), About/Support links, clear modal instructions.



