'use client';

import { ExternalLink, Calendar, Tag, FileText, Target, Link as LinkIcon, ImageIcon } from 'lucide-react';
import type { OutroBriefing, BriefingMedia } from '@/types/briefing';
import { EditableField } from './EditableField';
import { MediaUpload } from './MediaUpload';
import { CommentsThread } from './CommentsThread';

const VERTICAL_LABELS: Record<OutroBriefing['vertical'], string> = {
  szi: 'SZI / Investimentos',
  marketplace: 'Marketplace',
};

interface Props {
  briefing: OutroBriefing;
  editable: boolean;
  onUpdate: (patch: Partial<OutroBriefing>) => void;
}

export function OutroBriefingView({ briefing, editable, onUpdate }: Props) {
  return (
    <div className="space-y-6">
      {/* Header card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="flex items-center gap-2 mb-3">
          {editable ? (
            <select
              value={briefing.vertical}
              onChange={e => onUpdate({ vertical: e.target.value as OutroBriefing['vertical'] })}
              className="text-xs font-bold uppercase tracking-widest border border-gray-200 rounded-full px-3 py-1 focus:outline-none focus:ring-2 focus:ring-[#0048D7]"
            >
              <option value="szi">SZI / Investimentos</option>
              <option value="marketplace">Marketplace</option>
            </select>
          ) : (
            <span className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full ${
              briefing.vertical === 'marketplace'
                ? 'bg-green-100 text-green-700'
                : 'bg-blue-100 text-blue-700'
            }`}>
              <Tag className="w-3 h-3 inline mr-1" /> {VERTICAL_LABELS[briefing.vertical]}
            </span>
          )}
        </div>

        <EditableField
          as="h1"
          editable={editable}
          value={briefing.titulo}
          onChange={(v) => onUpdate({ titulo: v })}
          placeholder="Título da demanda"
          className="text-3xl font-bold text-[#00143D] mb-3"
        />

        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-gray-500">Spot:</span>
            <EditableField
              as="span"
              editable={editable}
              value={briefing.spot_name || ''}
              onChange={(v) => onUpdate({ spot_name: v })}
              placeholder="—"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="font-semibold text-gray-500">Entrega:</span>
            {editable ? (
              <input
                type="date"
                value={briefing.data_entrega || ''}
                onChange={e => onUpdate({ data_entrega: e.target.value || null })}
                className="text-sm text-[#00143D] border border-gray-200 rounded px-2 py-0.5 focus:outline-none focus:ring-2 focus:ring-[#0048D7]"
              />
            ) : (
              <span>{briefing.data_entrega ? formatDateBR(briefing.data_entrega) : '—'}</span>
            )}
          </div>
        </div>
      </div>

      {/* Contexto */}
      <Section icon={FileText} title="Contexto da demanda">
        <EditableField
          as="p"
          editable={editable}
          multiline
          value={briefing.contexto || ''}
          onChange={(v) => onUpdate({ contexto: v })}
          placeholder="Por que essa demanda existe, qual o cenário…"
          className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap"
        />
      </Section>

      {/* O que precisamos */}
      <Section icon={Target} title="O que precisamos">
        <EditableField
          as="p"
          editable={editable}
          multiline
          value={briefing.o_que_precisamos || ''}
          onChange={(v) => onUpdate({ o_que_precisamos: v })}
          placeholder="Entregáveis específicos, formatos, requisitos…"
          className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap"
        />
      </Section>

      {/* Link da referência */}
      <Section icon={LinkIcon} title="Link da referência">
        <EditableField
          as="span"
          editable={editable}
          value={briefing.link_referencia || ''}
          onChange={(v) => onUpdate({ link_referencia: v })}
          placeholder="https://…"
          className="text-sm text-[#0048D7] break-all"
        />
        {briefing.link_referencia && !editable && (
          <a
            href={briefing.link_referencia}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 inline-flex items-center gap-1 text-xs text-[#0048D7] hover:underline"
          >
            Abrir <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </Section>

      {/* Mídia de referência */}
      <Section icon={ImageIcon} title="Imagens / vídeos de referência">
        <MediaUpload
          media={briefing.referencia_media || []}
          editable={editable}
          onChange={(media) => onUpdate({ referencia_media: media })}
          briefingId={briefing.id}
          creativeType="outros_referencia"
        />
        {!editable && (!briefing.referencia_media || briefing.referencia_media.length === 0) && (
          <p className="text-sm text-gray-400 italic">Nenhuma referência visual adicionada.</p>
        )}
      </Section>

      {/* Comentários */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-6 py-2">
        <CommentsThread
          briefingId={briefing.id}
          locationKey="outros_briefing:root"
          isAdmin={editable}
        />
      </div>
    </div>
  );
}

function Section({ icon: Icon, title, children }: { icon: React.ComponentType<{ className?: string }>; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h2 className="flex items-center gap-2 text-sm font-bold text-[#00143D] uppercase tracking-widest mb-3">
        <Icon className="w-4 h-4" /> {title}
      </h2>
      {children}
    </div>
  );
}

function formatDateBR(iso: string): string {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}
