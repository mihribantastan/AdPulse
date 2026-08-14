import { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { AppLayout } from '../components/layout/AppLayout';
import { CampaignCard } from '../components/CampaignCard';
import { campaignsApi } from '../lib/api';
import type { ApprovalStatus, Campaign } from '../lib/types';

const FILTERS: { key: ApprovalStatus | 'all'; label: string }[] = [
  { key: 'all', label: 'Tümü' },
  { key: 'pending', label: 'Onay Bekliyor' },
  { key: 'approved', label: 'Yayında' },
];

export function Campaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [filter, setFilter] = useState<ApprovalStatus | 'all'>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    campaignsApi.list().then(setCampaigns);
  }, []);

  const filtered = useMemo(() => {
    return campaigns.filter((c) => {
      const matchesFilter = filter === 'all' || c.approval_status === filter;
      const matchesSearch = c.target_url_or_product.toLowerCase().includes(search.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [campaigns, filter, search]);

  return (
    <AppLayout title="Kampanyalar" subtitle="Aktif ve geçmiş kampanyalarınız.">
      <div className="space-y-4 pb-12">

        {/* Arama ve Filtreleme */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-white/[0.03] backdrop-blur-xl border border-white/10 p-2 rounded-xl">
          <div className="flex items-center gap-1 pl-1 w-full md:w-auto">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === f.key
                    ? 'bg-accent-500/10 text-accent-400'
                    : 'text-ink-400 hover:text-ink-100'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="relative w-full md:max-w-xs shrink-0">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" strokeWidth={2} />
            <input
              placeholder="Kampanya ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/[0.03] border border-white/10 rounded-lg py-2 pl-9 pr-4 text-sm outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/25 text-ink-100 transition-colors placeholder:text-ink-400"
            />
          </div>
        </div>

        {/* Liste */}
        <div className="space-y-2.5">
          {filtered.map((c) => (
            <CampaignCard key={c.id} campaign={c} />
          ))}

          {filtered.length === 0 && (
            <div className="border border-dashed border-white/15 rounded-2xl p-16 text-center">
              <p className="text-ink-400 text-sm">Eşleşen kampanya bulunamadı.</p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
