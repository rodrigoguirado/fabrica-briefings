'use client';

import { Ban, AlertTriangle, Scale, TrendingUp, BarChart3, Megaphone, Gauge, Clock, Plus, Trash2 } from 'lucide-react';
import type { Briefing, BriefingContent, Dont } from '@/types/briefing';
import { EditableField } from '@/components/EditableField';

type UpdateFn = (updates: Partial<Briefing>) => void;

interface Props {
  briefing: Briefing;
  editable?: boolean;
  onUpdate?: UpdateFn;
}

const DONT_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  'Termos juridicamente proibidos': Scale,
  'Garantia de Rentabilidade': AlertTriangle,
  'Valorização como promessa': TrendingUp,
  'Comparação direta com Selic ou renda fixa': BarChart3,
  'Escassez artificial': Megaphone,
  'Promessas de ocupação total': Gauge,
  'Prazo de entrega como definitivo': Clock,
};

function iconFor(titulo: string) {
  for (const [key, Icon] of Object.entries(DONT_ICONS)) {
    if (titulo.toLowerCase().includes(key.toLowerCase())) return Icon;
  }
  return Ban;
}

function withContentUpdate(content: BriefingContent, updater: (draft: BriefingContent) => void): BriefingContent {
  const next = JSON.parse(JSON.stringify(content)) as BriefingContent;
  updater(next);
  return next;
}

export function DontsSection({ briefing, editable = false, onUpdate }: Props) {
  const donts = briefing.content.abas?.donts || [];

  const updateDont = (i: number, patch: Partial<Dont>) => {
    if (!onUpdate) return;
    const content = withContentUpdate(briefing.content, (c) => {
      const arr = (c.abas.donts = c.abas.donts || []);
      arr[i] = { ...arr[i], ...patch };
    });
    onUpdate({ content });
  };
  const addDont = () => {
    if (!onUpdate) return;
    const content = withContentUpdate(briefing.content, (c) => {
      const arr = (c.abas.donts = c.abas.donts || []);
      arr.push({ titulo: 'Novo Don\'t', tag: 'Não mencionar', descricao: '', itens: [], nota: '' });
    });
    onUpdate({ content });
  };
  const removeDont = (i: number) => {
    if (!onUpdate) return;
    const content = withContentUpdate(briefing.content, (c) => {
      const arr = (c.abas.donts = c.abas.donts || []);
      arr.splice(i, 1);
    });
    onUpdate({ content });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#00143D] flex items-center gap-2">
            <Ban className="w-6 h-6" /> Definição dos Don&apos;ts
          </h1>
          <p className="text-sm text-gray-500 mt-1">Diretrizes de comunicação — pontos que não devem ser mencionados.</p>
        </div>
        {editable && (
          <button
            onClick={addDont}
            className="flex items-center gap-1.5 bg-[#00143D] text-white text-sm px-3 py-2 rounded-lg hover:bg-[#001d5a]"
          >
            <Plus className="w-4 h-4" /> Adicionar
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="flex items-center gap-2 font-bold text-[#00143D] text-lg mb-1">
          <Ban className="w-5 h-5 text-[#FC6058]" /> Diretrizes de Comunicação
        </h2>
        <p className="text-sm text-gray-500 mb-5">Itens que não podem aparecer nos criativos, anúncios, vídeos ou materiais públicos.</p>

        {donts.length === 0 ? (
          <div className="text-center text-gray-400 py-8 border border-dashed border-gray-200 rounded-xl">
            {editable ? 'Clique em "Adicionar" pra criar o primeiro Don\'t.' : 'Nenhum Don\'t foi extraído do briefing.'}
          </div>
        ) : (
          <div className="space-y-4">
            {donts.map((d, i) => {
              const Icon = iconFor(d.titulo);
              return (
                <div key={i} className="bg-[#FEF2F2] border border-[#FCA5A5]/40 rounded-xl p-5 group">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white flex items-center justify-center">
                      <Icon className="w-5 h-5 text-[#FC6058]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap mb-2">
                        <EditableField
                          as="h3"
                          editable={editable}
                          value={d.titulo}
                          onChange={(v) => updateDont(i, { titulo: v })}
                          placeholder="Título do Don't"
                          className="font-bold text-[#00143D]"
                        />
                        <span className="inline-flex items-center gap-1 bg-white text-[#FC6058] text-xs font-medium px-2.5 py-1 rounded-full border border-[#FCA5A5]/50">
                          <Ban className="w-3 h-3" />
                          <EditableField
                            as="span"
                            editable={editable}
                            value={d.tag}
                            onChange={(v) => updateDont(i, { tag: v })}
                            placeholder="Tag"
                          />
                        </span>
                      </div>
                      <EditableField
                        as="p"
                        editable={editable}
                        multiline
                        value={d.descricao || ''}
                        onChange={(v) => updateDont(i, { descricao: v })}
                        placeholder="Descrição"
                        className="text-sm text-gray-700 mb-2"
                      />
                      <ul className="space-y-1 mb-2">
                        {(d.itens || []).map((item, j) => (
                          <li key={j} className="text-sm text-gray-700 flex items-center gap-2">
                            <span className="w-1 h-1 rounded-full bg-[#FC6058]" />
                            <EditableField
                              as="span"
                              editable={editable}
                              value={item}
                              onChange={(v) => {
                                const itens = [...(d.itens || [])];
                                itens[j] = v;
                                updateDont(i, { itens });
                              }}
                              placeholder="termo a evitar"
                              className="italic"
                            />
                            {editable && (
                              <button
                                onClick={() => {
                                  const itens = (d.itens || []).filter((_, k) => k !== j);
                                  updateDont(i, { itens });
                                }}
                                className="text-gray-300 hover:text-[#FC6058]"
                                title="Remover item"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </li>
                        ))}
                        {editable && (
                          <li>
                            <button
                              onClick={() => updateDont(i, { itens: [...(d.itens || []), ''] })}
                              className="text-xs text-[#FC6058] hover:underline flex items-center gap-1"
                            >
                              <Plus className="w-3 h-3" /> adicionar item
                            </button>
                          </li>
                        )}
                      </ul>
                      <EditableField
                        as="p"
                        editable={editable}
                        multiline
                        value={d.nota || ''}
                        onChange={(v) => updateDont(i, { nota: v })}
                        placeholder="Nota opcional"
                        className="text-xs text-gray-500 italic"
                      />
                    </div>
                    {editable && (
                      <button
                        onClick={() => removeDont(i)}
                        className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-[#FC6058] transition-opacity"
                        title="Remover Don't"
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
