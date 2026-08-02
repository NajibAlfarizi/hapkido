"use client";

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { UserCheck, Plus, X, Phone, Mail, Award, CheckCircle } from 'lucide-react';

export default function PelatihPage() {
  const [trainers, setTrainers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const [form, setForm] = useState({
    username: '',
    password: '',
    name: '',
    email: '',
    phone: '',
    specialty: '',
    bio: '',
    isHead: false,
  });

  const loadTrainers = async () => {
    setLoading(true);
    const res = await apiFetch('/trainers');
    if (res.success) setTrainers(res.data);
    setLoading(false);
  };

  useEffect(() => {
    loadTrainers();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await apiFetch('/trainers', {
      method: 'POST',
      body: JSON.stringify(form),
    });

    if (res.success) {
      setShowAddModal(false);
      setForm({ username: '', password: '', name: '', email: '', phone: '', specialty: '', bio: '', isHead: false });
      loadTrainers();
    } else {
      alert(res.message || 'Gagal merilis akun pelatih.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-hapkido-navy" />
            Manajemen Pelatih Dojang
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Daftar tim instruktur & pelatih (Sabum), pengelompokan kelas mengajar, dan status lisensi.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-hapkido-navy hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Pelatih Baru</span>
        </button>
      </div>

      {/* Trainers Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <p className="text-xs text-slate-400 col-span-full text-center py-8">Memuat data pelatih...</p>
        ) : trainers.length > 0 ? (
          trainers.map((t) => (
            <div key={t.id} className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs hover:shadow-md transition space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-hapkido-navy to-slate-700 text-white flex items-center justify-center font-extrabold text-sm shadow-md">
                  {t.user?.name?.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-800 text-base">{t.user?.name}</h3>
                  <span className="inline-block px-2 py-0.5 bg-blue-50 text-blue-700 font-bold text-[10px] rounded">
                    {t.isHead ? 'Kepala Pelatih (Head Sabum)' : 'Pelatih Instruktur'}
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-xs border-t border-slate-100 pt-3">
                <p className="text-slate-600 font-medium">
                  <strong>Spesialisasi:</strong> {t.specialty || 'Kuncian & Nakbop Hapkido'}
                </p>
                <p className="text-slate-500">📞 {t.user?.phone || '-'}</p>
                <p className="text-slate-500">✉️ {t.user?.email || '-'}</p>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-slate-100 text-[11px]">
                <span className="text-emerald-600 font-bold flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> Active Status
                </span>
                <span className="text-slate-400 font-semibold">{t.classes?.length || 0} Kelas Mengajar</span>
              </div>
            </div>
          ))
        ) : (
          <p className="text-xs text-slate-400 col-span-full text-center py-8">Belum ada pelatih terdaftar.</p>
        )}
      </div>

      {/* Add Trainer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h2 className="text-lg font-extrabold text-slate-800">Tambah Akun Pelatih Baru</h2>
              <button onClick={() => setShowAddModal(false)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Username Login *</label>
                  <input
                    type="text"
                    required
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Password *</label>
                  <input
                    type="password"
                    required
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap Pelatih (Sabum) *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">No HP</label>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Spesialisasi Teknik</label>
                <input
                  type="text"
                  value={form.specialty}
                  onChange={(e) => setForm({ ...form, specialty: e.target.value })}
                  placeholder="Contoh: Kuncian Hoshinsool & Tendangan"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isHead"
                  checked={form.isHead}
                  onChange={(e) => setForm({ ...form, isHead: e.target.checked })}
                  className="w-4 h-4 text-hapkido-navy rounded border-slate-300"
                />
                <label htmlFor="isHead" className="text-xs font-bold text-slate-700">
                  Tetapkan sebagai Kepala Pelatih (Head Trainer)
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 text-xs font-bold text-slate-600 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-hapkido-navy text-white text-xs font-bold rounded-xl shadow-md"
                >
                  Simpan Pelatih
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
