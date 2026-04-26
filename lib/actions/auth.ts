"use server";

import { auth } from "@/lib/auth/auth";
// TODO (post-MVP): Consider migrating revalidatePath to revalidateTag
// for more granular cache invalidation as the app scales.
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { APIError, isAPIError } from "better-auth/api";
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

    await auth.api.signInEmail({
      headers: await headers(),
      body: {
        email: validated.email,
        password: validated.password,
      },
    });

    return { success: true, data: { message: "Signed in successfully" } };
  } catch (error) {
    if (isAPIError(error)) {
      const apiError = error as unknown as APIError;
      if (apiError.status === 401) {
        return { success: false, error: "Invalid email or password" };
      }
      if (apiError.status === 403) {
        return { success: false, error: "Email not verified. Please check your email for a verification link." };
      }
      return { success: false, error: apiError.message };
    }
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function signUpAction(input: SignUpInput): Promise<ActionResult> {
  try {
    const validated = signUpSchema.parse(input);

    // Bypass Better Auth's email enumeration protection so the UI can show the error
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, validated.email.toLowerCase()),
    });

    if (existingUser) {
      return { 
        success: false, 
        error: "An account with this email already exists. Please sign in instead." 
      };
    }

    const result = await auth.api.signUpEmail({
      headers: await headers(),
      body: {
        email: validated.email,
        password: validated.password,
        name: validated.name,
      },
    });

    return { success: true, data: { user: result } };
  } catch (error) {
    if (isAPIError(error)) {
      const apiError = error as unknown as APIError;
      if (apiError.status === 409) {
        return { success: false, error: "An account with this email already exists. Please sign in instead." };
      }
      if (apiError.status === 422) {
        return { success: false, error: "Invalid input. Please check your information and try again." };
      }
      return { success: false, error: apiError.message };
    }
    if (error instanceof Error) {
      // Check for common error patterns in error messages
      const errorMessage = error.message.toLowerCase();
      if (errorMessage.includes("user already exists") ||
          errorMessage.includes("already registered") ||
          errorMessage.includes("duplicate")) {
        return { success: false, error: "An account with this email already exists. Please sign in instead." };
      }
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

export async function signOutAction(): Promise<ActionResult> {
  try {
    await auth.api.signOut({
      headers: await headers(),
    });

    return { success: true, data: { message: "Signed out successfully" } };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to sign out" };
  }
}
