import TransactionRepository from "../../repositories/transaction.repository";
import { TransactionUpdateStatusSchema } from "../../validators/transaction.validator";

const TransactionService = {
    updateStatusTransaction: async (data: TransactionUpdateStatusSchema) => {
        const transaction = await TransactionRepository.findById(data.id);
        if (!transaction) {
            throw new Error(`Transaction with id ${data.id} not found`);
        }

        return TransactionRepository.updateTransactionStatus(data.id, data.status);
    },

};

export default TransactionService;