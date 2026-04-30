'use client';

import { useState, useEffect, Fragment } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ChevronDown, ChevronRight } from 'lucide-react';
import { Header } from '@/components/Header';
import { supabase } from '@/lib/supabase';

interface DeletionLogEntry {
  id: string;
  table_name: 'briefings' | 'outros_briefings' | string;
  record_id: string;
  record_title: string | null;
  deleted_by_id: string | null;
  deleted_by_email: string | null;
  deleted_at: string;
  snapshot: Record<string, unknown> | null;
}

const TABLE_LABEL: Record<string, string> = {
  briefings: 'Spot',
  outros_briefings: 'Outro Briefing',
};

function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

export default function ExclusoesPage() {
  const router = useRouter();
  const [entries, setEntries] = useState<DeletionLogEntry[]>([]);
  const [search, setSearch] = useState('');
  const [tableFilter, setTableFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadEntries();
    loadUser();
  }, []);

  async function loadUser() {
    const { data } = await supabase.auth.getUser();
    if (data.user) setUserEmail(data.user.email || '');
    else router.push('/login');
  }

  async function loadEntries() {
    setLoading(true);
    const { data, error } = await supabase
      .from('deletion_log')
      .select('*')
      .order('deleted_at', { ascending: false });
    if (error) {
      alert('Falha ao carregar log de exclusões: ' + error.message);
    }
    if (data) setEntries(data as DeletionLogEntry[]);
    setLoading(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/login');
  }

  function toggleExpand(id: string) {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const filtered = entries.filter(e => {
    if (tableFilter && e.table_name !== tableFilter) return false;
    if (search) {
      const hay = `${e.record_title ?? ''} ${e.deleted_by_email ?? ''}`.toLowerCase();
      if (!hay.includes(search.toLowerCase())) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen">
      <Header
        userEmail={userEmail}
        onTabChange={(tab) => router.push(tab === 'spots' ? '/' : '/outros')}
        onLogout={handleLogout}
      />
      <main className="max-w-[1400px] mx-auto px-6 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-1">Log de exclusões</h1>
          <p className="text-sm text-seazone-muted">Quem apagou, o que apagou e quando — registrado a partir de abril/26.</p>
        </div>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-seazone-muted" />
            <input
              type="text" placeholder="Buscar por título ou e-mail..." value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-seazone-card border border-seazone-border rounded-lg pl-10 pr-4 py-2.5 text-sm text-seazone-text placeholder:text-seazone-muted focus:outline-none focus:ring-2 focus:ring-navy-600"
            />
          </div>
          <select value={tableFilter} onChange={e => setTableFilter(e.target.value)}
            className="bg-seazone-card border border-seazone-border rounded-lg px-4 py-2.5 text-sm text-seazone-text focus:outline-none focus:ring-2 focus:ring-navy-600">
            <option value="">Todos os tipos</option>
            <option value="briefings">Spot</option>
            <option value="outros_briefings">Outro Briefing</option>
          </select>
        </div>

        {loading ? (
          <div className="text-center py-20 text-seazone-muted">Carregando...</div>
        ) : (
          <div className="bg-seazone-card border border-seazone-border rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-seazone-border">
                  {['', 'Data/Hora', 'Usuário', 'Tipo', 'Título do briefing'].map(h => (
                    <th key={h} className="px-4 py-3 text-sm font-medium text-seazone-muted text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-12 text-center text-seazone-muted">Nenhuma exclusão registrada.</td></tr>
                ) : (
                  filtered.map(e => {
                    const isOpen = expanded.has(e.id);
                    return (
                      <Fragment key={e.id}>
                        <tr
                          className="border-b border-seazone-border/50 hover:bg-white/[0.02] transition-colors cursor-pointer"
                          onClick={() => toggleExpand(e.id)}
                        >
                          <td className="px-4 py-3 w-8 text-seazone-muted">
                            {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                          </td>
                          <td className="px-4 py-3 text-seazone-text text-sm tabular-nums">{formatDateTime(e.deleted_at)}</td>
                          <td className="px-4 py-3 text-seazone-text text-sm">{e.deleted_by_email || <span className="text-seazone-muted">desconhecido</span>}</td>
                          <td className="px-4 py-3">
                            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                              e.table_name === 'outros_briefings'
                                ? 'bg-purple-500/20 text-purple-400'
                                : 'bg-blue-500/20 text-blue-400'
                            }`}>{TABLE_LABEL[e.table_name] ?? e.table_name}</span>
                          </td>
                          <td className="px-4 py-3 font-semibold text-white">{e.record_title || <span className="text-seazone-muted font-normal">(sem título)</span>}</td>
                        </tr>
                        {isOpen && (
                          <tr className="border-b border-seazone-border/50 bg-black/20">
                            <td></td>
                            <td colSpan={4} className="px-4 py-4">
                              <div className="text-xs text-seazone-muted mb-2">
                                ID original: <span className="font-mono text-seazone-text">{e.record_id}</span>
                              </div>
                              <pre className="text-xs text-seazone-text bg-black/40 border border-seazone-border rounded-lg p-3 overflow-x-auto max-h-96">
{JSON.stringify(e.snapshot, null, 2)}
                              </pre>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
