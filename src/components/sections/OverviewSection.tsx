'use client';

import { useState } from 'react';
import { MapPin, Building2, Ruler, Layers, Waves, Home, AlertCircle, ChevronDown, ChevronRight, Plus } from 'lucide-react';
import type { Briefing, BriefingContent } from '@/types/briefing';
import { EditableField } from '@/components/EditableField';

type UpdateFn = (updates: Partial<Briefing>) => void;

interface Props {
  briefing: Briefing;
  editable?: boolean;
  onUpdate?: UpdateFn;
}

// Helper: create a new content object with a nested path updated
function withContentUpdate<T = unknown>(
  content: BriefingContent,
  updater: (draft: BriefingContent) => void
): BriefingContent {
  const next = JSON.parse(JSON.stringify(content)) as BriefingContent;
  updater(next);
  return next;
}

export function OverviewSection({ briefing, editable = false, onUpdate }: Props) {
  const ctx = briefing.content.abas?.contexto;
  const emp = briefing.content.abas?.dados_empreendimento;
  const tec = briefing.content.abas?.informacoes_tecnicas;
  const loc = briefing.content.abas?.localizacao;

  const updateContext = (field: string, value: string) => {
    if (!onUpdate) return;
    const content = withContentUpdate(briefing.content, (c) => {
      const contexto = c.abas.contexto as Record<string, unknown>;
      contexto[field] = value;
    });
    onUpdate({ content });
  };

  const updateEmp = (field: string, value: string | number) => {
    if (!onUpdate) return;
    const content = withContentUpdate(briefing.content, (c) => {
      if (!c.abas.dados_empreendimento) {
        c.abas.dados_empreendimento = {
          quantidade_opcoes: 0, pavimentos: '', tipologias_count: 0,
          metragem_min: 0, metragem_max: 0, vagas_garagem: '',
          modalidade_aprovacao: '', administrador_obras: '', arquiteto: '',
          cotas_marketplace: 0,
        };
      }
      const d = c.abas.dados_empreendimento as Record<string, unknown>;
      d[field] = value;
    });
    onUpdate({ content });
  };

  const addressLine = [ctx?.neighborhood, briefing.city].filter(Boolean).join(' — ');

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="bg-gradient-to-br from-[#00143D] to-[#001d5a] rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 left-8 right-8 h-1 bg-[#0048D7] rounded-b-full" />
        <p className="text-xs tracking-widest text-white/60 uppercase mb-2">INÍCIO</p>
        <h1 className="text-4xl font-bold mb-3">{briefing.spot_name}</h1>
        {addressLine && (
          <p className="flex items-center gap-1.5 text-white/70 text-sm">
            <MapPin className="w-4 h-4" /> {addressLine}
          </p>
        )}
      </div>

      {/* Bem-vindo (3 parágrafos editáveis) */}
      <div className="bg-white rounded-2xl p-6 border-t-4 border-[#0048D7] shadow-sm">
        <h2 className="flex items-center gap-2 font-bold text-[#00143D] text-lg mb-4">
          <Home className="w-5 h-5" /> Bem-vindo ao {briefing.spot_name}
        </h2>
        <div className="space-y-3 text-gray-700 leading-relaxed">
          <EditableField
            as="p"
            editable={editable}
            value={ctx?.welcome_p1 || ''}
            onChange={(v) => updateContext('welcome_p1', v)}
            multiline
            placeholder="Parágrafo de abertura (apresentação do Spot)…"
          />
          <EditableField
            as="p"
            editable={editable}
            value={ctx?.welcome_p2 || ''}
            onChange={(v) => updateContext('welcome_p2', v)}
            multiline
            placeholder="Parágrafo sobre a região e contexto turístico…"
          />
          <EditableField
            as="p"
            editable={editable}
            value={ctx?.welcome_p3 || ''}
            onChange={(v) => updateContext('welcome_p3', v)}
            multiline
            placeholder="Parágrafo sobre o posicionamento do Spot…"
          />
        </div>
      </div>

      {/* Dados do Empreendimento (editáveis) */}
      <div className="bg-white rounded-2xl p-6 border-t-4 border-[#FC6058] shadow-sm">
        <h2 className="flex items-center gap-2 font-bold text-[#00143D] text-lg mb-4">
          <Building2 className="w-5 h-5" /> Dados do Empreendimento
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <DataItem
            icon={Home}
            label="Quantidade de opções (cotas)"
            value={emp?.quantidade_opcoes ? `${emp.quantidade_opcoes} cotas` : ''}
            rawValue={String(emp?.quantidade_opcoes ?? '')}
            editable={editable}
            onChange={(v) => updateEmp('quantidade_opcoes', parseInt(v) || 0)}
            placeholder="ex: 66"
          />
          <DataItem
            icon={Layers}
            label="Pavimentos"
            value={emp?.pavimentos || ''}
            editable={editable}
            onChange={(v) => updateEmp('pavimentos', v)}
            placeholder="ex: 4 pavimentos + mezanino"
          />
          <DataItem
            icon={Ruler}
            label="Metragem mínima (m²)"
            value={emp?.metragem_min ? `${emp.metragem_min} m²` : ''}
            rawValue={String(emp?.metragem_min ?? '')}
            editable={editable}
            onChange={(v) => updateEmp('metragem_min', parseInt(v) || 0)}
            placeholder="ex: 19"
          />
          <DataItem
            icon={Ruler}
            label="Metragem máxima (m²)"
            value={emp?.metragem_max ? `${emp.metragem_max} m²` : ''}
            rawValue={String(emp?.metragem_max ?? '')}
            editable={editable}
            onChange={(v) => updateEmp('metragem_max', parseInt(v) || 0)}
            placeholder="ex: 64"
          />
          <DataItem
            icon={Building2}
            label="Tipologias"
            value={emp?.tipologias_count ? `${emp.tipologias_count} tipologias` : ''}
            rawValue={String(emp?.tipologias_count ?? '')}
            editable={editable}
            onChange={(v) => updateEmp('tipologias_count', parseInt(v) || 0)}
            placeholder="ex: 9"
          />
          {tec?.amenities && tec.amenities.length > 0 && (
            <InfoChip icon={Waves} text={tec.amenities.find((a) => /piscina/i.test(a)) || tec.amenities[0]} />
          )}
          {loc?.distance_to_attraction && loc?.main_attraction && (
            <InfoChip icon={MapPin} text={`${loc.distance_to_attraction} da ${loc.main_attraction}`} />
          )}
        </div>

        <div className="mt-5 pt-4 border-t border-gray-100 space-y-2 text-sm">
          <LabeledRow
            label="Cotas disponíveis no Marketplace"
            value={emp?.cotas_marketplace ? String(emp.cotas_marketplace) : ''}
            editable={editable}
            onChange={(v) => updateEmp('cotas_marketplace', parseInt(v) || 0)}
            placeholder="ex: 28"
          />
          <LabeledRow
            label="Administrador de obras"
            value={emp?.administrador_obras || ''}
            editable={editable}
            onChange={(v) => updateEmp('administrador_obras', v)}
            placeholder="ex: Puel Engenharia LTDA"
          />
          <LabeledRow
            label="Arquiteto"
            value={emp?.arquiteto || ''}
            editable={editable}
            onChange={(v) => updateEmp('arquiteto', v)}
            placeholder="ex: Casa & Construção LTDA"
          />
        </div>
      </div>

      <InformacoesImportantesCard
        value={ctx?.informacoes_importantes || ''}
        editable={editable}
        onChange={(v) => updateContext('informacoes_importantes', v)}
      />

      <p className="text-xs text-gray-400 italic text-center">
        Este material é de uso estratégico interno, voltado para análise e tomada de decisão.
      </p>
    </div>
  );
}

function InformacoesImportantesCard({
  value, editable, onChange,
}: {
  value: string;
  editable: boolean;
  onChange: (v: string) => void;
}) {
  const hasContent = !!value.trim();
  const [expanded, setExpanded] = useState(hasContent);

  if (!hasContent && !editable) return null;

  if (!hasContent && editable && !expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-dashed border-amber-300 bg-amber-50/50 text-amber-700 hover:bg-amber-50 transition-colors text-sm font-medium"
      >
        <Plus className="w-4 h-4" /> Adicionar informações importantes
      </button>
    );
  }

  return (
    <div className="bg-amber-50 rounded-2xl p-6 border-l-4 border-amber-400 shadow-sm">
      <div className="flex items-start justify-between gap-3 mb-3">
        <h2 className="flex items-center gap-2 font-bold text-amber-900 text-sm uppercase tracking-widest">
          <AlertCircle className="w-5 h-5" /> Informações Importantes
        </h2>
        {editable && hasContent && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-amber-700 hover:text-amber-900"
            title={expanded ? 'Recolher' : 'Expandir'}
          >
            {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        )}
      </div>
      {expanded && (
        <EditableField
          as="p"
          editable={editable}
          multiline
          value={value}
          onChange={onChange}
          placeholder="Anote aqui informações relevantes que devem ficar em destaque antes do briefing…"
          className="text-sm text-amber-900 leading-relaxed whitespace-pre-wrap"
        />
      )}
    </div>
  );
}

function DataItem({
  icon: Icon, label, value, rawValue, editable, onChange, placeholder,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  rawValue?: string;
  editable: boolean;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="flex items-center gap-2.5 px-4 py-3 border border-gray-200 rounded-xl text-gray-700">
      <Icon className="w-4 h-4 text-[#FC6058] flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="text-[10px] uppercase tracking-widest text-gray-400 mb-0.5">{label}</div>
        <EditableField
          as="span"
          editable={editable}
          value={editable ? (rawValue ?? value) : value}
          onChange={onChange}
          placeholder={placeholder}
          className="text-sm"
        />
      </div>
    </div>
  );
}

function InfoChip({ icon: Icon, text }: { icon: React.ComponentType<{ className?: string }>; text: string }) {
  return (
    <div className="flex items-center gap-2.5 px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-700">
      <Icon className="w-4 h-4 text-[#FC6058] flex-shrink-0" />
      <span className="truncate">{text}</span>
    </div>
  );
}

function LabeledRow({
  label, value, editable, onChange, placeholder,
}: {
  label: string;
  value: string;
  editable: boolean;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="font-semibold text-[#00143D]">{label}:</span>
      <div className="flex-1">
        <EditableField
          as="span"
          editable={editable}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="text-gray-700"
        />
      </div>
    </div>
  );
}
