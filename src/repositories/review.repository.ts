import { Prisma, Review, TransactionStatus } from "../generated/prisma";
import { prisma } from "../libs/prisma.client";

// Only safe customer fields — never email
const customerSelect = { select: { name: true, profilePicture: true } } as const;

const ReviewRepository = {
	create: async (data: Prisma.ReviewUncheckedCreateInput): Promise<Review> => {
		return await prisma.review.create({ data });
	},

	// For the "already reviewed" (409) check
	findByCustomerAndEvent: async (customerId: string, eventId: string): Promise<Review | null> => {
		return await prisma.review.findFirst({
			where: { customerId, eventId },
		});
	},

	// For the "must have a DONE transaction" (403) check
	findDoneTransaction: async (customerId: string, eventId: string) => {
		return await prisma.transaction.findFirst({
			where: { customerId, eventId, status: TransactionStatus.DONE },
			select: { id: true },
		});
	},

	findByEventPaginated: async (eventId: string, limit: number, cursor?: string) => {
		return await prisma.review.findMany({
			where: { eventId },
			orderBy: [{ createdAt: "desc" }, { id: "desc" }],
			take: limit + 1,
			...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
			include: { customer: customerSelect },
		});
	},

	// Organizer history: reviews from all of the organizer's events
	findByOrganizerPaginated: async (eventOrganizerName: string, limit: number, cursor?: string) => {
		return await prisma.review.findMany({
			where: { event: { eventOrganizerName } },
			orderBy: [{ createdAt: "desc" }, { id: "desc" }],
			take: limit + 1,
			...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
			include: {
				customer: customerSelect,
				event: { select: { id: true, name: true, endDate: true } },
			},
		});
	},

	// Average rating + total reviews for any filter (one event or one organizer)
	aggregate: async (where: Prisma.ReviewWhereInput) => {
		const result = await prisma.review.aggregate({
			where,
			_avg: { rating: true },
			_count: true,
		});

		return {
			averageRating: result._avg.rating,
			totalReviews: result._count,
		};
	},
};

export default ReviewRepository;
