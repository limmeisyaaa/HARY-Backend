import { Request, Response } from "express";
import AppError from "../../errors/app-error";
import ReviewService from "./review.service";
import {
	organizerNameParamsSchema,
	reviewCreateSchema,
	reviewEventParamsSchema,
	reviewListQuerySchema,
} from "../../validators/review.validator";

const ReviewController = {
	create: async (req: Request, res: Response) => {
		if (req.auth.userType !== "CUSTOMER")
			throw new AppError("Unauthorized operation!", 403);

		const { eventId } = reviewEventParamsSchema.parse(req.params);
		const input = reviewCreateSchema.parse(req.body);

		const review = await ReviewService.createReview(req.auth.id, eventId, input);

		res.status(201).send({ message: "Review created successfully!", data: review });
	},

	getByEvent: async (req: Request, res: Response) => {
		const { eventId } = reviewEventParamsSchema.parse(req.params);
		const query = reviewListQuerySchema.parse(req.query);

		const reviews = await ReviewService.getEventReviews(eventId, query);

		res.send({ data: reviews });
	},

	getByOrganizer: async (req: Request, res: Response) => {
		const { eventOrganizerName } = organizerNameParamsSchema.parse(req.params);
		const query = reviewListQuerySchema.parse(req.query);

		const reviews = await ReviewService.getOrganizerReviews(eventOrganizerName, query);

		res.send({ data: reviews });
	},
};

export default ReviewController;
