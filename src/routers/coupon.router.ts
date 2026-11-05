import { Router } from "express";
import { userTypeGuard, verifyAccessToken } from "../middlewares/auth.middleware";
import CouponController from "../modules/coupon/coupon.controller";

const couponRouter = Router();

couponRouter.use(verifyAccessToken, userTypeGuard("CUSTOMER"));

// customer's usable coupons (for the cart coupon picker)
couponRouter.get("/", CouponController.getMyCoupons);

export default couponRouter;
