'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Save, Share2, ExternalLink } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { OutroBriefingView } from '@/components/OutroBriefingView';
import type { OutroBriefing } from '@/types/briefing';

export default function OutroBriefingPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [briefing, setBriefing] = useState<OutroBriefing | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    load();
    checkAuth();
  }, [id]);

  async function checkAuth() {
    const { data } = await supabase.auth.getUser();
    setIsAuthenticated(!!data.user);
  }

  async function load() {
    setLoading(true);
    const { data } = await supabase.from('outros_briefings').select('*').eq('id', id).single();
    if (data) setBriefing(data as OutroBriefing);
    setLoading(false);
  }

  const handleUpdate = useCallback((patch: Partial<OutroBriefing>) => {
    setBriefing(prev => prev ? { ...prev, ...patch } : prev);
    setHasChanges(true);
  }, []);

  async function handleSave() {
    if (!briefing) return;
    setSaving(true);
    const { id, share_id, created_by, created_at, updated_at, ...rest } = briefing;
    const { error } = await supabase.from('outros_briefings').update(rest).eq('id', briefing.id);
    if (!error) setHasChanges(false);
    else alert('Erro ao salvar: ' + error.message);
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-[#0048D7]" />
      </div>
    );
  }

  if (!briefing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Briefing não encontrado.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/outros')} className="text-gray-500 hover:text-[#00143D]" title="Voltar">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-bold text-[#00143D] truncate">{briefing.titulo}</h1>
          </div>
          <div className="flex items-center gap-3">
            {isAuthenticated && (
              <select
                value={briefing.status}
                onChange={e => handleUpdate({ status: e.target.value as OutroBriefing['status'] })}
                className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#0048D7]"
              >
                <option value="em_revisao">Em produção</option>
                <option value="publicado">Finalizado</option>
              </select>
            )}
            <button
              onClick={() => {
                const url = `${window.location.origin}/outros/share/${briefing.share_id}`;
                navigator.clipboard.writeText(url);
                alert('Link copiado: ' + url);
              }}
              className="bg-[#00143D] text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-[#001d5a] transition-colors flex items-center gap-2"
            >
              <Share2 className="w-4 h-4" /> Compartilhar
            </button>
            {isAuthenticated && hasChanges && (
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-[#FC6058] hover:bg-[#ec4f47] text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? 'Salvando...' : 'Salvar'}
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8">
        <OutroBriefingView briefing={briefing} editable={isAuthenticated} onUpdate={handleUpdate} />
      </main>
    </div>
  );
}
