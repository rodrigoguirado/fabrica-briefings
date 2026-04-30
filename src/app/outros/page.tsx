'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Plus, ExternalLink, Trash2 } from 'lucide-react';
import { Header } from '@/components/Header';
import { supabase } from '@/lib/supabase';
import type { OutroBriefing } from '@/types/briefing';
import { formatDate } from '@/lib/utils';

const VERTICAL_LABELS: Record<OutroBriefing['vertical'], string> = {
  szi: 'SZI / Investimentos',
  marketplace: 'Marketplace',
};

export default function OutrosBriefingsPage() {
  const router = useRouter();
  const [briefings, setBriefings] = useState<OutroBriefing[]>([]);
  const [search, setSearch] = useState('');
  const [verticalFilter, setVerticalFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    loadBriefings();
    loadUser();
  }, []);

  async function loadUser() {
    const { data } = await supabase.auth.getUser();
    if (data.user) setUserEmail(data.user.email || '');
    else router.push('/login');
  }

  async function loadBriefings() {
    setLoading(true);
    const { data } = await supabase
      .from('outros_briefings')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setBriefings(data as OutroBriefing[]);
    setLoading(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/login');
  }

  async function handleStatusChange(id: string, newStatus: 'em_revisao' | 'publicado') {
    setBriefings(prev => prev.map(b => b.id === id ? { ...b, status: newStatus } : b));
    const { error } = await supabase.from('outros_briefings').update({ status: newStatus }).eq('id', id);
    if (error) {
      await loadBriefings();
      alert('Falha ao atualizar status: ' + error.message);
    }
  }

  async function handleDelete(id: string, titulo: string) {
    if (!confirm(`Excluir briefing "${titulo}"? Esta ação não pode ser desfeita.`)) return;
    const target = briefings.find(b => b.id === id);
    // Registra a exclusão antes de remover (quem, o quê, quando)
    if (target) {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;
      await supabase.from('deletion_log').insert({
        table_name: 'outros_briefings',
        record_id: id,
        record_title: target.titulo,
        deleted_by_id: user?.id ?? null,
        deleted_by_email: user?.email ?? null,
        snapshot: target,
      });
    }
    setBriefings(prev => prev.filter(b => b.id !== id));
    const { error } = await supabase.from('outros_briefings').delete().eq('id', id);
    if (error) {
      await loadBriefings();
      alert('Falha ao excluir: ' + error.message);
    }
  }

  const filtered = briefings.filter(b => {
    if (search && !`${b.titulo} ${b.spot_name || ''}`.toLowerCase().includes(search.toLowerCase())) return false;
    if (verticalFilter && b.vertical !== verticalFilter) return false;
    if (statusFilter && b.status !== statusFilter) return false;
    return true;
  });

  const total = briefings.length;
  const entregues = briefings.filter(b => b.status === 'publicado').length;
  const emProducao = total - entregues;

  return (
    <div className="min-h-screen">
      <Header
        userEmail={userEmail}
        activeTab="outros"
        onTabChange={(tab) => router.push(tab === 'spots' ? '/' : '/outros')}
        onLogout={handleLogout}
      />
      <main className="max-w-[1400px] mx-auto px-6 py-6">
        <div className="grid grid-cols-3 gap-4 mb-6">
          <StatCard label="Total" value={total} color="text-white" />
          <StatCard label="Entregues" value={entregues} color="text-green-400" />
          <StatCard label="Em produção" value={emProducao} color="text-yellow-400" />
        </div>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-seazone-muted" />
            <input
              type="text" placeholder="Buscar por título ou Spot..." value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-seazone-card border border-seazone-border rounded-lg pl-10 pr-4 py-2.5 text-sm text-seazone-text placeholder:text-seazone-muted focus:outline-none focus:ring-2 focus:ring-navy-600"
            />
          </div>
          <select value={verticalFilter} onChange={e => setVerticalFilter(e.target.value)}
            className="bg-seazone-card border border-seazone-border rounded-lg px-4 py-2.5 text-sm text-seazone-text focus:outline-none focus:ring-2 focus:ring-navy-600">
            <option value="">Todas as verticais</option>
            <option value="szi">SZI / Investimentos</option>
            <option value="marketplace">Marketplace</option>
          </select>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="bg-seazone-card border border-seazone-border rounded-lg px-4 py-2.5 text-sm text-seazone-text focus:outline-none focus:ring-2 focus:ring-navy-600">
            <option value="">Todos os status</option>
            <option value="em_revisao">Em produção</option>
            <option value="publicado">Finalizado</option>
          </select>
          <button onClick={() => router.push('/outros/novo')}
            className="bg-accent hover:bg-accent/90 text-white font-medium text-sm px-5 py-2.5 rounded-lg flex items-center gap-2 transition-colors whitespace-nowrap">
            <Plus className="w-4 h-4" /> Novo Briefing
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20 text-seazone-muted">Carregando...</div>
        ) : (
          <div className="bg-seazone-card border border-seazone-border rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-seazone-border">
                  {['Vertical', 'Título', 'Spot', 'Data de Entrega', 'Criado', 'Link', 'Status', ''].map(h => (
                    <th key={h} className="px-4 py-3 text-sm font-medium text-seazone-muted text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={8} className="px-4 py-12 text-center text-seazone-muted">Nenhum briefing por aqui ainda. Clique em "Novo Briefing" pra criar.</td></tr>
                ) : (
                  filtered.map(b => (
                    <tr key={b.id} className="border-b border-seazone-border/50 hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                          b.vertical === 'marketplace'
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-blue-500/20 text-blue-400'
                        }`}>{VERTICAL_LABELS[b.vertical]}</span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-white">{b.titulo}</td>
                      <td className="px-4 py-3 text-seazone-muted">{b.spot_name || '—'}</td>
                      <td className="px-4 py-3 text-seazone-muted text-sm">{b.data_entrega ? formatDate(b.data_entrega) : '—'}</td>
                      <td className="px-4 py-3 text-seazone-muted text-sm">{formatDate(b.created_at)}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => router.push(`/outros/${b.id}`)} className="text-accent hover:text-accent/80 text-sm font-medium flex items-center gap-1">
                          Abrir <ExternalLink className="w-3 h-3" />
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={b.status}
                          onChange={(e) => handleStatusChange(b.id, e.target.value as 'em_revisao' | 'publicado')}
                          className={`appearance-none cursor-pointer text-xs font-medium pl-2.5 pr-7 py-1 rounded-full border focus:outline-none focus:ring-2 focus:ring-accent ${
                            b.status === 'publicado'
                              ? 'bg-green-500/20 text-green-400 border-green-500/40'
                              : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40'
                          }`}
                        >
                          <option value="em_revisao" className="bg-seazone-card text-seazone-text">Em produção</option>
                          <option value="publicado" className="bg-seazone-card text-seazone-text">Finalizado</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleDelete(b.id, b.titulo)}
                          className="text-seazone-muted hover:text-accent hover:bg-accent/10 p-2 rounded-lg transition-colors"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-seazone-card border border-seazone-border rounded-xl p-5">
      <p className="text-seazone-muted text-sm mb-1">{label}</p>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
    </div>
  );
}
