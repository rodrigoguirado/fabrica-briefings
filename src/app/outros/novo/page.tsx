'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function NovoOutroBriefingPage() {
  const router = useRouter();
  const [vertical, setVertical] = useState<'szi' | 'marketplace'>('szi');
  const [titulo, setTitulo] = useState('');
  const [spotName, setSpotName] = useState('');
  const [contexto, setContexto] = useState('');
  const [oQuePrecisamos, setOQuePrecisamos] = useState('');
  const [linkReferencia, setLinkReferencia] = useState('');
  const [dataEntrega, setDataEntrega] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) router.push('/login');
    });
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!titulo.trim()) {
      alert('Informe o título da demanda.');
      return;
    }
    setSaving(true);
    const { data, error } = await supabase
      .from('outros_briefings')
      .insert({
        vertical,
        titulo: titulo.trim(),
        spot_name: spotName.trim() || null,
        contexto: contexto.trim() || null,
        o_que_precisamos: oQuePrecisamos.trim() || null,
        link_referencia: linkReferencia.trim() || null,
        data_entrega: dataEntrega || null,
      })
      .select()
      .single();
    setSaving(false);
    if (error) {
      alert('Erro ao criar: ' + error.message);
      return;
    }
    router.push(`/outros/${data.id}`);
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-3">
          <button onClick={() => router.push('/outros')} className="text-gray-500 hover:text-[#00143D]">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold text-[#00143D]">Novo Briefing</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-5">
          <Field label="Vertical *">
            <div className="flex gap-2">
              {([['szi', 'SZI / Investimentos'], ['marketplace', 'Marketplace']] as const).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setVertical(key)}
                  className={`flex-1 px-4 py-3 rounded-lg text-sm font-semibold transition-colors border ${
                    vertical === key
                      ? 'bg-[#0048D7] text-white border-[#0048D7]'
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Título da demanda *">
            <input
              type="text"
              value={titulo}
              onChange={e => setTitulo(e.target.value)}
              required
              placeholder="ex: Campanha de tráfego para o Spot Campeche"
              className="w-full text-sm text-[#00143D] placeholder-gray-400 bg-white border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0048D7]"
            />
          </Field>

          <Field label="Nome do Spot">
            <input
              type="text"
              value={spotName}
              onChange={e => setSpotName(e.target.value)}
              placeholder="ex: Campeche Spot"
              className="w-full text-sm text-[#00143D] placeholder-gray-400 bg-white border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0048D7]"
            />
          </Field>

          <Field label="Contexto da demanda">
            <textarea
              value={contexto}
              onChange={e => setContexto(e.target.value)}
              rows={4}
              placeholder="Por que essa demanda existe, qual o cenário..."
              className="w-full text-sm text-[#00143D] placeholder-gray-400 bg-white border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0048D7] resize-y"
            />
          </Field>

          <Field label="O que precisamos">
            <textarea
              value={oQuePrecisamos}
              onChange={e => setOQuePrecisamos(e.target.value)}
              rows={4}
              placeholder="Entregáveis específicos, formatos, requisitos..."
              className="w-full text-sm text-[#00143D] placeholder-gray-400 bg-white border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0048D7] resize-y"
            />
          </Field>

          <Field label="Link da referência">
            <input
              type="url"
              value={linkReferencia}
              onChange={e => setLinkReferencia(e.target.value)}
              placeholder="https://…"
              className="w-full text-sm text-[#00143D] placeholder-gray-400 bg-white border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0048D7]"
            />
          </Field>

          <Field label="Data de entrega">
            <input
              type="date"
              value={dataEntrega}
              onChange={e => setDataEntrega(e.target.value)}
              className="w-full text-sm text-[#00143D] bg-white border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0048D7]"
            />
          </Field>

          <p className="text-xs text-gray-500 italic">
            Imagens e vídeos de referência podem ser adicionados depois de criar o briefing.
          </p>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => router.push('/outros')}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="bg-[#FC6058] hover:bg-[#ec4f47] text-white px-5 py-2 rounded-lg text-sm font-medium flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? 'Salvando...' : 'Criar briefing'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-bold uppercase tracking-widest text-[#00143D] mb-2">{label}</label>
      {children}
    </div>
  );
}
