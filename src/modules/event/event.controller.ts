import type { Request, Response } from "express";
import { eventIdParamsSchema, eventInputSchema, eventPaginationQuerySchema } from "../../validators/event.validator";
import EventService from "./event.service";
import EventRepository from "../../repositories/event.repository";
import { uploadEventPicture } from "../cloudinary/cloudinary.service";

const EventController = {
    //General withot login
    async getEventById(req: Request, res: Response) {
        const { id } = eventIdParamsSchema.parse(req.params);
        const event = await EventService.getEventById(id);

        res.send({ data: event });
    },

    async getAllEvent(req: Request, res: Response) {
        const query = eventPaginationQuerySchema.parse(req.query);
        // Public hanya melihat event yang belum selesai
        const events = await EventService.getEventsPaginated(
            { endDate: { gt: new Date() } },
            query
        );

        res.send({ message: "Events retrieved successfully!", data: events });
    },

    //Login required
    async createEvent(req: Request, res: Response) {
        const input = eventInputSchema.parse(req.body);

        const eventPictureUrl = req.file
              ? await uploadEventPicture(req.file, req.auth.eventOrganizerName, req.auth.userType)
              : undefined;

        const event = await EventService.createEvent(req.auth.id, req.auth.eventOrganizerName, input, eventPictureUrl);

        res.status(201).send({ data: event });
    },

    async updateEvent(req: Request, res: Response) {
        const input = eventInputSchema.parse(req.body);
        const event = await EventService.editEvent(req.auth.eventOrganizerName, input);

        res.send({ data: event });
    },

    async getCustomersOfEvent(req: Request, res: Response) {
        const { id } = eventIdParamsSchema.parse(req.params);
        const customersOfEvent = await EventService.findCustomersOfEvent(id, req.auth.eventOrganizerName);

        res.send({ data: customersOfEvent });
    },

    async getAllEventByOrganizerName(req: Request, res: Response) {
        const query = eventPaginationQuerySchema.parse(req.query);
        const events = await EventService.getEventsPaginated(
            { eventOrganizerName: req.auth.eventOrganizerName },
            query
        );

        res.send({ message: "Events retrieved successfully!", data: events });
    },
};

export default EventController;