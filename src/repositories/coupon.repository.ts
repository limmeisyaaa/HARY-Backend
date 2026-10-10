import { Prisma, Coupon } from "../generated/prisma";
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
  
	findAvailableCouponsForCustomer: async (customerId: string): Promise<Coupon[] | null> => {
		return await prisma.$queryRaw`
			SELECT * 
			FROM "coupons" 
			WHERE "is_used" = false 
			AND "customer_id" =  ${customerId}
			AND "expires_at" > NOW()
		`
	},
  
	create: async (data: Prisma.CouponUncheckedCreateInput) => {
		return await prisma.coupon.create({data});
	},
}

export default CouponRepository;