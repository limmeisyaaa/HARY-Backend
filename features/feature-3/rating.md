# Feature 2 — Reviews & Organizer Rating

## Goal
Let customers review events they attended, and show the **organizer's rating** on their upcoming events so new buyers can judge whether to trust them.

## Core idea
- A review is **written for one finished event**.
- A review is **displayed on the organizer's other (upcoming) events**.
- Events do not need to repeat — reviews from past events build the organizer's reputation.

```
Review → Event → Organizer (eventOrganizerName)
```

Example on an upcoming event page:
```
by JakartaFest  ★ 4.7 (85 reviews)
Recent reviews of JakartaFest events:
★★★★★ "Great sound!"          — on Jazz Evening (Aug 2026)
★★★★☆ "Long queue at entry"   — on Indie Fest (Sep 2026)
```

## Data model
Uses the existing `Review` table — no new table needed.

| Field | Type | Notes |
|---|---|---|
| `id` | uuid | |
| `customerId` | uuid | who wrote it |
| `eventId` | uuid | which event it is about |
| `rating` | int | 1–5 (enforced in Zod) |
| `comment` | string | currently required — consider `String?` to allow rating-only |
| `createdAt` | datetime | |

**Proposed schema change (needs a migration, coordinate with team):**
- `@@unique([customerId, eventId])` — one review per customer per event.

Organizer identity = `eventOrganizerName` (several organizer accounts can share one organization).

## Event status (derived, no column)
| Status | Rule |
|---|---|
| Upcoming | `now < startDate` |
| Ongoing | `startDate ≤ now ≤ endDate` |
| Finished | `now > endDate` |

## Endpoints

### 1. Create review — customer only
`POST /api/events/:eventId/reviews`

Body (JSON):
```json
{ "rating": 5, "comment": "Great event!" }
```

Rules (checked in service):
- Event exists → else `404`
- Event is **finished** (`endDate < now`) → else `400`
- Customer has a transaction for this event with status `DONE` → else `403`
- Customer has not reviewed this event yet → else `409`
- `rating` 1–5, `comment` max length (e.g. 500) → else `400`

Response `201`: the created review.

### 2. Reviews of one event — public
`GET /api/events/:eventId/reviews?limit=10&cursor=<id>`

For a finished event's own page / organizer profile history.

Response:
```json
{
  "message": "...",
  "data": {
    "averageRating": 4.5,
    "totalReviews": 12,
    "items": [ { "id", "rating", "comment", "createdAt", "customer": { "name", "profilePicture" } } ],
    "nextCursor": "<id>" | null
  }
}
```

### 3. Organizer rating summary — public
`GET /api/organizers/:eventOrganizerName/reviews?limit=5&cursor=<id>`

Shown on **upcoming** event pages and the organizer profile. Aggregates reviews across **all** events of that organizer.

Response:
```json
{
  "message": "...",
  "data": {
    "averageRating": 4.7,
    "totalReviews": 85,
    "items": [ { "id", "rating", "comment", "createdAt",
                 "customer": { "name", "profilePicture" },
                 "event": { "id", "name", "endDate" } } ],
    "nextCursor": "<id>" | null
  }
}
```

### 4. (Optional) Rating on event list cards
Add `organizerRating: { average, count }` to each item in `getEventsPaginated` (public + organizer lists), same place `lowestPrice` / `bestVoucher` were calculated.

## Backend structure
Follow the voucher module pattern:
- `src/validators/review.validator.ts` — create body, params, pagination query
- `src/repositories/review.repository.ts` — create, findByCustomerAndEvent, findByEventPaginated, findByOrganizerPaginated, aggregate
- `src/modules/review/review.service.ts` — rules above, cursor pagination
- `src/modules/review/review.controller.ts`
- `src/routers/review.router.ts` — mount in `app.ts`

Guards:
- Create → `verifyAccessToken` + `userTypeGuard("CUSTOMER")`
- Lists → public

Customer data in responses: only `name` and `profilePicture` — never email.

## Frontend
- **Upcoming event detail page:** organizer block with ★ average + count, latest 3–5 reviews (each labelled with the past event name), "See all reviews" → organizer reviews page.
- **Customer "My tickets" / transaction history:** "Write a review" button on finished events with `DONE` transactions that have no review yet.
- **Review form:** 1–5 star picker + comment textarea; show backend error messages (already reviewed, event not finished, etc.).
- **Organizer dashboard (optional):** list of reviews for their events.
- Lists use the same infinite-scroll pattern as events (`limit` + `nextCursor`).

## Open questions for the team
1. Should `comment` be optional (rating-only reviews)?
2. Can customers edit or delete their review?
3. Add `@@unique([customerId, eventId])` migration — who runs it?
4. Show organizer rating on event list cards, or only on the detail page?
5. Minimum review count before showing an average (e.g. hide until ≥ 3 reviews)?
