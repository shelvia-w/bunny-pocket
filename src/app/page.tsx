'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { ActiveTab } from '@/lib/types';
import AuthScreen from '@/components/AuthScreen';
import BottomNav from '@/components/BottomNav';
import PocketScreen from '@/components/screens/PocketScreen';
import DailyScreen from '@/components/screens/DailyScreen';
import WeeklyScreen from '@/components/screens/WeeklyScreen';

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>('pocket');

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => setUser(session?.user ?? null))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-cream flex flex-col items-center justify-start pt-32 gap-4">
        <Image src="/images/splash-screen.png" alt="Bunny Pocket" width={220} height={220} className="object-contain animate-pulse" priority />
        <p className="text-sm text-muted font-semibold">Loading your pocket...</p>
      </div>
    );
  }

  if (!user) return <AuthScreen />;

  return (
    <div className="min-h-[100dvh] bg-cream">
      <main
        className="px-4"
        style={{
          paddingTop: 'calc(env(safe-area-inset-top) + 20px)',
          paddingBottom: 'calc(env(safe-area-inset-bottom) + 88px)',
        }}
      >
        {activeTab === 'pocket'  && <PocketScreen  user={user} />}
        {activeTab === 'daily'   && <DailyScreen   user={user} />}
        {activeTab === 'weekly'  && <WeeklyScreen  user={user} />}
      </main>
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
