"use client";

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { Package, Plus, X, Edit3 } from 'lucide-react';

export default function InventarisPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const [form, setForm] = useState({
    name: '',
    category: 'PERALATAN',
    stock: 10,
    unit: 'Pcs',
    unitPrice: 150000,
    condition: 'BAIK',
    location: 'Gudang Dojang',
    notes: '',
  });

  const loadData = async () => {
    setLoading(true);
    const res = await apiFetch('/inventory');
    if (res.success) setItems(res.data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await apiFetch('/inventory', {
      method: 'POST',
      body: JSON.stringify(form),
    });

    if (res.success) {
      setShowAddModal(false);
      loadData();
    } else {
      alert(res.message || 'Gagal menyimpan barang inventaris.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
            <Package className="w-6 h-6 text-hapkido-navy" />
            Inventaris & Peralatan Dojang
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Pengelolaan stok seragam (Dobok), pelindung tubuh/dada, matras puzzle, dan peralatan latihan.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-hapkido-navy hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Barang Inventaris</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="p-4">Kode / Nama Barang</th>
                <th className="p-4">Kategori</th>
                <th className="p-4">Stok / Satuan</th>
                <th className="p-4">Harga Satuan</th>
                <th className="p-4">Kondisi</th>
                <th className="p-4">Lokasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400">
                    Memuat stok inventaris...
                  </td>
                </tr>
              ) : items.length > 0 ? (
                items.map((it) => (
                  <tr key={it.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-4">
                      <p className="font-bold text-slate-800">{it.name}</p>
                      <span className="font-mono text-[10px] text-slate-400">{it.code}</span>
                    </td>

                    <td className="p-4">
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 font-extrabold text-[10px] rounded uppercase">
                        {it.category}
                      </span>
                    </td>

                    <td className="p-4 font-bold text-slate-800">
                      {it.stock} {it.unit}
                    </td>

                    <td className="p-4 font-semibold text-slate-700">
                      Rp {(it.unitPrice || 0).toLocaleString('id-ID')}
                    </td>

                    <td className="p-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-extrabold ${
                          it.condition === 'BAIK' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {it.condition}
                      </span>
                    </td>

                    <td className="p-4 text-slate-600 font-medium">{it.location || 'Gudang'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400">
                    Belum ada data barang inventaris.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add Item */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-800 text-sm">Tambah Barang Inventaris</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 text-slate-400 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Barang *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Misal: Dobok Hapkido Standar (Size M)"
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
                    <option value="SERAGAM">Seragam (Dobok)</option>
                    <option value="PELINDUNG">Pelindung / Body Protector</option>
                    <option value="MATRAS">Matras Latihan</option>
                    <option value="PERALATAN">Peralatan</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Stok Awal *</label>
                  <input
                    type="number"
                    required
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Satuan</label>
                  <input
                    type="text"
                    value={form.unit}
                    onChange={(e) => setForm({ ...form, unit: e.target.value })}
                    placeholder="Pcs / Stel / Lembar"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Harga Satuan (Rp)</label>
                  <input
                    type="number"
                    value={form.unitPrice}
                    onChange={(e) => setForm({ ...form, unitPrice: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Lokasi Penyimpanan</label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
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
                  Simpan Barang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
