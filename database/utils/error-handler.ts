import { PostgrestError } from "@supabase/supabase-js";
import { logServerError } from "@/lib/utils/error-handler";

export class DatabaseError extends Error {
  constructor(
    public message: string,
    public code: string,
    public details: string | null,
    public hint: string | null
  ) {
    super(message);
    this.name = "DatabaseError";
  }
}

/**
 * Parses raw Postgres/PostgREST errors into strongly typed domain errors.
 */
export function handlePostgresError(error: PostgrestError): DatabaseError {
  let customMessage = error.message;

  // Postgres Error Codes mapping
  switch (error.code) {
    case "23505":
      customMessage =
        "A record with this identifier already exists (Unique Violation).";
      break;
    case "23503":
      customMessage =
        "Referenced record does not exist (Foreign Key Violation).";
      break;
    case "42P01":
      customMessage = "The requested table does not exist.";
      break;
    case "PGRST116":
      customMessage = "Record not found.";
      break;
    default:
      // Leave default message for unknown codes
      break;
  }

  logServerError("DATABASE_POSTGRES", error, {
    code: error.code,
    details: error.details,
    hint: error.hint,
  });

  return new DatabaseError(
    customMessage,
    error.code,
    error.details,
    error.hint
  );
}
