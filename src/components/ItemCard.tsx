'use client';

import { useState } from 'react';
import { Item, formatReminderTime } from '@/lib/types';
import EditItemSheet from '@/components/EditItemSheet';

export interface Action {
  label: string;
  onClick: () => void;
  danger?: boolean;
}

interface ItemCardProps {
  item: Item;
  actions: Action[];
  onToggleDone?: () => void;
  onSave: (updated: Item) => void;
  accentColor?: string;
  dragHandleListeners?: Record<string, unknown>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dragHandleAttributes?: Record<string, any>;
}

export default function ItemCard({ item, actions, onToggleDone, onSave, accentColor, dragHandleListeners, dragHandleAttributes }: ItemCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const isDone = item.status === 'done';

  return (
    <>
      <div
        className={`bg-white rounded-2xl shadow-card border mb-2.5 ${
          accentColor ? 'border-l-4' : 'border-border'
        }`}
        style={accentColor ? { borderLeftColor: accentColor, borderColor: '#EDE8DF' } : undefined}
      >
        <div className="px-4 py-3 flex items-center gap-3">
          {dragHandleListeners && (
            <button
              {...dragHandleListeners}
              {...dragHandleAttributes}
              className="flex-shrink-0 text-border hover:text-muted transition-colors cursor-grab active:cursor-grabbing touch-none"
              aria-label="Drag to reorder"
              tabIndex={-1}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                <circle cx="4" cy="3" r="1.2" /><circle cx="10" cy="3" r="1.2" />
                <circle cx="4" cy="7" r="1.2" /><circle cx="10" cy="7" r="1.2" />
                <circle cx="4" cy="11" r="1.2" /><circle cx="10" cy="11" r="1.2" />
              </svg>
            </button>
          )}
          {onToggleDone && (
            <button
              onClick={onToggleDone}
              className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                isDone ? 'bg-sage border-sage' : 'border-border hover:border-sage'
              }`}
              aria-label={isDone ? 'Mark undone' : 'Mark done'}
            >
              {isDone && (
                <svg viewBox="0 0 12 12" className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="2,6 5,9 10,3" />
                </svg>
              )}
            </button>
          )}

          <button
            className="flex-1 min-w-0 text-left"
            onClick={() => setEditOpen(true)}
          >
            <p className={`text-sm font-semibold leading-snug break-words ${isDone ? 'line-through text-muted' : 'text-warm-text'}`}>
              {item.title}
            </p>
            {item.reminder_at && !isDone && (
              <p className="text-xs text-muted mt-0.5 flex items-center gap-1">
                <span>⏰</span>
                {formatReminderTime(item.reminder_at)}
              </p>
            )}
            {item.details && !isDone && (
              <p className="text-xs text-muted/70 mt-0.5 whitespace-pre-line">{item.details}</p>
            )}
          </button>

          <button
            onClick={() => setMenuOpen(true)}
            className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full hover:bg-cream transition-colors text-muted"
            aria-label="More options"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="5" cy="12" r="2" />
              <circle cx="12" cy="12" r="2" />
              <circle cx="19" cy="12" r="2" />
            </svg>
          </button>
        </div>
      </div>

      {/* Three-dot action popover */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6" onClick={() => setMenuOpen(false)}>
          <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]" />
          <div
            className="relative w-full max-w-xs bg-white rounded-3xl shadow-soft px-4 py-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 px-1">
              <p className="text-base font-bold text-warm-text leading-snug truncate">{item.title}</p>
              <p className="text-xs text-muted mt-0.5">Choose an action</p>
            </div>

            <div className="flex flex-col gap-1">
              <button
                onClick={() => { setMenuOpen(false); setEditOpen(true); }}
                className="w-full text-left px-4 py-3 rounded-2xl text-sm font-semibold text-warm-text hover:bg-cream active:bg-border transition-colors"
              >
                Edit
              </button>
              {actions.map((action) => (
                <button
                  key={action.label}
                  onClick={() => { action.onClick(); setMenuOpen(false); }}
                  className={`w-full text-left px-4 py-3 rounded-2xl text-sm font-semibold transition-colors ${
                    action.danger
                      ? 'text-rose-300 hover:bg-rose-50 active:bg-rose-100'
                      : 'text-warm-text hover:bg-cream active:bg-border'
                  }`}
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Edit sheet */}
      {editOpen && (
        <EditItemSheet
          item={item}
          onSave={(updated) => { onSave(updated); setEditOpen(false); }}
          onClose={() => setEditOpen(false)}
        />
      )}
    </>
  );
}
