'use client';

import { useState } from 'react';
import { Copy, Check, Share2, ChevronDown, ChevronRight } from 'lucide-react';
import type { Briefing, CreativeStructure, BriefingMedia } from '@/types/briefing';
import { CREATIVE_TYPE_LABELS } from '@/types/briefing';
import { EditableField } from './EditableField';
import { PontosFortesBadges } from './PontosFortesBadges';
import { SceneTable } from './SceneTable';
import { MediaUpload } from './MediaUpload';
import { EstaticoView } from './EstaticoView';
import { CommentsThread } from './CommentsThread';
import { getShareUrl } from '@/lib/utils';

interface BriefingViewProps {
  briefing: Briefing;
  editable?: boolean;
  onUpdate?: (updates: Partial<Briefing>) => void;
}

export function BriefingView({ briefing, editable = false, onUpdate }: BriefingViewProps) {
  const [copied, setCopied] = useState(false);
  // Todas as abas começam RECOLHIDAS por padrão
  const [expandedTypes, setExpandedTypes] = useState<Record<string, boolean>>({
    estatico: false,
    video_apresentadora: false,
    video_narrado: false,
    disruptivo: false,
  });

  const content = briefing.content;

  function copyShareLink() {
    navigator.clipboard.writeText(getShareUrl(briefing.share_id));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function toggleType(type: string) {
    setExpandedTypes(prev => ({ ...prev, [type]: !prev[type] }));
  }

  function updateContent(path: string, value: any) {
    if (!onUpdate) return;
    const newContent = JSON.parse(JSON.stringify(content));
    const keys = path.split('.');
    let obj = newContent;
    for (let i = 0; i < keys.length - 1; i++) {
      obj = obj[keys[i]];
    }
    obj[keys[keys.length - 1]] = value;
    onUpdate({ content: newContent });
  }

  function getMediaKey(type: string): keyof Briefing {
    return `media_${type}` as keyof Briefing;
  }

  function getHeaderLabel(type: string): string {
    if (type.includes('narrado')) return 'NARRAÇÃO';
    return 'LOCUÇÃO';
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <p className="text-accent text-xs font-bold tracking-widest uppercase mb-2">BRIEFING DE CRIATIVOS</p>
            <EditableField
              value={content.abas?.contexto?.spot_name || briefing.spot_name}
              onChange={(v) => updateContent('abas.contexto.spot_name', v)}
              editable={editable}
              as="h1"
              className="text-3xl font-bold text-navy-900 mb-1"
            />
            <EditableField
              value={`${content.abas?.contexto?.city || briefing.city || ''} ${content.abas?.contexto?.neighborhood ? '— ' + content.abas.contexto.neighborhood : ''}`}
              onChange={(v) => updateContent('abas.contexto.city', v)}
              editable={editable}
              className="text-lg text-gray-500"
            />
          </div>
          {/* Share button */}
          <button
            onClick={copyShareLink}
            className="flex items-center gap-2 px-4 py-2 bg-navy-900 text-white rounded-lg hover:bg-navy-800 transition-colors text-sm"
          >
            {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
            {copied ? 'Link copiado!' : 'Compartilhar'}
          </button>
        </div>

        {/* Pontos fortes */}
        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Pontos Fortes</p>
          <PontosFortesBadges
            selected={content.abas?.pontos_fortes?.selected || []}
            editable={editable}
            onChange={(sel) => updateContent('abas.pontos_fortes.selected', sel)}
          />
        </div>

        {/* Financial summary */}
        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-100">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider">Investimento</p>
            <EditableField
              value={content.abas?.dados_financeiros?.investment_from ? `A partir de R$ ${content.abas.dados_financeiros.investment_from.toLocaleString('pt-BR')}` : '—'}
              onChange={(v) => {
                const num = parseFloat(v.replace(/\D/g, ''));
                if (!isNaN(num)) updateContent('abas.dados_financeiros.investment_from', num);
              }}
              editable={editable}
              className="text-xl font-bold text-navy-900 mt-1"
            />
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider">RE Mensal</p>
            <EditableField
              value={content.abas?.dados_financeiros?.monthly_income ? `R$ ${content.abas.dados_financeiros.monthly_income.toLocaleString('pt-BR')}/mês` : '—'}
              onChange={(v) => {
                const num = parseFloat(v.replace(/\D/g, ''));
                if (!isNaN(num)) updateContent('abas.dados_financeiros.monthly_income', num);
              }}
              editable={editable}
              className="text-xl font-bold text-green-600 mt-1"
            />
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider">RE Anual</p>
            <EditableField
              value={content.abas?.dados_financeiros?.annual_income ? `R$ ${content.abas.dados_financeiros.annual_income.toLocaleString('pt-BR')}/ano` : '—'}
              onChange={(v) => {
                const num = parseFloat(v.replace(/\D/g, ''));
                if (!isNaN(num)) updateContent('abas.dados_financeiros.annual_income', num);
              }}
              editable={editable}
              className="text-xl font-bold text-green-600 mt-1"
            />
          </div>
        </div>
      </div>

      {/* ABAs section */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Localização */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-sm font-bold text-navy-900 uppercase tracking-wider mb-3">Localização</h3>
          <EditableField
            value={content.abas?.localizacao?.main_attraction || ''}
            onChange={(v) => updateContent('abas.localizacao.main_attraction', v)}
            editable={editable}
            className="text-sm text-gray-700 mb-2"
            placeholder="Principal atrativo..."
          />
          <EditableField
            value={content.abas?.localizacao?.distance_to_attraction || ''}
            onChange={(v) => updateContent('abas.localizacao.distance_to_attraction', v)}
            editable={editable}
            className="text-sm font-semibold text-navy-600"
            placeholder="Distância..."
          />
          <EditableField
            value={content.abas?.localizacao?.region_characteristics || ''}
            onChange={(v) => updateContent('abas.localizacao.region_characteristics', v)}
            editable={editable}
            className="text-sm text-gray-600 mt-2"
            placeholder="Características da região..."
            multiline
          />
        </div>

        {/* Informações Técnicas */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-sm font-bold text-navy-900 uppercase tracking-wider mb-3">Informações Técnicas</h3>
          <EditableField
            value={(content.abas?.informacoes_tecnicas?.amenities || []).join(', ')}
            onChange={(v) => updateContent('abas.informacoes_tecnicas.amenities', v.split(',').map(s => s.trim()))}
            editable={editable}
            className="text-sm text-gray-700"
            placeholder="Amenidades (separadas por vírgula)..."
          />
          <EditableField
            value={content.abas?.informacoes_tecnicas?.construction_details || ''}
            onChange={(v) => updateContent('abas.informacoes_tecnicas.construction_details', v)}
            editable={editable}
            className="text-sm text-gray-600 mt-2"
            placeholder="Detalhes construtivos..."
            multiline
          />
        </div>
      </div>

      {/* Criativos — agrupa estatico / video_apresentadora / video_narrado / disruptivo (apres + narrado juntos) */}
      {(() => {
        const criativos = content.criativos || {};
        // Grupos a renderizar, na ordem desejada
        const groups: { key: string; label: string; items: { subtype: string; label: string; structures: CreativeStructure[] }[] }[] = [];

        // Novo formato (estatico_v2) tem prioridade sobre o legado
        if (criativos.estatico_v2?.structures?.length || criativos.estatico?.structures?.length) {
          groups.push({
            key: 'estatico',
            label: 'Estático',
            items: criativos.estatico?.structures?.length
              ? [{ subtype: 'estatico', label: 'Estático', structures: criativos.estatico.structures }]
              : [], // se só tem v2, renderiza pelo EstaticoView dentro do bloco
          });
        }
        if (criativos.video_apresentadora?.structures?.length) {
          groups.push({
            key: 'video_apresentadora',
            label: 'Vídeo Apresentadora',
            items: [{ subtype: 'video_apresentadora', label: 'Vídeo Apresentadora', structures: criativos.video_apresentadora.structures }],
          });
        }
        if (criativos.video_narrado?.structures?.length) {
          groups.push({
            key: 'video_narrado',
            label: 'Vídeo Narrado',
            items: [{ subtype: 'video_narrado', label: 'Vídeo Narrado', structures: criativos.video_narrado.structures }],
          });
        }
        // Disruptivos juntos numa aba só
        const disrupItems: { subtype: string; label: string; structures: CreativeStructure[] }[] = [];
        if (criativos.disruptivo_apresentadora?.structures?.length) {
          disrupItems.push({ subtype: 'disruptivo_apresentadora', label: 'Apresentadora', structures: criativos.disruptivo_apresentadora.structures });
        }
        if (criativos.disruptivo_narrado?.structures?.length) {
          disrupItems.push({ subtype: 'disruptivo_narrado', label: 'Narrado', structures: criativos.disruptivo_narrado.structures });
        }
        if (disrupItems.length > 0) {
          groups.push({ key: 'disruptivo', label: 'Disruptivo', items: disrupItems });
        }

        return groups.map((group) => {
          const isExpanded = expandedTypes[group.key] === true;
          let totalStructures = group.items.reduce((acc, it) => acc + it.structures.length, 0);
          // Novo formato de Estático: contar structures de estatico_v2
          if (group.key === 'estatico' && criativos.estatico_v2?.structures?.length) {
            totalStructures += criativos.estatico_v2.structures.length;
          }

          return (
            <div key={group.key} className="mb-6">
              <button
                onClick={() => toggleType(group.key)}
                className="w-full flex items-center gap-3 bg-navy-900 text-white rounded-t-xl px-6 py-4 hover:bg-navy-800 transition-colors"
              >
                {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                <h2 className="text-lg font-bold">{group.label}</h2>
                <span className="text-sm text-gray-400 ml-auto">
                  {totalStructures} estrutura{totalStructures > 1 ? 's' : ''}
                </span>
              </button>

              {isExpanded && (
                <div className={`bg-white shadow-sm border border-gray-100 border-t-0 ${expandedTypes[group.key] ? 'rounded-b-xl' : ''}`}>
                  {/* Render novo formato de Estático quando disponível */}
                  {group.key === 'estatico' && content.criativos?.estatico_v2 && (
                    <div className="p-6">
                      <EstaticoView briefing={briefing} editable={editable} onUpdate={onUpdate} />
                    </div>
                  )}
                  {group.items.map((item) => (
                    <div key={item.subtype}>
                      {/* Subtítulo quando há múltiplos subtipos (ex: Disruptivo → Apresentadora / Narrado) */}
                      {group.items.length > 1 && (
                        <div className="px-6 py-3 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
                          <span className="text-xs tracking-widest font-bold text-accent uppercase">
                            Disruptivo — {item.label}
                          </span>
                          <span className="text-xs text-gray-400">
                            ({item.structures.length} estrutura{item.structures.length > 1 ? 's' : ''})
                          </span>
                        </div>
                      )}

                      {/* Media upload for this creative subtype */}
                      <div className="px-6 py-4 border-b border-gray-100">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Referências visuais</p>
                        <MediaUpload
                          media={(briefing[getMediaKey(item.subtype)] as BriefingMedia[]) || []}
                          editable={editable}
                          onChange={(media) => onUpdate?.({ [getMediaKey(item.subtype)]: media })}
                          briefingId={briefing.id}
                          creativeType={item.subtype}
                        />
                      </div>

                      {/* Structures */}
                      {item.structures.map((structure, sIdx) => (
                        <StructureView
                          key={`${item.subtype}-${sIdx}`}
                          structure={structure}
                          index={sIdx}
                          editable={editable}
                          headerLabel={getHeaderLabel(item.subtype)}
                          isDisruptivo={item.subtype.startsWith('disruptivo')}
                          briefingId={briefing.id}
                          subtype={item.subtype}
                          onChange={(updated) => {
                            const newStructures = [...item.structures];
                            newStructures[sIdx] = updated;
                            updateContent(`criativos.${item.subtype}.structures`, newStructures);
                          }}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        });
      })()}
      {/* Referência pra evitar unused-import warning quando labels vierem do mapa abaixo */}
      {false && <span>{CREATIVE_TYPE_LABELS.estatico}</span>}

      {/* Legendas */}
      {content.legendas && content.legendas.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-bold text-navy-900 mb-4">Legendas para Mídia Paga</h2>
          {content.legendas.map((legend, i) => {
            // Monta o texto corrido da versão completa (evita duplicação quando headline == cta)
            const fullPieces = [legend.full_headline, legend.full_body, legend.full_financial, legend.full_institutional, legend.full_cta]
              .map(s => (s || '').trim())
              .filter(Boolean);
            const fullDedup = Array.from(new Set(fullPieces));
            const fullText = fullDedup.join('\n\n');

            const shortPieces = [legend.short_headline, legend.short_body, legend.short_location, legend.short_cta]
              .map(s => (s || '').trim())
              .filter(Boolean);
            const shortDedup = Array.from(new Set(shortPieces));
            const shortText = shortDedup.join('\n\n');

            return (
              <div key={i} className="space-y-4">
                {/* Versão Completa */}
                <div className="border-l-4 border-navy-900 pl-4 bg-navy-50 rounded-r-lg py-3 pr-4">
                  <p className="text-xs font-bold text-navy-600 uppercase tracking-wider mb-2">Versão Completa</p>
                  <EditableField
                    value={fullText}
                    onChange={(v) => updateContent(`legendas.${i}.full_headline`, v)}
                    editable={editable}
                    className="text-sm text-navy-900 whitespace-pre-wrap"
                    placeholder="Texto corrido da legenda..."
                    multiline
                  />
                </div>
                {/* Versão Enxuta */}
                <div className="border-l-4 border-accent pl-4 bg-red-50/30 rounded-r-lg py-3 pr-4">
                  <p className="text-xs font-bold text-accent uppercase tracking-wider mb-2">Versão Enxuta</p>
                  <EditableField
                    value={shortText}
                    onChange={(v) => updateContent(`legendas.${i}.short_headline`, v)}
                    editable={editable}
                    className="text-sm text-navy-900 whitespace-pre-wrap"
                    placeholder="Texto corrido da legenda enxuta..."
                    multiline
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ─── Structure sub-component ─── */

function StructureView({
  structure,
  index,
  editable,
  headerLabel,
  isDisruptivo,
  briefingId,
  subtype,
  onChange,
}: {
  structure: CreativeStructure;
  index: number;
  editable: boolean;
  headerLabel: string;
  isDisruptivo: boolean;
  briefingId: string;
  subtype: string;
  onChange: (s: CreativeStructure) => void;
}) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="border-b border-gray-100 last:border-b-0">
      {/* Structure header */}
      <div className="px-6 py-4">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-accent text-xs font-bold tracking-widest uppercase">ESTRUTURA {index + 1}</span>
          <button onClick={() => setExpanded(!expanded)} className="text-gray-400 hover:text-gray-600">
            {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>
        <EditableField
          value={structure.name}
          onChange={(v) => onChange({ ...structure, name: v })}
          editable={editable}
          as="h3"
          className="text-xl font-bold text-navy-900 mb-2"
        />
        <PontosFortesBadges
          selected={structure.pontos_fortes}
          editable={editable}
          onChange={(sel) => onChange({ ...structure, pontos_fortes: sel })}
          size="sm"
        />
      </div>

      {expanded && (
        <div className="px-6 pb-6">
          {/* Logic */}
          <div className="mb-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Lógica da Estrutura</p>
            <EditableField
              value={structure.logic}
              onChange={(v) => onChange({ ...structure, logic: v })}
              editable={editable}
              className="text-sm text-gray-700 leading-relaxed"
              placeholder="Lógica da estrutura..."
              multiline
            />
          </div>

          {/* Territory (disruptivo) */}
          {isDisruptivo && (
            <div className="mb-4">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Território Criativo</p>
              {structure.focus_central && (
                <EditableField
                  value={structure.focus_central}
                  onChange={(v) => onChange({ ...structure, focus_central: v })}
                  editable={editable}
                  className="text-sm font-semibold text-navy-600 mb-1"
                  placeholder="Foco central..."
                />
              )}
              <EditableField
                value={(structure.territory || []).join(' • ')}
                onChange={(v) => onChange({ ...structure, territory: v.split('•').map(s => s.trim()).filter(Boolean) })}
                editable={editable}
                className="text-sm text-gray-600"
                placeholder="Características do território..."
              />
            </div>
          )}

          {/* Variations */}
          {structure.variations.map((variation, vIdx) => (
            <div key={variation.variation_number} className="mb-6">
              <div className="flex items-baseline gap-3 mb-1">
                <span className="text-lg font-bold text-navy-900">V{variation.variation_number}</span>
                <EditableField
                  value={variation.hypothesis}
                  onChange={(v) => {
                    const newVars = [...structure.variations];
                    newVars[vIdx] = { ...newVars[vIdx], hypothesis: v };
                    onChange({ ...structure, variations: newVars });
                  }}
                  editable={editable}
                  className="text-sm text-gray-500"
                  placeholder="Hipótese..."
                />
              </div>
              <p className="text-xs text-gray-400 mb-3">
                Duração: <span className="font-semibold text-navy-900">{variation.duration}s</span>
                {' | '}Pontos fortes: <span className="font-semibold text-navy-900">{variation.pontos_fortes.join(' | ')}</span>
              </p>
              <SceneTable
                scenes={variation.scenes}
                editable={editable}
                headerLabel={headerLabel}
                onChange={(scenes) => {
                  const newVars = [...structure.variations];
                  newVars[vIdx] = { ...newVars[vIdx], scenes };
                  onChange({ ...structure, variations: newVars });
                }}
              />
              <CommentsThread
                briefingId={briefingId}
                locationKey={`${subtype}:${index}:${variation.variation_number}`}
                isAdmin={editable}
              />
            </div>
          ))}

          {/* AB Tests */}
          {structure.ab_tests.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-sm font-bold text-navy-600 mb-2">Testes A/B</p>
              {structure.ab_tests.map(test => (
                <p key={test.test_number} className="text-sm text-gray-600 mb-1">
                  <span className="font-semibold">Teste {test.test_number}:</span>{' '}
                  {test.hypothesis_a} <span className="text-accent font-bold">×</span> {test.hypothesis_b}
                </p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
