import AppError from "../../errors/app-error";
import { uploadProfilePicture } from "../cloudinary/cloudinary.service";
import AuthService from "../auth/auth.service";
import { ChangeOrganizerPasswordInput, UpdateOrganizerProfileInput } from "../../validators/organizer.validator";
import OrganizerRepository from "../../repositories/organizer.repository";

const OrganizerService = {
	updateProfile: async (
		customerId: string,
		input: UpdateOrganizerProfileInput,
		profilePicture?: Express.Multer.File,
	) => {
		const organizer = await OrganizerRepository.findById(customerId);
		if (!organizer) throw new AppError("Customer not found!", 404);

		if (input.email && input.email !== organizer.email) {
			const existingOrganizer = await OrganizerRepository.findAuthCredentialsByEmail(input.email);
			if (existingOrganizer) {
				throw new AppError("An account with this email already exists!", 409);
			}
		}

		const profilePictureUrl = profilePicture
			? await uploadProfilePicture(profilePicture, input.email ?? organizer.email, "ORGANIZER")
			: undefined;

		return OrganizerRepository.editProfile({
			where: { id: customerId },
			data: {
				...(input.name !== undefined ? { name: input.name } : {}),
				...(input.email !== undefined ? { email: input.email } : {}),
				...(profilePictureUrl ? { profilePicture: profilePictureUrl } : {}),
			},
		});
	},

	changePassword: async (
		customerId: string,
		input: ChangeOrganizerPasswordInput,
	) => {
		const customer = await OrganizerRepository.findAuthCredentialsById(customerId);
		if (!customer) throw new AppError("Customer not found!", 404);
		if (!customer.password) {
			throw new AppError("Customer does not have a password set!", 400);
		}

		const isCurrentPasswordValid = await AuthService.comparePassword(
			input.newPassword,
			customer.password,
		);
		
		if (isCurrentPasswordValid) {
			throw new AppError("You cannot change password with your previous password!", 400);
		}

		const hashedPassword = await AuthService.hashPassword(input.newPassword);
		return OrganizerRepository.editProfile({
			where: { id: customerId },
			data: { password: hashedPassword },
		});
	},
};

export default OrganizerService;