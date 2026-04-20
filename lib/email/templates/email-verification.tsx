import { Text } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./components/email-layout";
import { Button } from "./components/button";

interface EmailVerificationEmailProps {
  url: string;
  userName: string;
}

export const EmailVerificationEmail: React.FC<EmailVerificationEmailProps> = ({
  url,
  userName,
}) => {
  return (
    <EmailLayout preview="Verify your TaskFlow email address">
      <Text style={greeting}>Welcome, {userName}!</Text>
      <Text style={text}>
        Thank you for signing up for TaskFlow. To complete your registration,
        please verify your email address by clicking the button below:
      </Text>
      <Button href={url}>Verify Email</Button>
      <Text style={text}>
        This verification link will expire in 1 hour. If you didn&apos;t create
        an account, you can safely ignore this email.
      </Text>
      <Text style={text}>
        If the button above doesn&apos;t work, copy and paste this link into
        your browser:
      </Text>
      <Text style={link}>{url}</Text>
    </EmailLayout>
  );
};

const greeting = {
  color: "#0f172a",
  fontSize: "18px",
  fontWeight: "600",
  marginBottom: "16px",
};

const text = {
  color: "#374151",
  fontSize: "16px",
  lineHeight: "24px",
  marginBottom: "24px",
};

const link = {
  color: "#3b82f6",
  fontSize: "14px",
  wordBreak: "break-all" as const,
  marginBottom: "24px",
};
