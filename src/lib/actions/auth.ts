// src/lib/actions/auth.ts
"use server";

import { signIn, signOut } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { registerSchema } from "@/lib/validations/schemas";
import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import type { ApiResponse } from "@/types";

export async function registerUser(formData: unknown): Promise<ApiResponse> {
  try {
    const parsed = registerSchema.safeParse(formData);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.errors[0]?.message ?? "Validation failed",
      };
    }

    const { name, email, password } = parsed.data;

    // Check if user already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return { success: false, error: "An account with this email already exists" };
    }

    // Architecture note: bcrypt cost factor 12 provides a good balance
    // between security (slow to brute-force) and performance (~250ms).
    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.user.create({
      data: { name, email, password: hashedPassword },
    });

    return { success: true, message: "Account created successfully" };
  } catch (error) {
    console.error("[registerUser]", error);
    return { success: false, error: "Failed to create account" };
  }
}

export async function loginUser(formData: FormData) {
  try {
    await signIn("credentials", {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid email or password" };
        default:
          return { error: "Something went wrong" };
      }
    }
    throw error; // Re-throw redirect errors
  }
}

export async function logoutUser() {
  await signOut({ redirectTo: "/auth/login" });
}
