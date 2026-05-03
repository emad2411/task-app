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
import { handleActionError } from "@/lib/utils/action-error";

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
      // 401 = wrong credentials — safe to show
      if (apiError.statusCode === 401) {
        return { success: false, error: "Invalid email or password" };
      }
      // 403 = email not verified — safe to show
      if (apiError.statusCode === 403) {
        return { success: false, error: "Email not verified. Please check your email for a verification link." };
      }
      // All other API errors — log and return generic message
      console.error("[signInAction] API error:", apiError.statusCode, apiError.body);
      return { success: false, error: "An unexpected error occurred. Please try again." };
    }
    return handleActionError("[signInAction]", error, "An unexpected error occurred");
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
      // 409 = duplicate email — safe to show
      if (apiError.statusCode === 409) {
        return { success: false, error: "An account with this email already exists. Please sign in instead." };
      }
      // 422 = validation error — safe to show (generic message)
      if (apiError.statusCode === 422) {
        return { success: false, error: "Invalid input. Please check your information and try again." };
      }
      // All other API errors — log and return generic message
      console.error("[signUpAction] API error:", apiError.statusCode, apiError.body);
      return { success: false, error: "An unexpected error occurred. Please try again." };
    }
    // Check for duplicate user errors from non-API error paths
    if (error instanceof Error) {
      const msg = error.message.toLowerCase();
      if (msg.includes("user already exists") ||
          msg.includes("already registered") ||
          msg.includes("duplicate")) {
        return { success: false, error: "An account with this email already exists. Please sign in instead." };
      }
    }
    return handleActionError("[signUpAction]", error, "An unexpected error occurred");
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
  } catch (error) {
    // Log the error but still return success to prevent email enumeration
    console.error("[forgotPasswordAction]", error);
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
    return handleActionError("[resetPasswordAction]", error, "Failed to reset password");
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
    // Check for "wrong current password" error — safe to show
    if (error instanceof Error && error.message.toLowerCase().includes("current password")) {
      return { success: false, error: "Current password is incorrect" };
    }
    return handleActionError("[updatePasswordAction]", error, "Failed to update password");
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
    return handleActionError("[verifyEmailAction]", error, "Failed to verify email");
  }
}

export async function signOutAction(): Promise<ActionResult> {
  try {
    await auth.api.signOut({
      headers: await headers(),
    });

    return { success: true, data: { message: "Signed out successfully" } };
  } catch (error) {
    return handleActionError("[signOutAction]", error, "Failed to sign out");
  }
}
