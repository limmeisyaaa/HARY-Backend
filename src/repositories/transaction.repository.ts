import { Transaction, TransactionStatus } from "../generated/prisma";
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

    updateTransactionStatus: async( id: string, status: TransactionStatus ) => {
        return await prisma.transaction.update({
            where: {
                id: id,
            },
            data: {
                status: status
            },
        });
    },

    viewTransactionProof: async (id:string): Promise<String> => {
        const transactionData =  await prisma.transaction.findUnique({
            where: { id: id }
        });

        return transactionData?.paymentProofUrl ?? "";
    },
};

export default TransactionRepository;