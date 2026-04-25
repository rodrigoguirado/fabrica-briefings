'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { OutroBriefingView } from '@/components/OutroBriefingView';
import type { OutroBriefing } from '@/types/briefing';

export default function ShareOutroPage() {
  const { shareId } = useParams<{ shareId: string }>();
  const [briefing, setBriefing] = useState<OutroBriefing | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, [shareId]);

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from('outros_briefings')
      .select('*')
      .eq('share_id', shareId)
      .single();
    if (data) setBriefing(data as OutroBriefing);
    setLoading(false);
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-4">
        <div className="text-4xl font-bold text-[#00143D]">
          sea<span className="text-[#FC6058]">zone</span>
        </div>
        <p className="text-gray-500">Briefing não encontrado ou link inválido.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-xl font-bold text-[#00143D]">
            sea<span className="text-[#FC6058]">zone</span>
          </div>
          <p className="text-sm text-gray-400">Briefing</p>
        </div>
      </header>

      <main className="py-6 px-4 max-w-3xl mx-auto">
        <OutroBriefingView
          briefing={briefing}
          editable={false}
          onUpdate={() => {}}
        />
      </main>

      <footer className="border-t border-gray-200 py-6 text-center text-xs text-gray-400">
        Seazone — Marketplace de imóveis de temporada
      </footer>
    </div>
  );
}
