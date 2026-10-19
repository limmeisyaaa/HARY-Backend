import { TransactionStatus } from "../../generated/prisma";
import TransactionRepository from "../../repositories/transaction.repository";
import { TransactionUpdateStatusSchema } from "../../validators/transaction.validator";

const TransactionService = {
    updateStatusTransaction: async (data: TransactionUpdateStatusSchema) => {
        return TransactionRepository.updateTransactionStatus(data.id, data.status);
    },

};

export default TransactionService;