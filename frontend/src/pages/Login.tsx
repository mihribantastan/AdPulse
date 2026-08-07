import { useState, type SubmitEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, Mail, Lock } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: SubmitEvent) => {
    e.preventDefault();
    navigate('/app/statistics');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors duration-300 font-sans text-slate-900 dark:text-slate-100 p-6">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 p-10 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">

        {/* Logo ve Başlık */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-12 h-12 bg-blue-600 dark:bg-blue-500 rounded-xl flex items-center justify-center text-white mb-5">
            <Sparkles size={22} />
          </div>
          <h2 className="text-2xl font-semibold tracking-tight">AdPulse'a Giriş Yap</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Kampanyalarını yönetmeye devam et.</p>
        </div>

        {/* Giriş Formu */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-3.5">
            <div className="relative flex items-center">
              <Mail className="absolute left-4 text-slate-400" size={18} />
              <input
                type="email"
                required
                placeholder="E-posta adresiniz"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg py-3 pl-11 pr-4 text-sm font-medium outline-none focus:border-blue-500 dark:focus:border-blue-500 transition-colors placeholder:text-slate-400"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="relative flex items-center">
              <Lock className="absolute left-4 text-slate-400" size={18} />
              <input
                type="password"
                required
                placeholder="Şifreniz"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg py-3 pl-11 pr-4 text-sm font-medium outline-none focus:border-blue-500 dark:focus:border-blue-500 transition-colors placeholder:text-slate-400"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-blue-600 dark:bg-blue-500 text-white py-3 rounded-lg font-medium text-sm hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
          >
            Giriş Yap
            <ArrowRight size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
