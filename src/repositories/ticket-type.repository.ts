import { prisma } from "../libs/prisma.client";

const TicketTypeRepository = {
  findByIdWithEvent: async (id: string) => {
    const getTicketType = await prisma.ticketType.findUnique({
      where: { id: id },
      include: { event: true },
    });

    return getTicketType;
  },
};

export default TicketTypeRepository;
