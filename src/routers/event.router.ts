import { Router } from "express";
import EventController from "../modules/event/event.controller";
import AttendeeController from "../modules/attendee/attendee.controller";
import { roleGuard, userTypeGuard, verifyAccessToken } from "../middlewares/auth.middleware";
import { imageUploader } from "../middlewares/uploader.middleware";

const eventRouter = Router();

//Guest accessable
eventRouter.get("/all-event", EventController.getAllEvent);

//Customer accessable
eventRouter.get("/:id", verifyAccessToken, EventController.getEventById);

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
    "/organizer/reports",
    verifyAccessToken,
    userTypeGuard("ORGANIZER"),
    EventController.getOrganizerReport
);

eventRouter.get(
    "/organizer/events/:id/attendees",
    verifyAccessToken,
    userTypeGuard("ORGANIZER"),
    AttendeeController.getEventAttendees
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

eventRouter.get(
    "/organizer/reports",
    verifyAccessToken,
    userTypeGuard("ORGANIZER"),
    EventController.getOrganizerReport
);


export default eventRouter;
