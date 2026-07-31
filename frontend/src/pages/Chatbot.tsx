import { useState } from 'react';
import { Bot, Send, Sparkles, User as UserIcon } from 'lucide-react';
import { AppLayout } from '../components/layout/AppLayout';

const SUGGESTIONS = [
  'Son 30 günün en kârlı platformu hangisi?',
  'AeroClick X1 kampanyasının CTR’ını yorumla',
  'GreenFuel için yeni bir TikTok kampanyası taslağı hazırla',
  'Hangi kampanyalar bütçesini aşma riski taşıyor?',
];

export function Chatbot() {
  const [messages, setMessages] = useState<{ from: 'user' | 'bot'; text: string }[]>([
    {
      from: 'bot',
      text: 'Merhaba! Ben AdPulse Chatbot. Kampanyalarını, tıklama/harcama/kâr verilerini okuyup senin adına yorumlayabilir, hatta yeni bir kampanya taslağı başlatabilirim.',
    },
  ]);
  const [input, setInput] = useState('');

  const send = (text: string) => {
    if (!text.trim()) return;
    setMessages((m) => [
      ...m,
      { from: 'user', text },
      {
        from: 'bot',
        text: 'Bu arayüz, chatbot deneyiminin taslağı. Gerçek yanıtlar için bu ekranın backend/agentic_layer içindeki AI ajanlarına (ör. /api/chatbot endpoint’i) bağlanması gerekiyor.',
      },
    ]);
    setInput('');
  };

  return (
    <AppLayout title="AI Asistan" subtitle="Kampanyalarınız hakkında doğal dilde sorular sorun.">
      {/* Cam Efektli Ana Sohbet Kapsülü */}
      <div className="flex flex-col h-[calc(100vh-140px)] bg-white/70 dark:bg-[#0A101D]/70 backdrop-blur-2xl rounded-[2.5rem] border border-white dark:border-slate-800/50 shadow-[0_20px_60px_rgba(59,130,246,0.05)] dark:shadow-[0_20px_60px_rgba(34,211,238,0.05)] overflow-hidden">
        
        {/* Mesajların Aktığı Alan */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          {messages.map((m, i) => (
            <div key={i} className={`flex gap-4 ${m.from === 'user' ? 'flex-row-reverse' : ''} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
              
              {/* Avatar */}
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 shadow-md ${
                  m.from === 'user' 
                    ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-cyan-400 border border-slate-100 dark:border-slate-700' 
                    : 'bg-gradient-to-br from-blue-600 to-indigo-500 dark:from-cyan-400 dark:to-violet-600 shadow-[0_0_15px_rgba(59,130,246,0.4)] dark:shadow-[0_0_20px_rgba(34,211,238,0.3)]'
                }`}
              >
                {m.from === 'user' ? <UserIcon size={20} /> : <Bot size={24} className="text-white" />}
              </div>
              
              {/* Mesaj Baloncuğu */}
              <div
                className={`max-w-[75%] px-6 py-4 text-sm font-bold leading-relaxed shadow-sm ${
                  m.from === 'user'
                    ? 'bg-blue-600 dark:bg-cyan-500 text-white rounded-[2rem] rounded-tr-sm'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-slate-700/80 rounded-[2rem] rounded-tl-sm'
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}
        </div>

        {/* Hızlı Aksiyon / Tavsiye Butonları */}
        <div className="px-8 pb-4 flex flex-wrap gap-2.5">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-cyan-400 bg-blue-50 dark:bg-cyan-500/10 border border-blue-200 dark:border-cyan-500/20 px-4 py-2.5 rounded-full hover:bg-blue-100 dark:hover:bg-cyan-500/20 hover:scale-105 transition-all shadow-sm"
            >
              <Sparkles size={14} className="animate-pulse" /> {s}
            </button>
          ))}
        </div>

        {/* Mesaj Gönderme Formu */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="p-6 bg-white/80 dark:bg-[#0A101D]/80 backdrop-blur-md border-t border-slate-100 dark:border-slate-800/80 relative"
        >
          <div className="relative flex items-center max-w-5xl mx-auto">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Asistana bir talimat ver..."
              className="w-full bg-slate-100 dark:bg-slate-900 border border-transparent focus:border-blue-500 dark:focus:border-cyan-500 rounded-full pl-8 pr-16 py-5 text-sm font-bold outline-none transition-colors shadow-inner dark:text-white"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="absolute right-2 w-12 h-12 shrink-0 rounded-full bg-blue-600 dark:bg-cyan-500 text-white flex items-center justify-center shadow-lg hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 transition-all"
            >
              <Send size={18} className="ml-1" />
            </button>
          </div>
        </form>

      </div>
    </AppLayout>
  );
}