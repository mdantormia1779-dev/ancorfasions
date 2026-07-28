import { createClient } from '@supabase/supabase-js';
import { EmailProvider } from './EmailProvider';
import { PushProvider } from './PushProvider';
import { TemplateEngine } from './TemplateEngine';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// We use the service role client here as this service will run on the backend
// and needs to bypass RLS to read templates and preferences, and write logs.
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export interface NotificationEvent {
  userId: string;
  templateName: string;
  variables: Record<string, any>;
  emailTo?: string; // Optional override
}

export class NotificationService {
  /**
   * Processes a notification event and dispatches it to the appropriate channels.
   */
  static async dispatch(event: NotificationEvent) {
    const { userId, templateName, variables, emailTo } = event;

    try {
      // 1. Fetch Template
      const { data: template, error: tplError } = await supabase
        .from('notification_templates')
        .select('*')
        .eq('name', templateName)
        .eq('is_active', true)
        .single();

      if (tplError || !template) {
        console.error(`Template ${templateName} not found or inactive`);
        return;
      }

      // 2. Fetch User Preferences (if not system-critical)
      let preferences = null;
      if (template.type !== 'SYSTEM') {
        const { data: pref } = await supabase
          .from('notification_preferences')
          .select('*')
          .eq('user_id', userId)
          .single();
        preferences = pref;
      }

      // Default preferences if none exist
      const isEmailEnabled = preferences ? preferences.email_enabled : true;
      const isPushEnabled = preferences ? preferences.push_enabled : true;
      const isMarketingEnabled = preferences ? preferences.marketing_enabled : true;

      // Filter marketing
      if (template.type === 'MARKETING' && !isMarketingEnabled) {
        console.log(`User ${userId} opted out of marketing`);
        return;
      }

      // Handle Quiet Hours (Simplified logic for demonstration)
      // In a real enterprise system, you'd calculate timezone diffs and queue the message.
      
      const channels: string[] = template.channels || [];
      const subject = TemplateEngine.hydrate(template.subject_template || '', variables);
      const body = TemplateEngine.hydrate(template.body_template, variables);

      // 3. Dispatch to Channels
      
      if (channels.includes('email') && isEmailEnabled && emailTo) {
        const emailRes = await EmailProvider.send({
          to: emailTo,
          subject: subject,
          html: body,
        });
        
        await this.logDelivery(userId, template.id, 'email', emailRes.id, emailRes.error ? 'FAILED' : 'SENT', emailRes.error?.message);
      }

      if (channels.includes('push') && isPushEnabled) {
        // Fetch subscriptions
        const { data: subs } = await supabase
          .from('push_subscriptions')
          .select('*')
          .eq('user_id', userId);

        if (subs && subs.length > 0) {
          for (const sub of subs) {
            const pushRes = await PushProvider.send({
              endpoint: sub.endpoint,
              keys: { p256dh: sub.p256dh, auth: sub.auth }
            }, {
              title: subject,
              body: body.replace(/<[^>]*>?/gm, ''), // Strip HTML for push body
              url: variables.actionUrl || '/'
            });

            await this.logDelivery(userId, template.id, 'push', undefined, pushRes.success ? 'SENT' : 'FAILED', pushRes.error?.message);
          }
        }
      }

      if (channels.includes('in_app')) {
        // We'll write to the old generic `notifications` table or a specific table for in-app display.
        // For Anchor Fashion, we had a `notifications` table for users.
        const { error: inAppErr } = await supabase
          .from('notifications')
          .insert({
            user_id: userId,
            message: subject + ' - ' + body.replace(/<[^>]*>?/gm, ''), // Strip HTML for simple display
          });

        await this.logDelivery(userId, template.id, 'in_app', undefined, inAppErr ? 'FAILED' : 'DELIVERED', inAppErr?.message);
      }

    } catch (error) {
      console.error('Error in NotificationService.dispatch:', error);
    }
  }

  private static async logDelivery(
    userId: string,
    templateId: string,
    channel: string,
    providerId?: string,
    status: string = 'PENDING',
    errorMessage?: string
  ) {
    await supabase.from('notification_logs').insert({
      user_id: userId,
      template_id: templateId,
      channel,
      provider_id: providerId,
      status,
      error_message: errorMessage
    });
  }
}
