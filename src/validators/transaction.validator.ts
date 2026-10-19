import { z } from "zod";
import { TransactionStatus } from "../generated/prisma";

export const transactionIdParamsSchema = z.strictObject({
	id: z.string().uuid("Invalid event ID. Expected a UUID."),
});

export const transactionUpdateStatusSchema = z.strictObject({
	id: z.string().uuid("Invalid event ID. Expected a UUID."),
	status: z.nativeEnum(TransactionStatus, {
        message: "Invalid transaction status"
    })
});

export type TransactionUpdateStatusSchema = z.infer<typeof transactionUpdateStatusSchema>;