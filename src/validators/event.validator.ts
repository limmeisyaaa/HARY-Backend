import { z } from "zod";

export const eventInputSchema = z.strictObject({
	id: z.string().uuid("Invalid event ID. Expected a UUID.").optional(),
	name: z.string().min(3, "Event name must be at least 3 characters long!"),
	description: z.string(),
	category: z.string(),
	location: z.string(),
	startDate: z.string().date("Invalid date format. Expected YYYY-MM-DD"),
	endDate: z.string().date("Invalid date format. Expected YYYY-MM-DD"),
	availableSeats: z.int().min(1, "Available seat minimum 1!"),
	isFree: z.boolean(),
	ticketTypes: z.array(
        z.object({
            name: z.string().min(1, "Ticket name is required!"),
            price: z.number().min(0, "Price cannot be negative!")
        })
    ).default([]) // Gunakan default array kosong jika tidak dikirim dari client
}).refine(
    (data) => {
        // Jika event berbayar (isFree === false), maka ticketTypes tidak boleh kosong
        if (!data.isFree && data.ticketTypes.length === 0) {
            return false;
        }
        return true;
    }, 
    {
        message: "At least one ticket type is required for paid events!",
        path: ["ticketTypes"] // Error akan spesifik diarahkan ke field ticketTypes
    }
);

export const eventIdParamsSchema = z.strictObject({
	id: z.string().uuid("Invalid event ID. Expected a UUID."),
});

export const eventPaginationQuerySchema = z.strictObject({
	limit: z.coerce.number().int().min(1, "Limit minimum 1!").max(50, "Limit maximum 50!").default(12),
	cursor: z.string().uuid("Invalid cursor. Expected a UUID.").optional(),
});

export type EventInputSchema = z.infer<typeof eventInputSchema>;
export type EventPaginationQuerySchema = z.infer<typeof eventPaginationQuerySchema>;
