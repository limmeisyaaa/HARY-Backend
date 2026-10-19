import type { Request, Response } from "express";
import { eventIdParamsSchema } from "../../validators/event.validator";
import EventService from "./event.service";

const EventController = {
    async getEventById(req: Request, res: Response) {
        const { id } = eventIdParamsSchema.parse(req.params);
        const event = await EventService.getEventById(id);

        res.send({ data: event });
    },
};

export default EventController;