import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Bot, X, Maximize2, Send } from 'lucide-react';

const QUICK_REPLIES = [
  'Bu haftaki performansımı yorumla',
  'GreenFuel kampanyası için TikTok metni öner',
  'Hangi platforma bütçe kaydırmalıyım?',
];

export function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<{ from: 'user' | 'bot'; text: string }[]>([
    {
      from: 'bot',
      text: 'Merhaba! Kampanyalarını senin adına özetleyebilir, yorumlayabilir ya da yeni bir kampanya taslağı hazırlayabilirim. Ne sormak istersin?',
    },
  ]);
  const [input, setInput] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  // Chatbot'un kendi tam sayfasındayken küçük paneli tekrar gösterme
  if (location.pathname === '/app/chatbot') return null;

  const send = (text: string) => {
    if (!text.trim()) return;
    setMessages((m) => [
      ...m,
      { from: 'user', text },
      {
        from: 'bot',
        text: 'Bu, arayüz taslağındaki örnek bir yanıt. Gerçek yorumlar için chatbot, agentic_layer katmanındaki AI ajanlarına bağlanacak şekilde tamamlanmalı.',
      },
    ]);
    setInput('');
  };

  return (
    <>
      {open && (
        <div className="fixed bottom-32 right-8 z-50 w-[400px] flex flex-col overflow-hidden bg-white/95 dark:bg-[#0A101D]/95 backdrop-blur-3xl rounded-[2.5rem] shadow-[0_30px_60px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_50px_rgba(34,211,238,0.1)] border border-white dark:border-slate-700/80 animate-in slide-in-from-bottom-8 duration-300">
          
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-indigo-500 dark:from-cyan-400 dark:to-violet-600 flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.4)] dark:shadow-[0_0_20px_rgba(34,211,238,0.3)]">
                <Bot size={24} className="text-white" />
              </div>
              <div>
                <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white block">AdPulse Ajanı</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Sisteme Bağlı</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/app/chatbot')}
                className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:text-blue-600 dark:hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Tam ekran aç"
              >
                <Maximize2 size={18} />
              </button>
              <button 
                onClick={() => setOpen(false)} 
                className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Sohbet Mesajları Alanı */}
          <div className="flex-1 h-80 overflow-y-auto px-6 py-5 space-y-4">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`text-sm font-bold max-w-[85%] px-5 py-4 shadow-sm ${
                  m.from === 'user'
                    ? 'bg-blue-600 dark:bg-cyan-500 text-white ml-auto rounded-[1.5rem] rounded-br-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-[1.5rem] rounded-tl-sm'
                }`}
              >
                {m.text}
              </div>
            ))}
          </div>

          {/* Hızlı Yanıtlar (Quick Replies) */}
          <div className="px-5 pb-3 pt-2 flex flex-wrap gap-2">
            {QUICK_REPLIES.map((q) => (
              <button
                key={q}
                onClick={() => send(q)}
                className="text-xs font-bold text-blue-600 dark:text-cyan-400 bg-blue-50 dark:bg-cyan-500/10 border border-blue-200 dark:border-cyan-500/20 px-4 py-2 rounded-full hover:bg-blue-100 dark:hover:bg-cyan-500/20 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Mesaj Yazma Alanı */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="p-5 bg-white/80 dark:bg-[#0A101D]/80 border-t border-slate-100 dark:border-slate-800 backdrop-blur-md"
          >
            <div className="relative flex items-center">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ajan'a bir talimat ver..."
                className="w-full bg-slate-100 dark:bg-slate-900 border border-transparent rounded-full pl-6 pr-14 py-4 text-sm font-bold outline-none focus:border-blue-500 dark:focus:border-cyan-500 transition-colors shadow-inner dark:text-white"
              />
              <button 
                type="submit" 
                disabled={!input.trim()}
                className="absolute right-2 w-11 h-11 rounded-full bg-blue-600 dark:bg-cyan-500 text-white flex items-center justify-center hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 transition-all shadow-md"
              >
                <Send size={18} />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Ana Tetikleyici Buton (Floating Action Button) */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-10 right-10 z-50 w-20 h-20 rounded-full bg-gradient-to-br from-blue-600 to-indigo-500 dark:from-cyan-500 dark:to-violet-600 shadow-[0_15px_40px_rgba(59,130,246,0.5)] dark:shadow-[0_15px_40px_rgba(34,211,238,0.4)] flex items-center justify-center hover:scale-110 hover:-translate-y-2 transition-all border-4 border-white/20 group"
        title="AI Asistanı Aç"
      >
        <Bot size={36} className="text-white group-hover:rotate-12 transition-transform duration-300" />
        {!open && (
          <span className="absolute top-0 right-0 w-5 h-5 bg-rose-500 border-4 border-white dark:border-[#0A101D] rounded-full animate-pulse shadow-lg"></span>
        )}
      </button>
    </>
  );
}