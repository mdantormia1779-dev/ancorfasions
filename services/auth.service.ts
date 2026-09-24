import { createClient } from "@/lib/supabase/server";
import {
  LoginFormValues,
  RegisterFormValues,
  ResetPasswordFormValues,
} from "@/schemas/auth.schema";
import { headers } from "next/headers";

export class AuthService {
  /**
   * Register a new user
   */
  static async register(data: RegisterFormValues) {
    const supabase = await createClient();

    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          first_name: data.firstName,
          last_name: data.lastName,
          assigned_password: data.password,
        },
        // In production, you might want to redirect to a specific URL after email verification
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/callback`,
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    return authData;
  }

  /**
   * Login with email and password
   */
  static async login(data: LoginFormValues) {
    const supabase = await createClient();

    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      // Record failed login logic could go here via a separate RPC call
      throw new Error(error.message);
    }

    return authData;
  }

  /**
   * Login with magic link
   */
  static async loginWithMagicLink(email: string) {
    const supabase = await createClient();

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/callback`,
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    return true;
  }

  /**
   * Login with OAuth Provider
   */
  static async loginWithProvider(
    provider: "google" | "github" | "facebook" | "apple"
  ) {
    const supabase = await createClient();
    const headersList = await headers();
    const host = headersList.get("host");
    const protocol = process.env.NODE_ENV === "development" ? "http" : "https";

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${protocol}://${host}/api/auth/callback`,
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  /**
   * Log out the current user
   */
  static async logout() {
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw new Error(error.message);
    }

    return true;
  }

  /**
   * Reset Password Request (Forgot Password)
   */
  static async requestPasswordReset(email: string) {
    const supabase = await createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password`,
    });

    if (error) {
      throw new Error(error.message);
    }

    return true;
  }

  /**
   * Update Password (Reset Password Flow)
   */
  static async updatePassword(data: ResetPasswordFormValues) {
    const supabase = await createClient();
    const { error } = await supabase.auth.updateUser({
      password: data.password,
    });

    if (error) {
      throw new Error(error.message);
    }

    return true;
  }

  /**
   * Get the current user session
   */
  static async getSession() {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      throw new Error(error.message);
    }

    return data.session;
  }

  /**
   * Get the current user
   */
  static async getUser() {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getUser();

    if (error) {
      throw new Error(error.message);
    }

    return data.user;
  }
}
