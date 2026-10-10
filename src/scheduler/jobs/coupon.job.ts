import CouponRepository from "../../repositories/coupon.repository";
import { createScheduler } from "../runner";

export const nonActiveCouponJob = () => {
    createScheduler('*/1 * * * *', async () => {
        const updatedCoupons = await CouponRepository.updateExpiredCoupons();
        console.log(`Updated ${updatedCoupons.count} expired coupons.`);
    })
};