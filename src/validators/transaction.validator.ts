import { z } from "zod";
import { TransactionStatus } from "../generated/prisma";

export const transactionIdParamsSchema = z.strictObject({
  id: z.string().uuid("Invalid event ID. Expected a UUID."),
});

export const transactionCheckoutSchema = z.strictObject({
  ticketTypeId: z.string().uuid("invalid ticket type ID. expected a UUID!"),
  quantity: z.int().min(1).max(10, "max item reached (10) per ticket"),
});

export const transactionUpdateStatusSchema = z.strictObject({
  id: z.string().uuid("Invalid event ID. Expected a UUID."),
  // Organizer hanya boleh approve (DONE) atau reject (REJECTED)
  status: z.enum([TransactionStatus.DONE, TransactionStatus.REJECTED], {
    message: "Status must be DONE or REJECTED",
  }),
});

export const transactionUpdateCheckoutSchema = z.strictObject({
  quantity: z.int().min(1).max(10, "max item reached (10) per ticket"),
  voucherId: z.string().uuid().nullable().optional(),
  couponId: z.string().uuid().nullable().optional(),
  usePoints: z.boolean().nullable().optional(),
});

export const transactionMyQuerySchema = z.strictObject({
  status: z.nativeEnum(TransactionStatus).optional(),
});

export type TransactionUpdateStatusSchema = z.infer<
  typeof transactionUpdateStatusSchema
>;
export type TransactionCheckoutSchema = z.infer<
  typeof transactionCheckoutSchema
>;
export type TransactionUpdateCheckoutSchema = z.infer<
  typeof transactionUpdateCheckoutSchema
>;
