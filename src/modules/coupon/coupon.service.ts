
import { GiftStatus, Prisma } from "../../generated/prisma";
import CouponRepository from "../../repositories/coupon.repository";

const CouponService = {
    getMyCoupons: async (customerId: string) => {
        return await CouponRepository.findUsableByCustomer(customerId);
    },

    createReferralCouponData: (): Prisma.CouponCreateWithoutCustomerInput => {
        const expiresAt = new Date();
        expiresAt.setMonth(expiresAt.getMonth() + 3);

        return {
            discountAmount: 50000,
            expiresAt: expiresAt,
            status: GiftStatus.AVAILABLE
        };
    }
}

export default CouponService;