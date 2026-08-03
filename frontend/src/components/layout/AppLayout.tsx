import type { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { ChatbotWidget } from '../ChatbotWidget';

export function AppLayout({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode; }) {
  return (
    <div className="flex h-screen bg-frankie-bg text-frankie-text overflow-hidden selection:bg-frankie-card selection:text-white">
      <Sidebar />
      
      <div className="flex-1 flex flex-col min-w-0 z-10 mr-6 my-6">
        <Topbar title={title} subtitle={subtitle} />
        
        <main className="flex-1 overflow-auto pt-4 pb-12 relative z-10">
          <div className="max-w-6xl mx-auto h-full px-2">
            {children}
          </div>
        </main>
      </div>
      
      <ChatbotWidget />
    </div>
  );
}