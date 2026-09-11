import { Resend } from "resend";

// Lazy-initialized Resend client singleton
let resendInstance: Resend | null = null;

function getResend(): Resend {
  const apiKey = process.env.RESEND_API_KEY || "re_dummy_key";
  if (!resendInstance) {
    resendInstance = new Resend(apiKey);
  }
  return resendInstance;
}

export interface EmailPayload {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

export class EmailProvider {
  /**
   * Sends an email using the Resend API.
   * @param payload The email payload (to, subject, html, etc.)
   * @returns The provider's message ID if successful.
   */
  static async send(
    payload: EmailPayload
  ): Promise<{ id?: string; error?: any }> {
    try {
      const defaultFrom =
        process.env.EMAIL_FROM ||
        process.env.NEXT_PUBLIC_EMAIL_FROM ||
        "Anchor Fashion <noreply@accountstoreone.com>";

      const resend = getResend();
      const response = await resend.emails.send({
        from: payload.from || defaultFrom,
        to: Array.isArray(payload.to) ? payload.to : [payload.to],
        subject: payload.subject,
        html: payload.html,
        text: payload.text,
      });

      if (response.error) {
        console.error("EmailProvider error:", response.error);
        return { error: response.error };
      }

      return { id: response.data?.id };
    } catch (error) {
      console.error("EmailProvider fatal error:", error);
      return { error };
    }
  }
}
