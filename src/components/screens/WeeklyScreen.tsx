'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { Item, ItemCategory, getWeekStart, toDateString, formatWeekRange } from '@/lib/types';
import WeekChecklistItem from '@/components/WeekChecklistItem';
import AddItemModal from '@/components/AddItemModal';

interface WeeklyScreenProps {
  user: User;
}

const SECTIONS: { category: ItemCategory; label: string; bgClass: string; dotClass: string }[] = [
  { category: 'important_urgent',     label: 'Important + Urgent',     bgClass: 'bg-blush-light',    dotClass: 'bg-blush-dark' },
  { category: 'important_not_urgent', label: 'Important + Not Urgent', bgClass: 'bg-lavender-light', dotClass: 'bg-lavender-dark' },
  { category: 'keep_in_mind',         label: 'Keep in Mind',           bgClass: 'bg-sage-light',     dotClass: 'bg-sage-dark' },
];

export default function WeeklyScreen({ user }: WeeklyScreenProps) {
  const [weekStart, setWeekStart] = useState(() => toDateString(getWeekStart(new Date())));
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => { fetchItems(); }, [weekStart]);

  const fetchItems = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('personal_items')
      .select('*')
      .eq('user_id', user.id)
      .eq('list', 'weekly')
      .eq('week_start', weekStart)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true });
    setItems(data ?? []);
    setLoading(false);
  };

  const changeWeek = (delta: number) => {
    const d = new Date(weekStart + 'T00:00:00');
    d.setDate(d.getDate() + delta * 7);
    setWeekStart(toDateString(d));
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

  const moveToDaily = async (item: Item) => {
    const today = toDateString(new Date());
    await supabase
      .from('personal_items')
      .update({ list: 'daily', due_date: today, updated_at: new Date().toISOString() })
      .eq('id', item.id);
    removeItem(item.id);
  };

  const addSubtask = async (parent: Item, title: string) => {
    const { data, error } = await supabase
      .from('personal_items')
      .insert({
        user_id: user.id,
        title,
        list: 'weekly',
        category: parent.category,
        parent_id: parent.id,
        week_start: parent.week_start,
      })
      .select()
      .single();
    if (!error && data) setItems((prev) => [...prev, data as Item]);
  };

  const parents = items.filter((i) => i.parent_id === null);
  const subtasksByParent = items.reduce<Record<string, Item[]>>((acc, item) => {
    if (item.parent_id) (acc[item.parent_id] ??= []).push(item);
    return acc;
  }, {});

  const isCurrentWeek = weekStart === toDateString(getWeekStart(new Date()));

  return (
    <div>
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-extrabold text-warm-text leading-none mb-3">Weekly</h1>
        <div className="flex items-center justify-between bg-white rounded-2xl border border-border shadow-card px-3 py-2.5">
          <button
            onClick={() => changeWeek(-1)}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-cream transition-colors text-muted"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <div className="text-center">
            <p className="text-sm font-bold text-warm-text">{formatWeekRange(weekStart)}</p>
            {isCurrentWeek && <p className="text-[10px] text-muted mt-0.5">This week</p>}
          </div>
          <button
            onClick={() => changeWeek(1)}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-cream transition-colors text-muted"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
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
      ) : (
        <div className="space-y-3">
          {SECTIONS.map(({ category, label, bgClass, dotClass }) => {
            const sectionParents = parents.filter((i) => i.category === category);
            const totalTodo = sectionParents.reduce((n, p) => {
              const subs = subtasksByParent[p.id] ?? [];
              return n + (subs.length > 0
                ? subs.filter((s) => s.status === 'todo').length
                : p.status === 'todo' ? 1 : 0);
            }, 0);
            const allDone = sectionParents.length > 0 && totalTodo === 0;

            return (
              <div key={category} className="rounded-2xl overflow-hidden border border-border">
                <div className={`${bgClass} px-4 py-2.5 flex items-center gap-2`}>
                  <h3 className="text-xs font-bold text-warm-text flex-1">{label}</h3>
                  {allDone && <Image src="/images/bunny-carrot.png" alt="All done!" width={16} height={16} className="object-contain" />}
                  {totalTodo > 0 && (
                    <span className={`w-4 h-4 rounded-full ${dotClass} text-white text-[9px] font-bold flex items-center justify-center`}>
                      {totalTodo}
                    </span>
                  )}
                </div>
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
                          onMoveToDaily={() => moveToDaily(item)}
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

      <button
        onClick={() => setShowAdd(true)}
        className="fixed right-4 z-40 rounded-full bg-blush-dark text-white flex items-center justify-center text-2xl font-light active:scale-90 transition-all"
        aria-label="Add item"
        style={{
          bottom: 'calc(env(safe-area-inset-bottom) + 58px + 14px)',
          width: '52px',
          height: '52px',
          boxShadow: '0 4px 16px rgba(240,160,160,0.45)',
        }}
      >
        +
      </button>

      {showAdd && (
        <AddItemModal
          user={user}
          activeTab="weekly"
          selectedWeekStart={weekStart}
          onClose={() => setShowAdd(false)}
          onAdded={() => { setShowAdd(false); fetchItems(); }}
        />
      )}
    </div>
  );
}
