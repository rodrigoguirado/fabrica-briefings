'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, FileText, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { parseDocx } from '@/lib/docx-parser';

export default function UploadPage() {
  const router = useRouter();
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'parsing' | 'saving' | 'done' | 'error'>('idle');
  const [error, setError] = useState('');
  const [fileName, setFileName] = useState('');
  const [createdId, setCreatedId] = useState('');

  // Extra fields that user can set
  const [category, setCategory] = useState('SZI / Lancamentos');

  const processFile = useCallback(async (file: File) => {
    if (!file.name.endsWith('.docx')) {
      setError('Por favor, envie um arquivo .docx');
      setStatus('error');
      return;
    }

    setFileName(file.name);
    setUploading(true);
    setError('');

    try {
      // Step 1: Parse DOCX
      setStatus('parsing');
      const buffer = await file.arrayBuffer();
      const parsed = await parseDocx(buffer);

      // Step 2: Upload original DOCX to storage
      const docxPath = `originals/${Date.now()}_${file.name}`;
      const { data: uploadData } = await supabase.storage
        .from('briefing-files')
        .upload(docxPath, file, { upsert: true });

      let docxUrl = null;
      if (uploadData) {
        const { data: urlData } = supabase.storage
          .from('briefing-files')
          .getPublicUrl(docxPath);
        docxUrl = urlData.publicUrl;
      }

      // Step 3: Save to database
      setStatus('saving');
      const { data: user } = await supabase.auth.getUser();

      const { data: briefing, error: dbError } = await supabase
        .from('briefings')
        .insert({
          spot_name: parsed.spotName || file.name.replace('.docx', ''),
          city: parsed.city || null,
          category,
          investment_from: parsed.content.abas?.dados_financeiros?.investment_from || null,
          monthly_income: parsed.content.abas?.dados_financeiros?.monthly_income || null,
          annual_income: parsed.content.abas?.dados_financeiros?.annual_income || null,
          content: parsed.content,
          original_docx_url: docxUrl,
          created_by: user.user?.id || null,
          status: 'rascunho',
        })
        .select()
        .single();

      if (dbError) throw dbError;

      setCreatedId(briefing.id);
      setStatus('done');
    } catch (err: any) {
      setError(err.message || 'Erro ao processar o arquivo');
      setStatus('error');
    } finally {
      setUploading(false);
    }
  }, [category]);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }

  return (
    <div className="min-h-screen bg-seazone-bg">
      {/* Header */}
      <header className="bg-navy-900 border-b border-seazone-border">
        <div className="max-w-3xl mx-auto px-6 py-3 flex items-center gap-3">
          <button onClick={() => router.push('/')} className="text-seazone-muted hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="text-xl font-bold text-white">
            sea<span className="text-accent">zone</span>
          </span>
          <span className="text-seazone-muted text-sm ml-2">— Novo Briefing</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold text-white mb-2">Upload de Briefing</h1>
        <p className="text-seazone-muted mb-8">
          Faça upload do documento .docx gerado no Cowork. O sistema vai ler, parsear e criar a visualização automaticamente.
        </p>

        {/* Category selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-seazone-muted mb-2">Categoria</label>
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="bg-seazone-card border border-seazone-border rounded-lg px-4 py-2.5 text-sm text-seazone-text focus:outline-none focus:ring-2 focus:ring-navy-600 w-full"
          >
            <option value="SZI / Lancamentos">SZI / Lançamentos</option>
            <option value="Marketplace">Marketplace</option>
          </select>
        </div>

        {/* Drop zone */}
        {status === 'idle' || status === 'error' ? (
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-16 text-center transition-all cursor-pointer ${
              dragOver
                ? 'border-accent bg-accent/5'
                : 'border-seazone-border hover:border-seazone-muted bg-seazone-card'
            }`}
            onClick={() => document.getElementById('file-input')?.click()}
          >
            <Upload className={`w-12 h-12 mx-auto mb-4 ${dragOver ? 'text-accent' : 'text-seazone-muted'}`} />
            <p className="text-lg font-medium text-white mb-1">
              {dragOver ? 'Solte o arquivo aqui' : 'Arraste o .docx ou clique para selecionar'}
            </p>
            <p className="text-sm text-seazone-muted">
              Aceita documentos .docx gerados pela skill de briefing do Cowork
            </p>
            <input
              id="file-input"
              type="file"
              accept=".docx"
              onChange={handleFileInput}
              className="hidden"
            />
          </div>
        ) : null}

        {/* Processing status */}
        {(status === 'parsing' || status === 'saving') && (
          <div className="bg-seazone-card border border-seazone-border rounded-2xl p-12 text-center">
            <Loader2 className="w-10 h-10 animate-spin text-accent mx-auto mb-4" />
            <p className="text-white font-medium mb-1">
              {status === 'parsing' ? 'Lendo e parseando o documento...' : 'Salvando no banco de dados...'}
            </p>
            <p className="text-sm text-seazone-muted flex items-center justify-center gap-2">
              <FileText className="w-4 h-4" /> {fileName}
            </p>
          </div>
        )}

        {/* Success */}
        {status === 'done' && (
          <div className="bg-seazone-card border border-green-500/30 rounded-2xl p-12 text-center">
            <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <p className="text-white font-medium text-lg mb-2">Briefing criado com sucesso!</p>
            <p className="text-seazone-muted text-sm mb-6">O documento foi parseado e salvo. Você pode editá-lo agora.</p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => router.push(`/briefing/${createdId}`)}
                className="bg-accent hover:bg-accent/90 text-white font-medium text-sm px-6 py-2.5 rounded-lg transition-colors"
              >
                Abrir briefing
              </button>
              <button
                onClick={() => { setStatus('idle'); setFileName(''); }}
                className="border border-seazone-border text-seazone-muted hover:text-white font-medium text-sm px-6 py-2.5 rounded-lg transition-colors"
              >
                Upload outro
              </button>
            </div>
          </div>
        )}

        {/* Error */}
        {status === 'error' && error && (
          <div className="mt-4 bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400 text-sm">
            {error}
          </div>
        )}
      </main>
    </div>
  );
}
