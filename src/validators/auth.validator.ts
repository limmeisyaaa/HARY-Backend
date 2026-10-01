import { z } from "zod";
import { OrganizerRole } from "../generated/prisma";

export const customerSignUpSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters long!"),
  email: z.string().email("Invalid email format!"),
  password: z.string().min(6, "Password must be at least 6 characters long!"),
  referredByCode: z.string().optional(), // Opsional jika mendaftar pakai kode referral teman
});

export const organizerSignUpSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters long!"),
  email: z.string().email("Invalid email format!"),
  password: z.string().min(6, "Password must be at least 6 characters long!"),
  role: z.enum(OrganizerRole, {
    errorMap: () => ({ message: "Invalid organizer role!" }),
  }).optional() // Opsional tidak ada role automatis default ke "ADMIN"
});

export const credentialsSchema = z.object({
  email: z.string().email("Invalid email format!"),
  password: z.string().min(1, "Password must not be empty!"),
  role: z.enum(OrganizerRole).optional() // Opsional jika login sebagai customer
});