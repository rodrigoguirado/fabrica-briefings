'use client';

import { useState, useEffect, useRef } from 'react';
import { ExternalLink, History, Trash2, X } from 'lucide-react';
import type { Briefing } from '@/types/briefing';
import { formatCurrency, formatDate } from '@/lib/utils';

// Only two UI statuses:
//   Em produção  → stored as `em_revisao`
//   Finalizado   → stored as `publicado`
// Any other value (rascunho / aprovado) is treated as "Em produção" for display.
const UI_STATUSES = [
  { key: 'em_revisao', label: 'Em produção', className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40' },
  { key: 'publicado', label: 'Finalizado', className: 'bg-green-500/20 text-green-400 border-green-500/40' },
] as const;

function toUiStatusKey(raw: string): 'em_revisao' | 'publicado' {
  return raw === 'publicado' || raw === 'aprovado' ? 'publicado' : 'em_revisao';
}

function toUiLabel(raw: string): string {
  return toUiStatusKey(raw) === 'publicado' ? 'Finalizado' : 'Em produção';
}

// Group briefings by "spot_name + category" - newest becomes the principal,
// older ones become history (max 10 as per spec).
interface Group {
  principal: Briefing;
  historico: Briefing[];
}

function groupBriefings(briefings: Briefing[]): Group[] {
  // Sort by created_at desc so the first encountered with a key is the newest
  const sorted = [...briefings].sort((a, b) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  const map = new Map<string, Group>();
  for (const b of sorted) {
    const key = `${(b.spot_name || '').trim().toLowerCase()}|${(b.category || '').trim().toLowerCase()}`;
    if (!map.has(key)) {
      map.set(key, { principal: b, historico: [] });
    } else {
      const g = map.get(key)!;
      if (g.historico.length < 10) g.historico.push(b);
    }
  }
  return Array.from(map.values());
}

interface BriefingTableProps {
  briefings: Briefing[];
  onOpenBriefing: (id: string) => void;
  onStatusChange?: (id: string, newStatus: 'em_revisao' | 'publicado') => Promise<void> | void;
  onDelete?: (id: string) => Promise<void> | void;
}

export function BriefingTable({ briefings, onOpenBriefing, onStatusChange, onDelete }: BriefingTableProps) {
  const groups = groupBriefings(briefings);

  return (
    <div className="bg-seazone-card border border-seazone-border rounded-xl">
      <table className="w-full">
        <thead>
          <tr className="border-b border-seazone-border">
            {['Categoria','Spot','Cidade / Destino','Link do Briefing','Ticket (R$)','RE Mensal (R$)','RE Anual (R$)','Data Briefing','Status','Histórico',''].map(h => (
              <th key={h} className={`px-4 py-3 text-sm font-medium text-seazone-muted ${h.includes('R$') ? 'text-right' : 'text-left'}`}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {groups.map(g => (
            <GroupRow
              key={g.principal.id}
              group={g}
              onOpenBriefing={onOpenBriefing}
              onStatusChange={onStatusChange}
              onDelete={onDelete}
            />
          ))}
          {groups.length === 0 && (
            <tr><td colSpan={11} className="px-4 py-12 text-center text-seazone-muted">Nenhum briefing encontrado. Faça upload de um DOCX para começar.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function GroupRow({
  group, onOpenBriefing, onStatusChange, onDelete,
}: {
  group: Group;
  onOpenBriefing: (id: string) => void;
  onStatusChange?: (id: string, s: 'em_revisao' | 'publicado') => Promise<void> | void;
  onDelete?: (id: string) => Promise<void> | void;
}) {
  const b = group.principal;
  const [showHistory, setShowHistory] = useState(false);
  const [deleteStep, setDeleteStep] = useState<0 | 1 | 2>(0);
  const historyWrapperRef = useRef<HTMLDivElement>(null);

  // Close history popover on outside click (only when already open)
  useEffect(() => {
    if (!showHistory) return;
    const handler = (e: MouseEvent) => {
      if (historyWrapperRef.current && !historyWrapperRef.current.contains(e.target as Node)) {
        setShowHistory(false);
      }
    };
    // Defer by one tick so the click that opened doesn't immediately close it
    const t = setTimeout(() => document.addEventListener('mousedown', handler), 0);
    return () => {
      clearTimeout(t);
      document.removeEventListener('mousedown', handler);
    };
  }, [showHistory]);

  const uiKey = toUiStatusKey(b.status);
  const uiStatusConfig = UI_STATUSES.find(s => s.key === uiKey)!;

  async function handleStatusChange(newKey: 'em_revisao' | 'publicado') {
    if (newKey === uiKey) return;
    await onStatusChange?.(b.id, newKey);
  }

  async function handleDeleteClick() {
    if (deleteStep === 0) {
      setDeleteStep(1);
      return;
    }
    if (deleteStep === 1) {
      const confirmed = window.confirm(`CONFIRMAÇÃO FINAL\n\nExcluir briefing "${b.spot_name}" (${formatDate(b.created_at)})?\n\nEssa ação NÃO PODE ser desfeita.`);
      if (!confirmed) {
        setDeleteStep(0);
        return;
      }
      setDeleteStep(2);
      await onDelete?.(b.id);
      setDeleteStep(0);
    }
  }

  return (
    <>
      <tr className="border-b border-seazone-border/50 hover:bg-white/[0.02] transition-colors">
        <td className="px-4 py-3">
          {b.category && (
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
              b.category === 'Marketplace' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'
            }`}>{b.category}</span>
          )}
        </td>
        <td className="px-4 py-3 font-semibold text-white">{b.spot_name}</td>
        <td className="px-4 py-3 text-seazone-muted">{b.city || '—'}</td>
        <td className="px-4 py-3">
          <button onClick={() => onOpenBriefing(b.id)} className="text-accent hover:text-accent/80 text-sm font-medium flex items-center gap-1">
            Abrir <ExternalLink className="w-3 h-3" />
          </button>
        </td>
        <td className="px-4 py-3 text-right tabular-nums">{formatCurrency(b.investment_from)}</td>
        <td className="px-4 py-3 text-right tabular-nums">{formatCurrency(b.monthly_income)}</td>
        <td className="px-4 py-3 text-right tabular-nums">{formatCurrency(b.annual_income)}</td>
        <td className="px-4 py-3 text-seazone-muted text-sm">{formatDate(b.created_at)}</td>

        {/* Status editável via dropdown */}
        <td className="px-4 py-3">
          <div className="relative inline-block">
            <select
              value={uiKey}
              onChange={(e) => handleStatusChange(e.target.value as 'em_revisao' | 'publicado')}
              className={`appearance-none cursor-pointer text-xs font-medium pl-2.5 pr-7 py-1 rounded-full border ${uiStatusConfig.className} focus:outline-none focus:ring-2 focus:ring-accent`}
              title="Alterar status"
            >
              {UI_STATUSES.map(s => (
                <option key={s.key} value={s.key} className="bg-seazone-card text-seazone-text">{s.label}</option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs opacity-70">▾</span>
          </div>
        </td>

        {/* Histórico */}
        <td className="px-4 py-3">
          {group.historico.length > 0 ? (
            <div className="relative inline-block" ref={historyWrapperRef}>
              <button
                onClick={() => setShowHistory(v => !v)}
                className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:text-accent/80 border border-accent/40 rounded-full px-2.5 py-1"
                title="Ver briefings anteriores desta combinação (Spot + Categoria)"
              >
                <History className="w-3 h-3" /> Ver ({group.historico.length})
              </button>
              {showHistory && (
                <div className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-y-auto bg-seazone-card border border-seazone-border rounded-lg shadow-xl z-50">
                  <div className="px-4 py-3 border-b border-seazone-border flex items-center justify-between">
                    <span className="text-sm font-semibold text-white">Histórico ({group.historico.length})</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); setShowHistory(false); }}
                      className="text-seazone-muted hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <ul className="py-1">
                    {group.historico.map(h => (
                      <HistoryItem
                        key={h.id}
                        briefing={h}
                        onOpen={() => { setShowHistory(false); onOpenBriefing(h.id); }}
                        onDelete={onDelete}
                      />
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <span className="text-xs text-seazone-muted/60">—</span>
          )}
        </td>

        {/* Excluir */}
        <td className="px-4 py-3">
          <button
            onClick={handleDeleteClick}
            onMouseLeave={() => { if (deleteStep === 1) setDeleteStep(0); }}
            disabled={deleteStep === 2}
            title={deleteStep === 0 ? 'Excluir' : deleteStep === 1 ? 'Clique novamente para confirmar' : 'Excluindo...'}
            className={`p-2 rounded-lg transition-colors ${
              deleteStep === 1
                ? 'bg-accent/20 text-accent ring-2 ring-accent'
                : 'text-seazone-muted hover:text-accent hover:bg-accent/10'
            } disabled:opacity-50`}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </td>
      </tr>
    </>
  );
}

function HistoryItem({
  briefing, onOpen, onDelete,
}: {
  briefing: Briefing;
  onOpen: () => void;
  onDelete?: (id: string) => Promise<void> | void;
}) {
  const [deleteStep, setDeleteStep] = useState<0 | 1 | 2>(0);

  async function handleDeleteClick(e: React.MouseEvent) {
    e.stopPropagation();
    if (deleteStep === 0) {
      setDeleteStep(1);
      return;
    }
    if (deleteStep === 1) {
      const confirmed = window.confirm(
        `CONFIRMAÇÃO FINAL\n\nExcluir briefing antigo "${briefing.spot_name}" (${formatDate(briefing.created_at)})?\n\nEssa ação NÃO PODE ser desfeita.`
      );
      if (!confirmed) {
        setDeleteStep(0);
        return;
      }
      setDeleteStep(2);
      await onDelete?.(briefing.id);
      setDeleteStep(0);
    }
  }

  return (
    <li className="flex items-center gap-1 px-2 hover:bg-white/5">
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onOpen(); }}
        className="flex-1 text-left px-2 py-2.5 text-sm flex items-center justify-between gap-3"
      >
        <div>
          <div className="text-white font-medium">{briefing.spot_name}</div>
          <div className="text-xs text-seazone-muted">{formatDate(briefing.created_at)} · {toUiLabel(briefing.status)}</div>
        </div>
        <ExternalLink className="w-3.5 h-3.5 text-accent flex-shrink-0" />
      </button>
      <button
        type="button"
        onClick={handleDeleteClick}
        onMouseLeave={() => { if (deleteStep === 1) setDeleteStep(0); }}
        disabled={deleteStep === 2}
        title={deleteStep === 0 ? 'Excluir do histórico' : deleteStep === 1 ? 'Clique novamente para confirmar' : 'Excluindo...'}
        className={`p-1.5 rounded-md transition-colors flex-shrink-0 ${
          deleteStep === 1
            ? 'bg-accent/20 text-accent ring-2 ring-accent'
            : 'text-seazone-muted/70 hover:text-accent hover:bg-accent/10'
        } disabled:opacity-50`}
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </li>
  );
}
