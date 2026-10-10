
import { Prisma } from "../../generated/prisma";

const CouponService = {
    createReferralCouponData: (): Prisma.CouponCreateWithoutCustomerInput => {
        const expiresAt = new Date();
        expiresAt.setMonth(expiresAt.getMonth() + 3);

        return {
            discountAmount: 50000,
            expiresAt: expiresAt,
        };
    }
}

export default CouponService;