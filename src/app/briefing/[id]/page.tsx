'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2, Home, Palette, FileText, Target, Ban, CheckCircle2, Users, Share2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { BriefingView } from '@/components/BriefingView';
import { OverviewSection } from '@/components/sections/OverviewSection';
import { FinanceiroSection } from '@/components/sections/FinanceiroSection';
import { PontosFortesSection } from '@/components/sections/PontosFortesSection';
import { DontsSection } from '@/components/sections/DontsSection';
import { DosSection } from '@/components/sections/DosSection';
import { PerfilHospedeSection } from '@/components/sections/PerfilHospedeSection';
import type { Briefing } from '@/types/briefing';

type SectionKey = 'criativos' | 'financeiro' | 'pontos-fortes' | 'donts' | 'dos' | 'perfil-hospede';

const SECTIONS: { key: SectionKey; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: 'criativos', label: 'Estrutura dos Criativos', icon: Palette },
  { key: 'financeiro', label: 'Dados financeiros do Spot', icon: FileText },
  { key: 'pontos-fortes', label: 'Pontos Fortes e Posicionamento', icon: Target },
  { key: 'donts', label: "Definição dos Don't's", icon: Ban },
  { key: 'dos', label: "Definição dos Do's", icon: CheckCircle2 },
  { key: 'perfil-hospede', label: 'Perfil do Hóspede', icon: Users },
];

export default function BriefingPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [briefing, setBriefing] = useState<Briefing | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeSection, setActiveSection] = useState<SectionKey>('criativos');

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

  const renderSection = () => {
    switch (activeSection) {
      case 'criativos':
        return (
          <>
            <OverviewSection briefing={briefing} editable={isAuthenticated} onUpdate={handleUpdate} />
            <div className="mt-8">
              <BriefingView briefing={briefing} editable={isAuthenticated} onUpdate={handleUpdate} />
            </div>
          </>
        );
      case 'financeiro':
        return <FinanceiroSection briefing={briefing} editable={isAuthenticated} onUpdate={handleUpdate} />;
      case 'pontos-fortes':
        return <PontosFortesSection briefing={briefing} editable={isAuthenticated} onUpdate={handleUpdate} />;
      case 'donts':
        return <DontsSection briefing={briefing} editable={isAuthenticated} onUpdate={handleUpdate} />;
      case 'dos':
        return <DosSection briefing={briefing} editable={isAuthenticated} onUpdate={handleUpdate} />;
      case 'perfil-hospede':
        return <PerfilHospedeSection briefing={briefing} editable={isAuthenticated} onUpdate={handleUpdate} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-72 bg-[#00143D] text-white flex flex-col z-40">
        <div className="p-6 border-b border-white/10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-seazone-white.png"
            alt="Seazone"
            className="h-10 w-auto mb-2"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
          <p className="text-xs text-white/50 tracking-widest uppercase">{briefing.spot_name}</p>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {SECTIONS.map(({ key, label, icon: Icon }) => {
            const active = activeSection === key;
            return (
              <button
                key={key}
                onClick={() => setActiveSection(key)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-left transition-colors ${
                  active
                    ? 'bg-[#FC6058] text-white'
                    : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1">{label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 text-xs text-white/30 border-t border-white/10">
          Material de Referência Estratégica
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-72 min-h-screen">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-gray-200">
          <div className="flex items-center justify-between px-8 py-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/')}
                className="text-gray-500 hover:text-[#00143D] transition-colors"
                title="Voltar ao dashboard"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setActiveSection('criativos')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  activeSection === 'criativos'
                    ? 'bg-[#0048D7] text-white'
                    : 'text-gray-600 hover:text-[#00143D] hover:bg-gray-100'
                }`}
              >
                <Home className="w-4 h-4" />
                Início
              </button>
            </div>

            <div className="flex items-center gap-3">
              {isAuthenticated && (
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
                  const url = `${window.location.origin}/share/${briefing.share_id}`;
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
                  className="bg-[#FC6058] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#ec4f47] transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {saving ? 'Salvando...' : 'Salvar'}
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-8 max-w-5xl">
          {renderSection()}
        </div>
      </main>
    </div>
  );
}
