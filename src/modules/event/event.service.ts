import EventRepository from "../../repositories/event.repository";
import AppError from "../../errors/app-error";
import { EventInputSchema } from "../../validators/event.validator";
import TransactionRepository from "../../repositories/transaction.repository";

const EventService = {
    getEventById: async (id: string) => {
        const event = await EventRepository.findById(id);
        if (!event) {
            throw new AppError("Event not found!", 404);
        }

        return event;
    },

    createEvent: async (organizerId: string, organisationName: string, data: EventInputSchema) => {
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
            isFree: data.isFree,
            ticketTypes: {
                create: data.ticketTypes,
            },
        });
    },

    editEvent: async (organisationName: string, data: EventInputSchema) => {
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

        return EventRepository.updateEvent(eventId, {
            name: data.name,
            eventOrganizerName: event.organizer.eventOrganizerName,
            description: data.description,
            category: data.category,
            location: data.location,
            startDate: new Date(data.startDate),
            endDate: new Date(data.endDate),
            availableSeats: data.availableSeats,
            isFree: data.isFree,
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