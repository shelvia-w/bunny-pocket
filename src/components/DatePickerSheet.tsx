'use client';

import { useState } from 'react';
import { toDateString } from '@/lib/types';
import DateSelector from '@/components/DateSelector';

interface DatePickerSheetProps {
  title?: string;
  confirmLabel?: string;
  onPick: (date: string) => void;
  onClose: () => void;
}

export default function DatePickerSheet({
  title = 'Move to Daily',
  confirmLabel = 'Move',
  onPick,
  onClose,
}: DatePickerSheetProps) {
  const [selected, setSelected] = useState(() => toDateString(new Date()));

  return (
    <div className="fixed inset-0 z-50 flex items-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]" />
      <div
        className="relative w-full bg-white rounded-t-3xl shadow-soft px-5 pt-5 pb-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-extrabold text-warm-text">{title}</h2>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-cream flex items-center justify-center text-muted hover:text-warm-text transition-colors"
          >
            ✕
          </button>
        </div>

        <DateSelector selectedDate={selected} onSelect={setSelected} />

        <button
          onClick={() => onPick(selected)}
          className="mt-5 w-full bg-blush-dark text-white rounded-2xl py-3 text-sm font-bold active:scale-[0.98] transition-all"
        >
          {confirmLabel}
        </button>
      </div>
    </div>
  );
}
