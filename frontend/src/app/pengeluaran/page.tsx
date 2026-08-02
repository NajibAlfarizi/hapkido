"use client";

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { TrendingDown, Plus, X, Trash2 } from 'lucide-react';

export default function PengeluaranPage() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const [form, setForm] = useState({
    title: '',
    category: 'OPERASIONAL',
    amount: 500000,
    recipient: '',
    notes: '',
  });

  const loadExpenses = async () => {
    setLoading(true);
    const res = await apiFetch('/expenses');
    if (res.success) setExpenses(res.data);
    setLoading(false);
  };

  useEffect(() => {
    loadExpenses();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await apiFetch('/expenses', {
      method: 'POST',
      body: JSON.stringify(form),
    });

    if (res.success) {
      setShowAddModal(false);
      loadExpenses();
    } else {
      alert(res.message || 'Gagal merilis pengeluaran.');
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`Hapus pencatatan pengeluaran: ${title}?`)) {
      const res = await apiFetch(`/expenses/${id}`, { method: 'DELETE' });
      if (res.success) loadExpenses();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
            <TrendingDown className="w-6 h-6 text-rose-600" />
            Pengeluaran Operasional Dojang
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Pencatatan pengeluaran gaji pelatih, sewa tempat latihan, peralatan, event, dan operasional harian.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-hapkido-navy hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Pengeluaran</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="p-4">Pengeluaran / Tanggal</th>
                <th className="p-4">Kategori</th>
                <th className="p-4">Penerima</th>
                <th className="p-4">Nominal</th>
                <th className="p-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-slate-400">
                    Memuat pengeluaran...
                  </td>
                </tr>
              ) : expenses.length > 0 ? (
                expenses.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-4">
                      <p className="font-bold text-slate-800">{e.title}</p>
                      <p className="text-[10px] text-slate-400">{new Date(e.expenseDate).toLocaleDateString('id-ID')}</p>
                    </td>

                    <td className="p-4">
                      <span className="px-2 py-0.5 bg-rose-50 text-rose-700 font-extrabold text-[10px] rounded uppercase">
                        {e.category}
                      </span>
                    </td>

                    <td className="p-4 font-semibold text-slate-700">{e.recipient || '-'}</td>

                    <td className="p-4 font-bold text-rose-600">Rp {e.amount.toLocaleString('id-ID')}</td>

                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleDelete(e.id, e.title)}
                        className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-slate-400">
                    Belum ada pencatatan pengeluaran.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add Expense */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-800 text-sm">Input Pengeluaran Dojang</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 text-slate-400 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Judul Pengeluaran *</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Misal: Sewa Lapangan Bulan Agustus"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kategori</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  >
                    <option value="GAJI_PELATIH">Gaji Pelatih</option>
                    <option value="SEWA_TEMPAT">Sewa Tempat</option>
                    <option value="PERALATAN">Peralatan Latihan</option>
                    <option value="EVENT">Event / Kejuaraan</option>
                    <option value="OPERASIONAL">Operasional</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nominal (Rp) *</label>
                  <input
                    type="number"
                    required
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Penerima Dana</label>
                <input
                  type="text"
                  value={form.recipient}
                  onChange={(e) => setForm({ ...form, recipient: e.target.value })}
                  placeholder="Misal: Pengelola Hall A"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold"
                >
                  Batal
                </button>
                <button type="submit" className="px-4 py-2 bg-hapkido-navy text-white rounded-xl font-bold shadow-md">
                  Simpan Pengeluaran
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
