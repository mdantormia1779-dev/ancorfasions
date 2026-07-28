'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface Preferences {
  email_enabled: boolean;
  push_enabled: boolean;
  marketing_enabled: boolean;
  quiet_hours_start: string | null;
  quiet_hours_end: string | null;
}

export function NotificationPreferences() {
  const [preferences, setPreferences] = useState<Preferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', session.user.id)
      .single();

    if (data) {
      setPreferences(data);
    } else {
      // Defaults
      setPreferences({
        email_enabled: true,
        push_enabled: false,
        marketing_enabled: true,
        quiet_hours_start: null,
        quiet_hours_end: null,
      });
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!preferences) return;
    setSaving(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    await supabase
      .from('notification_preferences')
      .upsert({
        user_id: session.user.id,
        ...preferences,
      });

    setSaving(false);
    alert('Preferences saved successfully!');
  };

  const requestPushPermission = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      alert('Push notifications are not supported by your browser.');
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      // In a real implementation, you would subscribe the user to the push manager here
      // and send the subscription object to your backend via the API route we created.
      setPreferences((prev) => prev ? { ...prev, push_enabled: true } : null);
      alert('Push notifications enabled!');
    } else {
      alert('Push notification permission denied.');
    }
  };

  if (loading) return <div>Loading preferences...</div>;
  if (!preferences) return null;

  return (
    <div className="max-w-2xl p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-semibold mb-6">Notification Preferences</h2>
      
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-gray-900">Email Notifications</h3>
            <p className="text-sm text-gray-500">Receive order updates and important alerts via email.</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              className="sr-only peer" 
              checked={preferences.email_enabled}
              onChange={(e) => setPreferences({ ...preferences, email_enabled: e.target.checked })}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-gray-900">Push Notifications</h3>
            <p className="text-sm text-gray-500">Receive real-time alerts directly on your device.</p>
          </div>
          {preferences.push_enabled ? (
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={preferences.push_enabled}
                onChange={(e) => setPreferences({ ...preferences, push_enabled: e.target.checked })}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          ) : (
            <button 
              onClick={requestPushPermission}
              className="px-3 py-1 text-sm text-blue-600 border border-blue-600 rounded hover:bg-blue-50 transition-colors"
            >
              Enable
            </button>
          )}
        </div>

        <div className="flex items-center justify-between border-t pt-6">
          <div>
            <h3 className="font-medium text-gray-900">Marketing & Promotions</h3>
            <p className="text-sm text-gray-500">Receive personalized offers, flash sales, and newsletters.</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              className="sr-only peer" 
              checked={preferences.marketing_enabled}
              onChange={(e) => setPreferences({ ...preferences, marketing_enabled: e.target.checked })}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div className="border-t pt-6">
          <h3 className="font-medium text-gray-900 mb-4">Quiet Hours</h3>
          <p className="text-sm text-gray-500 mb-4">Pause non-essential notifications during these hours.</p>
          <div className="flex gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Start Time</label>
              <input 
                type="time" 
                className="px-3 py-2 border rounded-md"
                value={preferences.quiet_hours_start || ''}
                onChange={(e) => setPreferences({ ...preferences, quiet_hours_start: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">End Time</label>
              <input 
                type="time" 
                className="px-3 py-2 border rounded-md"
                value={preferences.quiet_hours_end || ''}
                onChange={(e) => setPreferences({ ...preferences, quiet_hours_end: e.target.value })}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50 transition-colors"
        >
          {saving ? 'Saving...' : 'Save Preferences'}
        </button>
      </div>
    </div>
  );
}
