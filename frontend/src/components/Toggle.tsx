export function Toggle({ checked, onChange, label, description }: { checked: boolean; onChange: (next: boolean) => void; label: string; description?: string }) {
  return (
    <label className="flex items-center justify-between gap-4 py-3 cursor-pointer">
      <div className="min-w-0">
        <p className="text-sm font-medium text-ink-100">{label}</p>
        {description && <p className="text-xs text-ink-400 mt-0.5">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative shrink-0 w-10 h-6 rounded-full transition-colors ${checked ? 'bg-accent-500' : 'bg-white/10'}`}
      >
        <span
          className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-ink-100 transition-transform ${checked ? 'translate-x-4' : 'translate-x-0'}`}
        />
      </button>
    </label>
  );
}
