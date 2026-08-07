import { useNavigate } from 'react-router-dom';
import { Megaphone, ChevronRight } from 'lucide-react';
import type { Campaign } from '../lib/types';
import { PlatformBadge } from './PlatformBadge';

export function CampaignCard({ campaign }: { campaign: Campaign }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/app/campaigns/${campaign.id}`)}
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex items-center justify-between gap-6 hover:border-slate-300 dark:hover:border-slate-700 transition-colors cursor-pointer group"
    >
      <div className="flex items-center gap-4 min-w-0">
        <div className="w-11 h-11 shrink-0 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
          <Megaphone size={19} strokeWidth={2} />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            {campaign.approval_status === 'pending' && (
              <span className="text-[11px] font-medium px-2 py-0.5 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 rounded-md">
                Onay Bekliyor
              </span>
            )}
            {campaign.approval_status === 'approved' && (
              <span className="text-[11px] font-medium px-2 py-0.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 rounded-md">
                Yayında
              </span>
            )}
            {campaign.approval_status === 'rejected' && (
              <span className="text-[11px] font-medium px-2 py-0.5 bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 rounded-md">
                Reddedildi
              </span>
            )}
            <div className="flex gap-1">
              {campaign.platforms.map((p) => (
                <PlatformBadge key={p} platform={p} size="sm" />
              ))}
            </div>
          </div>

          <h4 className="text-sm font-semibold text-slate-900 dark:text-white truncate">
            {campaign.target_url_or_product}
          </h4>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
            Günlük Bütçe: <span className="text-slate-700 dark:text-slate-300 font-medium">₺{campaign.daily_budget}</span>
          </p>
        </div>
      </div>

      <div className="text-slate-300 dark:text-slate-600 group-hover:text-slate-500 dark:group-hover:text-slate-400 transition-colors shrink-0">
        <ChevronRight size={18} strokeWidth={2} />
      </div>
    </div>
  );
}
