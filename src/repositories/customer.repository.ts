import { Prisma, Customer } from "../generated/prisma";
import { prisma } from "../libs/prisma.client";

export class CustomerRepository {
  async create(data: Prisma.CustomerCreateInput): Promise<Customer> {
    return await prisma.customer.create({ data });
  }

  async findByEmail(email: string): Promise<Customer | null> {
    return await prisma.customer.findUnique({ where: { email } });
  }

  async findByReferralCode(code: string): Promise<Customer | null> {
    return await prisma.customer.findUnique({ where: { referralCode: code } });
  }
}