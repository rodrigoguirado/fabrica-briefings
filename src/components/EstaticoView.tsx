'use client';

import { useState } from 'react';
import { Image as ImageIcon, Target, ChevronDown, ChevronUp, FlaskConical } from 'lucide-react';
import type { Briefing, EstaticoContent, StaticStructure, StaticVariation, StaticABTest, BriefingMedia } from '@/types/briefing';
import { EditableField } from './EditableField';
import { MediaUpload } from './MediaUpload';
import { CommentsThread } from './CommentsThread';

interface Props {
  briefing: Briefing;
  editable?: boolean;
  onUpdate?: (updates: Partial<Briefing>) => void;
}

function withContentUpdate<T>(
  briefing: Briefing,
  updater: (draft: Briefing['content']) => void
): Briefing['content'] {
  const next = JSON.parse(JSON.stringify(briefing.content));
  updater(next);
  return next;
}

export function EstaticoView({ briefing, editable = false, onUpdate }: Props) {
  const estatico = briefing.content.criativos?.estatico_v2;

  if (!estatico || !estatico.structures?.length) return null;

  const updateEstatico = (updater: (e: EstaticoContent) => void) => {
    if (!onUpdate) return;
    const content = withContentUpdate(briefing, (c) => {
      if (!c.criativos.estatico_v2) return;
      updater(c.criativos.estatico_v2);
    });
    onUpdate({ content });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-[#0048D7] flex items-center justify-center flex-shrink-0">
          <ImageIcon className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1 border-b border-gray-200 pb-3">
          <h2 className="text-xl font-bold text-[#00143D] uppercase">
            {estatico.label || `Estático — ${briefing.spot_name}`}
          </h2>
          <p className="text-sm text-gray-500">{estatico.subtitle || 'Peças estáticas para feed e stories'}</p>
        </div>
      </div>

      {/* Diretrizes Obrigatórias */}
      {estatico.global_guidelines && estatico.global_guidelines.length > 0 && (
        <div className="bg-[#FEF2F2] border-l-4 border-[#FC6058] rounded-r-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-4 h-4 text-[#FC6058]" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#00143D]">
              Diretrizes Obrigatórias para Todas as Peças
            </h3>
          </div>
          <ul className="space-y-1.5">
            {estatico.global_guidelines.map((g, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="w-1 h-1 rounded-full bg-[#FC6058] mt-2 flex-shrink-0" />
                <EditableField
                  as="span"
                  editable={editable}
                  value={g}
                  onChange={(v) => updateEstatico((e) => { e.global_guidelines[i] = v; })}
                  placeholder="Diretriz"
                />
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Estruturas */}
      {estatico.structures.map((struct, sIdx) => (
        <StructureBlock
          key={sIdx}
          structure={struct}
          index={sIdx}
          editable={editable}
          mediaKey={`media_estatico_${sIdx}`}
          briefing={briefing}
          onMediaChange={(media) => {
            // Por enquanto grava na chave genérica media_estatico (todas as estruturas compartilham)
            onUpdate?.({ media_estatico: media });
          }}
          onUpdate={(patch) => updateEstatico((e) => {
            e.structures[sIdx] = { ...e.structures[sIdx], ...patch };
          })}
          onVariationUpdate={(vIdx, patch) => updateEstatico((e) => {
            e.structures[sIdx].variations[vIdx] = { ...e.structures[sIdx].variations[vIdx], ...patch };
          })}
          onTextoFixoUpdate={(vIdx, tIdx, value) => updateEstatico((e) => {
            const textos = e.structures[sIdx].variations[vIdx].textos_fixos;
            textos[tIdx] = value;
          })}
          onABTestUpdate={(tIdx, patch) => updateEstatico((e) => {
            e.structures[sIdx].ab_tests[tIdx] = { ...e.structures[sIdx].ab_tests[tIdx], ...patch };
          })}
        />
      ))}

      {/* Teste Extra — Impacto da Imagem */}
      {estatico.cross_test && estatico.structures.length > 1 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <FlaskConical className="w-5 h-5 text-[#FC6058]" />
            <h3 className="text-lg font-bold text-[#00143D]">Teste Extra — Impacto da Imagem</h3>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            Teste ABC entre estruturas usando a mesma hipótese.
          </p>
          <div className="bg-[#F2F6FC] border border-[#0048D7]/20 rounded-xl p-4 mb-4">
            <p className="text-sm text-gray-700">
              Hipótese escolhida para comparação: <strong className="text-[#00143D]">{estatico.cross_test.hypothesis}</strong>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              (foi escolhida a Variação {estatico.cross_test.variation_number} de cada estrutura)
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-[#00143D]">Teste ABC</p>
            {estatico.structures.map((s, i) => (
              <div key={i} className="text-sm text-gray-700 pl-3 border-l-2 border-[#FC6058]/50">
                <strong>ESTRUTURA {i + 1} — VARIAÇÃO {estatico.cross_test!.variation_number}:</strong>{' '}
                {estatico.cross_test!.hypothesis} com imagem de {s.base_image.toLowerCase()}
                {i < estatico.structures.length - 1 && <span className="text-[#FC6058] ml-1">×</span>}
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-gray-100">
            <p className="text-xs font-bold uppercase tracking-wider text-[#00143D] mb-1">Objetivo do Teste</p>
            <EditableField
              as="p"
              editable={editable}
              multiline
              value={estatico.cross_test.objective}
              onChange={(v) => updateEstatico((e) => { if (e.cross_test) e.cross_test.objective = v; })}
              placeholder="Objetivo do teste"
              className="text-sm text-gray-700"
            />
          </div>
        </div>
      )}
    </div>
  );
}

function StructureBlock({
  structure, index, editable, briefing, mediaKey, onMediaChange, onUpdate, onVariationUpdate, onTextoFixoUpdate, onABTestUpdate,
}: {
  structure: StaticStructure;
  index: number;
  editable: boolean;
  briefing: Briefing;
  mediaKey: string;
  onMediaChange: (media: BriefingMedia[]) => void;
  onUpdate: (patch: Partial<StaticStructure>) => void;
  onVariationUpdate: (vIdx: number, patch: Partial<StaticVariation>) => void;
  onTextoFixoUpdate: (vIdx: number, tIdx: number, value: string) => void;
  onABTestUpdate: (tIdx: number, patch: Partial<StaticABTest>) => void;
}) {
  return (
    <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
      <h3 className="text-lg font-bold text-[#0048D7] mb-1">Estrutura {index + 1}</h3>
      <p className="text-sm font-semibold text-gray-700 mb-4">
        <span className="text-gray-500">Imagem base:</span>{' '}
        <EditableField
          as="span"
          editable={editable}
          value={structure.base_image}
          onChange={(v) => onUpdate({ base_image: v })}
          placeholder="ex: Fachada"
        />
      </p>

      {/* Imagem Base description */}
      <div className="bg-[#F2F6FC] border border-[#0048D7]/20 rounded-xl p-4 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <ImageIcon className="w-4 h-4 text-[#0048D7]" />
          <span className="text-xs tracking-widest font-bold uppercase text-[#00143D]">Imagem Base</span>
        </div>
        <EditableField
          as="p"
          editable={editable}
          multiline
          value={structure.base_image_description}
          onChange={(v) => onUpdate({ base_image_description: v })}
          placeholder="ex: As 5 variações devem apresentar imagens variadas da fachada..."
          className="text-sm text-gray-700"
        />
      </div>

      {/* Referências visuais (Media Upload) */}
      {editable && (
        <div className="mb-4">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Referências visuais (opcional)</p>
          <MediaUpload
            media={(briefing.media_estatico as BriefingMedia[]) || []}
            editable={editable}
            onChange={onMediaChange}
            briefingId={briefing.id}
            creativeType={`estatico_${index}`}
          />
        </div>
      )}

      {/* Variações */}
      <div className="space-y-3">
        {structure.variations.map((v, vIdx) => (
          <VariationCard
            key={vIdx}
            variation={v}
            editable={editable}
            briefingId={briefing.id}
            structureIndex={index}
            onUpdate={(patch) => onVariationUpdate(vIdx, patch)}
            onTextoFixoUpdate={(tIdx, value) => onTextoFixoUpdate(vIdx, tIdx, value)}
          />
        ))}
      </div>

      {/* Testes A/B da estrutura */}
      {structure.ab_tests && structure.ab_tests.length > 0 && (
        <div className="mt-5 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-bold text-[#00143D] uppercase tracking-wider mb-3">Testes A/B</h4>
          <div className="space-y-3">
            {structure.ab_tests.map((t, tIdx) => (
              <div key={tIdx} className="bg-white rounded-xl p-4 border border-gray-200">
                <p className="text-xs font-bold uppercase tracking-wider text-[#FC6058] mb-2">
                  Teste {t.test_number} — {t.kind}
                </p>
                <div className="space-y-1.5 text-sm text-gray-700">
                  {t.variations.map((varNum, i) => (
                    <div key={i} className="flex items-baseline gap-2">
                      <strong>Hipótese VARIAÇÃO {varNum}:</strong>
                      <span>{t.hypotheses[i] || ''}</span>
                      {i < t.variations.length - 1 && <span className="text-[#FC6058] ml-auto font-bold">×</span>}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function VariationCard({
  variation, editable, briefingId, structureIndex, onUpdate, onTextoFixoUpdate,
}: {
  variation: StaticVariation;
  editable: boolean;
  briefingId: string;
  structureIndex: number;
  onUpdate: (patch: Partial<StaticVariation>) => void;
  onTextoFixoUpdate: (tIdx: number, value: string) => void;
}) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
      >
        <span className="flex-shrink-0 w-10 h-10 rounded-lg bg-[#00143D] text-white font-bold text-sm flex items-center justify-center">
          V{variation.variation_number}
        </span>
        <div className="flex-1 text-left">
          <p className="text-sm font-semibold text-[#00143D]">
            Hipótese: <EditableField
              as="span"
              editable={editable}
              value={variation.hypothesis}
              onChange={(v) => onUpdate({ hypothesis: v })}
              placeholder="ex: RE mensal"
            />
          </p>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3">
          {/* Frase de Destaque */}
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-xs tracking-widest font-bold uppercase text-gray-500 mb-2">Frase de Destaque:</p>
            <EditableField
              as="p"
              editable={editable}
              multiline
              value={variation.frase_destaque}
              onChange={(v) => onUpdate({ frase_destaque: v })}
              placeholder="ex: R$ 4.600+ líquidos por mês*"
              className="text-2xl font-bold text-[#00143D]"
            />
          </div>

          {/* Textos Fixos */}
          <div className="bg-[#F2F6FC] border border-[#0048D7]/20 rounded-xl p-4">
            <p className="text-xs tracking-widest font-bold uppercase text-[#00143D] mb-2">Textos Fixos da Peça:</p>
            <ul className="space-y-1.5">
              {variation.textos_fixos.map((t, tIdx) => (
                <li key={tIdx} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="w-1 h-1 rounded-full bg-[#00143D] mt-2 flex-shrink-0" />
                  <EditableField
                    as="span"
                    editable={editable}
                    value={t}
                    onChange={(v) => onTextoFixoUpdate(tIdx, v)}
                    placeholder="Texto fixo"
                  />
                </li>
              ))}
            </ul>
          </div>

          <CommentsThread
            briefingId={briefingId}
            locationKey={`estatico_v2:${structureIndex}:${variation.variation_number}`}
            isAdmin={editable}
          />
        </div>
      )}
    </div>
  );
}
