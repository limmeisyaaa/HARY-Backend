import { Prisma, TransactionStatus } from "../generated/prisma";
import { prisma } from "../libs/prisma.client";

const EventReportRepository = {
  findEvents: async (
    eventOrganizerName: string,
    limit: number,
    cursor?: string,
  ) => prisma.event.findMany({
    where: { eventOrganizerName },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    select: {
      id: true,
      name: true,
      category: true,
      location: true,
      startDate: true,
      endDate: true,
      availableSeats: true,
      isFree: true,
      createdAt: true,
    },
  }),

  countEvents: async (eventOrganizerName: string) => prisma.event.count({
    where: { eventOrganizerName },
  }),

  countEventsBySchedule: async (eventOrganizerName: string, now: Date) => {
    const [upcoming, ongoing, completed] = await Promise.all([
      prisma.event.count({
        where: { eventOrganizerName, startDate: { gt: now } },
      }),
      prisma.event.count({
        where: {
          eventOrganizerName,
          startDate: { lte: now },
          endDate: { gte: now },
        },
      }),
      prisma.event.count({
        where: { eventOrganizerName, endDate: { lt: now } },
      }),
    ]);

    return { upcoming, ongoing, completed };
  },

  groupTransactionsByStatus: async (
    eventOrganizerName: string,
    from: Date,
    toExclusive: Date,
  ) => prisma.transaction.groupBy({
    by: ["status"],
    where: {
      event: { eventOrganizerName },
      createdAt: { gte: from, lt: toExclusive },
    },
    _count: { _all: true },
    _sum: { quantity: true, totalPrice: true },
  }),

  groupTransactionsByEventAndStatus: async (
    eventOrganizerName: string,
    eventIds: string[],
    from: Date,
    toExclusive: Date,
  ) => {
    if (eventIds.length === 0) return [];

    return prisma.transaction.groupBy({
      by: ["eventId", "status"],
      where: {
        eventId: { in: eventIds },
        createdAt: { gte: from, lt: toExclusive },
        event: { eventOrganizerName },
      },
      _count: { _all: true },
      _sum: { quantity: true, totalPrice: true },
    });
  },

  groupReviewsByEvent: async (
    eventOrganizerName: string,
    eventIds: string[],
    from: Date,
    toExclusive: Date,
  ) => {
    if (eventIds.length === 0) return [];

    return prisma.review.groupBy({
      by: ["eventId"],
      where: {
        eventId: { in: eventIds },
        createdAt: { gte: from, lt: toExclusive },
        event: { eventOrganizerName },
      },
      _avg: { rating: true },
      _count: { _all: true },
    });
  },

  getTimeline: async (
    eventOrganizerName: string,
    groupBy: "year" | "month" | "day",
    from: Date,
    toExclusive: Date,
  ) => prisma.$queryRaw<{
    period: Date;
    transaction_count: bigint;
    done_count: bigint;
    waiting_payment_count: bigint;
    waiting_confirmation_count: bigint;
    tickets_sold: bigint;
    revenue: Prisma.Decimal;
  }[]>(Prisma.sql`
    WITH periods AS (
      SELECT generate_series(
        date_trunc(${groupBy}, ${from}::timestamptz),
        date_trunc(${groupBy}, ${toExclusive}::timestamptz - interval '1 millisecond'),
        CASE ${groupBy}
          WHEN 'year' THEN interval '1 year'
          WHEN 'month' THEN interval '1 month'
          ELSE interval '1 day'
        END
      ) AS period
    )
    SELECT
      periods.period,
      COUNT(t.id) AS transaction_count,
      COUNT(t.id) FILTER (WHERE t.status = ${TransactionStatus.DONE}) AS done_count,
      COUNT(t.id) FILTER (WHERE t.status = ${TransactionStatus.WAITING_PAYMENT}) AS waiting_payment_count,
      COUNT(t.id) FILTER (WHERE t.status = ${TransactionStatus.WAITING_CONFIRMATION}) AS waiting_confirmation_count,
      COALESCE(SUM(t.quantity) FILTER (WHERE t.status = ${TransactionStatus.DONE}), 0) AS tickets_sold,
      COALESCE(SUM(t.total_price) FILTER (WHERE t.status = ${TransactionStatus.DONE}), 0) AS revenue
    FROM periods
    LEFT JOIN events AS e
      ON e.event_organizer_name = ${eventOrganizerName}
    LEFT JOIN transactions AS t
      ON t.event_id = e.id
      AND t.created_at >= ${from}
      AND t.created_at < ${toExclusive}
      AND date_trunc(${groupBy}, t.created_at) = periods.period
    GROUP BY periods.period
    ORDER BY periods.period ASC
  `),
};

export default EventReportRepository;
