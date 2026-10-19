import { z } from "zod";

export const eventInputSchema = z.strictObject({
	id: z.string().optional(),
	name: z.string().min(3, "Event name must be at least 3 characters long!"),
	description: z.string(),
	category: z.string(),
	location: z.string(),
	startDate: z.string().date("Invalid date format. Expected YYYY-MM-DD"),
	endDate: z.string().date("Invalid date format. Expected YYYY-MM-DD"),
	availableSeats: z.int().min(1, "Available seat minimum 1!"),
	isFree: z.boolean()
});

export const eventIdParamsSchema = z.strictObject({
	id: z.string().uuid("Invalid event ID. Expected a UUID."),
});

export type EventInputSchema = z.infer<typeof eventInputSchema>;

