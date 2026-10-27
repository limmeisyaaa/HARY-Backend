import { Prisma, Voucher } from "../generated/prisma";
import { prisma } from "../libs/prisma.client";

const VoucherRepository = {
  findById: async (id: string): Promise<Voucher | null> => {
    return await prisma.voucher.findUnique({
      where: { id },
    });
  },

  create: async (data: Prisma.VoucherUncheckedCreateInput) => {
    return await prisma.voucher.create({ data });
  },
};

export default VoucherRepository