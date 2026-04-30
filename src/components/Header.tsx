'use client';

import { History } from 'lucide-react';

interface HeaderProps {
  userEmail?: string;
  activeTab?: 'spots' | 'outros';
  onTabChange?: (tab: 'spots' | 'outros') => void;
  onLogout?: () => void;
}

export function Header({ userEmail, activeTab, onTabChange, onLogout }: HeaderProps) {
  return (
    <header className="bg-navy-900 border-b border-seazone-border sticky top-0 z-50">
      <div className="max-w-[1400px] mx-auto px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <a href="/" className="flex items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo-seazone-white.png"
              alt="Seazone"
              className="h-7 w-auto"
              onError={(e) => {
                const img = e.target as HTMLImageElement;
                img.style.display = 'none';
                img.insertAdjacentHTML('afterend', '<span class="text-2xl font-bold text-white tracking-tight">sea<span class="text-accent">zone</span></span>');
              }}
            />
          </a>
          <nav className="flex items-center gap-1">
            <button
              onClick={() => onTabChange?.('spots')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'spots'
                  ? 'text-white border-b-2 border-accent'
                  : 'text-seazone-muted hover:text-white'
              }`}
            >
              Spots
            </button>
            <button
              onClick={() => onTabChange?.('outros')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'outros'
                  ? 'text-white border-b-2 border-accent'
                  : 'text-seazone-muted hover:text-white'
              }`}
            >
              Outros Briefings
            </button>
            <a
              href="https://briefings-seazone.netlify.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 text-sm font-medium transition-colors text-seazone-muted hover:text-white"
              title="Abrir histórico antigo (até abril/26) em nova aba"
            >
              Histórico até abril 26
            </a>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-seazone-muted">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            Sincronizado
          </div>
          {userEmail && <span className="text-sm text-seazone-muted">{userEmail}</span>}
          <a
            href="/exclusoes"
            className="text-seazone-muted hover:text-white transition-colors p-1.5 rounded-lg"
            title="Log de exclusões"
          >
            <History className="w-4 h-4" />
          </a>
          <button
            onClick={onLogout}
            className="text-seazone-muted hover:text-white transition-colors px-3 py-1.5 border border-seazone-border rounded-lg text-sm"
          >
            Sair
          </button>
        </div>
      </div>
    </header>
  );
}
