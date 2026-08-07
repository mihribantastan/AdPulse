import { useState } from 'react';
import { Bot, Send, User as UserIcon } from 'lucide-react';
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
      <div className="flex flex-col h-[calc(100vh-160px)] bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">

        {/* Mesajların Aktığı Alan */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {messages.map((m, i) => (
            <div key={i} className={`flex gap-3 ${m.from === 'user' ? 'flex-row-reverse' : ''}`}>

              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                  m.from === 'user'
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    : 'bg-blue-600 dark:bg-blue-500'
                }`}
              >
                {m.from === 'user' ? <UserIcon size={16} /> : <Bot size={17} className="text-white" />}
              </div>

              <div
                className={`max-w-[75%] px-4 py-3 text-sm leading-relaxed ${
                  m.from === 'user'
                    ? 'bg-blue-600 dark:bg-blue-500 text-white rounded-2xl rounded-tr-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-2xl rounded-tl-sm'
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}
        </div>

        {/* Hızlı Aksiyon / Tavsiye Butonları */}
        <div className="px-6 pb-3 flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-3 py-2 rounded-full hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors"
            >
              {s}
            </button>
          ))}
        </div>

        {/* Mesaj Gönderme Formu */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="p-5 border-t border-slate-100 dark:border-slate-800"
        >
          <div className="relative flex items-center max-w-4xl mx-auto">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Asistana bir talimat ver..."
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full pl-5 pr-14 py-3.5 text-sm outline-none focus:border-blue-500 dark:focus:border-blue-500 transition-colors text-slate-900 dark:text-white"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="absolute right-1.5 w-9 h-9 shrink-0 rounded-full bg-blue-600 dark:bg-blue-500 text-white flex items-center justify-center disabled:opacity-40 hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
            >
              <Send size={15} />
            </button>
          </div>
        </form>

      </div>
    </AppLayout>
  );
}
