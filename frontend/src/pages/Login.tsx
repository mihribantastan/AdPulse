import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Bot, Mail, Lock, Sparkles } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Giriş yapılıyor...", { email, password });
    
    // Giriş yapıldıktan sonra İstatistikler sayfasına yönlendir
    navigate('/app/statistics');
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-50 dark:bg-[#070B14] transition-colors duration-500 font-sans text-slate-900 dark:text-slate-100 p-6">
      
      {/* Arka Plan Teknolojik Işıklar */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-300/40 dark:bg-cyan-600/15 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-screen pointer-events-none transition-colors duration-500 -z-10"></div>
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-indigo-200/50 dark:bg-violet-600/15 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen pointer-events-none transition-colors duration-500 -z-10"></div>

      {/* Ana Login Kapsülü */}
      <div className="w-full max-w-md bg-white/70 dark:bg-[#0A101D]/70 backdrop-blur-2xl p-10 rounded-[3rem] border border-white/50 dark:border-slate-800/50 shadow-[0_20px_60px_rgba(59,130,246,0.15)] dark:shadow-[0_20px_60px_rgba(34,211,238,0.1)] relative z-10 animate-in zoom-in-95 duration-500">
        
        {/* Logo ve Başlık */}
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-500 dark:from-cyan-400 dark:to-violet-600 rounded-full flex items-center justify-center text-white font-bold shadow-[0_0_20px_rgba(59,130,246,0.4)] dark:shadow-[0_0_25px_rgba(34,211,238,0.3)] mb-6">
            <Bot size={40} />
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-slate-800/80 text-blue-600 dark:text-cyan-400 font-bold text-xs mb-4 border border-blue-100 dark:border-slate-700">
            <Sparkles size={14} className="animate-pulse" /> AI Asistanına Bağlan
          </div>
          <h2 className="text-3xl font-black tracking-tight dark:text-white">AdPulse'a Giriş Yap</h2>
        </div>

        {/* Giriş Formu */}
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-4">
            <div className="relative flex items-center">
              <Mail className="absolute left-5 text-slate-400 dark:text-slate-500" size={20} />
              <input 
                type="email" 
                required
                placeholder="E-posta adresiniz" 
                className="w-full bg-white dark:bg-[#131B2C] border border-slate-200 dark:border-slate-700/80 rounded-full py-4 pl-14 pr-6 text-sm font-bold outline-none focus:border-blue-500 dark:focus:border-cyan-500 transition-colors shadow-inner dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div className="relative flex items-center">
              <Lock className="absolute left-5 text-slate-400 dark:text-slate-500" size={20} />
              <input 
                type="password" 
                required
                placeholder="Şifreniz" 
                className="w-full bg-white dark:bg-[#131B2C] border border-slate-200 dark:border-slate-700/80 rounded-full py-4 pl-14 pr-6 text-sm font-bold outline-none focus:border-blue-500 dark:focus:border-cyan-500 transition-colors shadow-inner dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full flex items-center justify-center gap-3 bg-blue-600 dark:bg-cyan-500 text-white py-4 rounded-full font-bold transition-all hover:scale-[1.02] hover:shadow-lg shadow-blue-600/30 dark:shadow-cyan-500/30 group"
          >
            Sisteme Giriş Yap
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

      </div>
    </div>
  );
}