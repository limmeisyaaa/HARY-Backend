import AppError from "../../errors/app-error";
import CustomerRepository from "../../repositories/customer.repository";
import type {
	ChangeCustomerPasswordInput,
	UpdateCustomerProfileInput,
} from "../../validators/customer.validator";
import { uploadProfilePicture } from "../cloudinary/cloudinary.service";
import AuthService from "../auth/auth.service";

const CustomerService = {
	updateProfile: async (
		customerId: string,
		input: UpdateCustomerProfileInput,
		profilePicture?: Express.Multer.File,
	) => {
		const customer = await CustomerRepository.findById(customerId);
		if (!customer) throw new AppError("Customer not found!", 404);

		if (input.email && input.email !== customer.email) {
			const existingCustomer = await CustomerRepository.findAuthCredentialsByEmail(input.email);
			if (existingCustomer) {
				throw new AppError("An account with this email already exists!", 409);
			}
		}

		const profilePictureUrl = profilePicture
			? await uploadProfilePicture(profilePicture, input.email ?? customer.email, "CUSTOMER")
			: undefined;

		return CustomerRepository.editProfile({
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
		input: ChangeCustomerPasswordInput,
	) => {
		const customer = await CustomerRepository.findAuthCredentialsById(customerId);
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
		return CustomerRepository.editProfile({
			where: { id: customerId },
			data: { password: hashedPassword },
		});
	},
};

export default CustomerService;