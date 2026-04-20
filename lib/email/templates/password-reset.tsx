import { Text } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./components/email-layout";
import { Button } from "./components/button";

interface PasswordResetEmailProps {
  url: string;
  userName: string;
}

export const PasswordResetEmail: React.FC<PasswordResetEmailProps> = ({
  url,
  userName,
}) => {
  return (
    <EmailLayout preview="Reset your TaskFlow password">
      <Text style={greeting}>Hi {userName},</Text>
      <Text style={text}>
        We received a request to reset your password. Click the button below to
        create a new password:
      </Text>
      <Button href={url}>Reset Password</Button>
      <Text style={text}>
        If you didn&apos;t request this, you can safely ignore this email. This
        link will expire in 1 hour for security reasons.
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
