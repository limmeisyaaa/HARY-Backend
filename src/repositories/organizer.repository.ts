import { Prisma, Organizer } from "../generated/prisma";
import { prisma } from "../libs/prisma.client";

export class OrganizerRepository {
  async create(data: Prisma.OrganizerCreateInput): Promise<Organizer> {
    return await prisma.organizer.create({ data });
  }

  async findByEmail(email: string): Promise<Organizer | null> {
    return await prisma.organizer.findUnique({ where: { email } });
  }
}