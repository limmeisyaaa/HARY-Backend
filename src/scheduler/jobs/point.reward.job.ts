import { NON_ACTIVATE_POINT } from "../../config/env.config";
import PointRepository from "../../repositories/point.repository";
import { createScheduler } from "../runner";

export const nonActivePointJob = () => {
    createScheduler(NON_ACTIVATE_POINT, async () => {
        const updatedPoint = await PointRepository.updateExpiredPoint();
        console.log(`Updated ${updatedPoint.count} expired point.`);
    })
};