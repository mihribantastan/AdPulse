import type { ReactNode } from 'react';
import { TopNav } from './TopNav';
import { Topbar } from './Topbar';

export function AppLayout({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode; }) {
  return (
    <div className="min-h-screen bg-ink-950 text-ink-100 relative">
      <div
        className="pointer-events-none fixed -top-40 -left-32 w-[42rem] h-[42rem] rounded-full opacity-20 blur-[120px] z-0"
        style={{ background: 'radial-gradient(circle, #33C2E8 0%, transparent 70%)' }}
      />
      <div className="relative z-10 flex flex-col min-h-screen max-w-7xl mx-auto px-6 py-5">
        <TopNav />
        <Topbar title={title} subtitle={subtitle} />

        <main className="flex-1 pb-12">
          {children}
        </main>
      </div>
    </div>
  );
}
