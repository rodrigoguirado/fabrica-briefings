'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Plus } from 'lucide-react';
import { Header } from '@/components/Header';
import { StatsCards } from '@/components/StatsCards';
import { BriefingTable } from '@/components/BriefingTable';
import { supabase } from '@/lib/supabase';
import type { Briefing } from '@/types/briefing';

export default function DashboardPage() {
  const router = useRouter();
  const [briefings, setBriefings] = useState<Briefing[]>([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
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
      .from('briefings')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setBriefings(data as Briefing[]);
    setLoading(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/login');
  }

  async function handleStatusChange(id: string, newStatus: 'em_revisao' | 'publicado') {
    // Optimistic update
    setBriefings(prev => prev.map(b => b.id === id ? { ...b, status: newStatus } : b));
    const { error } = await supabase.from('briefings').update({ status: newStatus }).eq('id', id);
    if (error) {
      // Revert on failure
      await loadBriefings();
      alert('Falha ao atualizar status: ' + error.message);
    }
  }

  async function handleDelete(id: string) {
    const target = briefings.find(b => b.id === id);
    // Registra a exclusão antes de remover (quem, o quê, quando)
    if (target) {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;
      await supabase.from('deletion_log').insert({
        table_name: 'briefings',
        record_id: id,
        record_title: target.spot_name,
        deleted_by_id: user?.id ?? null,
        deleted_by_email: user?.email ?? null,
        snapshot: target,
      });
    }
    // Optimistic remove
    setBriefings(prev => prev.filter(b => b.id !== id));
    const { error } = await supabase.from('briefings').delete().eq('id', id);
    if (error) {
      await loadBriefings();
      alert('Falha ao excluir: ' + error.message);
    }
  }

  // Map any raw status to the 2 UI statuses
  const toUiStatus = (raw: string) => (raw === 'publicado' || raw === 'aprovado' ? 'publicado' : 'em_revisao');

  const filtered = briefings.filter(b => {
    if (search && !b.spot_name.toLowerCase().includes(search.toLowerCase())) return false;
    if (categoryFilter && b.category !== categoryFilter) return false;
    if (statusFilter && toUiStatus(b.status) !== statusFilter) return false;
    return true;
  });

  const entregues = briefings.filter(b => toUiStatus(b.status) === 'publicado').length;
  const emProducao = briefings.filter(b => toUiStatus(b.status) === 'em_revisao').length;

  return (
    <div className="min-h-screen">
      <Header
        userEmail={userEmail}
        activeTab="spots"
        onTabChange={(tab) => router.push(tab === 'spots' ? '/' : '/outros')}
        onLogout={handleLogout}
      />
      <main className="max-w-[1400px] mx-auto px-6 py-6">
        <StatsCards total={briefings.length} entregues={entregues} emProducao={emProducao} />

        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-seazone-muted" />
            <input
              type="text" placeholder="Buscar spot por nome..." value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-seazone-card border border-seazone-border rounded-lg pl-10 pr-4 py-2.5 text-sm text-seazone-text placeholder:text-seazone-muted focus:outline-none focus:ring-2 focus:ring-navy-600"
            />
          </div>
          <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
            className="bg-seazone-card border border-seazone-border rounded-lg px-4 py-2.5 text-sm text-seazone-text focus:outline-none focus:ring-2 focus:ring-navy-600">
            <option value="">Todas as categorias</option>
            <option value="SZI / Lancamentos">SZI / Lançamentos</option>
            <option value="Marketplace">Marketplace</option>
          </select>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="bg-seazone-card border border-seazone-border rounded-lg px-4 py-2.5 text-sm text-seazone-text focus:outline-none focus:ring-2 focus:ring-navy-600">
            <option value="">Todos os status</option>
            <option value="em_revisao">Em produção</option>
            <option value="publicado">Finalizado</option>
          </select>
          <button onClick={() => router.push('/upload')}
            className="bg-accent hover:bg-accent/90 text-white font-medium text-sm px-5 py-2.5 rounded-lg flex items-center gap-2 transition-colors whitespace-nowrap">
            <Plus className="w-4 h-4" /> Novo Spot
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20 text-seazone-muted">Carregando...</div>
        ) : (
          <BriefingTable
            briefings={filtered}
            onOpenBriefing={id => router.push(`/briefing/${id}`)}
            onStatusChange={handleStatusChange}
            onDelete={handleDelete}
          />
        )}
      </main>
    </div>
  );
}
