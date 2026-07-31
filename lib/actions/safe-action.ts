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
 * Verifies that the authenticated user possesses an 'admin' role.
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
        return { success: false, error: "Unauthorized." };
      }

      // Check for custom admin claim or role in app_metadata
      const isAdmin =
        user.app_metadata?.role === "admin" ||
        user.app_metadata?.role === "super_admin";

      if (!isAdmin) {
        return { success: false, error: "Forbidden. Admin access required." };
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
      console.error("[Admin Action Error]:", error);
      return { success: false, error: "An unexpected error occurred." };
    }
  };
}
