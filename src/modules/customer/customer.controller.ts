import type { Request, Response } from "express";
import AppError from "../../errors/app-error";
import CustomerService from "./customer.service";
import {
	changeCustomerPasswordSchema,
	updateCustomerProfileSchema,
} from "../../validators/customer.validator";
import CustomerRepository from "../../repositories/customer.repository";

const CustomerController = {
	async updateProfile(req: Request, res: Response) {
		const input = updateCustomerProfileSchema.parse(req.body);
		if (Object.keys(input).length === 0 && !req.file) {
			throw new AppError("At least one profile field or profile picture is required!", 400);
		}

		const customer = await CustomerService.updateProfile(
			req.auth.id,
			input,
			req.file,
		);

		res.send({
			message: "Customer profile updated successfully!",
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
        const customer = await CustomerRepository.findById(req.auth.id);

		res.send({
			data: customer,
		});
	},
};

export default CustomerController;