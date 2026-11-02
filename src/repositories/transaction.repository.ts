import { CustomersEventResponseDTO } from "../dtos/customer-event.dto";
import { GiftStatus, StatusUpdater, Transaction, TransactionStatus } from "../generated/prisma";
import { prisma } from "../libs/prisma.client";

const TransactionRepository = {
    findById: async (id:string): Promise<Transaction | null> => {
        return await prisma.transaction.findUnique({
            where: { id: id }
        });
    },

    viewTransactionForEvent: async (eventId: string): Promise<Transaction[] | null> => {
        return await prisma.transaction.findMany({
                where: { eventId: eventId }
        });
    },

    findTransactionForEventByTrxStatus: async (
        eventId: string,
        transactionStatus: TransactionStatus
    ): Promise<Transaction[] | null> => {
        return await prisma.transaction.findMany({
            where: {
                eventId: eventId,
                status: transactionStatus
            }
        });
    },

    countTransactionsByEventIds: async (eventIds: string[]) => {
        if (eventIds.length === 0) return [];

        return prisma.transaction.groupBy({
            by: ["eventId", "status"],
            where: { eventId: { in: eventIds } },
            _count: { _all: true },
        });
    },

    updateTransactionStatus: async (id: string, status: TransactionStatus) => {
        return prisma.$transaction(async (tx) => {
            const transaction = await tx.transaction.findUnique({
                where: { id },
                select: {
                    status: true,
                    eventId: true,
                    customerId: true,
                    pointsUsed: true,
                    voucherId: true,
                    couponId: true,
                },
            });

            if (!transaction) {
                throw new Error(`Transaction with id ${id} not found`);
            }

            const statusChanged = transaction.status !== status;

            if (statusChanged && status === TransactionStatus.REJECTED) {
                await tx.event.update({
                    where: { id: transaction.eventId },
                    data: { availableSeats: { increment: 1 } },
                });

                if (transaction.pointsUsed.greaterThan(0)) {
                    await tx.pointRecord.updateMany({
                        where: {
                            customerId: transaction.customerId,
                            isUsed: true,
                        },
                        data: {
                            isUsed: false,
                            status: GiftStatus.AVAILABLE,
                        },
                    });
                }

                if (transaction.voucherId) {
                    await tx.voucher.update({
                        where: { id: transaction.voucherId },
                        data: { status: GiftStatus.AVAILABLE },
                    });
                }

                if (transaction.couponId) {
                    await tx.coupon.update({
                        where: { id: transaction.couponId },
                        data: {
                            isUsed: false,
                            status: GiftStatus.AVAILABLE,
                        },
                    });
                }
            }

            return tx.transaction.update({
                where: { id },
                data: {
                    status,
                    statusUpdatedBy: StatusUpdater.ORGANIZER,
                },
            });
        });
    },

    viewTransactionProof: async (id:string): Promise<String> => {
        const transactionData =  await prisma.transaction.findUnique({
            where: { id: id }
        });

        return transactionData?.paymentProofUrl ?? "";
    },

    findCustomersOfEvent: async (
            eventId: string,
    ): Promise<CustomersEventResponseDTO[] | null> => {
        const transactions = await prisma.transaction.findMany({
            where: { eventId: eventId},
            include: {
                customer: {
                    select: { name: true },
                },
                ticketType: {
                    select: { name: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    
        return transactions.map((tx) => {
            return new CustomersEventResponseDTO(
                tx,
                tx.customer.name, 
                tx.ticketType.name
            );
        });    
    },
};

export default TransactionRepository;