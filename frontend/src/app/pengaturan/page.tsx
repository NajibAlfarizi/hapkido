"use client";

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { Settings, Save, Database, Shield } from 'lucide-react';

export default function PengaturanPage() {
  const [form, setForm] = useState({
    dojangName: 'DOJANG HAPKIDO INDONESIA',
    logoUrl: '',
    address: 'Jl. Utama Perguruan Hapkido No. 1, Jakarta',
    phone: '0812-3456-7890',
    email: 'info@dojanghapkido.id',
    academicPeriod: '2026/2027',
    defaultMonthlyFee: 150000,
    defaultPracticeDays: 'Selasa, Kamis, Sabtu (16.00 - 18.00 WIB)',
    headerText: 'PERGURUAN BELADIRI HAPKIDO INDONESIA',
    footerReceiptText: 'Kuitansi Resmi Dojang Hapkido. Terima kasih atas pembayaran Anda!',
  });

  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    apiFetch('/settings').then((res) => {
      if (res.success && res.data) {
        setForm(res.data);
      }
      setLoading(false);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    const res = await apiFetch('/settings', {
      method: 'PUT',
      body: JSON.stringify(form),
    });

    if (res.success) {
      setSuccessMsg('Pengaturan Dojang berhasil diperbarui.');
    } else {
      alert(res.message || 'Gagal menyimpan pengaturan.');
    }
  };

  const handleBackupDB = () => {
    alert('Simulasi Backup Database PostgreSQL / SQLite berhasil diunduh (backup_dojang_hapkido_2026.sql)');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <h1 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
          <Settings className="w-6 h-6 text-hapkido-navy" />
          Pengaturan Perguruan & Dojang Hapkido
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Konfigurasi nama dojang, alamat, kontak, iuran bulanan default, hari latihan, teks kuitansi, dan backup database.
        </p>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold">
          ✅ {successMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <form onSubmit={handleSubmit} className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <h2 className="font-extrabold text-slate-800 text-base border-b border-slate-100 pb-3">Profil Dojang & Kuitansi</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Nama Perguruan / Dojang *</label>
              <input
                type="text"
                required
                value={form.dojangName}
                onChange={(e) => setForm({ ...form, dojangName: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Tahun Akademik / Periode *</label>
              <input
                type="text"
                required
                value={form.academicPeriod}
                onChange={(e) => setForm({ ...form, academicPeriod: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">No Telepon Dojang</label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Email Resmi</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Nominal Iuran Bulanan Default (Rp)</label>
              <input
                type="number"
                value={form.defaultMonthlyFee}
                onChange={(e) => setForm({ ...form, defaultMonthlyFee: Number(e.target.value) })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Hari & Jam Latihan Default</label>
              <input
                type="text"
                value={form.defaultPracticeDays}
                onChange={(e) => setForm({ ...form, defaultPracticeDays: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
              />
            </div>
          </div>

          <div className="text-xs space-y-3 pt-2">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Alamat Dojang</label>
              <textarea
                rows={2}
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
              ></textarea>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Teks Footer Kuitansi Pembayaran</label>
              <input
                type="text"
                value={form.footerReceiptText}
                onChange={(e) => setForm({ ...form, footerReceiptText: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 bg-hapkido-navy hover:bg-slate-800 text-white font-bold rounded-xl text-xs shadow-md transition flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Pengaturan</span>
            </button>
          </div>
        </form>

        {/* Database & System Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <h2 className="font-extrabold text-slate-800 text-base border-b border-slate-100 pb-3">Database & Pemeliharaan</h2>
            <p className="text-xs text-slate-500 mt-2">
              Unduh salinan cadangan (backup) database PostgreSQL/SQLite Dojang secara berkala untuk proteksi data.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
              <Database className="w-4 h-4 text-hapkido-red" />
              <span>Backup Database Dojang</span>
            </div>
            <p className="text-[11px] text-slate-500">Mencakup tabel Anggota, Pembayaran, Absensi QR, dan Sabuk.</p>
            <button
              type="button"
              onClick={handleBackupDB}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2"
            >
              <Database className="w-4 h-4" />
              <span>Unduh Backup Database (.sql)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
