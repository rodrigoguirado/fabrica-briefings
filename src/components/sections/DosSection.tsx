'use client';

import { CheckCircle2, Briefcase, Users, TrendingUp, MapPin, DollarSign, Tag, Waves, Plus, Trash2 } from 'lucide-react';
import type { Briefing, BriefingContent, Do as DoItem } from '@/types/briefing';
import { EditableField } from '@/components/EditableField';

type UpdateFn = (updates: Partial<Briefing>) => void;

interface Props {
  briefing: Briefing;
  editable?: boolean;
  onUpdate?: UpdateFn;
}

const DO_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  'short stay': Briefcase,
  'Gestão profissional': Users,
  'renda passiva': TrendingUp,
  'região desejada': MapPin,
  'Rendimento em reais': DollarSign,
  'Ticket de entrada': Tag,
  'Estrutura de lazer': Waves,
};

function iconFor(titulo: string) {
  const low = titulo.toLowerCase();
  for (const [key, Icon] of Object.entries(DO_ICONS)) {
    if (low.includes(key.toLowerCase())) return Icon;
  }
  return CheckCircle2;
}

function withContentUpdate(content: BriefingContent, updater: (draft: BriefingContent) => void): BriefingContent {
  const next = JSON.parse(JSON.stringify(content)) as BriefingContent;
  updater(next);
  return next;
}

export function DosSection({ briefing, editable = false, onUpdate }: Props) {
  const dos = briefing.content.abas?.dos || [];

  const updateDo = (i: number, patch: Partial<DoItem>) => {
    if (!onUpdate) return;
    const content = withContentUpdate(briefing.content, (c) => {
      const arr = (c.abas.dos = c.abas.dos || []);
      arr[i] = { ...arr[i], ...patch };
    });
    onUpdate({ content });
  };
  const addDo = () => {
    if (!onUpdate) return;
    const content = withContentUpdate(briefing.content, (c) => {
      const arr = (c.abas.dos = c.abas.dos || []);
      arr.push({ titulo: 'Novo Do', tag: 'Reforçar', descricao: '', sub_itens: [] });
    });
    onUpdate({ content });
  };
  const removeDo = (i: number) => {
    if (!onUpdate) return;
    const content = withContentUpdate(briefing.content, (c) => {
      const arr = (c.abas.dos = c.abas.dos || []);
      arr.splice(i, 1);
    });
    onUpdate({ content });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#00143D] flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6" /> Definição dos Do&apos;s
          </h1>
          <p className="text-sm text-gray-500 mt-1">Pontos que devem ser citados e reforçados nos criativos.</p>
        </div>
        {editable && (
          <button
            onClick={addDo}
            className="flex items-center gap-1.5 bg-[#00143D] text-white text-sm px-3 py-2 rounded-lg hover:bg-[#001d5a]"
          >
            <Plus className="w-4 h-4" /> Adicionar
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="flex items-center gap-2 font-bold text-[#00143D] text-lg mb-5">
          <CheckCircle2 className="w-5 h-5 text-[#10B981]" /> Diretrizes de Comunicação
        </h2>

        {dos.length === 0 ? (
          <div className="text-center text-gray-400 py-8 border border-dashed border-gray-200 rounded-xl">
            {editable ? 'Clique em "Adicionar" pra criar o primeiro Do\'.' : 'Nenhum Do\' foi extraído do briefing.'}
          </div>
        ) : (
          <div className="space-y-4">
            {dos.map((d, i) => {
              const Icon = iconFor(d.titulo);
              return (
                <div key={i} className="bg-[#F0FDF4] border border-[#86EFAC]/40 rounded-xl p-5 group">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white flex items-center justify-center">
                      <Icon className="w-5 h-5 text-[#10B981]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap mb-2">
                        <EditableField
                          as="h3"
                          editable={editable}
                          value={d.titulo}
                          onChange={(v) => updateDo(i, { titulo: v })}
                          placeholder="Título do Do"
                          className="font-bold text-[#00143D]"
                        />
                        <span className="inline-flex items-center gap-1 bg-white text-[#10B981] text-xs font-medium px-2.5 py-1 rounded-full border border-[#86EFAC]/50">
                          <CheckCircle2 className="w-3 h-3" />
                          <EditableField
                            as="span"
                            editable={editable}
                            value={d.tag}
                            onChange={(v) => updateDo(i, { tag: v })}
                            placeholder="Tag"
                          />
                        </span>
                      </div>
                      <EditableField
                        as="p"
                        editable={editable}
                        multiline
                        value={d.descricao || ''}
                        onChange={(v) => updateDo(i, { descricao: v })}
                        placeholder="Descrição do Do"
                        className="text-sm text-gray-700 mb-2"
                      />
                      <ul className="space-y-1">
                        {(d.sub_itens || []).map((item, j) => (
                          <li key={j} className="text-sm text-gray-700 flex items-center gap-2">
                            <span className="w-1 h-1 rounded-full bg-[#10B981]" />
                            <EditableField
                              as="span"
                              editable={editable}
                              value={item}
                              onChange={(v) => {
                                const sub_itens = [...(d.sub_itens || [])];
                                sub_itens[j] = v;
                                updateDo(i, { sub_itens });
                              }}
                              placeholder="sub-item"
                            />
                            {editable && (
                              <button
                                onClick={() => {
                                  const sub_itens = (d.sub_itens || []).filter((_, k) => k !== j);
                                  updateDo(i, { sub_itens });
                                }}
                                className="text-gray-300 hover:text-[#10B981]"
                                title="Remover sub-item"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </li>
                        ))}
                        {editable && (
                          <li>
                            <button
                              onClick={() => updateDo(i, { sub_itens: [...(d.sub_itens || []), ''] })}
                              className="text-xs text-[#10B981] hover:underline flex items-center gap-1"
                            >
                              <Plus className="w-3 h-3" /> adicionar sub-item
                            </button>
                          </li>
                        )}
                      </ul>
                    </div>
                    {editable && (
                      <button
                        onClick={() => removeDo(i)}
                        className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-[#10B981] transition-opacity"
                        title="Remover Do"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
