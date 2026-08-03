export function StatCard({ label, value, delta, icon: Icon, positive = true }: any) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="text-frankie-cardMuted">
          <Icon size={22} strokeWidth={1.5} />
        </div>
        <span className={`text-xs font-medium px-2.5 py-1 rounded-md ${
          positive 
            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
        }`}>
          {delta}
        </span>
      </div>
      <div>
        <p className="text-sm font-medium text-frankie-cardMuted mb-1.5">{label}</p>
        <p className="text-3xl font-normal text-frankie-cardText tracking-tight">{value}</p>
      </div>
    </div>
  );
}