import AppError from "../../errors/app-error";
import AttendeeRepository from "../../repositories/attendee.repository";
import { AttendeePaginationQuery } from "../../validators/attendee.validator";

const AttendeeService = {
  getEventAttendees: async (
    eventId: string,
    eventOrganizerName: string,
    query: AttendeePaginationQuery,
  ) => {
    const event = await AttendeeRepository.findEventOrganizerName(eventId);
    if (!event) {
      throw new AppError("Event not found!", 404);
    }
    if (event.eventOrganizerName !== eventOrganizerName) {
      throw new AppError("You are not allowed to access this event!", 403);
    }

    const [fetchedAttendees, total] = await Promise.all([
      AttendeeRepository.findByEvent(eventId, query.limit, query.cursor),
      AttendeeRepository.countByEvent(eventId),
    ]);

    const hasNextPage = fetchedAttendees.length > query.limit;
    const attendees = hasNextPage
      ? fetchedAttendees.slice(0, query.limit)
      : fetchedAttendees;

    return {
      attendees: attendees.map((attendee) => ({
        transactionId: attendee.id,
        name: attendee.customer.name,
        ticketQuantity: attendee.quantity,
        totalPricePaid: Number(attendee.totalPrice),
      })),
      pagination: {
        total,
        limit: query.limit,
        hasNextPage,
        nextCursor: hasNextPage
          ? attendees[attendees.length - 1].id
          : null,
      },
    };
  },
};

export default AttendeeService;
