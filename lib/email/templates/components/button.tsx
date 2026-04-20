import * as React from "react";

interface ButtonProps {
  href: string;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ href, children }) => {
  return (
    <a href={href} style={button}>
      {children}
    </a>
  );
};

const button = {
  backgroundColor: "#0f172a",
  borderRadius: "6px",
  color: "#ffffff",
  display: "inline-block",
  fontSize: "16px",
  fontWeight: "600",
  lineHeight: "48px",
  textAlign: "center" as const,
  textDecoration: "none",
  width: "200px",
};
