import { createClient } from "../supabase/browser-client";
import {
  RealtimeChannel,
  RealtimePostgresChangesPayload,
} from "@supabase/supabase-js";

type SubscriptionCallback<T extends { [key: string]: any }> = (
  payload: RealtimePostgresChangesPayload<T>
) => void;

/**
 * Enterprise Supabase Realtime Channel Manager
 * Handles subscriptions, reconnections, and presence sync across the app.
 */
export class ChannelManager {
  private supabase = createClient();
  private channels: Map<string, RealtimeChannel> = new Map();

  /**
   * Subscribes to table changes (INSERT, UPDATE, DELETE)
   */
  subscribeToTable<T extends { [key: string]: any }>(
    tableName: string,
    callback: SubscriptionCallback<T>,
    filter?: string // e.g., 'id=eq.123'
  ) {
    const channelName = `public:${tableName}${filter ? `:${filter}` : ""}`;

    if (this.channels.has(channelName)) {
      return this.channels.get(channelName)!;
    }

    const channel = this.supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: tableName,
          filter: filter,
        },
        callback
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          console.warn(`[Realtime] Subscribed to ${channelName}`);
        }
        if (status === "CLOSED") {
          console.warn(`[Realtime] Closed ${channelName}`);
        }
        if (status === "CHANNEL_ERROR") {
          console.error(`[Realtime] Error in ${channelName}`);
        }
      });

    this.channels.set(channelName, channel);
    return channel;
  }

  /**
   * Broadcasts a custom event to a specific channel
   */
  async broadcastEvent(channelName: string, event: string, payload: any) {
    const channel =
      this.channels.get(channelName) || this.supabase.channel(channelName);

    // Ensure subscribed before broadcasting
    if (channel.state !== "joined") {
      channel.subscribe();
    }

    return await channel.send({
      type: "broadcast",
      event: event,
      payload: payload,
    });
  }

  /**
   * Unsubscribes and cleans up a specific channel
   */
  async unsubscribe(channelName: string) {
    const channel = this.channels.get(channelName);
    if (channel) {
      await this.supabase.removeChannel(channel);
      this.channels.delete(channelName);
    }
  }

  /**
   * Closes all active connections (Useful for logout or unmount)
   */
  async closeAll() {
    await this.supabase.removeAllChannels();
    this.channels.clear();
  }
}

// Singleton instance for client-side use
export const realtimeManager = new ChannelManager();
