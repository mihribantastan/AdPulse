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
        <div className="fixed bottom-24 right-6 z-50 w-[380px] flex flex-col overflow-hidden bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 animate-in slide-in-from-bottom-4 duration-200">

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-blue-600 dark:bg-blue-500 flex items-center justify-center">
                <Bot size={18} className="text-white" />
              </div>
              <div>
                <span className="text-sm font-semibold text-slate-900 dark:text-white block">AdPulse Ajanı</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                  <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Sisteme Bağlı</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => navigate('/app/chatbot')}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Tam ekran aç"
              >
                <Maximize2 size={16} />
              </button>
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Sohbet Mesajları Alanı */}
          <div className="flex-1 h-72 overflow-y-auto px-5 py-4 space-y-3">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`text-sm max-w-[85%] px-4 py-2.5 ${
                  m.from === 'user'
                    ? 'bg-blue-600 dark:bg-blue-500 text-white ml-auto rounded-2xl rounded-br-sm font-medium'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-2xl rounded-tl-sm'
                }`}
              >
                {m.text}
              </div>
            ))}
          </div>

          {/* Hızlı Yanıtlar */}
          <div className="px-4 pb-3 flex flex-wrap gap-1.5">
            {QUICK_REPLIES.map((q) => (
              <button
                key={q}
                onClick={() => send(q)}
                className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-3 py-1.5 rounded-full hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors"
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
            className="p-4 border-t border-slate-100 dark:border-slate-800"
          >
            <div className="relative flex items-center">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ajan'a bir talimat ver..."
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full pl-4 pr-12 py-2.5 text-sm outline-none focus:border-blue-500 dark:focus:border-blue-500 transition-colors"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="absolute right-1.5 w-8 h-8 rounded-full bg-blue-600 dark:bg-blue-500 text-white flex items-center justify-center disabled:opacity-40 hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
              >
                <Send size={14} />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Ana Tetikleyici Buton */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-8 right-8 z-50 w-14 h-14 rounded-full bg-blue-600 dark:bg-blue-500 shadow-lg flex items-center justify-center hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
        title="AI Asistanı Aç"
      >
        <Bot size={24} className="text-white" />
        {!open && (
          <span className="absolute top-0 right-0 w-3 h-3 bg-rose-500 border-2 border-white dark:border-slate-950 rounded-full"></span>
        )}
      </button>
    </>
  );
}
