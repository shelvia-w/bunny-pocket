'use client';

import { useState, useEffect, useRef } from 'react';
import { Item } from '@/lib/types';
import { supabase } from '@/lib/supabase';

interface EditItemSheetProps {
  item: Item;
  onSave: (updated: Item) => void;
  onClose: () => void;
}

function toTimeValue(isoString: string | null): string {
  if (!isoString) return '';
  const d = new Date(isoString);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function buildReminderAt(timeValue: string): string | null {
  if (!timeValue) return null;
  const [h, m] = timeValue.split(':').map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d.toISOString();
}

export default function EditItemSheet({ item, onSave, onClose }: EditItemSheetProps) {
  const [title, setTitle] = useState(item.title);
  const [details, setDetails] = useState(item.details ?? '');
  const [reminderTime, setReminderTime] = useState(() => toTimeValue(item.reminder_at));
  const [saving, setSaving] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = setTimeout(() => titleRef.current?.focus(), 150);
    return () => clearTimeout(t);
  }, []);

  const handleSave = async () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;
    setSaving(true);

    const updates = {
      title: trimmedTitle,
      details: details.trim() || null,
      reminder_at: item.list === 'daily' ? buildReminderAt(reminderTime) : item.reminder_at,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('personal_items')
      .update(updates)
      .eq('id', item.id)
      .select()
      .single();

    if (!error && data) onSave(data as Item);
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-6" onClick={onClose}>
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]" />
      <div
        className="relative w-full max-w-sm bg-white rounded-3xl px-5 pt-5 pb-6 shadow-soft max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >

        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-extrabold text-warm-text">Edit</h2>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-cream flex items-center justify-center text-muted hover:text-warm-text transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <label className="text-xs text-muted font-semibold uppercase tracking-wider block mb-1.5">
              Title
            </label>
            <input
              ref={titleRef}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-cream rounded-2xl px-4 py-3 text-sm font-semibold text-warm-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-blush transition"
            />
          </div>

          <div>
            <label className="text-xs text-muted font-semibold uppercase tracking-wider block mb-1.5">
              Details{' '}
              <span className="normal-case font-normal text-muted/70">optional</span>
            </label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Add notes or context…"
              rows={3}
              className="w-full bg-cream rounded-2xl px-4 py-3 text-sm text-warm-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-blush transition resize-none"
            />
          </div>

          {item.list === 'daily' && (
            <div>
              <label className="text-xs text-muted font-semibold uppercase tracking-wider block mb-1.5">
                Reminder{' '}
                <span className="normal-case font-normal text-muted/70">optional</span>
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="time"
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                  className="flex-1 bg-cream rounded-2xl px-4 py-3 text-sm text-warm-text focus:outline-none focus:ring-2 focus:ring-blush transition"
                />
                {reminderTime && (
                  <button
                    type="button"
                    onClick={() => setReminderTime('')}
                    className="text-xs text-muted hover:text-warm-text transition-colors"
                  >
                    clear
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        <button
          onClick={handleSave}
          disabled={saving || !title.trim()}
          className="mt-6 w-full bg-blush-dark text-white rounded-2xl py-3.5 text-sm font-bold disabled:opacity-40 transition-opacity active:scale-[0.98]"
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </div>
  );
}
