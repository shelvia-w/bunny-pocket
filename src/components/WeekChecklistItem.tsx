'use client';

import { useState, useRef, useEffect } from 'react';
import { Item } from '@/lib/types';
import EditItemSheet from '@/components/EditItemSheet';

interface WeekChecklistItemProps {
  item: Item;
  subtasks: Item[];
  onToggle: () => void;
  onDelete: () => void;
  onSave: (updated: Item) => void;
  onMoveToDaily: () => void;
  onAddSubtask: (title: string) => void;
  onToggleSubtask: (sub: Item) => void;
  onDeleteSubtask: (sub: Item) => void;
}

function Checkbox({ checked, onToggle, size = 'md' }: { checked: boolean; onToggle: () => void; size?: 'md' | 'sm' }) {
  const dim = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';
  return (
    <button
      onClick={onToggle}
      className={`${dim} rounded border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
        checked ? 'bg-sage border-sage' : 'border-border hover:border-sage'
      }`}
    >
      {checked && (
        <svg viewBox="0 0 10 10" className="w-full h-full p-[1px] text-white" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="1.5,5 4,8 8.5,2" />
        </svg>
      )}
    </button>
  );
}

export default function WeekChecklistItem({
  item, subtasks, onToggle, onDelete, onSave, onMoveToDaily, onAddSubtask, onToggleSubtask, onDeleteSubtask,
}: WeekChecklistItemProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [addingSubtask, setAddingSubtask] = useState(false);
  const [draft, setDraft] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const isDone = item.status === 'done';

  useEffect(() => {
    if (addingSubtask) inputRef.current?.focus();
  }, [addingSubtask]);

  const submitSubtask = () => {
    const title = draft.trim();
    if (title) onAddSubtask(title);
    setDraft('');
    setAddingSubtask(false);
  };

  return (
    <div className="py-2">
      {/* Parent row */}
      <div className="flex items-center gap-2.5">
        <Checkbox checked={isDone} onToggle={onToggle} />

        <button className="flex-1 min-w-0 text-left" onClick={() => setEditOpen(true)}>
          <span className={`text-sm font-semibold leading-snug ${isDone ? 'line-through text-muted' : 'text-warm-text'}`}>
            {item.title}
          </span>
          {item.details && !isDone && (
            <p className="text-xs text-muted/60 mt-0.5 whitespace-pre-line">{item.details}</p>
          )}
        </button>

        <button
          onClick={() => setMenuOpen(true)}
          className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full text-border hover:text-muted transition-colors"
          aria-label="More options"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="5" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" />
          </svg>
        </button>
      </div>

      {/* Subtasks */}
      {subtasks.length > 0 && (
        <div className="ml-6 mt-1.5 space-y-1.5">
          {subtasks.map((sub) => (
            <div key={sub.id} className="flex items-center gap-2">
              <Checkbox checked={sub.status === 'done'} onToggle={() => onToggleSubtask(sub)} size="sm" />
              <span className={`flex-1 text-xs ${sub.status === 'done' ? 'line-through text-muted' : 'text-warm-text/80'}`}>
                {sub.title}
              </span>
              <button
                onClick={() => onDeleteSubtask(sub)}
                className="text-border hover:text-muted transition-colors text-base leading-none flex-shrink-0"
                aria-label="Delete subtask"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add subtask */}
      <div className="ml-6 mt-1.5">
        {addingSubtask ? (
          <input
            ref={inputRef}
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') submitSubtask();
              if (e.key === 'Escape') { setDraft(''); setAddingSubtask(false); }
            }}
            onBlur={submitSubtask}
            placeholder="New subtask…"
            className="w-full text-xs text-warm-text placeholder:text-muted bg-transparent focus:outline-none py-0.5 border-b border-border"
          />
        ) : (
          <button
            onClick={() => setAddingSubtask(true)}
            className="text-xs text-muted/60 hover:text-muted transition-colors"
          >
            + Add subtask
          </button>
        )}
      </div>

      {/* Action popover */}
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
              <button onClick={() => { setMenuOpen(false); setEditOpen(true); }} className="w-full text-left px-4 py-3 rounded-2xl text-sm font-semibold text-warm-text hover:bg-cream transition-colors">Edit</button>
              <button onClick={() => { onMoveToDaily(); setMenuOpen(false); }} className="w-full text-left px-4 py-3 rounded-2xl text-sm font-semibold text-warm-text hover:bg-cream transition-colors">Move to Daily</button>
              <button onClick={() => { onDelete(); setMenuOpen(false); }} className="w-full text-left px-4 py-3 rounded-2xl text-sm font-semibold text-rose-300 hover:bg-rose-50 transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}

      {editOpen && (
        <EditItemSheet
          item={item}
          onSave={(updated) => { onSave(updated); setEditOpen(false); }}
          onClose={() => setEditOpen(false)}
        />
      )}
    </div>
  );
}
