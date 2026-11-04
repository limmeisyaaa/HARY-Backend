import { TransactionStatus } from "../../generated/prisma";
import EventReportRepository from "../../repositories/event-report.repository";
import { EventReportQuery } from "../../validators/event-report.validator";

const startOfUtcDay = (date: Date) =>
  new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));

const addUtcDays = (date: Date, days: number) =>
  new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + days));

const getDefaultFrom = (groupBy: EventReportQuery["groupBy"], now: Date) => {
  if (groupBy === "year") {
    return new Date(Date.UTC(now.getUTCFullYear() - 4, 0, 1));
  }
  if (groupBy === "day") {
    return addUtcDays(startOfUtcDay(now), -29);
  }
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 11, 1));
};

const EventReportService = {
  getOrganizerReport: async (eventOrganizerName: string, query: EventReportQuery) => {
    const now = new Date();
    const from = query.from
      ? new Date(`${query.from}T00:00:00.000Z`)
      : getDefaultFrom(query.groupBy, now);
    const toExclusive = query.to
      ? addUtcDays(new Date(`${query.to}T00:00:00.000Z`), 1)
      : addUtcDays(startOfUtcDay(now), 1);

    const [
      fetchedEvents,
      eventTotal,
      scheduleCounts,
      groupedTransactions,
      timelineRows,
    ] = await Promise.all([
      EventReportRepository.findEvents(eventOrganizerName, query.limit, query.cursor),
      EventReportRepository.countEvents(eventOrganizerName),
      EventReportRepository.countEventsBySchedule(eventOrganizerName, now),
      EventReportRepository.groupTransactionsByStatus(eventOrganizerName, from, toExclusive),
      EventReportRepository.getTimeline(eventOrganizerName, query.groupBy, from, toExclusive),
    ]);

    const hasNextPage = fetchedEvents.length > query.limit;
    const events = hasNextPage
      ? fetchedEvents.slice(0, query.limit)
      : fetchedEvents;
    const eventIds = events.map(({ id }) => id);

    const [eventTransactions, eventReviews] = await Promise.all([
      EventReportRepository.groupTransactionsByEventAndStatus(
        eventOrganizerName,
        eventIds,
        from,
        toExclusive,
      ),
      EventReportRepository.groupReviewsByEvent(
        eventOrganizerName,
        eventIds,
        from,
        toExclusive,
      ),
    ]);

    const statusSummary = {
      total: 0,
      waitingPayment: 0,
      waitingConfirmation: 0,
      done: 0,
      rejected: 0,
      expired: 0,
      canceled: 0,
    };
    let ticketsSold = 0;
    let revenue = 0;
    let pendingPaymentAmount = 0;

    for (const row of groupedTransactions) {
      const count = row._count._all;
      statusSummary.total += count;
      switch (row.status) {
        case TransactionStatus.WAITING_PAYMENT:
          statusSummary.waitingPayment = count;
          break;
        case TransactionStatus.WAITING_CONFIRMATION:
          statusSummary.waitingConfirmation = count;
          pendingPaymentAmount += Number(row._sum.totalPrice ?? 0);
          break;
        case TransactionStatus.DONE:
          statusSummary.done = count;
          ticketsSold += row._sum.quantity ?? 0;
          revenue += Number(row._sum.totalPrice ?? 0);
          break;
        case TransactionStatus.REJECTED:
          statusSummary.rejected = count;
          break;
        case TransactionStatus.EXPIRED:
          statusSummary.expired = count;
          break;
        case TransactionStatus.CANCELED:
          statusSummary.canceled = count;
          break;
      }
    }

    const transactionsByEvent = new Map<string, {
      transactionCount: number;
      ticketsSold: number;
      revenue: number;
    }>();
    for (const row of eventTransactions) {
      const eventStats = transactionsByEvent.get(row.eventId) ?? {
        transactionCount: 0,
        ticketsSold: 0,
        revenue: 0,
      };
      eventStats.transactionCount += row._count._all;
      if (row.status === TransactionStatus.DONE) {
        eventStats.ticketsSold += row._sum.quantity ?? 0;
        eventStats.revenue += Number(row._sum.totalPrice ?? 0);
      }
      transactionsByEvent.set(row.eventId, eventStats);
    }

    const reviewsByEvent = new Map(
      eventReviews.map((row) => [row.eventId, {
        reviewCount: row._count._all,
        averageRating: row._avg.rating,
      }]),
    );

    return {
      dateRange: { from, to: new Date(toExclusive.getTime() - 1) },
      overview: {
        events: { total: eventTotal, ...scheduleCounts },
        transactions: statusSummary,
        ticketsSold,
        revenue,
        pendingPaymentAmount,
      },
      timeline: timelineRows.map((row) => ({
        period: row.period,
        transactions: Number(row.transaction_count),
        completedTransactions: Number(row.done_count),
        waitingPayment: Number(row.waiting_payment_count),
        waitingConfirmation: Number(row.waiting_confirmation_count),
        ticketsSold: Number(row.tickets_sold),
        revenue: Number(row.revenue),
      })),
      events: events.map((event) => ({
        ...event,
        ...(transactionsByEvent.get(event.id) ?? {
          transactionCount: 0,
          ticketsSold: 0,
          revenue: 0,
        }),
        ...(reviewsByEvent.get(event.id) ?? {
          reviewCount: 0,
          averageRating: null,
        }),
      })),
      pagination: {
        eventTotal,
        hasNextPage,
        nextCursor: hasNextPage ? events[events.length - 1].id : null,
      },
    };
  },
};

export default EventReportService;
