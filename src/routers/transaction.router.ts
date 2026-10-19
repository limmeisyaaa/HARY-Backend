import { Router } from "express";
import TransactionController from "../modules/transaction/transaction.controller";
import { roleGuard, verifyAccessToken } from "../middlewares/auth.middleware";

const transactionRouter = Router();

transactionRouter.use(verifyAccessToken);

transactionRouter.get("/:id", roleGuard("ADMIN", "SUPER_ADMIN"), TransactionController.viewTransactionProof);

transactionRouter.patch("/transaction-status", roleGuard("SUPER_ADMIN"), TransactionController.transactionApproval);


export default transactionRouter;
