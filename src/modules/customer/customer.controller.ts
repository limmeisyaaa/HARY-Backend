import type { Request, Response } from "express";
import AppError from "../../errors/app-error";
import CustomerService from "./customer.service";
import {
	changeCustomerPasswordSchema,
	updateCustomerProfileSchema,
} from "../../validators/customer.validator";
import PointRepository from "../../repositories/point.repository";

const CustomerController = {
	async updateProfile(req: Request, res: Response) {
		const input = updateCustomerProfileSchema.parse(req.body);

		const customer = await CustomerService.updateProfile(
			req.auth.id,
			input
		);

		res.send({
			message: "Customer profile updated successfully!",
			data: customer,
		});
	},

	async changeProfilePicture(req: Request, res: Response){
		if (!req.file) {
			throw new AppError("No picture for changes!", 400);
		}

		const customer = await CustomerService.changeProfilePicture(
			req.auth.id,
			req.file,
		);

		res.send({
			message: "Customer Profile picture updated successfully!",
			data: customer,
		});
	},

	async changePassword(req: Request, res: Response) {
		const input = changeCustomerPasswordSchema.parse(req.body);
		await CustomerService.changePassword(req.auth.id, input);

		res.send({
			message: "Customer password changed successfully!",
			data: null,
		});
	},

    async getPofileData(req: Request, res: Response) {
        const customer = await PointRepository.findCustomerProfileWithPoints(req.auth.id);

		if (!customer) {
			throw new AppError("Customer not found!", 404);
		}

		res.send({
			data: customer,
		});
	},
};

export default CustomerController;