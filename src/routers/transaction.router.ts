import { Router } from "express";
import TransactionController from "../modules/transaction/transaction.controller";
import {
  roleGuard,
  userTypeGuard,
  verifyAccessToken,
} from "../middlewares/auth.middleware";
import { imageUploader } from "../middlewares/uploader.middleware";

const transactionRouter = Router();

transactionRouter.use(verifyAccessToken);

// transactionRouter.patch(
//   "/transaction-status",
//   roleGuard("SUPER_ADMIN"),
//   TransactionController.transactionApproval,
// );
transactionRouter.get(
  "/me/:id",
  userTypeGuard("CUSTOMER"),
  TransactionController.getMyTransactionById,
);
transactionRouter.get(
  "/me",
  userTypeGuard("CUSTOMER"),
  TransactionController.getMyTransactions,
);

transactionRouter.patch(
  "/:id/payment-proof",
  userTypeGuard("CUSTOMER"),
  imageUploader().single("paymentProof"),
  TransactionController.transactionPaymentProof,
);

transactionRouter.patch(
  "/status",
  roleGuard("SUPER_ADMIN"),
  TransactionController.transactionApproval,
);

transactionRouter.post(
  "/",
  userTypeGuard("CUSTOMER"),
  TransactionController.transactionCheckout,
);
transactionRouter.get(
  "/organizer/:id",
  roleGuard("ADMIN", "SUPER_ADMIN"),
  TransactionController.viewTransactionProof,
);

transactionRouter.patch(
  "/:id",
  userTypeGuard("CUSTOMER"),
  TransactionController.transactionUpdate,
);

transactionRouter.patch(
  "/:id/cancel",
  userTypeGuard("CUSTOMER"),
  TransactionController.transactionCancel,
);

transactionRouter.get(
  "/:id",
  roleGuard("ADMIN", "SUPER_ADMIN"),
  TransactionController.viewTransactionProof,
);

export default transactionRouter;
