import EventRepository from "../../repositories/event.repository";
import { EventInputSchema } from "../../validators/event.validator";

const EventService = {
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