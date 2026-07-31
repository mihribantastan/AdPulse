import { useNavigate } from 'react-router-dom';
import { Megaphone, ChevronRight } from 'lucide-react';
import type { Campaign } from '../lib/types';
import { PlatformBadge } from './PlatformBadge';

export function CampaignCard({ campaign }: { campaign: Campaign }) {
  const navigate = useNavigate();

  return (
    <div 
      onClick={() => navigate(`/app/campaigns/${campaign.id}`)}
      className="bg-frankie-card border border-frankie-border p-5 rounded-[1.5rem] flex items-center justify-between hover:bg-frankie-hover transition-colors cursor-pointer group"
    >
      <div className="flex items-center gap-5">
        <div className="w-12 h-12 rounded-xl bg-frankie-hover border border-frankie-border flex items-center justify-center text-frankie-text">
          <Megaphone size={20} strokeWidth={1.5} />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-2">
            {campaign.approval_status === 'pending' && (
              <span className="text-[10px] font-medium px-2 py-1 bg-[#1A1A0A] text-[#FBBF24] border border-[#303014] rounded-md uppercase tracking-widest">
                Onay Bekliyor
              </span>
            )}
            {campaign.approval_status === 'approved' && (
              <span className="text-[10px] font-medium px-2 py-1 bg-[#0A1A10] text-[#4ADE80] border border-[#14301A] rounded-md uppercase tracking-widest">
                Yayında
              </span>
            )}
            <div className="flex gap-1">
              {campaign.platforms.map((p) => (
                <div key={p} className="text-frankie-muted text-xs">
                  <PlatformBadge platform={p} size="sm" />
                </div>
              ))}
            </div>
          </div>
          
          <h4 className="text-lg font-medium text-frankie-text">
            {campaign.target_url_or_product}
          </h4>
          <p className="text-frankie-muted text-sm font-light mt-0.5">
            Günlük Bütçe: <span className="text-frankie-text font-medium">{campaign.daily_budget}₺</span>
          </p>
        </div>
      </div>

      <div className="text-frankie-muted group-hover:text-frankie-text transition-colors">
        <ChevronRight size={20} strokeWidth={1.5} />
      </div>
    </div>
  );
}