import { randomBytes } from "node:crypto";

export const generateReferralCode = (): string => {
  return randomBytes(4).toString("hex").toUpperCase();
};