import { useState, type SubmitEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, Mail, Lock, User } from 'lucide-react';
import { useAuth } from '../context/useAuth';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await register(name, email, password, passwordConfirmation);
      navigate('/app/statistics');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kayıt başarısız oldu.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors duration-300 font-sans text-slate-900 dark:text-slate-100 p-6">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 p-10 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">

        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-12 h-12 bg-blue-600 dark:bg-blue-500 rounded-xl flex items-center justify-center text-white mb-5">
            <Sparkles size={22} />
          </div>
          <h2 className="text-2xl font-semibold tracking-tight">AdPulse'a Katıl</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Kampanyalarını yapay zeka ile yönetmeye başla.</p>
        </div>

        <button
          type="button"
          onClick={loginWithGoogle}
          className="w-full flex items-center justify-center gap-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 py-3 rounded-lg font-medium text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors mb-5"
        >
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.87 2.68-6.62z" />
            <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18z" />
            <path fill="#FBBC05" d="M3.97 10.72A5.4 5.4 0 0 1 3.68 9c0-.6.1-1.18.29-1.72V4.95H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.05l3.01-2.33z" />
            <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.46 3.44 1.35l2.59-2.59C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z" />
          </svg>
          Google ile kayıt ol
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
          <span className="text-xs text-slate-400">veya</span>
          <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="text-sm text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-lg px-3.5 py-2.5">
              {error}
            </div>
          )}
          <div className="space-y-3.5">
            <div className="relative flex items-center">
              <User className="absolute left-4 text-slate-400" size={18} />
              <input
                type="text"
                required
                placeholder="Ad Soyad"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg py-3 pl-11 pr-4 text-sm font-medium outline-none focus:border-blue-500 dark:focus:border-blue-500 transition-colors placeholder:text-slate-400"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

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
                minLength={8}
                placeholder="Şifre (en az 8 karakter)"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg py-3 pl-11 pr-4 text-sm font-medium outline-none focus:border-blue-500 dark:focus:border-blue-500 transition-colors placeholder:text-slate-400"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="relative flex items-center">
              <Lock className="absolute left-4 text-slate-400" size={18} />
              <input
                type="password"
                required
                placeholder="Şifreyi tekrar gir"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg py-3 pl-11 pr-4 text-sm font-medium outline-none focus:border-blue-500 dark:focus:border-blue-500 transition-colors placeholder:text-slate-400"
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 dark:bg-blue-500 text-white py-3 rounded-lg font-medium text-sm hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            {submitting ? 'Kayıt olunuyor...' : 'Kayıt Ol'}
            {!submitting && <ArrowRight size={16} />}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
          Zaten hesabın var mı? <Link to="/login" className="text-blue-600 dark:text-blue-400 font-medium hover:underline">Giriş yap</Link>
        </p>
      </div>
    </div>
  );
}
