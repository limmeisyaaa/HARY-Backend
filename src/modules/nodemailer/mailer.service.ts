import nodemailer from "nodemailer";
import getTransporter from "../../libs/nodemailer";
import { SMTP_USER } from "../../config/env.config";

const sendEmail = async (bodyEmail: string, recipient: string) => {
  const transporter = getTransporter();
  const info = await transporter.sendMail({
    from: `"HA-RY Pass" <${SMTP_USER}>`,
    to: recipient,
    subject: "Transaction Notification from HA-RY Pass",
    html: bodyEmail,
  });

  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (previewUrl) {
    console.log("Email preview URL:", previewUrl);
  }

  return info;
};

export default sendEmail;