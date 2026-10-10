import { PointRecord } from "@prisma/client";
import PointRepository from "../../repositories/point.repository";

const PointService = {
    createPointRecord: async (customerId: string): Promise<PointRecord> => {
        const expiresAt = new Date();
        expiresAt.setMonth(expiresAt.getMonth() + 3);

        return await PointRepository.create({
            customerId: customerId,
            expiresAt: expiresAt,
            amount: 10000
        });
    }
}

export default PointService;