'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { User } from '@supabase/supabase-js';
import { DndContext, DragEndEvent, PointerSensor, TouchSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { supabase } from '@/lib/supabase';
import { Item, toDateString } from '@/lib/types';
import DateSelector from '@/components/DateSelector';
import SortableItemCard from '@/components/SortableItemCard';
import ItemCard from '@/components/ItemCard';

interface DailyScreenProps {
  user: User;
}

export default function DailyScreen({ user }: DailyScreenProps) {
  const [selectedDate, setSelectedDate] = useState(() => toDateString(new Date()));
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState('');
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } })
  );

  useEffect(() => { fetchItems(); }, [selectedDate]);

  const fetchItems = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('personal_items')
      .select('*')
      .eq('user_id', user.id)
      .eq('list', 'daily')
      .eq('due_date', selectedDate)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });
    setItems(data ?? []);
    setLoading(false);
  };

  const handleCapture = async () => {
    const title = draft.trim();
    if (!title) return;
    setSaving(true);
    const { data, error } = await supabase
      .from('personal_items')
      .insert({ user_id: user.id, title, list: 'daily', due_date: selectedDate })
      .select()
      .single();
    if (!error && data) {
      setItems((prev) => [data, ...prev]);
      setDraft('');
    }
    setSaving(false);
    inputRef.current?.focus();
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const todo = items.filter((i) => i.status === 'todo');
    const oldIndex = todo.findIndex((i) => i.id === active.id);
    const newIndex = todo.findIndex((i) => i.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const reorderedTodo = arrayMove(todo, oldIndex, newIndex);
    setItems([...reorderedTodo, ...items.filter((i) => i.status === 'done')]);
    await Promise.all(
      reorderedTodo.map((item, index) =>
        supabase.from('personal_items').update({ sort_order: index }).eq('id', item.id)
      )
    );
  };

  const toggleDone = async (item: Item) => {
    const newStatus = item.status === 'done' ? 'todo' : 'done';
    await supabase.from('personal_items').update({ status: newStatus, updated_at: new Date().toISOString() }).eq('id', item.id);
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, status: newStatus } : i)));
  };

  const deleteItem = async (item: Item) => {
    await supabase.from('personal_items').delete().eq('id', item.id);
    setItems((prev) => prev.filter((i) => i.id !== item.id));
  };

  const onSave = (updated: Item) =>
    setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));

  const todo = items.filter((i) => i.status === 'todo');
  const done = items.filter((i) => i.status === 'done');

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-2xl font-extrabold text-warm-text leading-none mb-3">Daily</h1>
        <DateSelector selectedDate={selectedDate} onSelect={setSelectedDate} />
      </div>

      {/* Inline add-task input */}
      <div className="flex items-center gap-2 bg-white rounded-2xl border border-border shadow-card px-4 py-3 mb-4">
        <input
          ref={inputRef}
          type="text"
          placeholder="Add a task..."
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleCapture()}
          className="flex-1 bg-transparent text-sm text-warm-text placeholder:text-muted focus:outline-none"
        />
        <button
          onClick={handleCapture}
          disabled={saving || !draft.trim()}
          className="w-7 h-7 rounded-full bg-blush-dark text-white flex items-center justify-center text-lg leading-none flex-shrink-0 disabled:opacity-30 transition-opacity active:scale-90"
          aria-label="Add"
        >
          +
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center pt-16">
          <div className="text-2xl animate-pulse">🐰</div>
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center pt-10 text-center">
          <Image src="/images/empty-today.png" alt="Nothing planned" width={130} height={130} className="object-contain mb-4" />
          <p className="text-warm-text font-bold text-sm mb-1">Nothing planned yet 🌷</p>
          <p className="text-muted text-xs">Soft start. Pick one little thing.</p>
        </div>
      ) : (
        <>
          {todo.length > 0 && (
            <>
              <p className="text-[10px] text-muted font-semibold uppercase tracking-wider mb-2.5">
                To Do · {todo.length}
              </p>
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={todo.map((i) => i.id)} strategy={verticalListSortingStrategy}>
                  {todo.map((item) => (
                    <SortableItemCard
                      key={item.id}
                      item={item}
                      onToggleDone={() => toggleDone(item)}
                      onSave={onSave}
                      actions={[{ label: 'Delete', onClick: () => deleteItem(item), danger: true }]}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            </>
          )}

          {done.length > 0 && (
            <div className={todo.length > 0 ? 'mt-5' : ''}>
              {todo.length === 0 ? (
                <div className="flex items-center gap-1.5 mb-2.5">
                  <Image src="/images/bunny-carrot.png" alt="" width={16} height={16} className="object-contain" />
                  <p className="text-[10px] text-muted font-semibold uppercase tracking-wider">All done · {done.length}</p>
                </div>
              ) : (
                <p className="text-[10px] text-muted font-semibold uppercase tracking-wider mb-2.5">Done · {done.length}</p>
              )}
              {done.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  onToggleDone={() => toggleDone(item)}
                  onSave={onSave}
                  actions={[{ label: 'Delete', onClick: () => deleteItem(item), danger: true }]}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
