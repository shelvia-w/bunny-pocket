'use client';

import Image from 'next/image';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { ActiveTab } from '@/lib/types';

const TODAY = new Date().toLocaleDateString('en-US', {
  weekday: 'long',
  month: 'short',
  day: 'numeric',
});

interface HeaderProps {
  user: User;
  activeTab: ActiveTab;
}

export default function Header({ user: _user, activeTab }: HeaderProps) {
  const handleSignOut = () => supabase.auth.signOut();

  return (
    <header
      className="bg-white/90 backdrop-blur-sm border-b border-border px-4 sticky top-0 z-30"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <div className="flex items-center justify-between h-12">
        <div className="flex items-center gap-2">
          <Image
            src="/images/logo-mark.png"
            alt=""
            width={26}
            height={26}
            className="object-contain flex-shrink-0"
          />
          <div className="flex items-baseline gap-2">
            <Image
              src="/images/logo.png"
              alt="Bunny Pocket"
              width={100}
              height={20}
              className="object-contain"
            />
            {activeTab === 'daily' && (
              <span className="text-[10px] text-muted leading-none">{TODAY}</span>
            )}
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="text-[11px] text-muted hover:text-warm-text px-2.5 py-1 rounded-full hover:bg-cream transition-colors"
        >
          Sign out
        </button>
      </div>
    </header>
  );
}
