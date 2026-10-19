import AppError from "../../errors/app-error";
import { uploadProfilePicture } from "../cloudinary/cloudinary.service";
import AuthService from "../auth/auth.service";
import { ChangeOrganizerPasswordInput, UpdateOrganizerProfileInput } from "../../validators/organizer.validator";
import OrganizerRepository from "../../repositories/organizer.repository";

const OrganizerService = {
	updateProfile: async (
		organizerId: string,
		input: UpdateOrganizerProfileInput
	) => {
		const organizer = await OrganizerRepository.findById(organizerId);
		if (!organizer) throw new AppError("Customer not found!", 404);

		if (input.email && input.email !== organizer.email) {
			const existingOrganizer = await OrganizerRepository.findAuthCredentialsByEmail(input.email);
			if (existingOrganizer) {
				throw new AppError("An account with this email already exists!", 409);
			}
		}

		return OrganizerRepository.editProfile({
			where: { id: organizerId },
			data: {
				...(input.name !== undefined ? { name: input.name } : {}),
				...(input.email !== undefined ? { email: input.email } : {}),
			},
		});
	},

	changeProfilePicture: async (
		organizerId: string,
		profilePicture?: Express.Multer.File,
	) => {
		const customer = await OrganizerRepository.findById(organizerId);
		if (!customer) throw new AppError("Customer not found!", 404);

		const profilePictureUrl = profilePicture
			? await uploadProfilePicture(profilePicture, customer.email, "ORGANIZER")
			: undefined;

		return OrganizerRepository.editProfile({
			where: { id: organizerId },
			data: {
				...(profilePictureUrl ? { profilePicture: profilePictureUrl } : {}),
			},
		});
	},

	changePassword: async (
		organizerId: string,
		input: ChangeOrganizerPasswordInput,
	) => {
		const customer = await OrganizerRepository.findAuthCredentialsById(organizerId);
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
			where: { id: organizerId },
			data: { password: hashedPassword },
		});
	},
};

export default OrganizerService;