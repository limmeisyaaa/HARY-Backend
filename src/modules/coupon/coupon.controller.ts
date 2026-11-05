import { Request, Response } from "express";
import CouponService from "./coupon.service";

const CouponController = {
	getMyCoupons: async (req: Request, res: Response) => {
		const coupons = await CouponService.getMyCoupons(req.auth.id);

		res.send({ data: coupons });
	},
};

export default CouponController;
