import { Request, Response } from "express";
import TransactionRepository from "../../repositories/transaction.repository";
import {
  transactionCheckoutSchema,
  transactionIdParamsSchema,
  transactionUpdateCheckoutSchema,
  transactionUpdateStatusSchema,
} from "../../validators/transaction.validator";
import TransactionService from "./transaction.service";

const TransactionController = {
  async viewTransactionProof(req: Request, res: Response) {
    const { id } = transactionIdParamsSchema.parse(req.params);
    const trxProof = TransactionRepository.viewTransactionProof(id);
    res.send({
      message: "View transaction proof successfully!",
      data: trxProof,
    });
  },

  async transactionApproval(req: Request, res: Response) {
    const data = transactionUpdateStatusSchema.parse(req.body);
    res.send({
      message: `Success to change transaction status to ${data.status}!`,
      data: TransactionService.updateStatusTransaction(data),
    });
  },

  async transactionCheckout(req: Request, res: Response) {
    const data = transactionCheckoutSchema.parse(req.body);
    const create = await TransactionService.checkout(req.auth.id, data);
    res.status(201).send({
      message: "Checkout success!",
      data: create,
    });
  },

  async transactionUpdate(req: Request, res: Response) {
    const { id } = transactionIdParamsSchema.parse(req.params);
    const customerId = req.auth.id;
    const input = transactionUpdateCheckoutSchema.parse(req.body);

    const update = await TransactionService.updateCheckout(
      id,
      customerId,
      input,
    );
    res.send({
      message: "Checkout updated!",
      data: update,
    });
  },

  async transactionCancel(req: Request, res: Response) {
    const { id } = transactionIdParamsSchema.parse(req.params);
    const customerId = req.auth.id;

    const update = await TransactionService.cancelTransaction(id, customerId);
    res.send({
      message: "Transaction cancelled successfully",
      data: update,
    });
  },
};

export default TransactionController;
