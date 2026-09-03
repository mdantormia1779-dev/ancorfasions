import { z } from "zod";
import { createClient } from "../supabase/server-client";
import {
  handlePostgresError,
  DatabaseError,
} from "@/database/utils/error-handler";
import { User } from "@supabase/supabase-js";

export type ActionState<T> = {
  success: boolean;
  data?: T;
  error?: string;
  errors?: Record<string, string[] | undefined>; // Form validation errors
};

type ProtectedActionContext = {
  user: User;
};

/**
 * Creates a public server action with Zod validation.
 */
export function createSafeAction<Input, Output>(
  schema: z.Schema<Input>,
  handler: (parsedInput: Input) => Promise<Output>
) {
  return async (input: Input): Promise<ActionState<Output>> => {
    try {
      const parsedInput = schema.parse(input);
      const data = await handler(parsedInput);
      return { success: true, data };
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          error: "Validation failed",
          errors: error.flatten().fieldErrors,
        };
      }
      if (error instanceof DatabaseError) {
        return { success: false, error: error.message };
      }
      console.error("[Action Error]:", error);
      return { success: false, error: "An unexpected error occurred." };
    }
  };
}

/**
 * Creates an authenticated server action.
 * Automatically verifies the user's session before executing the handler.
 */
export function createProtectedAction<Input, Output>(
  schema: z.Schema<Input>,
  handler: (parsedInput: Input, ctx: ProtectedActionContext) => Promise<Output>
) {
  return async (input: Input): Promise<ActionState<Output>> => {
    const supabase = await createClient();
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        return { success: false, error: "Unauthorized. Please log in." };
      }

      const parsedInput = schema.parse(input);
      const data = await handler(parsedInput, { user });
      return { success: true, data };
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          error: "Validation failed",
          errors: error.flatten().fieldErrors,
        };
      }
      if (error instanceof DatabaseError) {
        return { success: false, error: error.message };
      }
      console.error("[Protected Action Error]:", error);
      return { success: false, error: "An unexpected error occurred." };
    }
  };
}

/**
 * Creates an admin-only server action.
 * Verifies that the authenticated user possesses an 'admin' or 'manager' role.
 */
export function createAdminAction<Input, Output>(
  schema: z.Schema<Input>,
  handler: (parsedInput: Input, ctx: ProtectedActionContext) => Promise<Output>
) {
  return async (input: Input): Promise<ActionState<Output>> => {
    const supabase = await createClient();
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        return { success: false, error: "Unauthorized. Please log in." };
      }

      // Allow admin, super_admin, and manager roles
      const role = user.app_metadata?.role;
      const isAllowed =
        role === "admin" || role === "super_admin" || role === "manager";

      if (!isAllowed) {
        console.warn(`[Admin Action] Access denied for user ${user.id} with role: ${role}`);
        return { success: false, error: "Forbidden. Insufficient permissions." };
      }

      const parsedInput = schema.parse(input);
      const data = await handler(parsedInput, { user });
      return { success: true, data };
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        const fieldErrors = error.flatten().fieldErrors;
        const firstError = Object.values(fieldErrors)[0]?.[0];
        return {
          success: false,
          error: firstError || "Validation failed. Please check the form fields.",
          errors: fieldErrors,
        };
      }
      if (error instanceof DatabaseError) {
        return { success: false, error: error.message };
      }
      // Surface the real error message for debugging instead of hiding it
      const message = error?.message || "An unexpected error occurred.";
      console.error("[Admin Action Error]:", error);
      return { success: false, error: message };
    }
  };
}
