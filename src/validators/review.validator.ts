import z from "zod";

export const reviewEventParamsSchema = z.strictObject({
    eventId: z.string().uuid("Invalid event ID. Expected a UUID.")
})

export const reviewCreateSchema = z.strictObject({
    rating: z.int().min(1, "Invalid rating, must not be below 1").max(5, "Invalid rating, must not be over 5"),
    comment: z.string().trim().min(1).max(500)
})

export const organizerNameParamsSchema = z.strictObject({
    eventOrganizerName: z.string().regex(/^\S+$/, "Event organizer name cannot contain spaces!")
})

export const reviewListQuerySchema = z.strictObject({
    limit: z.coerce.number().int().min(1).max(50).default(10),
    cursor: z.string().uuid("Invalid cursor. Expected a UUID.").optional(),
})

export type ReviewEventParams = z.infer<typeof reviewEventParamsSchema>;
export type ReviewCreateInput = z.infer<typeof reviewCreateSchema>;
export type OrganizerNameParams = z.infer<typeof organizerNameParamsSchema>;
export type ReviewListQuery = z.infer<typeof reviewListQuerySchema>;
