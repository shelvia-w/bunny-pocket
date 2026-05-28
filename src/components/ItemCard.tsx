'use client';

import { useState } from 'react';
import { DndContext, DragEndEvent, PointerSensor, TouchSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Item, formatDateTimeLabel, formatReminderTime } from '@/lib/types';
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
  checkboxVariant?: 'circle' | 'square';
  dragHandleListeners?: Record<string, unknown>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dragHandleAttributes?: Record<string, any>;
  subtasks?: Item[];
  onAddSubtask?: (title: string) => void;
  onToggleSubtask?: (subtask: Item) => void;
  onDeleteSubtask?: (subtask: Item) => void;
  onReorderSubtasks?: (activeId: string, overId: string) => void;
}

interface SubtaskRowProps {
  subtask: Item;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function SubtaskRow({ subtask, onToggle, onEdit, onDelete }: SubtaskRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: subtask.id,
  });

  return (
    <div
      ref={setNodeRef}
      className="flex items-center gap-2"
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.45 : 1,
        zIndex: isDragging ? 10 : undefined,
      }}
    >
      <button
        {...listeners}
        {...attributes}
        className="flex-shrink-0 text-border hover:text-muted transition-colors cursor-grab active:cursor-grabbing touch-none"
        aria-label="Drag subtask to reorder"
      >
        <svg width="10" height="14" viewBox="0 0 10 14" fill="currentColor">
          <circle cx="3" cy="3" r="1" /><circle cx="7" cy="3" r="1" />
          <circle cx="3" cy="7" r="1" /><circle cx="7" cy="7" r="1" />
          <circle cx="3" cy="11" r="1" /><circle cx="7" cy="11" r="1" />
        </svg>
      </button>
      <button
        onClick={onToggle}
        className={`w-3.5 h-3.5 rounded border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
          subtask.status === 'done' ? 'bg-sage border-sage' : 'border-border hover:border-sage'
        }`}
        aria-label={subtask.status === 'done' ? 'Mark subtask undone' : 'Mark subtask done'}
      >
        {subtask.status === 'done' && (
          <svg viewBox="0 0 10 10" className="w-full h-full p-[1px] text-white" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="1.5,5 4,8 8.5,2" />
          </svg>
        )}
      </button>
      <button
        className={`flex-1 text-left text-xs ${subtask.status === 'done' ? 'line-through text-muted' : 'text-warm-text/80'}`}
        onClick={onEdit}
      >
        {subtask.title}
      </button>
      <button
        onClick={onDelete}
        className="text-border hover:text-muted transition-colors text-base leading-none flex-shrink-0"
        aria-label="Delete subtask"
      >
        x
      </button>
    </div>
  );
}

export default function ItemCard({
  item,
  actions,
  onToggleDone,
  onSave,
  accentColor,
  checkboxVariant = 'circle',
  dragHandleListeners,
  dragHandleAttributes,
  subtasks = [],
  onAddSubtask,
  onToggleSubtask,
  onDeleteSubtask,
  onReorderSubtasks,
}: ItemCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingSubtask, setEditingSubtask] = useState<Item | null>(null);
  const [addingSubtask, setAddingSubtask] = useState(false);
  const [subtaskDraft, setSubtaskDraft] = useState('');
  const isDone = item.status === 'done';
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } })
  );

  const submitSubtask = () => {
    const title = subtaskDraft.trim();
    if (title && onAddSubtask) onAddSubtask(title);
    setSubtaskDraft('');
    setAddingSubtask(false);
  };

  const handleSubtaskDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !onReorderSubtasks) return;
    onReorderSubtasks(String(active.id), String(over.id));
  };

  return (
    <>
      <div
        className={`bg-white rounded-2xl shadow-card border mb-2.5 ${
          accentColor ? 'border-l-4' : 'border-border'
        }`}
        style={accentColor ? { borderLeftColor: accentColor, borderColor: '#EDE8DF' } : undefined}
      >
        <div className="px-4 pt-3 pb-0 flex items-start gap-3">
          {dragHandleListeners && (
            <button
              {...dragHandleListeners}
              {...dragHandleAttributes}
              className="mt-0.5 flex-shrink-0 text-border hover:text-muted transition-colors cursor-grab active:cursor-grabbing touch-none"
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
              className={`mt-0.5 ${checkboxVariant === 'square' ? 'w-4 h-4 rounded' : 'w-5 h-5 rounded-full'} border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
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

          <div className="flex-1 min-w-0">
            <button
              className="block w-full text-left"
              onClick={() => setEditOpen(true)}
            >
              <p className={`text-sm font-semibold leading-snug break-words ${isDone ? 'line-through text-muted' : 'text-warm-text'}`}>
                {item.title}
              </p>
            </button>
            {item.reminder_at && !isDone && (
              <p className="text-xs text-muted mt-0.5 flex items-center gap-1">
                <span>⏰</span>
                {formatReminderTime(item.reminder_at)}
              </p>
            )}
            {item.deadline_date && !isDone && (
              <p className="text-xs text-muted mt-0.5">
                Deadline: {formatDateTimeLabel(item.deadline_date)}
              </p>
            )}
          </div>

          <button
            onClick={() => setMenuOpen(true)}
            className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full hover:bg-cream transition-colors text-muted"
            aria-label="More options"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="5" cy="12" r="2" />
              <circle cx="12" cy="12" r="2" />
              <circle cx="19" cy="12" r="2" />
            </svg>
          </button>
        </div>

        {(subtasks.length > 0 || onAddSubtask) && (
          <div className={`px-4 pb-3 mt-1.5 ${onToggleDone ? 'pl-[4.5rem]' : 'pl-[2.625rem]'}`}>
            {subtasks.length > 0 && onToggleSubtask && onDeleteSubtask && (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleSubtaskDragEnd}>
                <SortableContext items={subtasks.map((subtask) => subtask.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-1.5">
                    {subtasks.map((subtask) => (
                      <SubtaskRow
                        key={subtask.id}
                        subtask={subtask}
                        onToggle={() => onToggleSubtask(subtask)}
                        onEdit={() => setEditingSubtask(subtask)}
                        onDelete={() => onDeleteSubtask(subtask)}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}

            {onAddSubtask && (
              <div className={subtasks.length > 0 ? 'mt-1.5' : 'mt-0'}>
                {addingSubtask ? (
                  <input
                    type="text"
                    value={subtaskDraft}
                    onChange={(e) => setSubtaskDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') submitSubtask();
                      if (e.key === 'Escape') {
                        setSubtaskDraft('');
                        setAddingSubtask(false);
                      }
                    }}
                    onBlur={submitSubtask}
                    placeholder="New subtask..."
                    className="w-full text-xs text-warm-text placeholder:text-muted bg-transparent focus:outline-none py-0.5 border-b border-border"
                    autoFocus
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
            )}
          </div>
        )}
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

      {editingSubtask && (
        <EditItemSheet
          item={editingSubtask}
          onSave={(updated) => { onSave(updated); setEditingSubtask(null); }}
          onClose={() => setEditingSubtask(null)}
        />
      )}
    </>
  );
}
