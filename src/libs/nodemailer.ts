import nodemailer from "nodemailer";
import {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
} from "../config/env.config";

const getTransporter = () => {
  const port = Number(SMTP_PORT);
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || !Number.isInteger(port) || port < 1) {
    throw new Error("SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS must be configured to send email.");
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port:port,
    secure: port === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
};

export default getTransporter;
