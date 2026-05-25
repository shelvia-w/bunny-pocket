'use client';

import { useEffect, useRef } from 'react';
import { toDateString } from '@/lib/types';

interface DateSelectorProps {
  selectedDate: string;
  onSelect: (date: string) => void;
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function buildDates(): Date[] {
  const dates: Date[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = -3; i <= 13; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    dates.push(d);
  }
  return dates;
}

export default function DateSelector({ selectedDate, onSelect }: DateSelectorProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const today = toDateString(new Date());
  const dates = buildDates();

  useEffect(() => {
    const el = scrollRef.current?.querySelector('[data-selected="true"]') as HTMLElement | null;
    el?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }, []);

  return (
    <div
      ref={scrollRef}
      className="flex gap-2 overflow-x-auto -mx-4 px-4 pb-1"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      {dates.map((date) => {
        const ds = toDateString(date);
        const isSelected = ds === selectedDate;
        const isToday = ds === today;
        return (
          <button
            key={ds}
            data-selected={isSelected}
            onClick={() => onSelect(ds)}
            className={`flex flex-col items-center justify-center flex-shrink-0 w-12 py-2 rounded-2xl transition-all active:scale-95 ${
              isSelected
                ? 'bg-blush-dark text-white shadow-card'
                : 'bg-white text-muted border border-border hover:bg-cream'
            }`}
          >
            <span className={`text-[9px] font-semibold uppercase tracking-wide ${isSelected ? 'text-white/80' : 'text-muted'}`}>
              {isToday ? 'Today' : DAY_NAMES[date.getDay()]}
            </span>
            <span className={`text-base font-bold leading-tight mt-0.5 ${isSelected ? 'text-white' : 'text-warm-text'}`}>
              {date.getDate()}
            </span>
          </button>
        );
      })}
    </div>
  );
}
