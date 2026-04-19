import { z } from "zod";

export const signInSchema = z.object({
  email: z.email({ message: "Please enter a valid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
});

export const signUpSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }).max(100, { message: "Name must be less than 100 characters" }),
  email: z.email({ message: "Please enter a valid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
});

export const forgotPasswordSchema = z.object({
  email: z.email({ message: "Please enter a valid email address" }),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, { message: "Reset token is required" }),
  newPassword: z.string().min(8, { message: "Password must be at least 8 characters" }),
});

export const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, { message: "Current password is required" }),
  newPassword: z.string().min(8, { message: "New password must be at least 8 characters" }),
});

export const verifyEmailSchema = z.object({
  token: z.string().min(1, { message: "Verification token is required" }),
});

export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
