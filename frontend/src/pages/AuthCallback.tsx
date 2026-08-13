import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { setToken } from '../lib/api';
import { useAuth } from '../context/useAuth';

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refresh } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const token = searchParams.get('token');
    if (!token) {
      setError('Google girişi başarısız oldu. Lütfen tekrar deneyin.');
      return;
    }
    setToken(token);
    refresh()
      .then(() => navigate('/app/statistics', { replace: true }))
      .catch(() => setError('Google girişi başarısız oldu. Lütfen tekrar deneyin.'));
  }, [searchParams, navigate, refresh]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors duration-300 font-sans text-slate-900 dark:text-slate-100 p-6">
      <div className="flex flex-col items-center gap-4 text-center">
        {error ? (
          <>
            <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>
            <button
              onClick={() => navigate('/login')}
              className="text-sm text-blue-600 dark:text-blue-400 font-medium hover:underline"
            >
              Giriş sayfasına dön
            </button>
          </>
        ) : (
          <>
            <Loader2 className="animate-spin text-blue-600 dark:text-blue-400" size={28} />
            <p className="text-sm text-slate-500 dark:text-slate-400">Giriş yapılıyor...</p>
          </>
        )}
      </div>
    </div>
  );
}
