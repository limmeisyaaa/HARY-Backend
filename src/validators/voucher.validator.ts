import { z } from "zod";

const voucherCode = z
	.string()
	.trim()
	.toUpperCase()
	.min(3, "Voucher code must be at least 3 characters long!")
	.max(20, "Voucher code must be at most 20 characters long!")
	.regex(/^[A-Z0-9]+$/, "Voucher code can only contain letters and numbers!");

export const voucherInputSchema = z.strictObject({
	code: voucherCode,
	discountAmount: z.number().positive("Discount amount must be greater than 0!"),
	startDate: z.string().date("Invalid date format. Expected YYYY-MM-DD"),
	endDate: z.string().date("Invalid date format. Expected YYYY-MM-DD"),
}).refine(
	(data) => new Date(data.startDate) <= new Date(data.endDate),
	{
		message: "Start date must be before or equal to end date!",
		path: ["endDate"],
	}
);

// Untuk edit voucher: semua field opsional, tapi tanggal tetap dicek jika keduanya dikirim
export const voucherUpdateSchema = z.strictObject({
	code: voucherCode.optional(),
	discountAmount: z.number().positive("Discount amount must be greater than 0!").optional(),
	startDate: z.string().date("Invalid date format. Expected YYYY-MM-DD").optional(),
	endDate: z.string().date("Invalid date format. Expected YYYY-MM-DD").optional(),
}).refine(
	(data) => !data.startDate || !data.endDate || new Date(data.startDate) <= new Date(data.endDate),
	{
		message: "Start date must be before or equal to end date!",
		path: ["endDate"],
	}
);

// Untuk customer saat checkout
export const voucherValidateSchema = z.strictObject({
	eventId: z.string().uuid("Invalid event ID. Expected a UUID."),
	code: voucherCode,
});

export const voucherEventParamsSchema = z.strictObject({
	eventId: z.string().uuid("Invalid event ID. Expected a UUID."),
});

export const voucherIdParamsSchema = z.strictObject({
	id: z.string().uuid("Invalid voucher ID. Expected a UUID."),
});

export type VoucherInputSchema = z.infer<typeof voucherInputSchema>;
export type VoucherUpdateSchema = z.infer<typeof voucherUpdateSchema>;
export type VoucherValidateSchema = z.infer<typeof voucherValidateSchema>;
