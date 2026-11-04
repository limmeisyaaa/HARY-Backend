import { Request, Response } from "express";
import {
  voucherEventParamsSchema,
  voucherInputSchema,
} from "../../validators/voucher.validator";
import VoucherService from "./voucher.service";
import AppError from "../../errors/app-error";

const VoucherController = {
  createEvent: async (req: Request, res: Response) => {
    if (req.auth.userType !== "ORGANIZER")
      throw new AppError("Unauthorized operation!", 403);

    const eventOrganizerName = req.auth.eventOrganizerName;

    const input = voucherInputSchema.parse(req.body);
    const { eventId } = voucherEventParamsSchema.parse(req.params);

    const voucher = await VoucherService.createVoucher(
      eventOrganizerName,
      eventId,
      input,
    );

    res.status(201).send({ data: voucher });
  },
};

export default VoucherController;
