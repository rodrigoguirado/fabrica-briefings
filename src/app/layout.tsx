import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Briefing Spot — Seazone',
  description: 'Sistema de briefings de criativos para Spots Seazone',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="bg-seazone-bg text-seazone-text min-h-screen">
        {children}
      </body>
    </html>
  );
}
