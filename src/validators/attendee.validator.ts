import { z } from "zod";

export const attendeePaginationQuerySchema = z.strictObject({
  limit: z.coerce
    .number()
    .int()
    .min(1, "Limit minimum 1!")
    .max(50, "Limit maximum 50!")
    .default(12),
  cursor: z.string().uuid("Invalid cursor. Expected a UUID.").optional(),
});

export type AttendeePaginationQuery = z.infer<
  typeof attendeePaginationQuerySchema
>;
