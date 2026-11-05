import { Prisma, Organizer } from "../generated/prisma";
import { prisma } from "../libs/prisma.client";

export type SafeUser = Omit<Organizer, "password">;

const OrganizerRepository = {
	// Public organizer profile: name, picture, event count, average rating
	findPublicProfileById: async (id: string) => {
		const organizer = await prisma.organizer.findUnique({
			where: { id },
			select: {
				id: true,
				name: true,
				eventOrganizerName: true,
				profilePicture: true,
			},
		});

		if (!organizer) return null;

		// Company-wide (eventOrganizerName), same as the /reviews/organizer endpoint
		const { eventOrganizerName } = organizer;
		const [totalEvents, rating] = await Promise.all([
			prisma.event.count({ where: { eventOrganizerName } }),
			prisma.review.aggregate({
				where: { event: { eventOrganizerName } },
				_avg: { rating: true },
				_count: true,
			}),
		]);

		return {
			id: organizer.id,
			name: organizer.name,
			eventOrganizerName: organizer.eventOrganizerName,
			profilePicture: organizer.profilePicture,
			totalEvents,
			averageRating: rating._avg.rating,
			totalReviews: rating._count,
		};
	},

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

	findAuthCredentialsById: async (id: string): Promise<Organizer | null> => {
		return await prisma.organizer.findUnique({
			where: { id },
			omit: { password: false },
		});
	},

  	create: async (data: Prisma.OrganizerCreateInput) => {
		return await prisma.organizer.create({data});
	},

	editProfile: async (args: Prisma.OrganizerUpdateArgs): Promise<SafeUser | null> => {
		return await prisma.organizer.update({
			...args,
			omit: { password: true },
		});
	},
}

export default OrganizerRepository;