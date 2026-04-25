'use client';

import { Target, Plus, Trash2 } from 'lucide-react';
import type { Briefing, BriefingContent, PontoForteDetalhado } from '@/types/briefing';
import { PONTOS_FORTES } from '@/types/briefing';
import { EditableField } from '@/components/EditableField';

type UpdateFn = (updates: Partial<Briefing>) => void;

interface Props {
  briefing: Briefing;
  editable?: boolean;
  onUpdate?: UpdateFn;
}

function withContentUpdate(content: BriefingContent, updater: (draft: BriefingContent) => void): BriefingContent {
  const next = JSON.parse(JSON.stringify(content)) as BriefingContent;
  updater(next);
  return next;
}

export function PontosFortesSection({ briefing, editable = false, onUpdate }: Props) {
  const detalhados = briefing.content.abas?.pontos_fortes?.detalhados || [];

  const updateDetalhado = (index: number, patch: Partial<PontoForteDetalhado>) => {
    if (!onUpdate) return;
    const content = withContentUpdate(briefing.content, (c) => {
      const arr = (c.abas.pontos_fortes.detalhados = c.abas.pontos_fortes.detalhados || []);
      const oldSigla = arr[index]?.sigla;
      arr[index] = { ...arr[index], ...patch };

      if (patch.sigla && patch.sigla !== oldSigla) {
        const selected = (c.abas.pontos_fortes.selected = c.abas.pontos_fortes.selected || []);
        const stillUsed = arr.some((p, i) => i !== index && p.sigla === oldSigla);
        if (!stillUsed) {
          const idx = selected.indexOf(oldSigla);
          if (idx >= 0) selected.splice(idx, 1);
        }
        if (!selected.includes(patch.sigla)) selected.unshift(patch.sigla);
      }
    });
    onUpdate({ content });
  };

  const addDetalhado = () => {
    if (!onUpdate) return;
    const novaSigla = 'L';
    const content = withContentUpdate(briefing.content, (c) => {
      const arr = (c.abas.pontos_fortes.detalhados = c.abas.pontos_fortes.detalhados || []);
      arr.unshift({ sigla: novaSigla, nome: 'Localização', descricao: '', numeros: [] });
      const selected = (c.abas.pontos_fortes.selected = c.abas.pontos_fortes.selected || []);
      if (!selected.includes(novaSigla)) selected.unshift(novaSigla);
    });
    onUpdate({ content });
  };

  const removeDetalhado = (index: number) => {
    if (!onUpdate) return;
    const content = withContentUpdate(briefing.content, (c) => {
      const arr = (c.abas.pontos_fortes.detalhados = c.abas.pontos_fortes.detalhados || []);
      arr.splice(index, 1);
    });
    onUpdate({ content });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#00143D] flex items-center gap-2">
            <Target className="w-6 h-6" /> Pontos Fortes e Posicionamento
          </h1>
          <p className="text-sm text-gray-500 mt-1">Definição dos Pontos Fortes</p>
        </div>
        {editable && (
          <button
            onClick={addDetalhado}
            className="flex items-center gap-1.5 bg-[#00143D] text-white text-sm px-3 py-2 rounded-lg hover:bg-[#001d5a]"
          >
            <Plus className="w-4 h-4" /> Adicionar ponto forte
          </button>
        )}
      </div>

      {detalhados.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center text-gray-400 border border-dashed border-gray-200">
          {editable ? 'Clique em "Adicionar ponto forte" pra começar.' : 'Nenhum ponto forte detalhado foi extraído do briefing.'}
        </div>
      ) : (
        <div className="space-y-4">
          {detalhados.map((pf, i) => {
            const meta = (PONTOS_FORTES as Record<string, { name: string; color: string }>)[pf.sigla];
            const color = meta?.color || '#555555';
            return (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 group">
                <div className="flex items-start gap-4">
                  <div
                    className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                    style={{ backgroundColor: color }}
                  >
                    {pf.sigla}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 mb-2">
                      {editable && (
                        <select
                          value={pf.sigla}
                          onChange={(e) => updateDetalhado(i, { sigla: e.target.value, nome: (PONTOS_FORTES as Record<string, { name: string }>)[e.target.value]?.name || pf.nome })}
                          className="text-sm font-bold text-[#00143D] border border-gray-200 rounded px-2 py-0.5 focus:outline-none focus:ring-2 focus:ring-[#0048D7]"
                        >
                          {Object.entries(PONTOS_FORTES).map(([k, v]) => (
                            <option key={k} value={k}>{k} — {(v as { name: string }).name}</option>
                          ))}
                        </select>
                      )}
                      {!editable && (
                        <h3 className="text-lg font-bold text-[#00143D]">{pf.sigla} — {pf.nome}</h3>
                      )}
                    </div>

                    {/* Números destacados */}
                    <div className="space-y-1 mb-3">
                      {(pf.numeros || []).map((n, j) => (
                        <div key={j} className="flex items-center gap-2">
                          <EditableField
                            as="p"
                            editable={editable}
                            value={n}
                            onChange={(v) => {
                              const numeros = [...(pf.numeros || [])];
                              numeros[j] = v;
                              updateDetalhado(i, { numeros });
                            }}
                            placeholder="ex: R$ 55 mil líquidos por ano"
                            className="text-base font-bold text-[#00143D]"
                          />
                          {editable && (
                            <button
                              onClick={() => {
                                const numeros = (pf.numeros || []).filter((_, k) => k !== j);
                                updateDetalhado(i, { numeros });
                              }}
                              className="text-gray-300 hover:text-[#FC6058]"
                              title="Remover número"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ))}
                      {editable && (
                        <button
                          onClick={() => updateDetalhado(i, { numeros: [...(pf.numeros || []), ''] })}
                          className="text-xs text-[#0048D7] hover:underline flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" /> adicionar número destacado
                        </button>
                      )}
                    </div>

                    <EditableField
                      as="p"
                      editable={editable}
                      multiline
                      value={pf.descricao || ''}
                      onChange={(v) => updateDetalhado(i, { descricao: v })}
                      placeholder="Descrição contextualizada do ponto forte neste Spot"
                      className="text-sm text-gray-700 leading-relaxed"
                    />
                  </div>
                  {editable && (
                    <button
                      onClick={() => removeDetalhado(i)}
                      className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-[#FC6058] transition-opacity"
                      title="Remover ponto forte"
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
  );
}
