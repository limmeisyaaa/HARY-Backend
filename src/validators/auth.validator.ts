import { z } from "zod";
import { OrganizerRole } from "../generated/prisma";

export const customerSignUpSchema = z.strictObject({
  name: z.string().min(3, "Name must be at least 3 characters long!"),
  email: z.string().email("Invalid email format!"),
  password: z.string().min(6, "Password must be at least 6 characters long!"),
  referredByCode: z.string().optional(), // Opsional jika mendaftar pakai kode referral teman
  userType: z.literal("CUSTOMER"), // Hanya bisa mendaftar sebagai CUSTOMER
});

const organizerRoles = [...Object.values(OrganizerRole)] as [OrganizerRole, ...OrganizerRole[]];

export const organizerSignUpSchema = z.strictObject({
  name: z.string().min(3, "Name must be at least 3 characters long!"),
  email: z.string().email("Invalid email format!"),
  password: z.string().min(6, "Password must be at least 6 characters long!"),
  role: z.enum(organizerRoles, { message: "Invalid organizer role!" }).optional(), // Opsional tidak ada role automatis default ke "ADMIN"
  userType: z.literal("ORGANIZER"), // Hanya bisa mendaftar sebagai ORGANIZER
});

export const credentialsSchema = z.strictObject({
  email: z.string().email("Invalid email format!"),
  password: z.string().min(1, "Password must not be empty!"),
  role: z.enum(organizerRoles).optional(), // Tidak perlu jika login sebagai customer
  userType: z.enum(["CUSTOMER", "ORGANIZER"]), // Menentukan tipe pengguna yang sedang login
});

