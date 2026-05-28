'use client';

import { useEffect, useRef, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { Item } from '@/lib/types';

interface ReminderWatcherProps {
  user: User;
}

const SENT_KEY = 'bunny-pocket-sent-reminders';

function getSentReminders(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(SENT_KEY) ?? '{}') as Record<string, string>;
  } catch {
    return {};
  }
}

function markReminderSent(item: Item) {
  const sent = getSentReminders();
  sent[item.id] = item.reminder_at ?? new Date().toISOString();
  localStorage.setItem(SENT_KEY, JSON.stringify(sent));
}

function shouldNotify(item: Item) {
  if (!item.reminder_at) return false;
  const sent = getSentReminders();
  return sent[item.id] !== item.reminder_at;
}

function showReminder(item: Item) {
  if (!shouldNotify(item)) return;

  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('Bunny Pocket reminder', {
      body: item.title,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
    });
  }

  markReminderSent(item);
}

export default function ReminderWatcher({ user }: ReminderWatcherProps) {
  const [needsPermission, setNeedsPermission] = useState(false);
  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    if (!('Notification' in window)) return;
    setNeedsPermission(Notification.permission === 'default');
  }, []);

  useEffect(() => {
    let cancelled = false;

    const clearTimers = () => {
      timersRef.current.forEach((timer) => window.clearTimeout(timer));
      timersRef.current = [];
    };

    const scheduleReminders = async () => {
      clearTimers();

      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const { data } = await supabase
        .from('personal_items')
        .select('*')
        .eq('user_id', user.id)
        .eq('list', 'daily')
        .eq('status', 'todo')
        .not('reminder_at', 'is', null)
        .gte('reminder_at', now.toISOString())
        .lte('reminder_at', tomorrow.toISOString())
        .order('reminder_at', { ascending: true });

      if (cancelled) return;

      (data ?? []).forEach((item) => {
        const reminderAt = item.reminder_at ? new Date(item.reminder_at).getTime() : 0;
        const delay = reminderAt - Date.now();
        if (delay < 0 || !shouldNotify(item as Item)) return;

        const timer = window.setTimeout(() => showReminder(item as Item), delay);
        timersRef.current.push(timer);
      });
    };

    scheduleReminders();
    const interval = window.setInterval(scheduleReminders, 60_000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
      clearTimers();
    };
  }, [user.id]);

  const enableNotifications = async () => {
    if (!('Notification' in window)) return;
    const permission = await Notification.requestPermission();
    setNeedsPermission(permission === 'default');
  };

  if (!needsPermission) return null;

  return (
    <button
      onClick={enableNotifications}
      className="fixed left-4 right-4 z-50 bg-white border border-border shadow-soft rounded-2xl px-4 py-3 text-sm font-bold text-warm-text active:scale-[0.98] transition-all"
      style={{ bottom: 'calc(env(safe-area-inset-bottom) + 86px)' }}
    >
      Enable reminders
    </button>
  );
}
