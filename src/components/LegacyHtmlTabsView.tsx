'use client';

import { useMemo, useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, ExternalLink, Archive, Home, Palette, FileText, Target,
  Ban, CheckCircle2, Users, FolderOpen,
} from 'lucide-react';

type TabValue = string | { __subtabs: Record<string, string> };

interface LegacyHtmlTabsViewProps {
  title: string;
  htmlTabs: Record<string, TabValue | null>;
  headCss?: string;
  sourceUrl?: string | null;
  backHref: string;
  publicView?: boolean;
}

function hasSubtabs(v: TabValue | null | undefined): v is { __subtabs: Record<string, string> } {
  return !!v && typeof v === 'object' && '__subtabs' in v;
}

function pickIcon(label: string) {
  const k = label.toLowerCase();
  if (k.includes('iníc') || k.includes('inic') || k.includes('home')) return Home;
  if (k.includes('criativ') || k.includes('formato') || k.includes('estrutura')) return Palette;
  if (k.includes('financ') || k.includes('valor') || k.includes('renda')) return FileText;
  if (k.includes('ponto') || k.includes('forte') || k.includes('posiciona')) return Target;
  if (k.includes("don't") || k.includes('dont')) return Ban;
  if (k.includes("do's") || k.includes('dos')) return CheckCircle2;
  if (k.includes('hóspede') || k.includes('hospede') || k.includes('perfil')) return Users;
  return FolderOpen;
}

export function LegacyHtmlTabsView({
  title,
  htmlTabs,
  headCss,
  sourceUrl,
  backHref,
  publicView = false,
}: LegacyHtmlTabsViewProps) {
  const router = useRouter();

  const validTabs = useMemo(
    () => Object.entries(htmlTabs).filter(([, v]) => {
      if (!v) return false;
      if (typeof v === 'string') return v.length > 0;
      if (hasSubtabs(v)) return Object.keys(v.__subtabs).length > 0;
      return false;
    }) as [string, TabValue][],
    [htmlTabs]
  );

  const [active, setActive] = useState(validTabs[0]?.[0] || '');
  const activeValue = htmlTabs[active];
  const subtabs = hasSubtabs(activeValue) ? activeValue.__subtabs : null;
  const subtabKeys = subtabs ? Object.keys(subtabs) : [];
  const [activeSub, setActiveSub] = useState<string>('');

  // Reseta sub-aba ativa quando troca aba principal
  useEffect(() => {
    setActiveSub(subtabKeys[0] || '');
  }, [active, subtabs]);

  const activeHtml = useMemo(() => {
    let html = '';
    if (typeof activeValue === 'string') html = activeValue;
    else if (subtabs && activeSub) html = subtabs[activeSub] || '';
    // O HTML capturado tem class="ml-72" porque o Lovable original tem sidebar fixa.
    // No nosso iframe, ocupa tudo, então removemos essa margem.
    const cleaned = html
      .replace(/class="ml-72\s+/g, 'class="')
      .replace(/class="ml-72"/g, 'class=""');
    return `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<base target="_blank">
<style>
  html, body { margin: 0; padding: 0; background: hsl(var(--background, 0 0% 100%)); }
  /* Esconde header sticky do Lovable original (vamos usar nosso) */
  main > header.sticky { display: none !important; }
  main { margin-left: 0 !important; }
  /* Esconde a barra de sub-tabs do Lovable (vamos usar a nossa) */
  [role="tablist"] { display: none !important; }
</style>
${headCss ? `<style>${headCss}</style>` : ''}
</head>
<body>
${cleaned}
</body>
</html>`;
  }, [activeValue, subtabs, activeSub, headCss]);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeHeight, setIframeHeight] = useState(800);

  // Auto-resize do iframe pra altura do conteúdo (escuta resize)
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const onLoad = () => {
      try {
        const doc = iframe.contentDocument;
        if (doc) {
          const h = Math.max(doc.body.scrollHeight, doc.documentElement.scrollHeight);
          setIframeHeight(h + 40);
        }
      } catch {
        // cross-origin (não acontece com srcdoc)
      }
    };
    iframe.addEventListener('load', onLoad);
    return () => iframe.removeEventListener('load', onLoad);
  }, [activeHtml]);

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
          {validTabs.map(([label]) => {
            const Icon = pickIcon(label);
            const isActive = active === label;
            return (
              <button
                key={label}
                onClick={() => setActive(label)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-left transition-colors ${
                  isActive
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
              <span className="text-sm text-gray-500">Briefing legado importado do Lovable</span>
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

        {subtabs && subtabKeys.length > 0 && (
          <div className="bg-gray-100 border-b border-gray-200 px-8 py-3 flex gap-2 flex-wrap sticky top-[57px] z-20">
            {subtabKeys.map(key => (
              <button
                key={key}
                onClick={() => setActiveSub(key)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  activeSub === key
                    ? 'bg-[#0048D7] text-white shadow-sm'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                {key}
              </button>
            ))}
          </div>
        )}

        <iframe
          ref={iframeRef}
          srcDoc={activeHtml}
          title={`${title} — ${active}${activeSub ? ' — ' + activeSub : ''}`}
          className="w-full bg-white border-0 block"
          style={{ height: `${iframeHeight}px` }}
          sandbox="allow-same-origin"
        />
      </main>
    </div>
  );
}
