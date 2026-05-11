'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Home, Palette, FileText, Target, Ban, CheckCircle2, Users } from 'lucide-react';
import { BriefingView } from './BriefingView';
import { OverviewSection } from './sections/OverviewSection';
import { FinanceiroSection } from './sections/FinanceiroSection';
import { PontosFortesSection } from './sections/PontosFortesSection';
import { DontsSection } from './sections/DontsSection';
import { DosSection } from './sections/DosSection';
import { PerfilHospedeSection } from './sections/PerfilHospedeSection';
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

interface Props {
  briefing: Briefing;
  editable: boolean;
  onUpdate?: (updates: Partial<Briefing>) => void;
  topBarRight?: React.ReactNode;
  publicView?: boolean;
}

export function BriefingSidebarLayout({ briefing, editable, onUpdate, topBarRight, publicView = false }: Props) {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<SectionKey>('criativos');

  const renderSection = () => {
    switch (activeSection) {
      case 'criativos':
        return (
          <>
            <OverviewSection briefing={briefing} editable={editable} onUpdate={onUpdate} />
            <div className="mt-8">
              <BriefingView briefing={briefing} editable={editable} onUpdate={onUpdate} />
            </div>
          </>
        );
      case 'financeiro':
        return <FinanceiroSection briefing={briefing} editable={editable} onUpdate={onUpdate} />;
      case 'pontos-fortes':
        return <PontosFortesSection briefing={briefing} editable={editable} onUpdate={onUpdate} />;
      case 'donts':
        return <DontsSection briefing={briefing} editable={editable} onUpdate={onUpdate} />;
      case 'dos':
        return <DosSection briefing={briefing} editable={editable} onUpdate={onUpdate} />;
      case 'perfil-hospede':
        return <PerfilHospedeSection briefing={briefing} editable={editable} onUpdate={onUpdate} />;
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
              {!publicView && (
                <button
                  onClick={() => router.push('/')}
                  className="text-gray-500 hover:text-[#00143D] transition-colors"
                  title="Voltar ao dashboard"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              )}
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
              {topBarRight}
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
