import type { Request, Response } from "express";
import { eventIdParamsSchema, eventInputSchema } from "../../validators/event.validator";
import EventService from "./event.service";
import EventRepository from "../../repositories/event.repository";

const EventController = {
    //General withot login
    async getEventById(req: Request, res: Response) {
        const { id } = eventIdParamsSchema.parse(req.params);
        const event = await EventService.getEventById(id);

        res.send({ data: event });
    },

    async getAllEvent(req: Request, res: Response) {
        const event = await EventRepository.findAllActiveEvent();

        res.send({ data: event });
    },

    //Login required
    async createEvent(req: Request, res: Response) {
        const input = eventInputSchema.parse(req.body);
        const event = await EventService.createEvent(req.auth.id, req.auth.eventOrganizerName, input);

        res.status(201).send({ data: event });
    },

    async updateEvent(req: Request, res: Response) {
        const input = eventInputSchema.parse(req.body);
        const event = await EventService.editEvent(req.auth.id, req.auth.eventOrganizerName, input);

        res.send({ data: event });
    },

    async getCustomersOfEvent(req: Request, res: Response) {
        const { id } = eventIdParamsSchema.parse(req.params);
        const customersOfEvent = await EventService.findCustomersOfEvent(id, req.auth.eventOrganizerName);

        res.send({ data: customersOfEvent });
    },

    async getAllEventByOrganizerName(req: Request, res: Response) {
        const customersOfEvent = await EventRepository.findAllEventByOrganizerName(req.auth.eventOrganizerName);

        res.send({ data: customersOfEvent });
    },
};

export default EventController;