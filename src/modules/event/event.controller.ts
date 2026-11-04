import type { Request, Response } from "express";
import {
  eventIdParamsSchema,
  eventInputSchema,
  eventPaginationQuerySchema,
} from "../../validators/event.validator";
import EventService from "./event.service";
import EventReportService from "./event-report.service";
import { eventReportQuerySchema } from "../../validators/event-report.validator";
import { uploadEventPicture } from "../cloudinary/cloudinary.service";
import AppError from "../../errors/app-error";

const parseEventInput = (body: unknown) => {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return eventInputSchema.parse(body);
  }

  const normalizedBody: Record<string, unknown> = { ...body };

  if (typeof normalizedBody.availableSeats === "string") {
    normalizedBody.availableSeats = Number(normalizedBody.availableSeats);
  }

  if (normalizedBody.isFree === "true") {
    normalizedBody.isFree = true;
  } else if (normalizedBody.isFree === "false") {
    normalizedBody.isFree = false;
  }

  if (typeof normalizedBody.ticketTypes === "string") {
    try {
      normalizedBody.ticketTypes = JSON.parse(normalizedBody.ticketTypes);
    } catch (error) {
      throw new AppError("ticketTypes must contain valid JSON!", 400, error);
    }
  }

  return eventInputSchema.parse(normalizedBody);
};

const EventController = {
  //General withot login
  async getEventById(req: Request, res: Response) {
    const { id } = eventIdParamsSchema.parse(req.params);
    const event = await EventService.getEventById(id);

    res.send({ data: event });
  },

  async getAllEvent(req: Request, res: Response) {
    const query = eventPaginationQuerySchema.parse(req.query);
    const result = await EventService.getActiveEventsPaginated(query);

    res.send({
      data: result.events,
      pagination: {
        eventTotal: result.eventTotal,
        hasNextPage: result.hasNextPage,
        nextCursor: result.nextCursor,
      },
    });
  },

  //Login required
  async createEvent(req: Request, res: Response) {
    if(req.auth.userType !== "ORGANIZER") throw new AppError("Organizer only", 403);

    // type checking

    const input = parseEventInput(req.body);

    const eventPictureUrl = req.file
      ? await uploadEventPicture(
          req.file,
          req.auth.eventOrganizerName,
          req.auth.userType,
        )
      : undefined;

    const event = await EventService.createEvent(
      req.auth.id,
      req.auth.eventOrganizerName,
      input,
      eventPictureUrl,
    );

    res.status(201).send({ data: event });
  },

  async updateEvent(req: Request, res: Response) {
    if(req.auth.userType !== "ORGANIZER") throw new AppError("Organizer only", 403);

    const input = parseEventInput(req.body);
    const eventPictureUrl = req.file
      ? await uploadEventPicture(
          req.file,
          req.auth.eventOrganizerName,
          req.auth.userType,
        )
      : undefined;
    const event = await EventService.editEvent(
      req.auth.eventOrganizerName,
      input,
      eventPictureUrl,
    );

    res.send({ data: event });
  },

  async getCustomersOfEvent(req: Request, res: Response) {
    if(req.auth.userType !== "ORGANIZER") throw new AppError("Organizer only", 403);

    const { id } = eventIdParamsSchema.parse(req.params);
    const customersOfEvent = await EventService.findCustomersOfEvent(
      id,
      req.auth.eventOrganizerName,
    );

    res.send({ data: customersOfEvent });
  },

  async getAllEventByOrganizerName(req: Request, res: Response) {
    if(req.auth.userType !== "ORGANIZER") throw new AppError("Organizer only", 403);

    const query = eventPaginationQuerySchema.parse(req.query);
    const events = await EventService.getEventsPaginated(
      { eventOrganizerName: req.auth.eventOrganizerName },
      query,
    );

    res.send({ message: "Events retrieved successfully!", data: events });
  },

  async getAllEventWithTransactionSummary(req: Request, res: Response) {
    if(req.auth.userType !== "ORGANIZER") throw new AppError("Organizer only", 403);
    
    const query = eventPaginationQuerySchema.parse(req.query);
    const events = await EventService.getEventsWithTransactionSummary(
      { eventOrganizerName: req.auth.eventOrganizerName },
      query,
    );

    res.send({
      message: "Transaction summaries retrieved successfully!",
      data: events,
    });
  },

  async getOrganizerReport(req: Request, res: Response) {
    if (req.auth.userType !== "ORGANIZER") {
      throw new AppError("Organizer only", 403);
    }

    const query = eventReportQuerySchema.parse(req.query);
    const report = await EventReportService.getOrganizerReport(
      req.auth.eventOrganizerName,
      query,
    );

    res.send({
      message: "Organizer event report retrieved successfully!",
      data: report,
    });
  },
};

export default EventController;
