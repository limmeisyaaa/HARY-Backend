import { Router } from "express";
import EventController from "../modules/event/event.controller";
import { roleGuard, userTypeGuard, verifyAccessToken } from "../middlewares/auth.middleware";
import { imageUploader } from "../middlewares/uploader.middleware";

const eventRouter = Router();

//Guest accessable
eventRouter.get("/:id", EventController.getEventById);
eventRouter.get("/all-event/:id", EventController.getAllEvent);

//Organizer event management
eventRouter.post(
    "/event",
    verifyAccessToken,
    userTypeGuard("ORGANIZER"),
    imageUploader().single("eventPicture"),
    EventController.createEvent
);

eventRouter.patch(
    "/organizer/edit-event",
    verifyAccessToken,
    userTypeGuard("ORGANIZER"),
    imageUploader().single("eventPicture"),
    EventController.updateEvent
);

eventRouter.get(
    "/event/:id", 
    verifyAccessToken, 
    userTypeGuard("ORGANIZER"),
    EventController.getCustomersOfEvent
);

eventRouter.get(
    "/organizer/all-event", 
    verifyAccessToken, 
    userTypeGuard("ORGANIZER"),
    EventController.getAllEventByOrganizerName
);

eventRouter.get(
    "/organizer/all-event/transaction-summary",
    verifyAccessToken,
    userTypeGuard("ORGANIZER"),
    EventController.getAllEventWithTransactionSummary
);

export default eventRouter;
