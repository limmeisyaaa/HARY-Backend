import { Prisma, Event, Transaction } from "../generated/prisma";
import { prisma } from "../libs/prisma.client";

const EventRepository = {
    //can use for Public
    findById: async (id: string): Promise<Event | null> => {
        return await prisma.event.findUnique({
            where: { id },
        });
    },

    findByIdForUpdate: async (id: string) => {
        return await prisma.event.findUnique({
            where: { id },
            include: {
                organizer: {
                    select: { eventOrganizerName: true },
                },
                ticketTypes: true,
                _count: {
                    select: { transactions: true },
                },
            },
        });
    },

    findAllActiveEvent: async (): Promise<Event[] | null> => {
        return await prisma.event.findMany({
            where: { endDate: new Date },
        });
    },

    create: async (data: Prisma.EventCreateInput) => {
        return await prisma.event.create({data});
    },

    findByOrganizerId: async (organizerId: string): Promise<Event[] | null> => {
        return await prisma.event.findMany({
            where: { organizerId: organizerId },
        });
    },

    findAllEventByOrganizerName: async (eventOrganizerName: string): Promise<Event[] | null> => {
        return await prisma.event.findMany({
            where: { eventOrganizerName: eventOrganizerName },
        });
    },

    findActiveEventByOrganizerId: async (organizerId: string): Promise<Event[] | null> => {
        return await prisma.event.findMany({
            where: { 
                organizerId: organizerId,
                endDate: {
                    gt: new Date(),
                },
             },
        });
    },

    updateEvent: async (id: string, data: Prisma.EventUpdateInput) => {
        return await prisma.event.update({
            where: { id: id },
            data,
        });
    }, 
  
}

export default EventRepository;