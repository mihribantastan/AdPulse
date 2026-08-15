import { useState, type SubmitEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Mail, Lock, User } from 'lucide-react';
import { useAuth } from '../context/useAuth';

const FLOW = [
  { label: 'Research', state: 'done' },
  { label: 'Creative', state: 'done' },
  { label: 'Media', state: 'active' },
  { label: 'Onay', state: 'gate' },
] as const;

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
    <div data-force-dark className="min-h-screen relative flex bg-ink-950 text-ink-100 font-sans overflow-hidden">
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute -top-40 -left-32 w-[42rem] h-[42rem] rounded-full opacity-40 blur-[110px]"
        style={{ background: 'radial-gradient(circle, #33C2E8 0%, transparent 70%)' }}
      />
      <div
        className="pointer-events-none absolute -bottom-56 right-[-10rem] w-[38rem] h-[38rem] rounded-full opacity-30 blur-[110px]"
        style={{ background: 'radial-gradient(circle, #2A4B8F 0%, transparent 70%)' }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
      />

      {/* Sol panel — marka / vaat */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between px-16 py-14 z-10">
        <span className="font-display text-lg tracking-tight text-ink-100">AdPulse</span>

        <div className="max-w-md">
          <p className="font-display text-4xl leading-[1.15] text-ink-100 text-balance">
            Onayınız olmadan tek kuruş harcanmaz.
          </p>
          <p className="mt-5 text-sm leading-relaxed text-ink-400">
            Research, Creative ve Media ajanları taslağı hazırlar; bütçe hiçbir platforma sizin onayınız olmadan ulaşmaz.
          </p>

          <div className="mt-10 flex items-center gap-2">
            {FLOW.map((step, i) => (
              <div key={step.label} className="flex items-center gap-2">
                <span
                  className={`font-mono text-[11px] tracking-wide uppercase px-2.5 py-1.5 rounded-md border backdrop-blur-sm ${
                    step.state === 'gate'
                      ? 'border-accent-500/60 text-accent-400 bg-accent-500/10 shadow-[0_0_16px_rgba(51,194,232,0.25)]'
                      : step.state === 'active'
                      ? 'border-white/15 text-ink-100 bg-white/[0.04]'
                      : 'border-white/10 text-ink-400 bg-transparent'
                  }`}
                >
                  {step.label}
                </span>
                {i < FLOW.length - 1 && <span className="w-4 h-px bg-white/15" />}
              </div>
            ))}
          </div>
        </div>

        <p className="font-mono text-[11px] text-ink-400/70 tracking-wide">
          İnsan Onaylı Mimari · LangGraph
        </p>
      </div>

      {/* Sağ panel — cam form kartı */}
      <div className="flex-1 flex items-center justify-center p-6 z-10">
        <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl shadow-2xl shadow-black/40 p-8">
          <div className="mb-6 lg:hidden text-center">
            <span className="font-display text-lg text-ink-100">AdPulse</span>
          </div>

          <h1 className="font-display text-2xl text-ink-100">AdPulse'a Katıl</h1>
          <p className="text-sm text-ink-400 mt-2 mb-7">Kampanyalarını yapay zeka ile yönetmeye başla.</p>

          <button
            type="button"
            onClick={loginWithGoogle}
            className="w-full flex items-center justify-center gap-2.5 border border-white/10 bg-white/[0.03] text-ink-100 py-3 rounded-lg font-medium text-sm hover:bg-white/[0.07] transition-colors mb-5"
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
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-xs text-ink-400">veya</span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="text-sm text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3.5 py-2.5">
                {error}
              </div>
            )}
            <div className="space-y-3.5">
              <div className="relative flex items-center">
                <User className="absolute left-4 text-ink-400" size={18} />
                <input
                  type="text"
                  required
                  placeholder="Ad Soyad"
                  className="w-full bg-white/[0.03] border border-white/10 rounded-lg py-3 pl-11 pr-4 text-sm font-medium text-ink-100 outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/25 transition-colors placeholder:text-ink-400"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="relative flex items-center">
                <Mail className="absolute left-4 text-ink-400" size={18} />
                <input
                  type="email"
                  required
                  placeholder="E-posta adresiniz"
                  className="w-full bg-white/[0.03] border border-white/10 rounded-lg py-3 pl-11 pr-4 text-sm font-medium text-ink-100 outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/25 transition-colors placeholder:text-ink-400"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="relative flex items-center">
                <Lock className="absolute left-4 text-ink-400" size={18} />
                <input
                  type="password"
                  required
                  minLength={8}
                  placeholder="Şifre (en az 8 karakter)"
                  className="w-full bg-white/[0.03] border border-white/10 rounded-lg py-3 pl-11 pr-4 text-sm font-medium text-ink-100 outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/25 transition-colors placeholder:text-ink-400"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="relative flex items-center">
                <Lock className="absolute left-4 text-ink-400" size={18} />
                <input
                  type="password"
                  required
                  placeholder="Şifreyi tekrar gir"
                  className="w-full bg-white/[0.03] border border-white/10 rounded-lg py-3 pl-11 pr-4 text-sm font-medium text-ink-100 outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/25 transition-colors placeholder:text-ink-400"
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 bg-accent-500 text-ink-950 py-3 rounded-lg font-semibold text-sm hover:bg-accent-400 transition-colors disabled:opacity-50 shadow-[0_0_20px_rgba(51,194,232,0.3)]"
            >
              {submitting ? 'Kayıt olunuyor...' : 'Kayıt Ol'}
              {!submitting && <ArrowRight size={16} />}
            </button>
          </form>

          <p className="text-center text-sm text-ink-400 mt-6">
            Zaten hesabın var mı? <Link to="/login" className="text-accent-400 font-medium hover:underline">Giriş yap</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
