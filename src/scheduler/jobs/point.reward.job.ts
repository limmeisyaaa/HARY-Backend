import PointRepository from "../../repositories/point.repository";
import { createScheduler } from "../runner";

export const nonActivePointJob = () => {
    createScheduler('*/1 * * * *', async () => {
        const updatedPoint = await PointRepository.updateExpiredPoint();
        console.log(`Updated ${updatedPoint.count} expired point.`);
    })
};