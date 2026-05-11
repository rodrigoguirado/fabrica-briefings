'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { LegacyJsonView } from '@/components/LegacyJsonView';
import { LegacyHtmlTabsView } from '@/components/LegacyHtmlTabsView';
import { BriefingSidebarLayout } from '@/components/BriefingSidebarLayout';
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

  if (briefing.is_legacy && briefing.legacy_content) {
    if (briefing.legacy_content.__html_tabs) {
      return (
        <LegacyHtmlTabsView
          title={briefing.spot_name}
          htmlTabs={briefing.legacy_content.__html_tabs}
          headCss={briefing.legacy_content.__head_css}
          sourceUrl={briefing.legacy_source_url}
          backHref="/"
          publicView
        />
      );
    }
    return (
      <LegacyJsonView
        title={briefing.spot_name}
        content={briefing.legacy_content}
        sourceUrl={briefing.legacy_source_url}
        backHref="/"
        publicView
      />
    );
  }

  return (
    <BriefingSidebarLayout
      briefing={briefing}
      editable={false}
      publicView
    />
  );
}
