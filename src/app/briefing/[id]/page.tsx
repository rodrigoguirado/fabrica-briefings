'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Save, Loader2, Share2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { LegacyJsonView } from '@/components/LegacyJsonView';
import { LegacyHtmlTabsView } from '@/components/LegacyHtmlTabsView';
import { BriefingSidebarLayout } from '@/components/BriefingSidebarLayout';
import { getShareUrl } from '@/lib/utils';
import { useUserRole } from '@/lib/useUserRole';
import type { Briefing } from '@/types/briefing';

export default function BriefingPage() {
  const { id } = useParams<{ id: string }>();
  const [briefing, setBriefing] = useState<Briefing | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { canEdit: roleCanEdit } = useUserRole();
  const canEdit = isAuthenticated && roleCanEdit;

  useEffect(() => {
    loadBriefing();
    checkAuth();
  }, [id]);

  async function checkAuth() {
    const { data } = await supabase.auth.getUser();
    setIsAuthenticated(!!data.user);
  }

  async function loadBriefing() {
    setLoading(true);
    const { data } = await supabase.from('briefings').select('*').eq('id', id).single();
    if (data) setBriefing(data as Briefing);
    setLoading(false);
  }

  const handleUpdate = useCallback((updates: Partial<Briefing>) => {
    if (!briefing) return;
    setBriefing(prev => prev ? { ...prev, ...updates } : prev);
    setHasChanges(true);
  }, [briefing]);

  async function handleSave() {
    if (!briefing) return;
    setSaving(true);

    const { content, media_estatico, media_video_apresentadora, media_video_narrado,
      media_disruptivo_apresentadora, media_disruptivo_narrado, status,
      spot_name, city, neighborhood, category, investment_from, monthly_income, annual_income
    } = briefing;

    const syncedSpotName = content.abas?.contexto?.spot_name || spot_name;
    const syncedCity = content.abas?.contexto?.city || city;
    const syncedInvestment = content.abas?.dados_financeiros?.investment_from || investment_from;
    const syncedMonthly = content.abas?.dados_financeiros?.monthly_income || monthly_income;
    const syncedAnnual = content.abas?.dados_financeiros?.annual_income || annual_income;

    const { error } = await supabase
      .from('briefings')
      .update({
        content,
        media_estatico,
        media_video_apresentadora,
        media_video_narrado,
        media_disruptivo_apresentadora,
        media_disruptivo_narrado,
        status,
        spot_name: syncedSpotName,
        city: syncedCity,
        neighborhood,
        category,
        investment_from: syncedInvestment,
        monthly_income: syncedMonthly,
        annual_income: syncedAnnual,
      })
      .eq('id', briefing.id);

    if (!error) setHasChanges(false);
    setSaving(false);
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Briefing não encontrado.</p>
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
        />
      );
    }
    return (
      <LegacyJsonView
        title={briefing.spot_name}
        content={briefing.legacy_content}
        sourceUrl={briefing.legacy_source_url}
        backHref="/"
      />
    );
  }

  const topBarRight = (
    <>
      {canEdit && (
        <select
          value={briefing.status === 'publicado' || briefing.status === 'aprovado' ? 'publicado' : 'em_revisao'}
          onChange={e => handleUpdate({ status: e.target.value as Briefing['status'] })}
          className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#0048D7]"
        >
          <option value="em_revisao">Em produção</option>
          <option value="publicado">Finalizado</option>
        </select>
      )}
      <button
        onClick={() => {
          const url = getShareUrl(briefing.share_id);
          navigator.clipboard.writeText(url);
          alert('Link copiado: ' + url);
        }}
        className="bg-[#00143D] text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-[#001d5a] transition-colors flex items-center gap-2"
      >
        <Share2 className="w-4 h-4" /> Compartilhar
      </button>
      {canEdit && hasChanges && (
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-[#FC6058] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#ec4f47] transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Salvando...' : 'Salvar'}
        </button>
      )}
    </>
  );

  return (
    <BriefingSidebarLayout
      briefing={briefing}
      editable={canEdit}
      onUpdate={handleUpdate}
      topBarRight={topBarRight}
    />
  );
}
