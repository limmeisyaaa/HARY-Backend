import { Router } from "express";
import { userTypeGuard, verifyAccessToken } from "../middlewares/auth.middleware";
import ReviewController from "../modules/review/review.controller";

const reviewRouter = Router();

// public
reviewRouter.get("/event/:eventId", ReviewController.getByEvent);
reviewRouter.get("/organizer/:eventOrganizerName", ReviewController.getByOrganizer);

// customer only
reviewRouter.post(
	"/event/:eventId",
	verifyAccessToken,
	userTypeGuard("CUSTOMER"),
	ReviewController.create,
);

export default reviewRouter;
