import { Prisma, Event, Transaction, GiftStatus } from "../generated/prisma";
import { prisma } from "../libs/prisma.client";

const EventRepository = {
    //can use for Public
    findById: async (id: string): Promise<Event | null> => {
        return await prisma.event.findUnique({
            where: { id },
            include: {
                ticketTypes: true,
                vouchers: true,
            }
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

    // Cursor pagination, ambil limit + 1 untuk cek apakah masih ada halaman berikutnya
    findEventsPaginated: async (where: Prisma.EventWhereInput, limit: number, cursor?: string) => {
        return await prisma.event.findMany({
            where,
            orderBy: [{ createdAt: "desc" }, { id: "desc" }],
            take: limit + 1,
            ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
            include: {
                ticketTypes: true,
                // Hanya voucher yang sedang berlaku, untuk hitung bestVoucher
                vouchers: {
                    where: {
                        status: GiftStatus.AVAILABLE,
                        startDate: { lte: new Date() },
                        endDate: { gte: new Date() },
                    },
                },
            },
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