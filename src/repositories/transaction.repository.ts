import { CustomersEventResponseDTO } from "../dtos/customer-event.dto";
import AppError from "../errors/app-error";
import { GiftStatus, Prisma, StatusUpdater, Transaction, TransactionStatus } from "../generated/prisma";
import { prisma } from "../libs/prisma.client";

export type updateCheckoutTxParams = {
  transactionId: string;
  eventId: string;
  customerId: string;
  seatDiff: number;
  oldCouponId: string | null;
  newCouponId: string | null;
  usedPointIds: string[];
  refundPoints: number;
  leftOvers: { amount: number; expiresAt: Date } | null;
  data: Prisma.TransactionUncheckedUpdateInput;
};

const TransactionRepository = {
  findById: async (id: string): Promise<Transaction | null> => {
    return await prisma.transaction.findUnique({
      where: { id: id },
    });
  },

  viewTransactionForEvent: async (
    eventId: string,
  ): Promise<Transaction[] | null> => {
    return await prisma.transaction.findMany({
      where: { eventId: eventId },
    });
  },

  findTransactionForEventByTrxStatus: async (
    eventId: string,
    transactionStatus: TransactionStatus,
  ): Promise<Transaction[] | null> => {
    return await prisma.transaction.findMany({
      where: {
        eventId: eventId,
        status: transactionStatus,
      },
    });
  },

  updateTransactionStatus: async (id: string, status: TransactionStatus) => {
    return await prisma.transaction.update({
      where: {
        id: id,
      },
      data: {
        status: status,
      },
    });
  },

  viewTransactionProof: async (id: string): Promise<String> => {
    const transactionData = await prisma.transaction.findUnique({
      where: { id: id },
    });

    return transactionData?.paymentProofUrl ?? "";
  },

  findCustomersOfEvent: async (
    eventId: string,
  ): Promise<CustomersEventResponseDTO[] | null> => {
    const transactions = await prisma.transaction.findMany({
      where: { eventId: eventId },
      include: {
        customer: {
          select: { name: true },
        },
        ticketType: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return transactions.map((tx) => {
      return new CustomersEventResponseDTO(
        tx,
        tx.customer.name,
        tx.ticketType.name,
      );
    });
  },

  findActiveByCustomerAndEvent: async (
    customerId: string,
    eventId: string,
  ): Promise<Transaction | null> => {
    const getActive = await prisma.transaction.findFirst({
      where: {
        customerId,
        eventId,
        status: "WAITING_PAYMENT",
      },
    });

    return getActive;
  },

  createWithSeatHold: async (data: Prisma.TransactionUncheckedCreateInput) => {
    return prisma.$transaction(async (tx) => {
      const setUpdateSeat = await tx.event.updateMany({
        where: {
          id: data.eventId,
          availableSeats: {
            gte: data.quantity,
          },
        },
        data: {
          availableSeats: {
            decrement: data.quantity,
          },
        },
      });

      if (setUpdateSeat.count === 0)
        throw new AppError("Not enough seats!", 400);
      return await tx.transaction.create({ data });
    });
  },

  updateCheckoutTx: async (params: updateCheckoutTxParams) => {
    return prisma.$transaction(async (tx) => {
      if (params.seatDiff !== 0) {
        const seatsUpdated = await tx.event.updateMany({
          where: {
            id: params.eventId,
            ...(params.seatDiff > 0
              ? { availableSeats: { gte: params.seatDiff } }
              : {}),
          },
          data: {
            availableSeats: { decrement: params.seatDiff },
          },
        });
        if (seatsUpdated.count === 0)
          throw new AppError("Not enough available", 400);
      }

      if (params.oldCouponId !== params.newCouponId) {
        if (params.oldCouponId) {
          await tx.coupon.update({
            where: {
              id: params.oldCouponId,
            },
            data: {
              isUsed: false,
            },
          });
        }
      }

      if (params.newCouponId) {
        await tx.coupon.update({
          where: {
            id: params.newCouponId,
          },
          data: { isUsed: true },
        });
      }

      if (params.refundPoints > 0) {
        await tx.pointRecord.create({
          data: {
            customerId: params.customerId,
            amount: params.refundPoints,
            expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
            status: "AVAILABLE",
          },
        });
      }

      if (params.usedPointIds.length > 0) {
        await tx.pointRecord.updateMany({
          where: { id: { in: params.usedPointIds } },
          data: { isUsed: true },
        });
      }

      if (params.leftOvers) {
        await tx.pointRecord.create({
          data: {
            customerId: params.customerId,
            amount: params.leftOvers.amount,
            expiresAt: params.leftOvers.expiresAt,
            status: "AVAILABLE",
          },
        });
      }

      return await tx.transaction.update({
        where: { id: params.transactionId },
        data: params.data,
      });
    });
  },

  // Batalkan transaksi dan kembalikan semua yang di-hold: kursi, kupon, dan poin.
  // Dipakai untuk CANCELED (customer), REJECTED (organizer), dan EXPIRED (scheduler).
  releaseTransaction: async (
    transactionId: string,
    finalStatus: "CANCELED" | "REJECTED" | "EXPIRED",
    updatedBy: StatusUpdater,
  ) => {
    return prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.findUnique({
        where: { id: transactionId },
      });
      if (!transaction) throw new AppError("Transaction not found", 404);

      // Kunci status: hanya transaksi yang masih aktif yang boleh dibatalkan.
      // updateMany + where status mencegah pengembalian ganda jika dipanggil dua kali bersamaan.
      const statusUpdated = await tx.transaction.updateMany({
        where: {
          id: transactionId,
          status: { in: [TransactionStatus.WAITING_PAYMENT, TransactionStatus.WAITING_CONFIRMATION] },
        },
        data: {
          status: finalStatus,
          statusUpdatedBy: updatedBy,
          couponId: null, // lepas kupon agar bisa dipakai di transaksi lain (couponId @unique)
        },
      });
      if (statusUpdated.count === 0)
        throw new AppError("Transaction can no longer be canceled", 409);

      // Kembalikan kursi
      await tx.event.update({
        where: { id: transaction.eventId },
        data: { availableSeats: { increment: transaction.quantity } },
      });

      // Kembalikan kupon
      if (transaction.couponId) {
        await tx.coupon.update({
          where: { id: transaction.couponId },
          data: { isUsed: false },
        });
      }

      // Kembalikan poin sebagai record baru (record lama sudah ditandai isUsed)
      const pointsUsed = Number(transaction.pointsUsed);
      if (pointsUsed > 0) {
        await tx.pointRecord.create({
          data: {
            customerId: transaction.customerId,
            amount: pointsUsed,
            expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
            status: GiftStatus.AVAILABLE,
          },
        });
      }

      return await tx.transaction.findUnique({ where: { id: transactionId } });
    });
  },
};

export default TransactionRepository;
