'use client';

import { FileText, Calendar, Building2, DollarSign } from 'lucide-react';
import type { Briefing, BriefingContent } from '@/types/briefing';
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

function fmtMoney(n?: number): string {
  if (!n) return '';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(n);
}

function parseMoney(s: string): number {
  if (!s) return 0;
  const hasMil = /mil/i.test(s);
  const cleaned = s.replace(/[^\d.,]/g, '');
  const normalized = cleaned.includes(',') ? cleaned.replace(/\./g, '').replace(',', '.') : cleaned.replace(/\./g, '');
  const n = parseFloat(normalized) || 0;
  return hasMil ? n * 1000 : n;
}

function Row({
  label, value, editable = false, onChange, placeholder, isMoney = false,
}: {
  label: string;
  value: string;
  editable?: boolean;
  onChange?: (v: string) => void;
  placeholder?: string;
  isMoney?: boolean;
}) {
  if (!editable && (value == null || value === '')) return null;
  return (
    <div className="flex justify-between items-baseline py-2.5 border-b border-gray-100 last:border-0 gap-4">
      <span className="text-sm text-gray-600 flex-shrink-0">{label}</span>
      <div className="text-sm font-semibold text-[#00143D] text-right flex-1">
        <EditableField
          as="span"
          editable={!!editable}
          value={value}
          onChange={(v) => onChange?.(v)}
          placeholder={placeholder}
        />
      </div>
    </div>
  );
}

function Card({ title, icon: Icon, children, color = '#0048D7' }: { title: string; icon: React.ComponentType<{ className?: string }>; children: React.ReactNode; color?: string }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border-t-4" style={{ borderTopColor: color }}>
      <h2 className="flex items-center gap-2 font-bold text-[#00143D] text-lg mb-4">
        <Icon className="w-5 h-5" /> {title}
      </h2>
      <div>{children}</div>
    </div>
  );
}

export function FinanceiroSection({ briefing, editable = false, onUpdate }: Props) {
  const ctx = briefing.content.abas?.contexto;
  const emp = briefing.content.abas?.dados_empreendimento;
  const cron = briefing.content.abas?.cronograma;
  const fin = briefing.content.abas?.dados_financeiros;
  const loc = briefing.content.abas?.localizacao;

  const upd = (aba: string, field: string, value: unknown) => {
    if (!onUpdate) return;
    const content = withContentUpdate(briefing.content, (c) => {
      const abas = c.abas as Record<string, unknown>;
      if (!abas[aba]) {
        // initialize defaults for optional abas
        if (aba === 'cronograma') {
          abas[aba] = { inicio_vendas: '', fechamento_grupo: '', inicio_obra: '', entrega_obra: '', fase_projeto: '' };
        } else if (aba === 'dados_empreendimento') {
          abas[aba] = {
            quantidade_opcoes: 0, pavimentos: '', tipologias_count: 0,
            metragem_min: 0, metragem_max: 0, vagas_garagem: '',
            modalidade_aprovacao: '', administrador_obras: '', arquiteto: '',
            cotas_marketplace: 0,
          };
        }
      }
      const target = abas[aba] as Record<string, unknown>;
      target[field] = value;
    });
    onUpdate({ content });
  };

  const updCtx = (field: string, value: string) => upd('contexto', field, value);
  const updCron = (field: string, value: string) => upd('cronograma', field, value);
  const updEmp = (field: string, value: string | number) => upd('dados_empreendimento', field, value);
  const updFin = (field: string, value: unknown) => upd('dados_financeiros', field, value);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#00143D] flex items-center gap-2">
          <FileText className="w-6 h-6" /> Dados Financeiros do Spot
        </h1>
        <p className="text-sm text-gray-500 mt-1">Dados confirmados para comunicação.</p>
      </div>

      <Card title="Identificação do Projeto" icon={FileText}>
        <Row label="Nome do Spot" value={briefing.spot_name} editable={editable} onChange={(v) => onUpdate?.({ spot_name: v })} placeholder="Nome do Spot" />
        <Row label="Endereço" value={(loc?.main_attraction as string) || ''} editable={editable}
          onChange={(v) => { if (!onUpdate) return; const content = withContentUpdate(briefing.content, (c) => { c.abas.localizacao.main_attraction = v; }); onUpdate({ content }); }}
          placeholder="ex: Rua Pequi, s/n — Morro das Pedras"
        />
        <Row label="Bairro" value={ctx?.neighborhood || ''} editable={editable} onChange={(v) => updCtx('neighborhood', v)} placeholder="ex: Campeche" />
        <Row label="Cidade / UF" value={briefing.city || ''} editable={editable} onChange={(v) => onUpdate?.({ city: v })} placeholder="ex: Florianópolis / SC" />
      </Card>

      <Card title="Cronograma de Obras Previsto" icon={Calendar}>
        <Row label="Início das vendas" value={cron?.inicio_vendas || ''} editable={editable} onChange={(v) => updCron('inicio_vendas', v)} placeholder="ex: 07/2024" />
        <Row label="Fechamento do grupo" value={cron?.fechamento_grupo || ''} editable={editable} onChange={(v) => updCron('fechamento_grupo', v)} placeholder="ex: 10/2024" />
        <Row label="Início da obra" value={cron?.inicio_obra || ''} editable={editable} onChange={(v) => updCron('inicio_obra', v)} placeholder="ex: 10/2025" />
        <Row label="Entrega da obra" value={cron?.entrega_obra || ''} editable={editable} onChange={(v) => updCron('entrega_obra', v)} placeholder="ex: 10/01/2029" />
        <Row label="Fase do projeto" value={cron?.fase_projeto || ''} editable={editable} onChange={(v) => updCron('fase_projeto', v)} placeholder="ex: Em obra" />
      </Card>

      <Card title="Estrutura do Empreendimento" icon={Building2}>
        <Row label="Quantidade de opções" value={emp?.quantidade_opcoes ? String(emp.quantidade_opcoes) : ''} editable={editable}
          onChange={(v) => updEmp('quantidade_opcoes', parseInt(v) || 0)} placeholder="ex: 97" />
        <Row label="Pavimentos" value={emp?.pavimentos || ''} editable={editable} onChange={(v) => updEmp('pavimentos', v)} placeholder="ex: 4 pav. + mezanino + cobertura" />
        <Row label="Tipologias" value={emp?.tipologias_count ? String(emp.tipologias_count) : ''} editable={editable}
          onChange={(v) => updEmp('tipologias_count', parseInt(v) || 0)} placeholder="ex: 28" />
        <Row label="Metragem mínima (m²)" value={emp?.metragem_min ? String(emp.metragem_min) : ''} editable={editable}
          onChange={(v) => updEmp('metragem_min', parseInt(v) || 0)} placeholder="ex: 14" />
        <Row label="Metragem máxima (m²)" value={emp?.metragem_max ? String(emp.metragem_max) : ''} editable={editable}
          onChange={(v) => updEmp('metragem_max', parseInt(v) || 0)} placeholder="ex: 41" />
        <Row label="Vagas de garagem" value={emp?.vagas_garagem || ''} editable={editable} onChange={(v) => updEmp('vagas_garagem', v)} placeholder="ex: Não possui / 1 por unidade" />
        <Row label="Modalidade de aprovação" value={emp?.modalidade_aprovacao || ''} editable={editable}
          onChange={(v) => updEmp('modalidade_aprovacao', v)} placeholder="ex: Multifamiliar" />
      </Card>

      <Card title="Informações Financeiras" icon={DollarSign}>
        <Row label="Ticket de entrada" value={fin?.investment_from ? fmtMoney(fin.investment_from) : ''} editable={editable}
          onChange={(v) => updFin('investment_from', parseMoney(v))} placeholder="ex: R$ 360.000" />
        <Row label="Rendimento líquido mensal" value={fin?.monthly_income ? fmtMoney(fin.monthly_income) : ''} editable={editable}
          onChange={(v) => updFin('monthly_income', parseMoney(v))} placeholder="ex: R$ 4.600" />
        <Row label="Rendimento líquido anual" value={fin?.annual_income ? fmtMoney(fin.annual_income) : ''} editable={editable}
          onChange={(v) => updFin('annual_income', parseMoney(v))} placeholder="ex: R$ 55.300" />
        <Row label="Valorização em 3 anos (%)" value={fin?.valorizacao_percentual ? `${fin.valorizacao_percentual}%` : ''} editable={editable}
          onChange={(v) => updFin('valorizacao_percentual', parseFloat(v.replace('%', '').replace(',', '.')) || 0)} placeholder="ex: 71" />
        <Row label="Breakdown da valorização" value={fin?.valorizacao_breakdown || ''} editable={editable}
          onChange={(v) => updFin('valorizacao_breakdown', v)} placeholder="ex: 30% incorporação + 27% produto + 14% região" />
        <Row label="Entrega prevista" value={fin?.entrega_prevista || cron?.entrega_obra || ''} editable={editable}
          onChange={(v) => updFin('entrega_prevista', v)} placeholder="ex: 10/01/2029" />
        <Row label="Condições de pagamento" value={fin?.payment_conditions || ''} editable={editable}
          onChange={(v) => updFin('payment_conditions', v)} placeholder="ex: Parcelado durante a obra" />
        <Row label="Financiamento" value={fin?.financing || ''} editable={editable}
          onChange={(v) => updFin('financing', v)} placeholder="ex: A definir" />
      </Card>
    </div>
  );
}
