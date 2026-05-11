'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, ExternalLink, Archive, Home, Palette, FileText, Target,
  Ban, CheckCircle2, Users, MapPin, Sparkles, Info,
} from 'lucide-react';
import { PONTOS_FORTES, type PontoForteKey } from '@/types/briefing';

interface LegacyJsonViewProps {
  title: string;
  content: Record<string, any>;
  sourceUrl?: string | null;
  backHref: string;
  publicView?: boolean;
}

type SectionKey = 'inicio' | 'criativos' | 'financeiro' | 'pontos-fortes' | 'donts' | 'dos' | 'perfil' | 'extras';

const SECTIONS: { key: SectionKey; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: 'inicio', label: 'Início', icon: Home },
  { key: 'criativos', label: 'Estrutura dos Criativos', icon: Palette },
  { key: 'financeiro', label: 'Dados financeiros do Spot', icon: FileText },
  { key: 'pontos-fortes', label: 'Pontos Fortes e Posicionamento', icon: Target },
  { key: 'donts', label: "Definição dos Don't's", icon: Ban },
  { key: 'dos', label: "Definição dos Do's", icon: CheckCircle2 },
  { key: 'perfil', label: 'Perfil do Hóspede', icon: Users },
];

// =============================================================================
// Helpers
// =============================================================================
function isPlainObject(v: any): v is Record<string, any> {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}

function humanize(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
    .replace(/Re Mensal/gi, 'RE Mensal')
    .replace(/Re Anual/gi, 'RE Anual');
}

function findFirst(content: Record<string, any>, keys: string[]): any {
  for (const k of keys) {
    if (content[k] !== undefined && content[k] !== null) return content[k];
  }
  return null;
}

function getEndereco(content: Record<string, any>): string | null {
  const loc = findFirst(content, ['localizacao', 'location', 'endereco', 'address']);
  if (typeof loc === 'string') return loc;
  if (isPlainObject(loc)) {
    return [loc.endereco, loc.praia, loc.bairro, loc.regiao, loc.cidade, loc.estado].filter(Boolean).join(' • ');
  }
  return null;
}

// =============================================================================
// Renderer genérico (fallback)
// =============================================================================
function GenericRender({ value, fieldKey }: { value: any; fieldKey?: string }) {
  if (value === null || value === undefined) return <span className="text-gray-400 italic">—</span>;
  if (typeof value === 'string') {
    if (!value) return <span className="text-gray-400 italic">—</span>;
    return <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{value}</p>;
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return <span className="text-[#0F172A] font-medium">{String(value)}</span>;
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return <span className="text-gray-400 italic">—</span>;
    if (value.every(v => typeof v === 'string' || typeof v === 'number')) {
      return (
        <ul className="list-disc pl-5 space-y-1.5">
          {value.map((v, i) => <li key={i} className="text-gray-700">{String(v)}</li>)}
        </ul>
      );
    }
    return (
      <div className="space-y-3">
        {value.map((item, i) => (
          <div key={i} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            {isPlainObject(item) ? <ObjectRender obj={item} /> : <GenericRender value={item} />}
          </div>
        ))}
      </div>
    );
  }
  if (isPlainObject(value)) return <ObjectRender obj={value} />;
  return <span>{JSON.stringify(value)}</span>;
}

function ObjectRender({ obj }: { obj: Record<string, any> }) {
  return (
    <div className="space-y-3">
      {Object.entries(obj).map(([k, v]) => (
        <div key={k} className="space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">{humanize(k)}</span>
          <div><GenericRender value={v} fieldKey={k} /></div>
        </div>
      ))}
    </div>
  );
}

function EmptySection({ label }: { label: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
      <Info className="w-10 h-10 text-gray-300 mx-auto mb-3" />
      <p className="text-gray-500 font-medium mb-1">Sem dados de “{label}” neste JSON.</p>
      <p className="text-gray-400 text-sm">
        O briefing original do Lovable pode ter mais abas — exporte os outros JSONs e importe novamente.
      </p>
    </div>
  );
}

// =============================================================================
// Início
// =============================================================================
function InicioSection({ content, title }: { content: Record<string, any>; title: string }) {
  const projeto = findFirst(content, ['projeto', 'titulo', 'title', 'nome', 'name']) || title;
  const tipo = findFirst(content, ['tipo', 'type']);
  const endereco = getEndereco(content);
  const ticket = findFirst(content, ['ticket_medio', 'ticket', 'valor']);
  const rendaMensal = findFirst(content, ['renda_mensal_estimada', 'renda_mensal', 'monthly_income']);
  const rendaAnual = findFirst(content, ['renda_anual_estimada', 'renda_anual', 'annual_income']);
  const welcome = findFirst(content, ['bem_vindo', 'welcome', 'introducao', 'intro', 'descricao']);
  const pontosFortesGlobais = findFirst(content, ['pontos_fortes_globais', 'pontos_fortes']);

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="bg-gradient-to-br from-[#00143D] to-[#001d5a] rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 left-8 right-8 h-1 bg-[#0048D7] rounded-b-full" />
        {tipo && <p className="text-xs tracking-widest text-white/60 uppercase mb-2">{tipo}</p>}
        <h1 className="text-4xl font-bold mb-3">{projeto}</h1>
        {endereco && (
          <p className="flex items-center gap-1.5 text-white/70 text-sm">
            <MapPin className="w-4 h-4" /> {endereco}
          </p>
        )}
      </div>

      {/* Bem-vindo */}
      {welcome && (
        <div className="bg-white rounded-2xl p-6 border-t-4 border-[#0048D7] shadow-sm">
          <h2 className="flex items-center gap-2 font-bold text-[#00143D] text-lg mb-4">
            <Home className="w-5 h-5" /> Bem-vindo ao {projeto}
          </h2>
          <div className="text-gray-700 leading-relaxed">
            <GenericRender value={welcome} />
          </div>
        </div>
      )}

      {/* Cards de stats */}
      {(ticket || rendaMensal || rendaAnual) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {ticket && <StatCard icon="💰" label="Ticket" value={String(ticket)} />}
          {rendaMensal && <StatCard icon="📅" label="Renda Mensal" value={String(rendaMensal)} />}
          {rendaAnual && <StatCard icon="📈" label="Renda Anual" value={String(rendaAnual)} />}
        </div>
      )}

      {/* Pontos fortes globais como tags */}
      {pontosFortesGlobais && (
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <h3 className="flex items-center gap-2 font-bold text-[#00143D] text-base mb-4">
            <Sparkles className="w-5 h-5" /> Pontos Fortes Globais
          </h3>
          <PontosFortesGlobaisGrid data={pontosFortesGlobais} />
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
      <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">{icon} {label}</p>
      <p className="text-xl font-bold text-[#00143D]">{value}</p>
    </div>
  );
}

// =============================================================================
// Pontos Fortes
// =============================================================================
function PontosFortesGlobaisGrid({ data }: { data: any }) {
  // data é tipo { D: "Distância dos Atrativos", L: "Localização", ... }
  if (!isPlainObject(data)) {
    return <GenericRender value={data} />;
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {Object.entries(data).map(([sigla, nome]) => {
        const pf = PONTOS_FORTES[sigla as PontoForteKey];
        const color = pf?.color || '#475569';
        return (
          <div key={sigla} className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-lg p-3">
            <span
              className="text-xs font-bold text-white px-2.5 py-1 rounded-full flex-shrink-0"
              style={{ backgroundColor: color }}
            >
              {sigla}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#00143D] truncate">{String(nome)}</p>
              {pf?.description && <p className="text-xs text-gray-500 truncate">{pf.description}</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function PontosFortesSectionView({ content }: { content: Record<string, any> }) {
  const data = findFirst(content, ['pontos_fortes_globais', 'pontos_fortes']);
  if (!data) return <EmptySection label="Pontos Fortes" />;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
        <h3 className="font-bold text-[#00143D] text-base mb-4">Pontos Fortes do Projeto</h3>
        <PontosFortesGlobaisGrid data={data} />
      </div>
    </div>
  );
}

// =============================================================================
// Criativos
// =============================================================================
function CriativosSection({ content }: { content: Record<string, any> }) {
  const formatos = findFirst(content, ['formatos', 'criativos']);
  if (!formatos || !isPlainObject(formatos)) return <EmptySection label="Estrutura dos Criativos" />;

  const formatoKeys = Object.keys(formatos);
  const [active, setActive] = useState(formatoKeys[0]);
  const activeData = formatos[active];

  return (
    <div className="space-y-5">
      {/* Sub-tabs por formato */}
      {formatoKeys.length > 1 && (
        <div className="flex gap-2 flex-wrap border-b border-gray-200 pb-3">
          {formatoKeys.map(k => (
            <button
              key={k}
              onClick={() => setActive(k)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                active === k
                  ? 'bg-[#0048D7] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {humanize(k)}
            </button>
          ))}
        </div>
      )}

      {/* Conteúdo do formato ativo */}
      {isPlainObject(activeData) && <FormatoView formato={activeData} formatoNome={humanize(active)} />}
    </div>
  );
}

function FormatoView({ formato, formatoNome }: { formato: Record<string, any>; formatoNome: string }) {
  const descricao = formato.descricao || formato.description;
  const instrucoesVariacao = formato.instrucoes_variacao;
  const instrucoesVisuais = formato.instrucoes_visuais || formato.instrucoes_visual;
  const posicionamento = formato.posicionamento_obrigatorio;
  const logica = formato.logica_geral;
  const diretrizes = formato.diretrizes_obrigatorias;
  const legenda = formato.legenda;
  const estruturas = formato.estruturas || formato.structures;

  // Outras chaves não conhecidas — pra não perder dado
  const known = new Set([
    'descricao', 'description', 'instrucoes_variacao', 'instrucoes_visuais', 'instrucoes_visual',
    'posicionamento_obrigatorio', 'logica_geral', 'diretrizes_obrigatorias', 'legenda',
    'estruturas', 'structures',
  ]);
  const outros = Object.entries(formato).filter(([k]) => !known.has(k));

  return (
    <div className="space-y-5">
      {descricao && (
        <div className="bg-white border-l-4 border-[#0048D7] rounded-r-xl p-5 shadow-sm">
          <h3 className="font-bold text-[#00143D] mb-1">{formatoNome}</h3>
          <p className="text-gray-700 leading-relaxed">{descricao}</p>
        </div>
      )}

      {Array.isArray(posicionamento) && posicionamento.length > 0 && (
        <Card title="Posicionamento Obrigatório" icon={<Target className="w-4 h-4" />}>
          <ul className="list-disc pl-5 space-y-1.5">
            {posicionamento.map((p, i) => <li key={i} className="text-gray-700">{p}</li>)}
          </ul>
        </Card>
      )}

      {instrucoesVariacao && (
        <Card title="Instruções de Variação" icon={<Info className="w-4 h-4" />}>
          <p className="text-gray-700 leading-relaxed">{instrucoesVariacao}</p>
        </Card>
      )}

      {Array.isArray(instrucoesVisuais) && instrucoesVisuais.length > 0 && (
        <Card title="Instruções Visuais" icon={<Palette className="w-4 h-4" />}>
          <ul className="list-disc pl-5 space-y-1.5">
            {instrucoesVisuais.map((p, i) => <li key={i} className="text-gray-700">{p}</li>)}
          </ul>
        </Card>
      )}

      {Array.isArray(logica) && logica.length > 0 && (
        <Card title="Lógica Geral" icon={<Info className="w-4 h-4" />}>
          <ul className="list-disc pl-5 space-y-1.5">
            {logica.map((p, i) => <li key={i} className="text-gray-700">{p}</li>)}
          </ul>
        </Card>
      )}

      {Array.isArray(diretrizes) && diretrizes.length > 0 && (
        <Card title="Diretrizes Obrigatórias" icon={<CheckCircle2 className="w-4 h-4" />}>
          <ul className="list-disc pl-5 space-y-1.5">
            {diretrizes.map((p, i) => <li key={i} className="text-gray-700">{p}</li>)}
          </ul>
        </Card>
      )}

      {Array.isArray(legenda) && legenda.length > 0 && (
        <Card title="Legenda Pronta" icon={<FileText className="w-4 h-4" />}>
          <div className="space-y-2 text-gray-700 leading-relaxed">
            {legenda.map((p, i) => <p key={i}>{p}</p>)}
          </div>
        </Card>
      )}

      {Array.isArray(estruturas) && estruturas.map((est, i) => (
        <EstruturaCard key={i} estrutura={est} />
      ))}

      {outros.length > 0 && (
        <Card title="Outros dados" icon={<Info className="w-4 h-4" />}>
          <div className="space-y-3">
            {outros.map(([k, v]) => (
              <div key={k}>
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">{humanize(k)}</p>
                <GenericRender value={v} fieldKey={k} />
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

function EstruturaCard({ estrutura }: { estrutura: Record<string, any> }) {
  if (!isPlainObject(estrutura)) return null;
  const numero = estrutura.numero ?? estrutura.num ?? estrutura.number;
  const titulo = estrutura.titulo || estrutura.title || estrutura.tema || estrutura.nome;
  const subtitulo = estrutura.subtitulo || estrutura.subtitle;
  const objetivo = estrutura.objetivo || estrutura.objective;
  const pontosFortes = estrutura.pontos_fortes;
  const sequencia = estrutura.sequencia || estrutura.sequence;
  const descricao = estrutura.descricao || estrutura.description;
  const textosFixos = estrutura.textos_fixos;
  const variacoes = estrutura.variacoes;

  const known = new Set([
    'numero', 'num', 'number', 'titulo', 'title', 'tema', 'nome',
    'subtitulo', 'subtitle', 'objetivo', 'objective', 'pontos_fortes',
    'sequencia', 'sequence', 'descricao', 'description', 'textos_fixos', 'variacoes',
  ]);
  const outros = Object.entries(estrutura).filter(([k]) => !known.has(k));

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="bg-[#00143D] text-white px-5 py-4">
        <div className="flex items-baseline gap-3 mb-1">
          {numero !== undefined && (
            <span className="bg-[#FC6058] text-white text-sm font-bold px-2.5 py-0.5 rounded">
              Estrutura {numero}
            </span>
          )}
          {titulo && <h3 className="text-lg font-bold">{titulo}</h3>}
        </div>
        {subtitulo && <p className="text-sm text-white/70 font-mono">{subtitulo}</p>}
        {pontosFortes && typeof pontosFortes === 'string' && (
          <p className="text-xs text-white/50 mt-1">Pontos fortes: {pontosFortes}</p>
        )}
      </div>

      <div className="p-5 space-y-4">
        {objetivo && (
          <div className="bg-blue-50 border-l-4 border-[#0048D7] rounded-r-lg p-3">
            <p className="text-xs font-bold uppercase tracking-wider text-[#0048D7] mb-1">Objetivo</p>
            <p className="text-gray-700 leading-relaxed text-sm">{objetivo}</p>
          </div>
        )}

        {descricao && <p className="text-gray-700 leading-relaxed text-sm">{descricao}</p>}

        {textosFixos && (
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Textos Fixos</p>
            <GenericRender value={textosFixos} />
          </div>
        )}

        {Array.isArray(sequencia) && sequencia.length > 0 && (
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Sequência</p>
            {sequencia.map((cena, i) => <CenaCard key={i} cena={cena} />)}
          </div>
        )}

        {Array.isArray(variacoes) && variacoes.length > 0 && (
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Variações</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {variacoes.map((v, i) => <VariacaoCard key={i} variacao={v} />)}
            </div>
          </div>
        )}

        {outros.length > 0 && (
          <div className="space-y-3 pt-3 border-t border-gray-200">
            {outros.map(([k, v]) => (
              <div key={k}>
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">{humanize(k)}</p>
                <GenericRender value={v} fieldKey={k} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CenaCard({ cena }: { cena: any }) {
  if (!isPlainObject(cena)) return <GenericRender value={cena} />;
  const titulo = cena.titulo || cena.title;
  const visual = cena.visual || cena.visual_sequence;
  const copy = cena.copy || cena.copy_direction;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      {titulo && <h4 className="font-bold text-[#00143D] text-sm mb-3">{titulo}</h4>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {visual && (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-purple-600 mb-1.5">🎬 Visual</p>
            <p className="text-gray-700 text-sm leading-relaxed">{visual}</p>
          </div>
        )}
        {copy && (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-pink-600 mb-1.5">✏️ Copy</p>
            <p className="text-gray-700 text-sm leading-relaxed">{copy}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function VariacaoCard({ variacao }: { variacao: any }) {
  if (!isPlainObject(variacao)) return <GenericRender value={variacao} />;
  const num = variacao.num ?? variacao.numero;
  const frase = variacao.frase_destaque || variacao.frase || variacao.titulo;
  const pontos = variacao.pontos_fortes;

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
      {num !== undefined && (
        <span className="bg-[#FC6058] text-white text-[10px] font-bold px-2 py-0.5 rounded mr-2">V{num}</span>
      )}
      {frase && <p className="font-semibold text-[#00143D] text-sm mt-2">{frase}</p>}
      {Array.isArray(pontos) && pontos.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {pontos.map((p: string) => {
            const pf = PONTOS_FORTES[p as PontoForteKey];
            return (
              <span
                key={p}
                className="text-[10px] font-bold text-white px-1.5 py-0.5 rounded"
                style={{ backgroundColor: pf?.color || '#475569' }}
                title={pf?.name}
              >
                {p}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Card({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
      <h4 className="flex items-center gap-2 font-bold text-[#00143D] text-sm mb-3">
        {icon} {title}
      </h4>
      {children}
    </div>
  );
}

// =============================================================================
// Financeiro
// =============================================================================
function FinanceiroSectionView({ content }: { content: Record<string, any> }) {
  const fin = findFirst(content, ['dados_financeiros', 'financeiro']);
  const ticket = findFirst(content, ['ticket_medio', 'ticket', 'valor']);
  const rendaMensal = findFirst(content, ['renda_mensal_estimada', 'renda_mensal']);
  const rendaAnual = findFirst(content, ['renda_anual_estimada', 'renda_anual']);

  const hasAny = fin || ticket || rendaMensal || rendaAnual;
  if (!hasAny) return <EmptySection label="Dados Financeiros" />;

  return (
    <div className="space-y-5">
      {(ticket || rendaMensal || rendaAnual) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {ticket && <StatCard icon="💰" label="Ticket Médio" value={String(ticket)} />}
          {rendaMensal && <StatCard icon="📅" label="Renda Mensal" value={String(rendaMensal)} />}
          {rendaAnual && <StatCard icon="📈" label="Renda Anual" value={String(rendaAnual)} />}
        </div>
      )}
      {fin && (
        <Card title="Outros dados financeiros">
          <GenericRender value={fin} />
        </Card>
      )}
    </div>
  );
}

// =============================================================================
// Don'ts / Do's
// =============================================================================
function ListSection({ content, keys, label, color }: {
  content: Record<string, any>;
  keys: string[];
  label: string;
  color: 'red' | 'green';
}) {
  const data = findFirst(content, keys);
  if (!data) return <EmptySection label={label} />;

  const colorClasses = color === 'red'
    ? 'border-red-300 bg-red-50'
    : 'border-green-300 bg-green-50';
  const headerColor = color === 'red' ? 'text-red-700' : 'text-green-700';

  if (Array.isArray(data)) {
    return (
      <div className="space-y-3">
        {data.map((item, i) => (
          <div key={i} className={`border-l-4 ${colorClasses} rounded-r-xl p-5`}>
            {isPlainObject(item) ? (
              <>
                {item.titulo && <h4 className={`font-bold ${headerColor} mb-2`}>{item.titulo}</h4>}
                {item.tag && <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2 block">{item.tag}</span>}
                {item.descricao && <p className="text-gray-700 text-sm leading-relaxed mb-2">{item.descricao}</p>}
                {Array.isArray(item.itens) && (
                  <ul className="list-disc pl-5 space-y-1 text-gray-700 text-sm">
                    {item.itens.map((it: string, j: number) => <li key={j}>{it}</li>)}
                  </ul>
                )}
                {item.nota && <p className="text-xs text-gray-500 italic mt-2">{item.nota}</p>}
              </>
            ) : (
              <p className="text-gray-700">{String(item)}</p>
            )}
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className={`border-l-4 ${colorClasses} rounded-r-xl p-5`}>
      <GenericRender value={data} />
    </div>
  );
}

// =============================================================================
// Perfil do Hóspede
// =============================================================================
function PerfilSectionView({ content }: { content: Record<string, any> }) {
  const data = findFirst(content, ['perfil_hospede', 'perfil', 'hospede', 'guest_profile']);
  if (!data) return <EmptySection label="Perfil do Hóspede" />;
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
      <GenericRender value={data} />
    </div>
  );
}

// =============================================================================
// Extras (chaves não mapeadas)
// =============================================================================
const KNOWN_TOP_KEYS = new Set([
  'projeto', 'titulo', 'title', 'nome', 'name', 'tipo', 'type',
  'localizacao', 'location', 'endereco', 'address',
  'ticket_medio', 'ticket', 'valor',
  'renda_mensal_estimada', 'renda_mensal', 'renda_anual_estimada', 'renda_anual',
  'monthly_income', 'annual_income',
  'formatos', 'criativos', 'estruturas',
  'dados_financeiros', 'financeiro',
  'pontos_fortes_globais', 'pontos_fortes',
  'donts', "dont's", 'dont_s',
  'dos', "do's", 'do_s',
  'perfil_hospede', 'perfil', 'hospede', 'guest_profile',
  'bem_vindo', 'welcome', 'introducao', 'intro', 'descricao',
]);

function ExtrasSection({ content }: { content: Record<string, any> }) {
  const extras = Object.entries(content).filter(([k]) => !KNOWN_TOP_KEYS.has(k.toLowerCase()));
  if (extras.length === 0) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
      <h3 className="font-bold text-[#00143D]">Outros dados do JSON</h3>
      {extras.map(([k, v]) => (
        <div key={k}>
          <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">{humanize(k)}</p>
          <GenericRender value={v} fieldKey={k} />
        </div>
      ))}
    </div>
  );
}

// =============================================================================
// Main view
// =============================================================================
export function LegacyJsonView({ title, content, sourceUrl, backHref, publicView = false }: LegacyJsonViewProps) {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<SectionKey>('inicio');

  const hasExtras = useMemo(() => {
    return Object.keys(content).some(k => !KNOWN_TOP_KEYS.has(k.toLowerCase()));
  }, [content]);

  const sections = useMemo(() => {
    const list = [...SECTIONS];
    if (hasExtras) list.push({ key: 'extras', label: 'Outros dados', icon: Info });
    return list;
  }, [hasExtras]);

  const renderSection = () => {
    switch (activeSection) {
      case 'inicio': return <InicioSection content={content} title={title} />;
      case 'criativos': return <CriativosSection content={content} />;
      case 'financeiro': return <FinanceiroSectionView content={content} />;
      case 'pontos-fortes': return <PontosFortesSectionView content={content} />;
      case 'donts': return <ListSection content={content} keys={['donts', "dont's", 'dont_s']} label="Don't's" color="red" />;
      case 'dos': return <ListSection content={content} keys={['dos', "do's", 'do_s']} label="Do's" color="green" />;
      case 'perfil': return <PerfilSectionView content={content} />;
      case 'extras': return <ExtrasSection content={content} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <aside className="fixed left-0 top-0 bottom-0 w-72 bg-[#00143D] text-white flex flex-col z-40">
        <div className="p-6 border-b border-white/10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-seazone-white.png"
            alt="Seazone"
            className="h-10 w-auto mb-2"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
          <p className="text-xs text-white/50 tracking-widest uppercase truncate">{title}</p>
          <span className="inline-flex items-center gap-1 mt-2 bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-semibold px-2 py-0.5 rounded uppercase tracking-wider">
            <Archive className="w-2.5 h-2.5" /> Legado
          </span>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {sections.map(({ key, label, icon: Icon }) => {
            const active = activeSection === key;
            return (
              <button
                key={key}
                onClick={() => setActiveSection(key)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-left transition-colors ${
                  active
                    ? 'bg-[#FC6058] text-white'
                    : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1">{label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 text-xs text-white/30 border-t border-white/10">
          Material de Referência Estratégica
        </div>
      </aside>

      <main className="ml-72 min-h-screen">
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-gray-200">
          <div className="flex items-center justify-between px-8 py-4">
            <div className="flex items-center gap-3">
              {!publicView && (
                <button
                  onClick={() => router.push(backHref)}
                  className="text-gray-500 hover:text-[#00143D] transition-colors"
                  title="Voltar"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              )}
              <button
                onClick={() => setActiveSection('inicio')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  activeSection === 'inicio'
                    ? 'bg-[#0048D7] text-white'
                    : 'text-gray-600 hover:text-[#00143D] hover:bg-gray-100'
                }`}
              >
                <Home className="w-4 h-4" /> Início
              </button>
              <span className="text-xs text-gray-400 ml-2">Briefing legado importado do Lovable</span>
            </div>
            {sourceUrl && (
              <a
                href={sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-[#00143D] text-xs flex items-center gap-1"
                title="Abrir versão original (pode estar offline)"
              >
                Original <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </header>

        <div className="p-8 max-w-5xl">
          {renderSection()}
        </div>
      </main>
    </div>
  );
}
