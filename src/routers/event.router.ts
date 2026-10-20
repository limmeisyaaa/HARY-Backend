import { Router } from "express";
import EventController from "../modules/event/event.controller";
import { roleGuard, verifyAccessToken } from "../middlewares/auth.middleware";

const eventRouter = Router();

//Guest accessable
eventRouter.get("/:id", EventController.getEventById);

eventRouter.get(
    "/customer-event/:id", 
    verifyAccessToken, 
    roleGuard("ADMIN", "SUPER_ADMIN"), 
    EventController.getCustomersOfEvent
);

export default eventRouter;
