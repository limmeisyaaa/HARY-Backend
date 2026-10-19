import { CustomerProfileResponseDTO } from "../dtos/customer-profile.dto";
import { Prisma, Customer, GiftStatus } from "../generated/prisma";
import { prisma } from "../libs/prisma.client";


export type SafeUser = Omit<Customer, "password">;

const CustomerRepository = {
   // For public
	findById: async (id: string): Promise<SafeUser | null> => {
		return await prisma.customer.findUnique({
			where: { id },
			omit: { password: true },
		});
	},

	findByReferralCode: async (code: string): Promise<SafeUser | null> => {
		return await prisma.customer.findUnique({
			where: { referralCode: code },
		});
	},
  
	// For password check
	findAuthCredentialsByEmail: async (email: string): Promise<Customer | null> => {
		return await prisma.customer.findUnique({
			where: { email },
			omit: { password: false },
		});
	},

	findAuthCredentialsById: async (id: string): Promise<Customer | null> => {
		return await prisma.customer.findUnique({
			where: { id },
			omit: { password: false },
		});
	},
  
	create: async (data: Prisma.CustomerCreateInput) => {
		return await prisma.customer.create({data});
	},

	editProfile: async (args: Prisma.CustomerUpdateArgs): Promise<SafeUser | null> => {
		return await prisma.customer.update({
			...args,
			omit: { password: true },
		});
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

}

export default CustomerRepository;