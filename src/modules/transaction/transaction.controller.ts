import { Request, Response } from "express";
import TransactionRepository from "../../repositories/transaction.repository";
import {
  transactionCheckoutSchema,
  transactionIdParamsSchema,
  transactionMyQuerySchema,
  transactionUpdateCheckoutSchema,
  transactionUpdateStatusSchema,
} from "../../validators/transaction.validator";
import TransactionService from "./transaction.service";
import AppError from "../../errors/app-error";

const TransactionController = {
  async viewTransactionProof(req: Request, res: Response) {
    const { id } = transactionIdParamsSchema.parse(req.params);
    const trxProof = await TransactionRepository.viewTransactionProof(id);
    res.send({
      message: "View transaction proof successfully!",
      data: trxProof,
    });
  },

  async transactionApproval(req: Request, res: Response) {
    const data = transactionUpdateStatusSchema.parse(req.body);

    if (req.auth.userType === "CUSTOMER")
      throw new AppError("Organizer only", 403);

    const eventOrganizerName = req.auth.eventOrganizerName;
    const update = await TransactionService.updateStatusTransaction(
      data,
      eventOrganizerName,
    );
    res.send({
      message: `Success to change transaction status of ${data.id} to ${data.status}!`,
      data: update,
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

  async transactionPaymentProof(req: Request, res: Response) {
    const { id } = transactionIdParamsSchema.parse(req.params);
    if (!req.file) throw new AppError("Payment proof required", 400);

    const data = await TransactionService.submitPaymentProof(
      id,
      req.auth.id,
      req.file,
    );
    res.send({ message: "Payment proof uploaded!", data });
  },

  async getMyTransactions(req: Request, res: Response) {
    const { status } = transactionMyQuerySchema.parse(req.query);

    const data = await TransactionService.getMyTransactions(
      req.auth.id,
      status,
    );

    res.send({
      data,
    });
  },

  async getMyTransactionById(req: Request, res: Response) {
    const { id } = transactionIdParamsSchema.parse(req.params);

    const data = await TransactionService.getMyTransactionById(
      id,
      req.auth.id,
    );

    res.send({
      data,
    });
  },
};

export default TransactionController;
