import { z } from "zod";

export const eventReportQuerySchema = z.strictObject({
  groupBy: z.enum(["year", "month", "day"]).default("month"),
  from: z.string().date("Invalid date format. Expected YYYY-MM-DD").optional(),
  to: z.string().date("Invalid date format. Expected YYYY-MM-DD").optional(),
  limit: z.coerce.number().int().min(1).max(50).default(12),
  cursor: z.string().uuid("Invalid cursor. Expected a UUID.").optional(),
}).refine(
  (data) => Boolean(data.from) === Boolean(data.to),
  { message: "Both 'from' and 'to' are required for date range!", path: ["to"] },
).refine(
  (data) => !data.from || !data.to || data.from <= data.to,
  { message: "'from' must be before or equal to 'to'!", path: ["to"] },
);

export type EventReportQuery = z.infer<typeof eventReportQuerySchema>;
