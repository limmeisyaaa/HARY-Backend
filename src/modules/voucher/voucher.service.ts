import VoucherRepository from "../../repositories/voucher.repository";
import { VoucherInputSchema } from "../../validators/voucher.validator";

const VoucherService = {
    createVoucher: async (eventId: string, data: VoucherInputSchema) => {
        return VoucherRepository.create({
            eventId,
            code: data.code,
            discountAmount: data.discountAmount,
            startDate: new Date(data.startDate),
            endDate: new Date(data.endDate),
            status: "AVAILABLE",
        })
    }
}

export default VoucherService