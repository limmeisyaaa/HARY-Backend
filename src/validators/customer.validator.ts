import { z } from "zod";

export const updateCustomerProfileSchema = z.strictObject({
	name: z.string().trim().min(3, "Name must be at least 3 characters long!").optional(),
	email: z.string().email("Invalid email format!").optional(),
});

export type UpdateCustomerProfileInput = z.infer<typeof updateCustomerProfileSchema>;

export const changeCustomerPasswordSchema = z.strictObject({
	newPassword: z.string().min(6, "New password must be at least 6 characters long!"),
});

export type ChangeCustomerPasswordInput = z.infer<typeof changeCustomerPasswordSchema>;
