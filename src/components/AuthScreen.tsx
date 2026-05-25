'use client';

import { useState } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';

export default function AuthScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError('Incorrect email or password.');

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-6 py-12">
      <div className="mb-8 text-center">
        <Image
          src="/images/bunny-mascot.png"
          alt="Bunny Pocket"
          width={140}
          height={140}
          className="mx-auto mb-5 object-contain"
          priority
        />
        <h1 className="text-3xl font-extrabold text-warm-text tracking-tight">Bunny Pocket</h1>
        <p className="text-muted text-sm mt-2">A cozy pocket for thoughts, tasks, and plans.</p>
      </div>

      <div className="w-full max-w-sm bg-white rounded-3xl p-7 shadow-soft border border-border">
        <h2 className="text-base font-bold text-warm-text mb-5">Welcome back 🌷</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl border border-border bg-cream text-warm-text placeholder:text-muted text-sm focus:outline-none focus:ring-2 focus:ring-blush transition"
            required
            autoComplete="email"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl border border-border bg-cream text-warm-text placeholder:text-muted text-sm focus:outline-none focus:ring-2 focus:ring-blush transition"
            required
            autoComplete="current-password"
          />

          {error && (
            <p className="text-xs text-center px-2 py-2 rounded-xl bg-blush-light text-warm-text">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blush-dark text-white rounded-2xl font-bold text-sm hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 mt-1"
          >
            {loading ? '...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
