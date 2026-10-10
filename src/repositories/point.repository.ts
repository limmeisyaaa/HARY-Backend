import { Prisma, PointRecord } from "../generated/prisma";
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

	findAvailableActivePointsByCustomerId: async (customerId: string): Promise<PointRecord[] | null> => {
		return await prisma.$queryRaw`
			SELECT * 
			FROM "point_records" 
			WHERE "is_used" = false 
			AND "customer_id" =  ${customerId}
			AND "expires_at" > NOW()
		`
	},
  
	create: async (data: Prisma.PointRecordUncheckedCreateInput) => {
		return await prisma.pointRecord.create({data});
	},
}

export default PointRepository;