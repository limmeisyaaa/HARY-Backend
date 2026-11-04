import { Prisma, PointRecord, GiftStatus } from "../generated/prisma";
import { prisma } from "../libs/prisma.client";

const PointRepository = {
   // For public
	findById: async (id: string): Promise<PointRecord | null> => {
		return await prisma.pointRecord.findUnique({
			where: { id },
		});
	},

	findByCustomerId: async (customerId: string, limit: number, cursor?: string): Promise<PointRecord[]> => {
		return await prisma.pointRecord.findMany({
			where: { customerId },
			orderBy: [{ expiresAt: "asc" }, { id: "asc" }],
			take: limit + 1,
			...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
		});
	},

	countByCustomerId: async (customerId: string): Promise<number> => {
		return await prisma.pointRecord.count({ where: { customerId } });
	},

	findAvailablePointsByCustomerId: async (customerId: string): Promise<PointRecord[] | null> => {
    return await prisma.pointRecord.findMany({
        where: {
            customerId,
            isUsed: false,
            status: 'AVAILABLE',
			expiresAt: {
				gt: new Date()
			}
        },
		orderBy: {
			expiresAt: "asc"
		}
    	});
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