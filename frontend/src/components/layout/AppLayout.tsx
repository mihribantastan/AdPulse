import type { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { ChatbotWidget } from '../ChatbotWidget';

export function AppLayout({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode; }) {
  return (
    <div className="flex h-screen bg-frankie-bg text-frankie-text overflow-hidden selection:bg-frankie-accent selection:text-white relative">
      
      {/* Arka planda çok hafif, modern bir ızgara deseni */}
      <div className="absolute inset-0 bg-[radial-gradient(#E5E7EB_1px,transparent_1px)] bg-[size:24px_24px] opacity-70 pointer-events-none -z-10"></div>
      
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