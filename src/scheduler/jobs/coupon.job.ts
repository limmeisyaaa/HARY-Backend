import { NON_ACTIVATE_COUPON } from "../../config/env.config";
import CouponRepository from "../../repositories/coupon.repository";
import { createScheduler } from "../runner";

export const nonActiveCouponJob = () => {
    createScheduler(NON_ACTIVATE_COUPON, async () => {
        const updatedCoupons = await CouponRepository.updateExpiredCoupons();
        console.log(`Updated ${updatedCoupons.count} expired coupons.`);
    })
};