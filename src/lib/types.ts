export type ItemList = 'pocket' | 'daily' | 'weekly';
export type ItemCategory = 'important_urgent' | 'important_not_urgent' | 'keep_in_mind';
export type ItemStatus = 'todo' | 'done';
export type ActiveTab = 'pocket' | 'daily' | 'weekly';

export interface Item {
  id: string;
  user_id: string;
  title: string;
  details: string | null;
  parent_id: string | null;
  list: ItemList;
  category: ItemCategory | null;
  status: ItemStatus;
  due_date: string | null;
  deadline_date: string | null;
  week_start: string | null;
  reminder_at: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export const CATEGORIES: { value: ItemCategory; label: string; shortLabel: string }[] = [
  { value: 'important_urgent',     label: 'Important + Urgent',     shortLabel: '🔴 Urgent' },
  { value: 'important_not_urgent', label: 'Important + Not Urgent', shortLabel: '🔵 Plan' },
  { value: 'keep_in_mind',         label: 'Keep in Mind',           shortLabel: '🟢 Notes' },
];

export function formatReminderTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

export function formatDateTimeLabel(dateString: string): string {
  const date = dateString.includes('T') ? new Date(dateString) : new Date(`${dateString}T00:00:00`);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export function toDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getWeekStart(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day; // Monday as week start
  d.setDate(d.getDate() + diff);
  return d;
}

export function formatWeekRange(weekStartStr: string): string {
  const start = new Date(weekStartStr + 'T00:00:00');
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  const s = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const e = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return `${s} – ${e}`;
}
