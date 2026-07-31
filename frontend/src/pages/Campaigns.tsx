import { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { AppLayout } from '../components/layout/AppLayout';
import { CampaignCard } from '../components/CampaignCard';
import { campaignsApi } from '../lib/api';
import type { ApprovalStatus, Campaign } from '../lib/types';

const FILTERS: { key: ApprovalStatus | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'approved', label: 'Active' },
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
      <div className="space-y-6 pb-12">
        
        {/* Arama ve Filtreleme */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-frankie-card border border-frankie-border p-2 rounded-[1.5rem]">
          <div className="flex items-center gap-1 pl-2 w-full md:w-auto">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-4 py-2 rounded-xl text-xs font-medium transition-colors ${
                  filter === f.key
                    ? 'bg-frankie-hover text-frankie-text border border-frankie-border'
                    : 'text-frankie-muted hover:text-frankie-text border border-transparent'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="relative w-full md:max-w-xs shrink-0">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-frankie-muted" strokeWidth={1.5} />
            <input
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-frankie-hover border border-frankie-border rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[#444444] text-frankie-text transition-colors placeholder:text-frankie-muted"
            />
          </div>
        </div>

        {/* Liste */}
        <div className="space-y-3">
          {filtered.map((c) => (
            <CampaignCard key={c.id} campaign={c} />
          ))}
          
          {filtered.length === 0 && (
            <div className="border border-frankie-border border-dashed rounded-[2rem] p-16 text-center">
              <p className="text-frankie-muted font-light">Eşleşen kampanya bulunamadı.</p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}