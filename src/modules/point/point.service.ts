import { PointRecord } from "@prisma/client";
import PointRepository from "../../repositories/point.repository";
import { GiftStatus } from "../../generated/prisma";

const PointService = {
    createPointRecord: async (customerId: string): Promise<PointRecord> => {
        const expiresAt = new Date();
        expiresAt.setMonth(expiresAt.getMonth() + 3);

        return await PointRepository.create({
            customerId: customerId,
            expiresAt: expiresAt,
            amount: 10000,
            status: GiftStatus.AVAILABLE
        });
    }
}

export default PointService;