'use client';

import { useEffect, useRef, useState } from 'react';
import { CATEGORIES, Item, ItemCategory } from '@/lib/types';
import { supabase } from '@/lib/supabase';

interface EditItemSheetProps {
  item: Item;
  onSave: (updated: Item) => void;
  onClose: () => void;
}

function toDateTimeLocalValue(isoString: string | null): string {
  if (!isoString) return '';
  const d = isoString.includes('T') ? new Date(isoString) : new Date(`${isoString}T00:00:00`);
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
  ].join('-') + `T${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function fromDateTimeLocalValue(value: string): string | null {
  if (!value) return null;
  return new Date(value).toISOString();
}

export default function EditItemSheet({ item, onSave, onClose }: EditItemSheetProps) {
  const [title, setTitle] = useState(item.title);
  const [deadlineDate, setDeadlineDate] = useState(() => toDateTimeLocalValue(item.deadline_date));
  const [category, setCategory] = useState<ItemCategory | null>(item.category);
  const [saving, setSaving] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);
  const canEditCategory = item.list === 'weekly' && item.parent_id === null;

  useEffect(() => {
    const t = setTimeout(() => titleRef.current?.focus(), 150);
    return () => clearTimeout(t);
  }, []);

  const handleSave = async () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;
    setSaving(true);

    const updates: Record<string, unknown> = {
      title: trimmedTitle,
      deadline_date: fromDateTimeLocalValue(deadlineDate),
      updated_at: new Date().toISOString(),
    };

    if (canEditCategory) {
      updates.category = category;
    }

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
            x
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
              Deadline <span className="normal-case font-normal text-muted/70">optional</span>
            </label>
            <div className="flex items-center gap-3">
              <input
                type="datetime-local"
                value={deadlineDate}
                onChange={(e) => setDeadlineDate(e.target.value)}
                className="flex-1 bg-cream rounded-2xl px-4 py-3 text-sm text-warm-text focus:outline-none focus:ring-2 focus:ring-blush transition"
              />
              {deadlineDate && (
                <button
                  type="button"
                  onClick={() => setDeadlineDate('')}
                  className="text-xs text-muted hover:text-warm-text transition-colors"
                >
                  clear
                </button>
              )}
            </div>
          </div>

          {canEditCategory && (
            <div>
              <label className="text-xs text-muted font-semibold uppercase tracking-wider block mb-1.5">
                Section
              </label>
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
        </div>

        <button
          onClick={handleSave}
          disabled={saving || !title.trim()}
          className="mt-6 w-full bg-blush-dark text-white rounded-2xl py-3.5 text-sm font-bold disabled:opacity-40 transition-opacity active:scale-[0.98]"
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>
    </div>
  );
}
