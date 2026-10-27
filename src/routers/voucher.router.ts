import { Router } from "express";
import { userTypeGuard, verifyAccessToken } from "../middlewares/auth.middleware";
import VoucherController from "../modules/voucher/voucher.controller";

const VoucherRouter = Router();


// organizer only
VoucherRouter.post(
    "/:eventId",
    verifyAccessToken,
    userTypeGuard("ORGANIZER"),
    VoucherController.createEvent
)

export default VoucherRouter