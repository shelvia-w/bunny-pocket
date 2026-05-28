'use client';

import { ItemCategory, CATEGORIES } from '@/lib/types';

interface CategoryPickerModalProps {
  onPick: (category: ItemCategory) => void;
  onClose: () => void;
}

export default function CategoryPickerModal({ onPick, onClose }: CategoryPickerModalProps) {
  const COLORS: Record<ItemCategory, string> = {
    important_urgent: 'bg-blush-light border-blush',
    important_not_urgent: 'bg-lavender-light border-lavender',
    keep_in_mind: 'bg-sage-light border-sage',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-soft px-5 pt-5 pb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-extrabold text-warm-text">Move to Weekly — pick section</h2>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-cream flex items-center justify-center text-muted hover:text-warm-text transition-colors"
          >
            ✕
          </button>
        </div>
        <div className="space-y-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => onPick(cat.value)}
              className={`w-full text-left px-4 py-3.5 rounded-2xl border-2 text-sm font-semibold transition-all active:scale-[0.98] ${COLORS[cat.value]}`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
