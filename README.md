# Event Management Platform (MVP)

A full-stack event management and ticketing platform built with **Express.js**, **TypeScript**, **Node.js**, and **Prisma**. This application allows organizers to create and promote events, while customers can browse, apply vouchers or system coupons, use points, and purchase tickets.

---

## 🚀 Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Language:** TypeScript
- **ORM:** Prisma
- **Database:** PostgreSQL
- **Authentication:** JWT & bcrypt
- **Email Service:** to be confirm

---

## ✨ Core Features

### 1. Event Discovery, Creation, and Promotion
- **Landing Page & Browsing:** Display upcoming events with filtering options by category, location, and price (IDR currency only).
- **Search Bar:** Integrated search bar with **debounce functionality** and handling for empty states.
- **Event Creation & Pricing:** Organizers can create free or paid events with descriptions, ticket types, available seats, start dates, and end dates.
- **Promotions:** Organizers can create limited-time, event-specific voucher promotions with defined start and end dates.

### 2. Event Transactions
- **Purchasing:** Customers can create transactions to buy event tickets.
- **Transaction Statuses:** Supports 6 statuses: `waiting for payment`, `waiting for admin confirmation`, `done`, `rejected`, `expired`, and `canceled`.
- **Payment Proof & Timer:** 2-hour countdown to upload payment proof after checkout.
- **Automatic Status Changes:** Transactions automatically expire if no payment proof is uploaded within 2 hours, and are canceled if the organizer doesn't accept/reject within 3 days.
- **Rollbacks & Seat Restoration:** Points, vouchers, coupons, and available seats are automatically restored if a transaction is canceled, expired, or rejected (implemented using SQL transactions).
- **Point Usage:** Customers can use loyalty points to reduce payment amounts.

### 3. Event Reviews and Ratings
- **Reviews:** Customers can leave reviews and ratings only after attending the event.
- **Organizer Profile:** Display ratings and reviews on the event organizer's profile.

### 4. User Authentication and Authorization
- **Account Creation & Roles:** Role-based access control protecting pages for `customer` and `event organizer` roles.
- **Referral System:** New users registering with a referral code receive a discount coupon, while referrers earn 10,000 points.
- **Expirations:** Points and referral-based discount coupons expire 3 months after being credited.
- **Profile Management:** Users can edit profiles, change passwords, and reset forgotten passwords.

### 5. Event Management Dashboard
- **Dashboard Access:** Organizers can manage events, transactions, and basic statistics.
- **Statistics Visualization:** Display event data in graphical visualizations and reports broken down by year, month, and day.
- **Transaction Management:** Organizers can accept, reject, and view customer payment proofs.
- **Notification Emails:** Email notifications sent to customers upon transaction acceptance or rejection.
- **Attendee List:** Show attendee lists including names, ticket quantities, and total prices paid.
