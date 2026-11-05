import { Prisma, Coupon, GiftStatus } from "../generated/prisma";
import { prisma } from "../libs/prisma.client";

const CouponRepository = {
   // For public
	findById: async (id: string): Promise<Coupon | null> => {
		return await prisma.coupon.findUnique({
			where: { id },
		});
	},

	findByCustomerId: async (customerId: string): Promise<Coupon[] | null> => {
		return await prisma.coupon.findMany({
			where: { customerId: customerId },
		});
	},
  
	findAvailableCouponsForCustomerId: async (customerId: string): Promise<Coupon[] | null> => {
		return await prisma.$queryRaw`
			SELECT * 
			FROM "coupons" 
			WHERE "is_used" = false 
			AND "customer_id" =  ${customerId}
			AND "status" = 'AVAILABLE'
		`
	},
  
	// Coupons the customer can still apply in the cart
	findUsableByCustomer: async (customerId: string): Promise<Coupon[]> => {
		return await prisma.coupon.findMany({
			where: {
				customerId,
				isUsed: false,
				status: GiftStatus.AVAILABLE,
				expiresAt: { gt: new Date() },
			},
			orderBy: { expiresAt: "asc" },
		});
	},

	create: async (data: Prisma.CouponUncheckedCreateInput) => {
		return await prisma.coupon.create({data});
	},

	updateExpiredCoupons: async () => {
		return await prisma.coupon.updateMany({
			where: {
				expiresAt: {
					lt: new Date(),
				},
				status: GiftStatus.AVAILABLE
			},
			data: {
				status: GiftStatus.EXPIRED
			}
		});
	},
}

export default CouponRepository;