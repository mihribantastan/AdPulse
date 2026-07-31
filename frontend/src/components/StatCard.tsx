export function StatCard({ label, value, delta, icon: Icon, positive = true }: any) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="text-frankie-muted">
          <Icon size={22} strokeWidth={1.5} />
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-md ${
          positive 
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
            : 'bg-rose-50 text-rose-700 border border-rose-100'
        }`}>
          {delta}
        </span>
      </div>
      <div>
        <p className="text-sm font-medium text-frankie-muted mb-1.5">{label}</p>
        <p className="text-3xl font-medium text-frankie-text tracking-tight">{value}</p>
      </div>
    </div>
  );
}