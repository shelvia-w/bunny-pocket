'use client';

import { CalendarDays } from 'lucide-react';
import { toDateString } from '@/lib/types';

interface DateSelectorProps {
  selectedDate: string;
  onSelect: (date: string) => void;
}

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAY_NAMES   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return toDateString(d);
}

function formatLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return `${DAY_NAMES[d.getDay()]}, ${d.getDate()} ${MONTH_NAMES[d.getMonth()]}`;
}

const NAV_BTN = 'w-9 h-9 rounded-full bg-white border border-[#F1E6DD] flex items-center justify-center text-[#8B7E78] hover:text-warm-text active:scale-90 transition-all';

export default function DateSelector({ selectedDate, onSelect }: DateSelectorProps) {
  return (
    <div className="flex items-center justify-center gap-3">
      <button
        onClick={() => onSelect(addDays(selectedDate, -1))}
        className={NAV_BTN}
        style={{ boxShadow: '0 1px 4px rgba(139,126,120,0.10)' }}
        aria-label="Previous day"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="10 4 6 8 10 12" />
        </svg>
      </button>

      <label
        className="flex items-center gap-2 cursor-pointer"
        title="Pick a date"
        aria-label="Open calendar"
      >
        <span className="text-sm font-bold text-warm-text">{formatLabel(selectedDate)}</span>
        <span
          className={NAV_BTN}
          style={{ boxShadow: '0 1px 4px rgba(139,126,120,0.10)' }}
        >
          <CalendarDays size={16} strokeWidth={1.8} />
        </span>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => e.target.value && onSelect(e.target.value)}
          className="sr-only"
          tabIndex={-1}
        />
      </label>

      <button
        onClick={() => onSelect(addDays(selectedDate, 1))}
        className={NAV_BTN}
        style={{ boxShadow: '0 1px 4px rgba(139,126,120,0.10)' }}
        aria-label="Next day"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 4 10 8 6 12" />
        </svg>
      </button>
    </div>
  );
}
