'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { User } from '@supabase/supabase-js';
import { DndContext, DragEndEvent, PointerSensor, TouchSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { supabase } from '@/lib/supabase';
import { Item, ItemCategory, getWeekStart, toDateString } from '@/lib/types';
import SortableItemCard from '@/components/SortableItemCard';
import CategoryPickerModal from '@/components/CategoryPickerModal';
import DatePickerSheet from '@/components/DatePickerSheet';

interface PocketScreenProps {
  user: User;
}

export default function PocketScreen({ user }: PocketScreenProps) {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState('');
  const [saving, setSaving] = useState(false);
  const [movingToDailyItem, setMovingToDailyItem] = useState<Item | null>(null);
  const [movingToWeeklyItem, setMovingToWeeklyItem] = useState<Item | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } })
  );

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('personal_items')
      .select('*')
      .eq('user_id', user.id)
      .eq('list', 'pocket')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });
    setItems(data ?? []);
    setLoading(false);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const parents = items.filter((i) => i.parent_id === null);
    const oldIndex = parents.findIndex((i) => i.id === active.id);
    const newIndex = parents.findIndex((i) => i.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const reordered = arrayMove(parents, oldIndex, newIndex);
    setItems([...reordered, ...items.filter((i) => i.parent_id !== null)]);
    await Promise.all(
      reordered.map((item, index) =>
        supabase.from('personal_items').update({ sort_order: index }).eq('id', item.id)
      )
    );
  };

  const handleCapture = async () => {
    const title = draft.trim();
    if (!title) return;
    setSaving(true);
    const { data, error } = await supabase
      .from('personal_items')
      .insert({ user_id: user.id, title, list: 'pocket' })
      .select()
      .single();
    if (!error && data) {
      setItems((prev) => [data, ...prev]);
      setDraft('');
    }
    setSaving(false);
    inputRef.current?.focus();
  };

  const moveToDaily = async (item: Item, date: string) => {
    await supabase
      .from('personal_items')
      .update({ list: 'daily', due_date: date, updated_at: new Date().toISOString() })
      .eq('id', item.id);
    await supabase
      .from('personal_items')
      .update({ list: 'daily', due_date: date, updated_at: new Date().toISOString() })
      .eq('parent_id', item.id);
    setItems((prev) => prev.filter((i) => i.id !== item.id && i.parent_id !== item.id));
    setMovingToDailyItem(null);
  };

  const moveToWeekly = async (item: Item, category: ItemCategory) => {
    const weekStart = toDateString(getWeekStart(new Date()));
    await supabase
      .from('personal_items')
      .update({ list: 'weekly', category, week_start: weekStart, updated_at: new Date().toISOString() })
      .eq('id', item.id);
    await supabase
      .from('personal_items')
      .update({ list: 'weekly', category, week_start: weekStart, updated_at: new Date().toISOString() })
      .eq('parent_id', item.id);
    setItems((prev) => prev.filter((i) => i.id !== item.id && i.parent_id !== item.id));
    setMovingToWeeklyItem(null);
  };

  const deleteItem = async (item: Item) => {
    await supabase.from('personal_items').delete().eq('id', item.id);
    setItems((prev) => prev.filter((i) => i.id !== item.id && i.parent_id !== item.id));
  };

  const updateItem = (updated: Item) =>
    setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));

  const toggleItem = async (item: Item) => {
    const newStatus = item.status === 'done' ? 'todo' : 'done';
    await supabase.from('personal_items').update({ status: newStatus, updated_at: new Date().toISOString() }).eq('id', item.id);
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, status: newStatus } : i)));
  };

  const addSubtask = async (parent: Item, title: string) => {
    const { data, error } = await supabase
      .from('personal_items')
      .insert({
        user_id: user.id,
        title,
        list: 'pocket',
        parent_id: parent.id,
      })
      .select()
      .single();

    if (!error && data) setItems((prev) => [...prev, data as Item]);
  };

  const reorderSubtasks = async (parent: Item, activeId: string, overId: string) => {
    const subtasks = items.filter((i) => i.parent_id === parent.id);
    const oldIndex = subtasks.findIndex((i) => i.id === activeId);
    const newIndex = subtasks.findIndex((i) => i.id === overId);
    if (oldIndex === -1 || newIndex === -1) return;

    const reorderedSubtasks = arrayMove(subtasks, oldIndex, newIndex).map((subtask, index) => ({
      ...subtask,
      sort_order: index,
    }));

    setItems((prev) => {
      const next: Item[] = [];
      let inserted = false;

      prev.forEach((item) => {
        if (item.parent_id !== parent.id) {
          next.push(item);
          return;
        }

        if (!inserted) {
          next.push(...reorderedSubtasks);
          inserted = true;
        }
      });

      return next;
    });

    await Promise.all(
      reorderedSubtasks.map((subtask) =>
        supabase.from('personal_items').update({ sort_order: subtask.sort_order }).eq('id', subtask.id)
      )
    );
  };

  const parents = items.filter((i) => i.parent_id === null);
  const subtasksByParent = items.reduce<Record<string, Item[]>>((acc, item) => {
    if (item.parent_id) (acc[item.parent_id] ??= []).push(item);
    return acc;
  }, {});

  return (
    <div>
      {/* Quick-capture input */}
      <div className="flex items-center gap-2 bg-white rounded-2xl border border-border shadow-card px-4 py-3 mb-4">
        <input
          ref={inputRef}
          type="text"
          placeholder="What's on your mind?"
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
        <div className="min-h-screen bg-[#FFF9F2] flex flex-col items-center px-6 pt-36">
          <Image
            src="/images/bunny-mascot.png"
            alt="Bunny Pocket loading"
            width={80}
            height={80}
            className="h-20 w-20 object-contain animate-pulse opacity-90"
          />
          <p className="mt-4 text-sm text-[#8B7E78]">Opening your pocket...</p>
        </div>
      ) : parents.length === 0 ? (
        <div className="flex flex-col items-center pt-10 text-center">
          <Image src="/images/empty-pocket.png" alt="Empty pocket" width={130} height={130} className="object-contain mb-4" />
          <p className="text-warm-text font-bold text-sm mb-1">Your pocket is empty for now ✨</p>
          <p className="text-muted text-xs">Add a thought or idea.</p>
        </div>
      ) : (
        <>
          <p className="text-[10px] text-muted font-semibold uppercase tracking-wider mb-2.5">
            {parents.length} {parents.length === 1 ? 'item' : 'items'}
          </p>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={parents.map((i) => i.id)} strategy={verticalListSortingStrategy}>
              {parents.map((item) => (
                <SortableItemCard
                  key={item.id}
                  item={item}
                  onSave={updateItem}
                  subtasks={subtasksByParent[item.id] ?? []}
                  onAddSubtask={(title) => addSubtask(item, title)}
                  onToggleSubtask={toggleItem}
                  onDeleteSubtask={deleteItem}
                  onReorderSubtasks={(activeId, overId) => reorderSubtasks(item, activeId, overId)}
                  actions={[
                    { label: 'Move to Daily', onClick: () => setMovingToDailyItem(item) },
                    { label: 'Move to Weekly', onClick: () => setMovingToWeeklyItem(item) },
                    { label: 'Delete', onClick: () => deleteItem(item), danger: true },
                  ]}
                />
              ))}
            </SortableContext>
          </DndContext>
        </>
      )}

      {movingToDailyItem && (
        <DatePickerSheet
          onPick={(date) => moveToDaily(movingToDailyItem, date)}
          onClose={() => setMovingToDailyItem(null)}
        />
      )}

      {movingToWeeklyItem && (
        <CategoryPickerModal
          onPick={(category) => moveToWeekly(movingToWeeklyItem, category)}
          onClose={() => setMovingToWeeklyItem(null)}
        />
      )}
    </div>
  );
}
