'use client';

import { Users, Sparkles, Waves, Sun, Utensils, MapPin, Heart, Briefcase, Home, Plus, Trash2 } from 'lucide-react';
import type { Briefing, BriefingContent, HospedeProfile } from '@/types/briefing';
import { EditableField } from '@/components/EditableField';

type UpdateFn = (updates: Partial<Briefing>) => void;

interface Props {
  briefing: Briefing;
  editable?: boolean;
  onUpdate?: UpdateFn;
}

const TAG_OPTIONS = ['Perfil Principal', 'Alta Recorrência', 'Experiência', 'Fluxo Constante', 'Família'];

const TAG_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  'Perfil Principal': { bg: '#DBEAFE', text: '#1D4ED8', border: '#93C5FD' },
  'Alta Recorrência': { bg: '#FCE7F3', text: '#BE185D', border: '#F9A8D4' },
  'Experiência':      { bg: '#DCFCE7', text: '#15803D', border: '#86EFAC' },
  'Fluxo Constante':  { bg: '#F3E8FF', text: '#7E22CE', border: '#D8B4FE' },
  'Família':          { bg: '#FEF3C7', text: '#B45309', border: '#FCD34D' },
};

const PROFILE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  'Turismo de praia': Waves,
  'lifestyle': Waves,
  'Casais': Heart,
  'Jovens': Users,
  'grupos pequenos': Users,
  'Nômades digitais': Briefcase,
  'Famílias': Home,
};

function iconFor(nome: string) {
  const low = nome.toLowerCase();
  for (const [key, Icon] of Object.entries(PROFILE_ICONS)) {
    if (low.includes(key.toLowerCase())) return Icon;
  }
  return Users;
}

function withContentUpdate(content: BriefingContent, updater: (draft: BriefingContent) => void): BriefingContent {
  const next = JSON.parse(JSON.stringify(content)) as BriefingContent;
  updater(next);
  return next;
}

function initPerfilHospede(c: BriefingContent) {
  if (!c.abas.perfil_hospede) {
    c.abas.perfil_hospede = {
      intro: '',
      descricao: '',
      perfis: [],
      destino: { regiao: '', perfil: '', praia: '', infraestrutura: '' },
    };
  }
  return c.abas.perfil_hospede;
}

export function PerfilHospedeSection({ briefing, editable = false, onUpdate }: Props) {
  const perfilData = briefing.content.abas?.perfil_hospede;
  const perfis = perfilData?.perfis || [];
  const destino = perfilData?.destino;

  const updateIntro = (field: 'intro' | 'descricao', value: string) => {
    if (!onUpdate) return;
    const content = withContentUpdate(briefing.content, (c) => {
      const ph = initPerfilHospede(c);
      ph[field] = value;
    });
    onUpdate({ content });
  };

  const updatePerfil = (i: number, patch: Partial<HospedeProfile>) => {
    if (!onUpdate) return;
    const content = withContentUpdate(briefing.content, (c) => {
      const ph = initPerfilHospede(c);
      ph.perfis[i] = { ...ph.perfis[i], ...patch };
    });
    onUpdate({ content });
  };

  const addPerfil = () => {
    if (!onUpdate) return;
    const content = withContentUpdate(briefing.content, (c) => {
      const ph = initPerfilHospede(c);
      ph.perfis.push({ nome: 'Novo perfil', tag: 'Perfil Principal', descricao: '' });
    });
    onUpdate({ content });
  };

  const removePerfil = (i: number) => {
    if (!onUpdate) return;
    const content = withContentUpdate(briefing.content, (c) => {
      const ph = initPerfilHospede(c);
      ph.perfis.splice(i, 1);
    });
    onUpdate({ content });
  };

  const updateDestino = (field: 'regiao' | 'perfil' | 'praia' | 'infraestrutura', value: string) => {
    if (!onUpdate) return;
    const content = withContentUpdate(briefing.content, (c) => {
      const ph = initPerfilHospede(c);
      ph.destino[field] = value;
    });
    onUpdate({ content });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#00143D] flex items-center gap-2">
            <Users className="w-6 h-6" /> Perfil do Hóspede
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Características do hóspede ideal para o {briefing.spot_name}.
          </p>
        </div>
        {editable && (
          <button
            onClick={addPerfil}
            className="flex items-center gap-1.5 bg-[#00143D] text-white text-sm px-3 py-2 rounded-lg hover:bg-[#001d5a]"
          >
            <Plus className="w-4 h-4" /> Adicionar perfil
          </button>
        )}
      </div>

      {/* Intro */}
      <div className="bg-[#F0FDF4] border border-[#86EFAC]/40 rounded-2xl p-5 flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center flex-shrink-0 border border-[#86EFAC]/50">
          <Sparkles className="w-6 h-6 text-[#10B981]" />
        </div>
        <div className="flex-1">
          <EditableField
            as="h3"
            editable={editable}
            value={perfilData?.intro || ''}
            onChange={(v) => updateIntro('intro', v)}
            placeholder="ex: 5 perfis mapeados para o [Região]"
            className="font-bold text-[#00143D] mb-1"
          />
          <EditableField
            as="p"
            editable={editable}
            multiline
            value={perfilData?.descricao || ''}
            onChange={(v) => updateIntro('descricao', v)}
            placeholder="Descrição geral dos perfis"
            className="text-sm text-gray-700"
          />
        </div>
      </div>

      {/* Perfis */}
      {perfis.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center text-gray-400 border border-dashed border-gray-200">
          {editable ? 'Clique em "Adicionar perfil" para começar.' : 'Nenhum perfil de hóspede foi extraído do briefing.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {perfis.map((p, i) => {
            const style = TAG_STYLES[p.tag] || TAG_STYLES['Perfil Principal'];
            const Icon = iconFor(p.nome);
            return (
              <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 group">
                <div className="flex items-start gap-3 mb-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: style.bg }}>
                    <Icon className="w-5 h-5" style={{ color: style.text }} />
                  </div>
                  <div className="flex-1 min-w-0 flex items-start justify-between gap-3">
                    <EditableField
                      as="h3"
                      editable={editable}
                      value={p.nome}
                      onChange={(v) => updatePerfil(i, { nome: v })}
                      placeholder="Nome do perfil"
                      className="font-bold text-[#00143D]"
                    />
                    {editable ? (
                      <select
                        value={p.tag}
                        onChange={(e) => updatePerfil(i, { tag: e.target.value })}
                        className="flex-shrink-0 text-xs font-medium px-2.5 py-1 rounded-full border"
                        style={{ backgroundColor: style.bg, color: style.text, borderColor: style.border }}
                      >
                        {TAG_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                    ) : (
                      <span className="flex-shrink-0 text-xs font-medium px-2.5 py-1 rounded-full border" style={{ backgroundColor: style.bg, color: style.text, borderColor: style.border }}>
                        {p.tag}
                      </span>
                    )}
                  </div>
                  {editable && (
                    <button
                      onClick={() => removePerfil(i)}
                      className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-[#FC6058] transition-opacity"
                      title="Remover perfil"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <EditableField
                  as="p"
                  editable={editable}
                  multiline
                  value={p.descricao}
                  onChange={(v) => updatePerfil(i, { descricao: v })}
                  placeholder="Descrição do perfil (comportamento, o que busca, o que valoriza)"
                  className="text-sm text-gray-700 leading-relaxed"
                />
              </div>
            );
          })}
        </div>
      )}

      {/* Características do Destino */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border-t-4 border-[#FCD34D]">
        <h2 className="flex items-center gap-2 font-bold text-[#00143D] text-lg mb-5">
          <Sun className="w-5 h-5 text-[#B45309]" /> Características do Destino
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <DestinyCard label="REGIÃO" icon={MapPin} value={destino?.regiao || ''} editable={editable} onChange={(v) => updateDestino('regiao', v)} placeholder="ex: Campeche Leste — Sul da Ilha" />
          <DestinyCard label="PERFIL" icon={Heart}  value={destino?.perfil || ''} editable={editable} onChange={(v) => updateDestino('perfil', v)} placeholder="ex: Destino de praia com lifestyle forte…" />
          <DestinyCard label="PRAIA"  icon={Sun}    value={destino?.praia || ''}  editable={editable} onChange={(v) => updateDestino('praia', v)} placeholder="ex: Faixa de areia extensa…" />
          <DestinyCard label="INFRAESTRUTURA" icon={Utensils} value={destino?.infraestrutura || ''} editable={editable} onChange={(v) => updateDestino('infraestrutura', v)} placeholder="ex: Quiosques, bares, restaurantes…" />
        </div>
      </div>
    </div>
  );
}

function DestinyCard({
  label, icon: Icon, value, editable, onChange, placeholder,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  value: string;
  editable: boolean;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  if (!editable && !value) return null;
  return (
    <div className="bg-[#FFFBEB] border border-[#FCD34D]/40 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4 text-[#B45309]" />
        <span className="text-xs tracking-widest uppercase font-bold text-[#B45309]">{label}</span>
      </div>
      <EditableField
        as="p"
        editable={editable}
        multiline
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="text-sm text-gray-800"
      />
    </div>
  );
}
