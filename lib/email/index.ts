import * as React from "react";
import { sendEmail } from "./resend";
import { PasswordResetEmail } from "./templates/password-reset";
import { EmailVerificationEmail } from "./templates/email-verification";

interface SendPasswordResetEmailOptions {
  to: string;
  userName: string;
  resetUrl: string;
}

interface SendVerificationEmailOptions {
  to: string;
  userName: string;
  verificationUrl: string;
}

export async function sendPasswordResetEmail(
  options: SendPasswordResetEmailOptions
): Promise<void> {
  const { to, userName, resetUrl } = options;

  await sendEmail({
    to,
    subject: "Reset your TaskFlow password",
    react: React.createElement(PasswordResetEmail, { url: resetUrl, userName }),
  });
}

export async function sendVerificationEmail(
  options: SendVerificationEmailOptions
): Promise<void> {
  const { to, userName, verificationUrl } = options;

  await sendEmail({
    to,
    subject: "Verify your TaskFlow email address",
    react: React.createElement(EmailVerificationEmail, { url: verificationUrl, userName }),
  });
}

export type { SendPasswordResetEmailOptions, SendVerificationEmailOptions };
