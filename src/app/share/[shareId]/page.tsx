'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { BriefingView } from '@/components/BriefingView';
import type { Briefing } from '@/types/briefing';

export default function SharePage() {
  const { shareId } = useParams<{ shareId: string }>();
  const [briefing, setBriefing] = useState<Briefing | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBriefing();
  }, [shareId]);

  async function loadBriefing() {
    setLoading(true);
    const { data } = await supabase
      .from('briefings')
      .select('*')
      .eq('share_id', shareId)
      .single();

    if (data) setBriefing(data as Briefing);
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-navy-600" />
      </div>
    );
  }

  if (!briefing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-4">
        <div className="text-4xl font-bold text-navy-900">
          sea<span className="text-accent">zone</span>
        </div>
        <p className="text-gray-500">Briefing não encontrado ou link inválido.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Minimal header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-xl font-bold text-navy-900">
            sea<span className="text-accent">zone</span>
          </div>
          <p className="text-sm text-gray-400">Briefing de Criativos</p>
        </div>
      </header>

      {/* Read-only briefing */}
      <main className="py-6 px-4">
        <BriefingView
          briefing={briefing}
          editable={false}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-6 text-center text-xs text-gray-400">
        Seazone — Marketplace de imóveis de temporada
      </footer>
    </div>
  );
}
