'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { User } from '@supabase/supabase-js';
import { DndContext, DragEndEvent, PointerSensor, TouchSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { supabase } from '@/lib/supabase';
import { Item } from '@/lib/types';
import SortableItemCard from '@/components/SortableItemCard';
import ItemCard from '@/components/ItemCard';

const TODAY_LABEL = new Date().toLocaleDateString('en-US', {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
});

interface TodayScreenProps {
  user: User;
  refreshKey: number;
}

export default function TodayScreen({ user, refreshKey }: TodayScreenProps) {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } })
  );

  useEffect(() => {
    fetchItems();
  }, [refreshKey]);

  const fetchItems = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('personal_items')
      .select('*')
      .eq('user_id', user.id)
      .eq('list', 'today')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });
    setItems(data ?? []);
    setLoading(false);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const todo = items.filter((i) => i.status === 'todo');
    const oldIndex = todo.findIndex((i) => i.id === active.id);
    const newIndex = todo.findIndex((i) => i.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const reorderedTodo = arrayMove(todo, oldIndex, newIndex);
    const done = items.filter((i) => i.status === 'done');
    setItems([...reorderedTodo, ...done]);
    await Promise.all(
      reorderedTodo.map((item, index) =>
        supabase.from('personal_items').update({ sort_order: index }).eq('id', item.id)
      )
    );
  };

  const toggleDone = async (item: Item) => {
    const newStatus = item.status === 'done' ? 'todo' : 'done';
    await supabase
      .from('personal_items')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', item.id);
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
      <div className="mb-5">
        <h1 className="text-2xl font-extrabold text-warm-text leading-none">Today</h1>
        <p className="text-xs text-muted mt-1">{TODAY_LABEL}</p>
      </div>

      {loading ? (
        <div className="min-h-screen bg-[#FFF9F2] flex flex-col items-center justify-center px-6">
          <Image src="/images/bunny-mascot.png" alt="Bunny Pocket loading" width={80} height={80} className="h-20 w-20 object-contain animate-pulse opacity-90" />
          <p className="mt-4 text-sm text-[#8B7E78]">Opening your pocket...</p>
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
                  <p className="text-[10px] text-muted font-semibold uppercase tracking-wider">
                    All done · {done.length}
                  </p>
                </div>
              ) : (
                <p className="text-[10px] text-muted font-semibold uppercase tracking-wider mb-2.5">
                  Done · {done.length}
                </p>
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
