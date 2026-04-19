"use server";

import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import {
  signInSchema,
  signUpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updatePasswordSchema,
  verifyEmailSchema,
  type SignInInput,
  type SignUpInput,
  type ForgotPasswordInput,
  type ResetPasswordInput,
  type UpdatePasswordInput,
  type VerifyEmailInput,
} from "@/lib/validation/auth";

export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function signInAction(input: SignInInput): Promise<ActionResult> {
  try {
    const validated = signInSchema.parse(input);
    
    const result = await auth.api.signInEmail({
      body: {
        email: validated.email,
        password: validated.password,
      },
      asResponse: true,
    });

    if (!result) {
      return { success: false, error: "Invalid email or password" };
    }

    return { success: true, data: { message: "Signed in successfully" } };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function signUpAction(input: SignUpInput): Promise<ActionResult> {
  try {
    const validated = signUpSchema.parse(input);
    
    const result = await auth.api.signUpEmail({
      body: {
        email: validated.email,
        password: validated.password,
        name: validated.name,
      },
    });

    if (!result) {
      return { success: false, error: "Failed to create account" };
    }

    return { success: true, data: { user: result } };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function forgotPasswordAction(input: ForgotPasswordInput): Promise<ActionResult> {
  try {
    const validated = forgotPasswordSchema.parse(input);
    
    await auth.api.requestPasswordReset({
      body: {
        email: validated.email,
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
      },
    });

    return { 
      success: true, 
      data: { message: "If an account exists with this email, you will receive a password reset link" } 
    };
  } catch {
    return { 
      success: true, 
      data: { message: "If an account exists with this email, you will receive a password reset link" } 
    };
  }
}

export async function resetPasswordAction(input: ResetPasswordInput): Promise<ActionResult> {
  try {
    const validated = resetPasswordSchema.parse(input);
    
    await auth.api.resetPassword({
      body: {
        token: validated.token,
        newPassword: validated.newPassword,
      },
    });

    return { success: true, data: { message: "Password reset successfully" } };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to reset password" };
  }
}

export async function updatePasswordAction(input: UpdatePasswordInput): Promise<ActionResult> {
  try {
    const validated = updatePasswordSchema.parse(input);
    
    await auth.api.changePassword({
      headers: await headers(),
      body: {
        currentPassword: validated.currentPassword,
        newPassword: validated.newPassword,
        revokeOtherSessions: true,
      },
    });

    return { success: true, data: { message: "Password updated successfully" } };
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("current password")) {
        return { success: false, error: "Current password is incorrect" };
      }
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to update password" };
  }
}

export async function verifyEmailAction(input: VerifyEmailInput): Promise<ActionResult> {
  try {
    const validated = verifyEmailSchema.parse(input);
    
    await auth.api.verifyEmail({
      query: {
        token: validated.token,
      },
    });

    return { success: true, data: { message: "Email verified successfully" } };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to verify email" };
  }
}
