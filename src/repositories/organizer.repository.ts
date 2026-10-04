import { Prisma, Organizer } from "../generated/prisma";
import { prisma } from "../libs/prisma.client";

export type SafeUser = Omit<Organizer, "password">;

const OrganizerRepository = {
  // For public
	findById: async (id: string): Promise<SafeUser | null> => {
		return await prisma.organizer.findUnique({
			where: { id },
		});
	},

	// For password check
	findAuthCredentialsByEmail: async (email: string): Promise<Organizer | null> => {
		return await prisma.organizer.findUnique({
			where: { email },
			omit: { password: false },
		});
	},

  create: async (data: Prisma.OrganizerCreateInput) => {
		return await prisma.organizer.create({data});
	},
}

export default OrganizerRepository;