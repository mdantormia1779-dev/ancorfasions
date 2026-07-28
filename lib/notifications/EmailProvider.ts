import { Resend } from 'resend';

// Ensure the RESEND_API_KEY is available in the environment
const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy_key');

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
  static async send(payload: EmailPayload): Promise<{ id?: string; error?: any }> {
    try {
      const defaultFrom = process.env.EMAIL_FROM || 'notifications@anchorfashion.com.bd';
      
      const response = await resend.emails.send({
        from: payload.from || defaultFrom,
        to: Array.isArray(payload.to) ? payload.to : [payload.to],
        subject: payload.subject,
        html: payload.html,
        text: payload.text,
      });

      if (response.error) {
        console.error('EmailProvider error:', response.error);
        return { error: response.error };
      }

      return { id: response.data?.id };
    } catch (error) {
      console.error('EmailProvider fatal error:', error);
      return { error };
    }
  }
}
