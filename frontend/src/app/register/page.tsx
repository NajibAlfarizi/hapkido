"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { Shield, User, Lock, Phone, Mail, ArrowRight, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function RegisterParentPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    username: '',
    password: '',
    phone: '',
    email: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    const res = await apiFetch('/auth/register-parent', {
      method: 'POST',
      body: JSON.stringify(form),
    });

    setLoading(false);

    if (res.success) {
      setSuccessMsg(res.message);
      setForm({ name: '', username: '', password: '', phone: '', email: '' });
    } else {
      setError(res.message || 'Registrasi gagal. Silakan coba lagi.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px]">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-200/80 overflow-hidden">
        {/* Header Banner */}
        <div className="bg-gradient-to-br from-hapkido-navy via-slate-800 to-hapkido-red p-6 text-center text-white relative">
          <div className="w-14 h-14 rounded-2xl bg-white/10 p-2 mx-auto flex items-center justify-center text-white shadow-lg mb-2">
            <img src="/hapkido-logo.png" alt="Hapkido Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-base font-extrabold tracking-wide uppercase">Pendaftaran Akun Orang Tua</h1>
          <p className="text-xs text-hapkido-lightBlue font-medium mt-0.5">Sistem Informasi Dojang Hapkido</p>
        </div>

        {/* Form */}
        <div className="p-6 sm:p-8 space-y-5">
          {successMsg ? (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs space-y-3">
              <div className="flex items-center gap-2 font-bold text-emerald-700">
                <CheckCircle className="w-5 h-5 shrink-0" />
                <span>Pendaftaran Berhasil!</span>
              </div>
              <p className="text-slate-600 leading-relaxed">{successMsg}</p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-4 py-2 bg-hapkido-navy text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition"
              >
                <span>Kembali ke Halaman Login</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <>
              {error && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleRegister} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Lengkap Orang Tua / Wali *</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Contoh: Bapak Ahmad Pratama"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-hapkido-navy transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nomor HP / WhatsApp *</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="tel"
                      required
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="Contoh: 081234567890"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-hapkido-navy transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Username Untuk Login *</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      value={form.username}
                      onChange={(e) => setForm({ ...form, username: e.target.value.toLowerCase().replace(/\s+/g, '') })}
                      placeholder="Contoh: ahmadpratama"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-hapkido-navy transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Password *</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="password"
                      required
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      placeholder="Buat password akun Anda"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-hapkido-navy transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email (Opsional)</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="Contoh: ahmad@gmail.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-hapkido-navy transition"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-hapkido-navy to-slate-800 text-white font-bold rounded-xl text-xs shadow-md hover:opacity-95 transition flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
                >
                  <span>{loading ? 'Memproses Pendaftaran...' : 'Daftar Akun Orang Tua'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </>
          )}

          <div className="pt-3 border-t border-slate-100 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-hapkido-navy transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Sudah punya akun? Masuk di sini</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
