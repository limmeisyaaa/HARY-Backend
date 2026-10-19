import EventRepository from "../../repositories/event.repository";
import AppError from "../../errors/app-error";
import { EventInputSchema } from "../../validators/event.validator";

const EventService = {
    getEventById: async (id: string) => {
        const event = await EventRepository.findById(id);
        if (!event) {
            throw new AppError("Event not found!", 404);
        }

        return event;
    },

    createEvent: async (organizerId: string, data: EventInputSchema) => {
        return EventRepository.create({
            organizer: {
                connect: { id: organizerId },
            },
            name: data.name,
            description: data.description,
            category: data.category,
            location: data.location,
            startDate: new Date(data.startDate),
            endDate: new Date(data.endDate),
            availableSeats: data.availableSeats,
            isFree: data.isFree,
        });
    },

    editEvent: async (id: string, data: EventInputSchema) => {
        return EventRepository.updateEvent(id, data);
    },
};

export default EventService;