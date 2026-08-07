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
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 rounded-xl">
          <div className="flex items-center gap-1 pl-1 w-full md:w-auto">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === f.key
                    ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="relative w-full md:max-w-xs shrink-0">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" strokeWidth={2} />
            <input
              placeholder="Kampanya ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg py-2 pl-9 pr-4 text-sm outline-none focus:border-blue-500 dark:focus:border-blue-500 text-slate-900 dark:text-white transition-colors placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Liste */}
        <div className="space-y-2.5">
          {filtered.map((c) => (
            <CampaignCard key={c.id} campaign={c} />
          ))}

          {filtered.length === 0 && (
            <div className="border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-16 text-center">
              <p className="text-slate-500 dark:text-slate-400 text-sm">Eşleşen kampanya bulunamadı.</p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
