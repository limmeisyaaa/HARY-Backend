import { Request, Response } from "express";
import {
  voucherEventParamsSchema,
  voucherInputSchema,
} from "../../validators/voucher.validator";
import VoucherService from "./voucher.service";

const VoucherController = {
  createEvent: async (req: Request, res: Response) => {
    const input = voucherInputSchema.parse(req.body);
    const { eventId } = voucherEventParamsSchema.parse(req.params);

    const voucher = await VoucherService.createVoucher(eventId, input);

    res.send({ data: voucher });
  },
};

export default VoucherController;
