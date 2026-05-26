'use client';

import { useState, useEffect, useRef } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { ActiveTab, ItemCategory, CATEGORIES } from '@/lib/types';

interface AddItemModalProps {
  user: User;
  activeTab: ActiveTab;
  selectedDate?: string;      // for daily
  selectedWeekStart?: string; // for weekly
  onClose: () => void;
  onAdded: () => void;
}

export default function AddItemModal({
  user, activeTab, selectedDate, selectedWeekStart, onClose, onAdded,
}: AddItemModalProps) {
  const [title, setTitle] = useState('');
  const [reminderTime, setReminderTime] = useState('');
  const [category, setCategory] = useState<ItemCategory>('important_urgent');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 150);
    return () => clearTimeout(t);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);

    let reminder_at: string | null = null;
    if (activeTab === 'daily' && reminderTime) {
      const [h, m] = reminderTime.split(':').map(Number);
      const d = new Date();
      d.setHours(h, m, 0, 0);
      reminder_at = d.toISOString();
    }

    const payload: Record<string, unknown> = {
      user_id: user.id,
      title: title.trim(),
      list: activeTab,
      reminder_at,
    };

    if (activeTab === 'daily') {
      payload.due_date = selectedDate ?? null;
    }
    if (activeTab === 'weekly') {
      payload.category = category;
      payload.week_start = selectedWeekStart ?? null;
    }

    const { error } = await supabase.from('personal_items').insert(payload);
    if (!error) onAdded();
    setLoading(false);
  };

  const TAB_LABELS: Record<ActiveTab, string> = {
    pocket: 'Add to Pocket',
    daily:  'Add to Daily',
    weekly: 'Add to Weekly',
  };

  const PLACEHOLDERS: Record<ActiveTab, string> = {
    pocket: "What's on your mind?",
    daily:  'What do you need to do today?',
    weekly: 'What should you work on?',
  };

  const isWeekly = activeTab === 'weekly';

  return (
    <div className={`fixed inset-0 z-50 flex ${isWeekly ? 'items-center justify-center p-4' : 'items-end'}`}>
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]" onClick={onClose} />
      <div
        className={`relative w-full bg-white shadow-soft px-5 pt-5 pb-8 animate-in duration-200 ${
          isWeekly
            ? 'max-w-sm rounded-3xl zoom-in-95 fade-in'
            : 'rounded-t-3xl slide-in-from-bottom'
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-extrabold text-warm-text">{TAB_LABELS[activeTab]}</h2>
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-cream flex items-center justify-center text-muted hover:text-warm-text transition-colors">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            ref={inputRef}
            type="text"
            placeholder={PLACEHOLDERS[activeTab]}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3.5 rounded-2xl border border-border bg-cream text-warm-text placeholder:text-muted text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blush transition"
          />

          {activeTab === 'daily' && (
            <div className="flex items-center gap-3">
              <label className="text-xs text-muted font-semibold flex-shrink-0">⏰ Reminder</label>
              <input
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl border border-border bg-cream text-warm-text text-sm focus:outline-none focus:ring-2 focus:ring-blush transition"
              />
              {reminderTime && (
                <button type="button" onClick={() => setReminderTime('')} className="text-xs text-muted hover:text-warm-text">clear</button>
              )}
            </div>
          )}

          {activeTab === 'weekly' && (
            <div className="space-y-2">
              <p className="text-xs text-muted font-semibold">Section</p>
              <div className="flex flex-col gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setCategory(cat.value)}
                    className={`w-full text-left px-4 py-3 rounded-2xl border-2 text-sm font-semibold transition-all ${
                      category === cat.value
                        ? cat.value === 'important_urgent'
                          ? 'border-blush bg-blush-light text-warm-text'
                          : cat.value === 'important_not_urgent'
                          ? 'border-lavender bg-lavender-light text-warm-text'
                          : 'border-sage bg-sage-light text-warm-text'
                        : 'border-border bg-cream text-muted'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !title.trim()}
            className="w-full py-3.5 bg-blush-dark text-white rounded-2xl font-bold text-sm hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-40 mt-1"
          >
            {loading ? '...' : 'Add'}
          </button>
        </form>
      </div>
    </div>
  );
}
