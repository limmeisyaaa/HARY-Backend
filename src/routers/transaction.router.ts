import { Router } from "express";
import TransactionController from "../modules/transaction/transaction.controller";
import {
  roleGuard,
  userTypeGuard,
  verifyAccessToken,
} from "../middlewares/auth.middleware";

const transactionRouter = Router();

transactionRouter.use(verifyAccessToken);

transactionRouter.patch(
  "/transaction-status",
  roleGuard("SUPER_ADMIN"),
  TransactionController.transactionApproval,
);

transactionRouter.post(
  "/",
  userTypeGuard("CUSTOMER"),
  TransactionController.transactionCheckout,
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
)

transactionRouter.get(
  "/:id",
  roleGuard("ADMIN", "SUPER_ADMIN"),
  TransactionController.viewTransactionProof,
);

export default transactionRouter;
