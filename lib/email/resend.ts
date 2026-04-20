import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export interface EmailOptions {
  to: string;
  subject: string;
  react: React.ReactNode;
}

export async function sendEmail(options: EmailOptions): Promise<void> {
  const { to, subject, react } = options;

  const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

  if (!resend) {
    console.log("\n📧 [DEV MODE] Email would be sent:");
    console.log("From:", fromEmail);
    console.log("To:", to);
    console.log("Subject:", subject);
    console.log("\n[Email HTML Component rendered]");
    return;
  }

  try {
    await resend.emails.send({
      from: `TaskFlow <${fromEmail}>`,
      to: [to],
      subject,
      react,
    });
  } catch (error) {
    console.error("Failed to send email:", error);
    throw error;
  }
}
