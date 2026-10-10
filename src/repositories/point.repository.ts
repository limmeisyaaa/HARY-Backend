import { Prisma, PointRecord, GiftStatus } from "../generated/prisma";
import { prisma } from "../libs/prisma.client";

const PointRepository = {
   // For public
	findById: async (id: string): Promise<PointRecord | null> => {
		return await prisma.pointRecord.findUnique({
			where: { id },
		});
	},

	findByCustomerId: async (customerId: string): Promise<PointRecord[] | null> => {
		return await prisma.pointRecord.findMany({
			where: { customerId: customerId },
		});
	},

	findAvailablePointsByCustomerId: async (customerId: string): Promise<PointRecord[] | null> => {
		return await prisma.$queryRaw`
			SELECT * 
			FROM "point_records" 
			WHERE "is_used" = false 
			AND "customer_id" =  ${customerId}
			AND "status" = 'AVAILABLE'
		`
	},
  
	create: async (data: Prisma.PointRecordUncheckedCreateInput) => {
		return await prisma.pointRecord.create({data});
	},

	updateExpiredPoint: async () => {
		return await prisma.pointRecord.updateMany({
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

export default PointRepository;