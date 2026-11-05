// import { PointRecord } from "@prisma/client";
import PointRepository from "../../repositories/point.repository";
import { GiftStatus, PointRecord } from "../../generated/prisma";
import { PointPaginationQuery } from "../../validators/point.validator";

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
    },

    getPoints: async (customerId: string, query: PointPaginationQuery) => {
        const [fetchedPoints, pointTotal, pointBalance] = await Promise.all([
            PointRepository.findByCustomerId(customerId, query.limit, query.cursor),
            PointRepository.countByCustomerId(customerId),
            PointRepository.sumUsableByCustomerId(customerId),
        ]);
        const hasNextPage = fetchedPoints.length > query.limit;
        const points = hasNextPage
            ? fetchedPoints.slice(0, query.limit)
            : fetchedPoints;

        return {
            points,
            pointTotal,
            pointBalance,
            hasNextPage,
            nextCursor: hasNextPage ? points[points.length - 1].id : null,
        };
    }
};

export default PointService;