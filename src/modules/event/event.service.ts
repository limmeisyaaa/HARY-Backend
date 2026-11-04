import EventRepository from "../../repositories/event.repository";
import AppError from "../../errors/app-error";
import { EventInputSchema, EventPaginationQuerySchema } from "../../validators/event.validator";
import TransactionRepository from "../../repositories/transaction.repository";
import { uploadEventPicture } from "../cloudinary/cloudinary.service";
import { Prisma, TransactionStatus } from "../../generated/prisma";

const EventService = {
    getActiveEventsPaginated: async (query: EventPaginationQuerySchema) => {
        const now = new Date();
        const [fetchedEvents, eventTotal] = await Promise.all([
            EventRepository.findAllActiveEvent(query.limit, query.cursor, now),
            EventRepository.countActiveEvents(now),
        ]);
        const hasNextPage = fetchedEvents.length > query.limit;
        const events = hasNextPage
            ? fetchedEvents.slice(0, query.limit)
            : fetchedEvents;

        return {
            events: events.map(({ ticketTypes, ...event }) => {
                if (event.isFree) {
                    return event;
                }

                const prices = ticketTypes.map(({ price }) => Number(price));
                return {
                    ...event,
                    minTicketPrice: prices.length > 0 ? Math.min(...prices) : null,
                    maxTicketPrice: prices.length > 0 ? Math.max(...prices) : null,
                };
            }),
            eventTotal,
            hasNextPage,
            nextCursor: hasNextPage ? events[events.length - 1].id : null,
        };
    },

    getEventsPaginated: async (
        where: Prisma.EventWhereInput,
        query: EventPaginationQuerySchema
    ) => {
        const [fetchedEvents, eventTotal] = await Promise.all([
            EventRepository.findEventsPaginated(where, query.limit, query.cursor),
            EventRepository.countEvents(where),
        ]);
        const hasNextPage = fetchedEvents.length > query.limit;
        const pageEvents = hasNextPage
            ? fetchedEvents.slice(0, query.limit)
            : fetchedEvents;
        return {
            events: pageEvents,
            eventTotal,
            hasNextPage,
            nextCursor: hasNextPage ? pageEvents[pageEvents.length - 1].id : null,
        };
    },

    getEventsWithTransactionSummary: async (
        where: Prisma.EventWhereInput,
        query: EventPaginationQuerySchema
    ) => {
        const [fetchedEvents, eventTotal] = await Promise.all([
            EventRepository.findEventsPaginated(where, query.limit, query.cursor),
            EventRepository.countEvents(where),
        ]);
        const hasNextPage = fetchedEvents.length > query.limit;
        const pageEvents = hasNextPage
            ? fetchedEvents.slice(0, query.limit)
            : fetchedEvents;
        const transactionCounts = await TransactionRepository.countTransactionsByEventIds(
            pageEvents.map(({ id }) => id)
        );
        const transactionCountsByEvent = new Map<
            string,
            { total: number; pending: number; done: number, expired: number; cancelled: number; rejected: number }
        >();

        for (const { eventId, status, _count } of transactionCounts) {
            const counts = transactionCountsByEvent.get(eventId) ?? {
                total: 0,
                pending: 0,
                done: 0,
                expired: 0,
                cancelled: 0,
                rejected: 0
            };
            const count = _count._all;

            counts.total += count;
            if (
                status === TransactionStatus.WAITING_PAYMENT ||
                status === TransactionStatus.WAITING_CONFIRMATION
            ) {
                counts.pending += count;
            } else if (status === TransactionStatus.DONE) {
                counts.done += count;
            } else if (status === TransactionStatus.EXPIRED ) {
                counts.expired += count;
            } else if (status === TransactionStatus.CANCELED ) {
                counts.cancelled += count;
            } else if (status === TransactionStatus.REJECTED ) {
                counts.rejected += count;
            } 

            transactionCountsByEvent.set(eventId, counts);
        }

        return {
            events: pageEvents.map((event) => {
                const counts = transactionCountsByEvent.get(event.id) ?? {
                    total: 0,
                    pending: 0,
                    done: 0,
                    expired: 0,
                    cancelled: 0,
                    rejected: 0
                };

                return {
                    eventId: event.id,
                    eventName: event.name,
                    start_date: event.startDate,
                    end_date: event.endDate,
                    availableSeats: event.availableSeats,
                    totalTransaction: counts.total,
                    pendingTransaction: counts.pending,
                    doneTransaction: counts.done,
                    expiredTransaction: counts.expired,
                    cancelledTransaction: counts.cancelled,
                    rejectedTransaction: counts.rejected,
                };
            }),
            eventTotal,
            hasNextPage,
            nextCursor: hasNextPage ? pageEvents[pageEvents.length - 1].id : null,
        };
    },

    getEventById: async (id: string) => {
        const event = await EventRepository.findById(id);
        if (!event) {
            throw new AppError("Event not found!", 404);
        }

        return event;
    },

    createEvent: async (
        organizerId: string,
        organisationName: string,
        data: EventInputSchema,
        eventPictureUrl?: string
    ) => {
        return EventRepository.create({
            organizer: {
                connect: { id: organizerId },
            },
            name: data.name,
            eventOrganizerName: organisationName,
            description: data.description,
            category: data.category,
            location: data.location,
            startDate: new Date(data.startDate),
            endDate: new Date(data.endDate),
            availableSeats: data.availableSeats,
            ...(eventPictureUrl ? { eventPicture: eventPictureUrl } : {}),
            isFree: data.isFree,
            ticketTypes: {
                create: data.ticketTypes,
            },
        });
    },

    editEvent: async (
        organisationName: string,
        data: EventInputSchema,
        eventPictureUrl?: string
    ) => {
        if (!data.id) throw new AppError("Id event missing for edit event!", 400);
        const eventId = data.id;

        const event = await EventRepository.findByIdForUpdate(eventId);
        if (!event) throw new AppError("Event not found!", 404);

        if (event.eventOrganizerName !== organisationName)
            throw new AppError("You are not in organisation that make event, you are not allowed to update this event!", 403);

        const sortTicketTypes = (ticketTypes: { name: string; price: number }[]) =>
            [...ticketTypes].sort((left, right) =>
                left.name.localeCompare(right.name) || left.price - right.price
            );
        const currentTicketTypes = sortTicketTypes(
            event.ticketTypes.map(({ name, price }) => ({ name, price: Number(price) }))
        );
        const requestedTicketTypes = sortTicketTypes(data.ticketTypes);
        const ticketTypesChanged =
            JSON.stringify(currentTicketTypes) !== JSON.stringify(requestedTicketTypes);

        if (ticketTypesChanged && event._count.transactions > 0) {
            throw new AppError("Ticket types cannot be changed after transactions exist!", 409);
        }

        // // Upload gambar baru hanya setelah lolos cek kepemilikan event
        // const eventPictureUrl = eventPicture
        //     ? await uploadEventPicture(eventPicture, organisationName, "ORGANIZER")
        //     : undefined;

        return EventRepository.updateEvent(eventId, {
            ...(eventPictureUrl ? { eventPicture: eventPictureUrl } : {}),
            name: data.name,
            eventOrganizerName: event.organizer.eventOrganizerName,
            description: data.description,
            category: data.category,
            location: data.location,
            startDate: new Date(data.startDate),
            endDate: new Date(data.endDate),
            availableSeats: data.availableSeats,
            isFree: data.isFree,
            ...(eventPictureUrl ? { eventPicture: eventPictureUrl } : {}),
            ...(ticketTypesChanged
                ? {
                      ticketTypes: {
                          deleteMany: {},
                          create: data.ticketTypes,
                      },
                  }
                : {}),
        });
    },

    findCustomersOfEvent: async (eventId: string, organisationName: string) => {
        const event = await EventRepository.findById(eventId);
        if (event?.eventOrganizerName !== organisationName) 
            throw new AppError("You are not in organisation that make event, you are not allowed to access this event!", 403);
    
        return TransactionRepository.findCustomersOfEvent(eventId);
    }
};

export default EventService;