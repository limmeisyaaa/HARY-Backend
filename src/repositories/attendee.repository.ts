import AppError from "../errors/app-error";
import { TransactionStatus } from "../generated/prisma";
import { prisma } from "../libs/prisma.client";

const AttendeeRepository = {
  findEventOrganizerName: async (eventId: string) =>
    prisma.event.findUnique({
      where: { id: eventId },
      select: { eventOrganizerName: true },
    }),

  findByEvent: async (eventId: string, limit: number, cursor?: string) => {
    if (cursor) {
      const cursorAttendee = await prisma.transaction.findFirst({
        where: {
          id: cursor,
          eventId,
          status: TransactionStatus.DONE,
        },
        select: { id: true },
      });

      if (!cursorAttendee) {
        throw new AppError("Cursor does not belong to this event's attendees!", 400);
      }
    }

    return prisma.transaction.findMany({
      where: {
        eventId,
        status: TransactionStatus.DONE,
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      select: {
        id: true,
        quantity: true,
        totalPrice: true,
        customer: {
          select: { name: true },
        },
      },
    });
  },

  countByEvent: async (eventId: string) =>
    prisma.transaction.count({
      where: {
        eventId,
        status: TransactionStatus.DONE,
      },
    }),
};

export default AttendeeRepository;
