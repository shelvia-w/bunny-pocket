'use client';

import { ActiveTab } from '@/lib/types';

interface BottomNavProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
}

function PocketIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.4 : 1.7} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 3h16a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1V4a1 1 0 011-1z" />
      <path d="M3 8v11a2 2 0 002 2h14a2 2 0 002-2V8" />
      <path d="M9 12h6" />
    </svg>
  );
}

function DailyIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.4 : 1.7} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="3" />
      <path d="M16 2v4M8 2v4M3 10h18" />
      <path d="M8 14l2.5 2.5L16 11" />
    </svg>
  );
}

function WeeklyIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.4 : 1.7} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}

const TABS: { id: ActiveTab; label: string; Icon: React.FC<{ active: boolean }> }[] = [
  { id: 'pocket',  label: 'Pocket',  Icon: PocketIcon },
  { id: 'daily',   label: 'Daily',   Icon: DailyIcon },
  { id: 'weekly',  label: 'Weekly',  Icon: WeeklyIcon },
];

export default function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-t border-border"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex h-[58px]">
        {TABS.map(({ id, label, Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className={`relative flex-1 flex flex-col items-center justify-center gap-[3px] transition-all active:scale-95 ${
                isActive ? 'text-blush-dark' : 'text-muted/70'
              }`}
            >
              {isActive && <span className="absolute top-1.5 w-5 h-[3px] rounded-full bg-blush opacity-70" />}
              <Icon active={isActive} />
              <span className={`text-[9px] leading-none ${isActive ? 'font-bold' : 'font-medium'}`}>{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
