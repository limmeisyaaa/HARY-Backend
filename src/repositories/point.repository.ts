import { Prisma, PointRecord, GiftStatus } from "../generated/prisma";
import { prisma } from "../libs/prisma.client";
import { CustomerProfileResponseDTO } from "../dtos/customer-profile.dto";

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

	findCustomerProfileWithPoints: async (
		customerId: string,
	): Promise<CustomerProfileResponseDTO | null> => {
		const customer = await prisma.customer.findUnique({
			where: { id: customerId },
			omit: { password: true },
			include: {
				pointRecords: {
					where: {
						isUsed: false,
						status: GiftStatus.AVAILABLE,
					},
					select: {
						amount: true,
					},
				},
			},
		});

		if (!customer) {
			return null;
		}

		const point = customer.pointRecords.reduce(
			(total, record) => total + Number(record.amount),
			0,
		);

		return new CustomerProfileResponseDTO(customer, point);
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