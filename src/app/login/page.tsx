'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError('Email ou senha inválidos.');
      setLoading(false);
      return;
    }

    router.push('/');
  }

  return (
    <div className="min-h-screen bg-seazone-bg flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-4xl font-bold text-white mb-2">
            sea<span className="text-accent">zone</span>
          </div>
          <p className="text-seazone-muted text-sm">Briefing de Criativos</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="bg-seazone-card border border-seazone-border rounded-xl p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-seazone-muted mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              className="w-full bg-seazone-bg border border-seazone-border rounded-lg px-4 py-2.5 text-sm text-seazone-text placeholder:text-seazone-muted focus:outline-none focus:ring-2 focus:ring-navy-600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-seazone-muted mb-1.5">Senha</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full bg-seazone-bg border border-seazone-border rounded-lg px-4 py-2.5 text-sm text-seazone-text placeholder:text-seazone-muted focus:outline-none focus:ring-2 focus:ring-navy-600"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent hover:bg-accent/90 text-white font-medium text-sm py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="text-center text-xs text-seazone-muted mt-4">
          Acesso restrito ao time de marketing Seazone.
        </p>
      </div>
    </div>
  );
}
