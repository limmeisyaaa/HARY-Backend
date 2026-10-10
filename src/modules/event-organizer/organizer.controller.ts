import type { Request, Response } from "express";
import AppError from "../../errors/app-error";
import CustomerRepository from "../../repositories/customer.repository";
import { changeOrganizerPasswordSchema, updateOrganizerProfileSchema } from "../../validators/organizer.validator";
import OrganizerService from "./organizer.service";
import OrganizerRepository from "../../repositories/organizer.repository";

const OrganizerController = {
	async updateProfile(req: Request, res: Response) {
		const input = updateOrganizerProfileSchema.parse(req.body);
		if (Object.keys(input).length === 0 && !req.file) {
			throw new AppError("At least one profile field or profile picture is required!", 400);
		}

		const customer = await OrganizerService.updateProfile(
			req.auth.id,
			input,
			req.file,
		);

		res.send({
			message: "Organizer profile updated successfully!",
			data: customer,
		});
	},

	async changePassword(req: Request, res: Response) {
		const input = changeOrganizerPasswordSchema.parse(req.body);
		await OrganizerService.changePassword(req.auth.id, input);

		res.send({
			message: "Organizer password changed successfully!",
			data: null,
		});
	},

    async getPofileData(req: Request, res: Response) {
        const organizer = await OrganizerRepository.findById(req.auth.id);

		res.send({
			data: organizer,
		});
	},
};

export default OrganizerController;