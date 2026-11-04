# HARY Backend: Flow and Endpoints for the Frontend

Base URL: `http://localhost:<APP_PORT>/api`

Every error response looks like this:

```json
{ "status": 400, "message": "quantity: max item reached (10) per ticket" }
```

Validation errors come back as 400, with the failing field name at the start of `message`.

---

## 1. Auth

### How tokens work

- **Access token:** returned in `data.token` when the user signs up, signs in or refreshes. Keep it **in memory** (a store or context), not in localStorage. Send it on every protected request:
  `Authorization: Bearer <token>`
- **Refresh token:** set as an **httpOnly cookie** (`refresh-token`, valid for 7 days). JavaScript can't read it, and it doesn't need to.
- Turn on `withCredentials: true` (axios) or `credentials: "include"` (fetch) for every request. Without it, the cookie isn't sent or saved.

### On app load, and when a request returns 401

1. Call `POST /auth/refresh`. The cookie is sent automatically, and the response contains a new `data.token`.
2. If refresh also returns 401, the user is logged out. Send them to the login page.

### Endpoints

| Method | Path | Auth | Body |
|---|---|---|---|
| POST | `/auth/customer/sign-up` | none | multipart: `name`, `email`, `password`, `userType="CUSTOMER"`, `referredByCode?`, `profilePicture?` (file) |
| POST | `/auth/organizer/sign-up` | none | multipart: `name`, `email`, `password`, `eventOrganizerName` (no spaces), `userType="ORGANIZER"`, `role?` (`ADMIN` \| `SUPER_ADMIN`), `profilePicture?` (file) |
| POST | `/auth/customer/sign-in` | none | `{ email, password, userType: "CUSTOMER" }` |
| POST | `/auth/organizer/sign-in` | none | `{ email, password, userType: "ORGANIZER", role? }` |
| POST | `/auth/refresh` | cookie | none |
| POST | `/auth/sign-out` | token | none (clears the cookie) |
| GET | `/auth/credential` | token | none (returns the logged-in user's token payload) |

Sign-in and sign-up both return `{ message, data: { token, user } }`.

Customers and organizers are **separate accounts**, so the login screen needs a Customer / Organizer toggle.

---

## 2. Points

| Method | Path | Auth | Query |
|---|---|---|---|
| GET | `/points?limit=12&cursor=<uuid>` | customer token | `limit` (1-50, default 12), `cursor` (optional) |

Points are ordered by `expiresAt` ascending, with the soonest expiration first. The response includes `pagination.pointTotal`, `hasNextPage`, and `nextCursor`.

---

## 3. Profile

The same routes exist for both account types: use `/customer/...` or `/organizer/...`.

| Method | Path | Body |
|---|---|---|
| GET | `/{customer\|organizer}/profile` | none |
| PATCH | `/{customer\|organizer}/profile` | `{ name?, email? }` |
| PATCH | `/{customer\|organizer}/profile-picture` | multipart: `profilePicture` (file) |
| PATCH | `/{customer\|organizer}/password` | `{ newPassword }` (minimum 6 characters) |

---

## 4. Events

### Public list (no login needed)

`GET /events/all-event?limit=12&cursor=<id>&search=<text>&from=YYYY-MM-DD&to=YYYY-MM-DD`

- Only events that **haven't ended** are returned.
- `search` matches the event name, description and organizer name.
- `from` and `to` must be sent **together** (a date range).
- Pagination uses a **cursor** ("load more" or infinite scroll):

```json
{
  "data": [ { ...event, "minTicketPrice": 50000, "maxTicketPrice": 150000 } ],
  "pagination": { "eventTotal": 34, "hasNextPage": true, "nextCursor": "<uuid>" }
}
```

To load the next page, send `cursor=<nextCursor>`. Stop when `hasNextPage` is `false`.
Free events have no `minTicketPrice` or `maxTicketPrice`.

### Event detail (login required)

`GET /events/:id`: returns the event with its `ticketTypes` and `vouchers`.

> A guest who opens an event detail page gets **401**. Show a "log in to view" prompt, or send them to the login page.

### Organizer: manage events

| Method | Path | Body |
|---|---|---|
| POST | `/events/event` | multipart (see below) |
| PATCH | `/events/organizer/edit-event` | multipart, the same fields plus `id` |
| GET | `/events/organizer/all-event?limit&cursor&search&from&to` | the organizer's own events (including finished ones) |
| GET | `/events/organizer/all-event/transaction-summary?...` | per event: total, pending, done, expired, cancelled and rejected counts |
| GET | `/events/organizer/reports?groupBy=month&from=YYYY-MM-DD&to=YYYY-MM-DD&limit=12&cursor=<uuid>` | dashboard/report data scoped to the organizer's `eventOrganizerName` |
| GET | `/events/event/:id` | customers who bought tickets for this event |
| GET | `/events/organizer/events/:id/attendees?limit=12&cursor=<uuid>` | paginated confirmed attendee list: name, ticket quantity, and total price paid |

The attendee endpoint is new and does not change the existing `/events/event/:id` response. It returns only `DONE` transactions for events owned by the authenticated organizer.

For reports, `groupBy` accepts `year`, `month` or `day` (default `month`). `from` and `to` are optional but must be sent together; both boundary dates are included. Without a range, daily reports cover 30 days, monthly reports cover 12 months and yearly reports cover 5 calendar years. Event list pagination uses `limit` (1-50, default 12) and `cursor`.

The report includes event totals by schedule (upcoming, ongoing, completed); transaction totals by status; completed tickets and revenue; payments awaiting organizer confirmation; a time series with transactions, completed transactions, tickets sold and revenue; and paginated event details with transaction count, tickets sold, revenue, review count and average rating. Revenue and tickets sold count `DONE` transactions only. Transaction and review metrics are filtered by their creation date; event schedule counts reflect the current date.

**Multipart fields for creating or editing an event.** Every field is sent as a string:

| Field | Example |
|---|---|
| `name` | `Jazz Night` |
| `description`, `category`, `location` | text |
| `startDate`, `endDate` | `2026-12-01` |
| `availableSeats` | `100` |
| `isFree` | `true` / `false` |
| `ticketTypes` | `JSON.stringify([{ "name": "VIP", "price": 150000 }])`, required when `isFree=false` |
| `eventPicture` | file (optional) |

Ticket types **can't be changed** once an event has transactions (the server returns 409).

---

## 4. Vouchers (organizer)

`POST /voucher/:eventId`

```json
{ "code": "HARY10", "discountAmount": 10000, "startDate": "2026-11-01", "endDate": "2026-11-30" }
```

- `code`: 3–20 letters or digits, saved in uppercase.
- Only the organizer who owns the event can do this. Anyone else gets 403.
- A voucher is **shared**: any customer can use it on that event while it's valid.

---

## 5. Customer purchase flow

### Statuses

```
            checkout
               │
               ▼
      ┌─ WAITING_PAYMENT ──(customer edits the cart: quantity, voucher, coupon, points)
      │        │
      │        │ upload payment proof         [NOT BUILT YET]
      │        ▼
      │  WAITING_CONFIRMATION
      │        │
      │        ├── organizer approves ─► DONE
      │        └── organizer rejects ─► REJECTED   (seats, coupon and points returned)
      │
      ├── customer cancels ─────────────► CANCELED   (seats, coupon and points returned)
      └── payment window passes ───────► EXPIRED    [expiry job NOT BUILT YET]

Free event: checkout goes straight to DONE.
```

### Step 1: Checkout (holds the seats)

`POST /transaction`: customer only

```json
{ "ticketTypeId": "<uuid>", "quantity": 2 }
```

- Returns **201** with the transaction (`status: WAITING_PAYMENT`, `totalPrice`, `expiresAt`).
- The seats are **held right away**, and the customer has **1 hour** to pay (`expiresAt`). Show a countdown.
- Each transaction holds **one ticket type**, with **1–10** tickets.
- Possible errors:
  - **409:** the customer already has an open cart for this event. Send them to that cart instead.
  - **400:** the event has ended, or there aren't enough seats.

### Step 2: Edit the cart (while `WAITING_PAYMENT`)

`PATCH /transaction/:id`: customer only

```json
{ "quantity": 3, "voucherId": "<uuid> | null", "couponId": "<uuid> | null", "usePoints": true }
```

- **Send the full cart state every time.** A missing or `null` `voucherId` or `couponId` means "no voucher" or "no coupon".
- The server recalculates and returns the transaction with the new `totalPrice` and `pointsUsed`. **Show the server's numbers**; don't calculate prices in the UI.
- Discounts are applied in this order, and the price never goes below 0: **voucher → coupon → points**.
- Each kind of discount:
  - **voucher:** comes from the event's `vouchers` in the event detail response. It must belong to this event and still be valid.
  - **coupon:** belongs to the customer and can be used once. It's freed again if the cart is changed, cancelled or rejected.
  - **points:** when `usePoints` is true, the customer's points cover the rest of the price, starting with the ones that expire soonest.
- Debounce quantity changes (for example 300–500 ms), so you don't send one request per click.
- Possible errors:
  - **403:** not the customer's cart.
  - **409:** the cart can no longer be edited.
  - **400:** the cart has expired, the voucher or coupon is invalid, or there aren't enough seats.
  - **404:** the voucher or coupon wasn't found.

### Step 3: Cancel

`PATCH /transaction/:id/cancel`: customer only

- Works while the status is `WAITING_PAYMENT` or `WAITING_CONFIRMATION`.
- Seats, the coupon and any points are returned. **Note:** returned points get a new expiry date, 90 days from the cancellation.
- Returns **409** if the transaction is already final.

### Step 4: Upload payment proof [NOT BUILT YET]

This is planned as `PATCH /transaction/:id/payment-proof`, multipart with a `paymentProof` file. It will move the status to `WAITING_CONFIRMATION`.

---

## 6. Organizer: approve or reject

`PATCH /transaction/status`: organizer with the `SUPER_ADMIN` role

```json
{ "id": "<transactionId>", "status": "DONE" }      // approve
{ "id": "<transactionId>", "status": "REJECTED" }  // reject
```

- This only works when the transaction is `WAITING_CONFIRMATION`. Otherwise the server returns **409**.
- The organizer can only act on transactions for **their own** events. Otherwise the server returns **403**.
- **Approve:** the coupon becomes permanently redeemed.
- **Reject:** seats, the coupon and points go back to the customer.

To view a transaction's payment proof (organizer with the `ADMIN` or `SUPER_ADMIN` role): `GET /transaction/:id`, which returns `data` as the proof image URL.

---

## 7. Not built yet

The UI should not wait on these yet:

- Uploading the payment proof (step 4).
- A "my transactions" list and a single-transaction view for customers.
- A list of an organizer's transactions that are waiting for confirmation (for now, use the transaction summary).
- An endpoint for a customer's coupons and point balance (needed for the cart's coupon picker and points toggle).
- Looking up a voucher by its code. For now, choose a voucher from the event detail's `vouchers` list.
- The expiry job (`EXPIRED` status).
- Reviews and ratings.
