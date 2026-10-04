import { Prisma, Customer } from "../generated/prisma";
import { prisma } from "../libs/prisma.client";


export type SafeUser = Omit<Customer, "password">;

const CustomerRepository = {
   // For public
	findById: async (id: string): Promise<SafeUser | null> => {
		return await prisma.customer.findUnique({
			where: { id },
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
  
	create: async (data: Prisma.CustomerCreateInput) => {
		return await prisma.customer.create({data});
	},
}

export default CustomerRepository;