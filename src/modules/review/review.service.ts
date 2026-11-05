import AppError from "../../errors/app-error";
import EventRepository from "../../repositories/event.repository";
import ReviewRepository from "../../repositories/review.repository";
import { ReviewCreateInput, ReviewListQuery } from "../../validators/review.validator";

// Shared cursor pagination: repository fetched limit + 1 rows
const paginate = <T extends { id: string }>(rows: T[], limit: number) => {
	const hasNextPage = rows.length > limit;
	const items = hasNextPage ? rows.slice(0, limit) : rows;

	return {
		items,
		nextCursor: hasNextPage ? items[items.length - 1].id : null,
	};
};

const ReviewService = {
	createReview: async (customerId: string, eventId: string, input: ReviewCreateInput) => {
		const event = await EventRepository.findById(eventId);
		if (!event) throw new AppError("Event not found!", 404);

		// Ongoing or finished events can be reviewed; upcoming ones can't
		if (event.startDate > new Date()) {
			throw new AppError("Event has not started yet!", 400);
		}

		const doneTransaction = await ReviewRepository.findDoneTransaction(customerId, eventId);
		if (!doneTransaction) {
			throw new AppError("Only customers who attended this event can review it!", 403);
		}

		const existingReview = await ReviewRepository.findByCustomerAndEvent(customerId, eventId);
		if (existingReview) {
			throw new AppError("You have already reviewed this event!", 409);
		}

		return await ReviewRepository.create({
			customerId,
			eventId,
			rating: input.rating,
			comment: input.comment,
		});
	},

	getEventReviews: async (eventId: string, query: ReviewListQuery) => {
		const event = await EventRepository.findById(eventId);
		if (!event) throw new AppError("Event not found!", 404);

		const [rows, summary] = await Promise.all([
			ReviewRepository.findByEventPaginated(eventId, query.limit, query.cursor),
			ReviewRepository.aggregate({ eventId }),
		]);

		return { ...summary, ...paginate(rows, query.limit) };
	},

	getOrganizerReviews: async (eventOrganizerName: string, query: ReviewListQuery) => {
		const [rows, summary] = await Promise.all([
			ReviewRepository.findByOrganizerPaginated(eventOrganizerName, query.limit, query.cursor),
			ReviewRepository.aggregate({ event: { eventOrganizerName } }),
		]);

		return { ...summary, ...paginate(rows, query.limit) };
	},
};

export default ReviewService;
