import { Router } from "express";
import EventController from "../modules/event/event.controller";

const eventRouter = Router();

eventRouter.get("/:id", EventController.getEventById);

export default eventRouter;
