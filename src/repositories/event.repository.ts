import { Prisma, Event, Transaction } from "../generated/prisma";
import { prisma } from "../libs/prisma.client";

const EventRepository = {
    //can use for Public
    findById: async (id: string): Promise<Event | null> => {
        return await prisma.event.findUnique({
            where: { id },
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