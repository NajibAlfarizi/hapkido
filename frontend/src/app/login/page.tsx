"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch, setAuthToken, getCurrentUser } from '@/lib/api';
import { Lock, User, AlertCircle, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      router.push('/dashboard');
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });

    if (res.success && res.data) {
      setAuthToken(res.data.token);
      localStorage.setItem('hapkido_user', JSON.stringify(res.data.user));
      window.location.href = '/dashboard';
    } else {
      setLoading(false);
      setError(res.message || 'Login gagal. Periksa username dan password Anda.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px]">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-200/80 overflow-hidden">
        {/* Header Banner */}
        <div className="bg-gradient-to-br from-hapkido-navy via-slate-800 to-hapkido-red p-8 text-center text-white relative">
          <div className="w-16 h-16 rounded-2xl bg-white/10 p-2 mx-auto flex items-center justify-center text-white shadow-lg mb-3">
            <img src="/hapkido-logo.png" alt="Hapkido Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-lg font-extrabold tracking-wide uppercase">HAPKIDO PADANG PANJANG</h1>
          <p className="text-xs text-hapkido-lightBlue font-medium mt-1">Sistem Informasi Dojang Hapkido</p>
        </div>

        {/* Form */}
        <div className="p-6 sm:p-8 space-y-6">
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Username Pengguna</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username admin / pelatih"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-hapkido-navy focus:border-transparent transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Kata Sandi / Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-hapkido-navy focus:border-transparent transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-hapkido-navy to-slate-800 text-white font-bold rounded-xl text-sm shadow-md hover:opacity-95 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{loading ? 'Memproses Login...' : 'Masuk ke Sistem'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Demo Login Quick Buttons */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <div className="text-center">
              <Link
                href="/register"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-hapkido-red hover:underline transition"
              >
                <span>Belum punya akun? Daftar sebagai Orang Tua</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div>
              <p className="text-[11px] font-semibold text-slate-500 mb-2 text-center">Uji Coba Akun Demo:</p>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => fillDemo('hapkidopadangpanjang', 'admin123')}
                  className="px-2 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-[11px] font-semibold text-slate-700 transition text-center"
                >
                  🔑 Admin
                </button>
                <button
                  type="button"
                  onClick={() => fillDemo('pelatih', 'pelatih123')}
                  className="px-2 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-[11px] font-semibold text-slate-700 transition text-center"
                >
                  🥋 Pelatih
                </button>
                <button
                  type="button"
                  onClick={() => fillDemo('orangtua', 'orangtua123')}
                  className="px-2 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-[11px] font-semibold text-slate-700 transition text-center"
                >
                  👨‍👩‍👧 Orang Tua
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
