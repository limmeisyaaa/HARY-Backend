import AppError from "../../errors/app-error";
import EventRepository from "../../repositories/event.repository";
import VoucherRepository from "../../repositories/voucher.repository";
import { VoucherInputSchema } from "../../validators/voucher.validator";

const VoucherService = {
  createVoucher: async (
    eventOrganizerName: string,
    eventId: string,
    data: VoucherInputSchema,
  ) => {

    const event = await EventRepository.findById(eventId)

    if(!event) throw new AppError("Event not found!", 404);

    if(eventOrganizerName !== event.eventOrganizerName) throw new AppError("Unauthorized operation organizer mismatch!", 403);

    return VoucherRepository.create({
      eventId,
      code: data.code,
      discountAmount: data.discountAmount,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      status: "AVAILABLE",
    });
  },
};

export default VoucherService;
