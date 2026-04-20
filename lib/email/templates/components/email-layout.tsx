import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface EmailLayoutProps {
  preview?: string;
  children: React.ReactNode;
}

export const EmailLayout: React.FC<EmailLayoutProps> = ({
  preview,
  children,
}) => {
  return (
    <Html>
      <Head />
      {preview && <Preview>{preview}</Preview>}
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={brand}>TaskFlow</Heading>
          </Section>
          <Section style={content}>{children}</Section>
          <Section style={footer}>
            <Text style={footerText}>
              © {new Date().getFullYear()} TaskFlow. All rights reserved.
            </Text>
            <Text style={footerTextSmall}>
              This is an automated email. Please do not reply to this message.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
  maxWidth: "600px",
};

const header = {
  padding: "0 48px",
  borderBottom: "1px solid #e6ebf1",
  marginBottom: "24px",
};

const brand = {
  color: "#0f172a",
  fontSize: "24px",
  fontWeight: "700",
  margin: "0",
  padding: "16px 0",
};

const content = {
  padding: "0 48px",
};

const footer = {
  padding: "24px 48px 0",
  borderTop: "1px solid #e6ebf1",
  marginTop: "32px",
};

const footerText = {
  color: "#6b7280",
  fontSize: "14px",
  margin: "0 0 8px",
};

const footerTextSmall = {
  color: "#9ca3af",
  fontSize: "12px",
  margin: "0",
};
