import { Router } from "express";
import EventController from "../modules/event/event.controller";
import { roleGuard, userTypeGuard, verifyAccessToken } from "../middlewares/auth.middleware";
import { imageUploader } from "../middlewares/uploader.middleware";

const eventRouter = Router();

//Guest accessable
eventRouter.get("/find-event/:id", EventController.getEventById);
eventRouter.get("/all-event", EventController.getAllEvent);

//Organizer event management
eventRouter.post(
    "/event",
    verifyAccessToken,
    userTypeGuard("ORGANIZER"),
    imageUploader().single("eventPicture"),
    EventController.createEvent
);

eventRouter.patch(
    "/event",
    verifyAccessToken,
    userTypeGuard("ORGANIZER"),
    EventController.updateEvent
);

eventRouter.get(
    "/event/:id", 
    verifyAccessToken, 
    roleGuard("ADMIN", "SUPER_ADMIN"), 
    EventController.getCustomersOfEvent
);

eventRouter.get(
    "/organizer/all-event", 
    verifyAccessToken, 
    roleGuard("ADMIN", "SUPER_ADMIN"), 
    EventController.getAllEventByOrganizerName
);

export default eventRouter;
