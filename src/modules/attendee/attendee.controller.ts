import type { Request, Response } from "express";
import AppError from "../../errors/app-error";
import { eventIdParamsSchema } from "../../validators/event.validator";
import { attendeePaginationQuerySchema } from "../../validators/attendee.validator";
import AttendeeService from "./attendee.service";

const AttendeeController = {
  async getEventAttendees(req: Request, res: Response) {
    if (req.auth.userType !== "ORGANIZER") {
      throw new AppError("Organizer only", 403);
    }

    const { id } = eventIdParamsSchema.parse(req.params);
    const query = attendeePaginationQuerySchema.parse(req.query);
    const result = await AttendeeService.getEventAttendees(
      id,
      req.auth.eventOrganizerName,
      query,
    );

    res.send({
      message: "Event attendees retrieved successfully!",
      data: result.attendees,
      pagination: result.pagination,
    });
  },
};

export default AttendeeController;
