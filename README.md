Event Management Platform (MVP)
A full-stack, feature-rich Event Management and Ticketing Platform built with Node.js, Express.js, TypeScript, and Prisma ORM. 
This application allows event organizers to create, manage, and promote events, while customers can seamlessly discover events, apply vouchers/coupons, use points, and purchase tickets with automated transaction handling.

🚀 Tech Stack
Runtime: Node.js

Framework: Express.js

Language: TypeScript

ORM: Prisma

Database: PostgreSQL

Authentication: JWT (JSON Web Tokens) & bcrypt

Email Service: Nodemailer

✨ Core Features & Specifications
1. Event Discovery, Creation & Management
Landing Page & Browsing: Browse upcoming events with filters for category, location, and price (IDR currency only).

Search: Dynamic search bar featuring debounce functionality and graceful handling of empty search states.

Event Creation & Pricing: Organizers can create free or paid events, set ticket types, available seats, and schedule start/end dates.

Promotions & Vouchers: Organizers can issue limited-time, event-specific discount vouchers.

2. Transaction & Ticketing Lifecycle
Status Workflow: Supports 6 transaction states: waiting for payment, waiting for admin confirmation, done, rejected, expired, and canceled.

Payment Proof & Timers:

2-hour countdown for users to upload payment proof.

Automatic expiration if no proof is uploaded within 2 hours.

Automatic cancellation if the organizer fails to accept/reject within 3 days.

Inventory & Asset Rollback: Automatic restoration of available seats, points, and coupons if a transaction is canceled or rejected. Uses SQL transactions for data integrity.

Point & Coupon Usage: Customers can apply system-wide coupons and loyalty points (IDR-based) to reduce checkout totals.

3. User Authentication, Roles & Referral System
Roles: Role-Based Access Control (RBAC) separating Customer and Event Organizer roles.

Referral System:

New users registering with a referral code receive a discount coupon (valid for 3 months).

Referrers earn 10,000 points (valid for 3 months before expiration).

Profile Management: Update profiles, manage profile pictures, and change/reset passwords securely.

4. Organizer Dashboard & Analytics
Statistics & Reports: Graphical visualization of event sales and analytics broken down by year, month, and day.

Transaction Management: Review, accept, or reject customer payment proofs with automated email notifications.

Attendee Tracking: Comprehensive list of attendees per event including ticket quantities and total revenue.
