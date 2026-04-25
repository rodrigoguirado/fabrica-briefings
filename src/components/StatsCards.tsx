interface StatsCardsProps {
  total: number;
  entregues: number;
  emProducao: number;
}

export function StatsCards({ total, entregues, emProducao }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-3 gap-4 mb-6">
      <div className="bg-seazone-card border border-seazone-border rounded-xl p-5">
        <p className="text-seazone-muted text-sm mb-1">Total de Spots</p>
        <p className="text-3xl font-bold text-white">{total}</p>
      </div>
      <div className="bg-seazone-card border border-seazone-border rounded-xl p-5">
        <p className="text-seazone-muted text-sm mb-1">Entregues</p>
        <p className="text-3xl font-bold text-green-400">{entregues}</p>
      </div>
      <div className="bg-seazone-card border border-seazone-border rounded-xl p-5">
        <p className="text-seazone-muted text-sm mb-1">Em produção</p>
        <p className="text-3xl font-bold text-yellow-400">{emProducao}</p>
      </div>
    </div>
  );
}
