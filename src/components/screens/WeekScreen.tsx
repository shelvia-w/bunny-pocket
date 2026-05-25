'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { Item, ItemCategory } from '@/lib/types';
import WeekChecklistItem from '@/components/WeekChecklistItem';

interface WeekScreenProps {
  user: User;
  refreshKey: number;
}

const SECTIONS: { category: ItemCategory; label: string; bgClass: string; dotClass: string }[] = [
  { category: 'important_urgent',     label: 'Important + Urgent',     bgClass: 'bg-blush-light',   dotClass: 'bg-blush-dark' },
  { category: 'important_not_urgent', label: 'Important + Not Urgent', bgClass: 'bg-lavender-light', dotClass: 'bg-lavender-dark' },
  { category: 'keep_in_mind',         label: 'Keep in Mind',           bgClass: 'bg-sage-light',    dotClass: 'bg-sage-dark' },
];

export default function WeekScreen({ user, refreshKey }: WeekScreenProps) {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchItems();
  }, [refreshKey]);

  const fetchItems = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('personal_items')
      .select('*')
      .eq('user_id', user.id)
      .eq('list', 'week')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true });
    setItems(data ?? []);
    setLoading(false);
  };

  const updateItem = (updated: Item) =>
    setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));

  const removeItem = (id: string) =>
    setItems((prev) => prev.filter((i) => i.id !== id && i.parent_id !== id));

  const toggleItem = async (item: Item) => {
    const newStatus = item.status === 'done' ? 'todo' : 'done';
    await supabase.from('personal_items').update({ status: newStatus, updated_at: new Date().toISOString() }).eq('id', item.id);
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, status: newStatus } : i)));
  };

  const deleteItem = async (item: Item) => {
    await supabase.from('personal_items').delete().eq('id', item.id);
    removeItem(item.id);
  };

  const moveToToday = async (item: Item) => {
    await supabase.from('personal_items').update({ list: 'today', updated_at: new Date().toISOString() }).eq('id', item.id);
    removeItem(item.id);
  };

  const addSubtask = async (parent: Item, title: string) => {
    const { data, error } = await supabase
      .from('personal_items')
      .insert({ user_id: user.id, title, list: 'week', category: parent.category, parent_id: parent.id })
      .select()
      .single();
    if (!error && data) setItems((prev) => [...prev, data as Item]);
  };

  const parents = items.filter((i) => i.parent_id === null);
  const subtasksByParent = items.reduce<Record<string, Item[]>>((acc, item) => {
    if (item.parent_id) {
      (acc[item.parent_id] ??= []).push(item);
    }
    return acc;
  }, {});

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-2xl font-extrabold text-warm-text leading-none">This Week</h1>
      </div>

      {loading ? (
        <div className="min-h-screen bg-[#FFF9F2] flex flex-col items-center px-6 pt-36">
          <Image src="/images/bunny-mascot.png" alt="Loading" width={80} height={80} className="h-20 w-20 object-contain animate-pulse opacity-90" />
          <p className="mt-4 text-sm text-[#8B7E78]">Opening your pocket...</p>
        </div>
      ) : (
        <div className="space-y-3">
          {SECTIONS.map(({ category, label, bgClass, dotClass }) => {
            const sectionParents = parents.filter((i) => i.category === category);
            const totalTodo = sectionParents.reduce((n, p) => {
              const subs = subtasksByParent[p.id] ?? [];
              const hasSubs = subs.length > 0;
              if (hasSubs) return n + subs.filter((s) => s.status === 'todo').length;
              return n + (p.status === 'todo' ? 1 : 0);
            }, 0);
            const allDone = sectionParents.length > 0 && totalTodo === 0;

            return (
              <div key={category} className="rounded-2xl overflow-hidden border border-border">
                {/* Section header */}
                <div className={`${bgClass} px-4 py-2.5 flex items-center gap-2`}>
                  <h3 className="text-xs font-bold text-warm-text flex-1">{label}</h3>
                  {allDone && (
                    <Image src="/images/bunny-carrot.png" alt="All done!" width={16} height={16} className="object-contain" />
                  )}
                  {totalTodo > 0 && (
                    <span className={`w-4 h-4 rounded-full ${dotClass} text-white text-[9px] font-bold flex items-center justify-center`}>
                      {totalTodo}
                    </span>
                  )}
                </div>

                {/* Checklist body */}
                <div className="bg-white px-4">
                  {sectionParents.length === 0 ? (
                    <p className="text-xs text-muted text-center py-3">Empty — tap + to add</p>
                  ) : (
                    <div className="divide-y divide-border/40">
                      {sectionParents.map((item) => (
                        <WeekChecklistItem
                          key={item.id}
                          item={item}
                          subtasks={subtasksByParent[item.id] ?? []}
                          onToggle={() => toggleItem(item)}
                          onDelete={() => deleteItem(item)}
                          onSave={updateItem}
                          onMoveToDaily={() => moveToToday(item)}
                          onAddSubtask={(title) => addSubtask(item, title)}
                          onToggleSubtask={toggleItem}
                          onDeleteSubtask={deleteItem}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
