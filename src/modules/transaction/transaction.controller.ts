import { Request, Response } from "express";
import TransactionRepository from "../../repositories/transaction.repository";
import { transactionIdParamsSchema, transactionUpdateStatusSchema } from "../../validators/transaction.validator";
import TransactionService from "./transaction.service";

const TransactionController = {
    async viewTransactionProof(req: Request, res: Response){
        const { id } = transactionIdParamsSchema.parse(req.params);
        const trxProof = TransactionRepository.viewTransactionProof(id);
        res.send({
			message: "View transaction proof successfully!",
			data: trxProof,
		});
    },

    async transactionApproval(req: Request, res: Response){
        const data = transactionUpdateStatusSchema.parse(req.body);
        res.send({
			message: `Success to change transaction status to ${data.status}!`,
			data: TransactionService.updateStatusTransaction(data),
		});
    },
};

export default TransactionController;