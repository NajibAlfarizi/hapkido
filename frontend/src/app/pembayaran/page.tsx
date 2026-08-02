"use client";

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { CreditCard, Plus, Printer, X, Shield, Search, CheckCircle, Ban } from 'lucide-react';

export default function PembayaranPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [duesTypes, setDuesTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);

  const [form, setForm] = useState({
    memberId: '',
    duesTypeId: '',
    amount: 150000,
    paidAmount: 150000,
    paymentMethod: 'TUNAI',
    dueDate: '',
    notes: '',
  });

  const loadData = async () => {
    setLoading(true);
    const [resPay, resMem, resDues] = await Promise.all([
      apiFetch('/payments'),
      apiFetch('/members?status=AKTIF'),
      apiFetch('/dues/types'),
    ]);

    if (resPay.success) setPayments(resPay.data);
    if (resMem.success) setMembers(resMem.data);
    if (resDues.success) setDuesTypes(resDues.data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSavePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await apiFetch('/payments', {
      method: 'POST',
      body: JSON.stringify(form),
    });

    if (res.success) {
      setShowAddModal(false);
      loadData();
      setSelectedReceipt(res.data);
    } else {
      alert(res.message || 'Gagal merilis transaksi pembayaran.');
    }
  };

  const handleCancelPayment = async (id: string, inv: string) => {
    if (confirm(`Apakah Anda yakin membatalkan pembayaran invoice ${inv}?`)) {
      const res = await apiFetch(`/payments/${id}/cancel`, { method: 'PUT' });
      if (res.success) loadData();
    }
  };

  const onSelectDuesType = (id: string) => {
    const dt = duesTypes.find((d) => d.id === id);
    if (dt) {
      setForm({
        ...form,
        duesTypeId: id,
        amount: dt.defaultAmount || 150000,
        paidAmount: dt.defaultAmount || 150000,
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-hapkido-red" />
            Iuran & Transaksi Pembayaran
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Pencatatan langsung iuran bulanan/ujian/event oleh Admin, pembayaran sebagian (Partial Payment), dan cetak Kuitansi.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-hapkido-navy hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Input Pembayaran Baru</span>
        </button>
      </div>

      {/* Payments History Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="p-4">Invoice / Tanggal</th>
                <th className="p-4">Anggota</th>
                <th className="p-4">Jenis Iuran</th>
                <th className="p-4">Metode</th>
                <th className="p-4">Nominal / Dibayar</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Kuitansi / Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400">
                    Memuat riwayat pembayaran...
                  </td>
                </tr>
              ) : payments.length > 0 ? (
                payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-4">
                      <p className="font-bold text-slate-800">{p.invoiceNo}</p>
                      <p className="text-[10px] text-slate-400">
                        {new Date(p.paymentDate).toLocaleDateString('id-ID')}
                      </p>
                    </td>

                    <td className="p-4">
                      <p className="font-bold text-slate-800">{p.member?.fullName}</p>
                      <span className="text-[10px] font-mono text-slate-400">{p.member?.nia}</span>
                    </td>

                    <td className="p-4 font-semibold text-slate-700">{p.duesType?.name || 'Iuran Latihan'}</td>

                    <td className="p-4">
                      <span className="px-2 py-0.5 bg-slate-100 font-bold text-[10px] rounded text-slate-600">
                        {p.paymentMethod}
                      </span>
                    </td>

                    <td className="p-4">
                      <p className="font-bold text-emerald-600">
                        Rp {p.paidAmount.toLocaleString('id-ID')}
                      </p>
                      {p.paidAmount < p.amount && (
                        <p className="text-[10px] text-amber-600 font-semibold">
                          Total Rp {p.amount.toLocaleString('id-ID')} (Sisa Rp {(p.amount - p.paidAmount).toLocaleString('id-ID')})
                        </p>
                      )}
                    </td>

                    <td className="p-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                          p.status === 'LUNAS'
                            ? 'bg-emerald-100 text-emerald-800'
                            : p.status === 'SEBAGIAN'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>

                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setSelectedReceipt(p)}
                          title="Cetak Kuitansi Resmi"
                          className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        {p.status !== 'BATAL' && (
                          <button
                            onClick={() => handleCancelPayment(p.id, p.invoiceNo)}
                            title="Batalkan Transaksi"
                            className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg transition"
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400">
                    Belum ada transaksi pembayaran.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add Payment */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-800 text-base">Input Pembayaran Iuran Dojang</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 text-slate-400 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePayment} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Pilih Anggota Dojang *</label>
                <select
                  required
                  value={form.memberId}
                  onChange={(e) => setForm({ ...form, memberId: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                >
                  <option value="">-- Pilih Anggota --</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.fullName} ({m.nia})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Jenis Iuran / Tagihan *</label>
                <select
                  required
                  value={form.duesTypeId}
                  onChange={(e) => onSelectDuesType(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                >
                  <option value="">-- Pilih Jenis Iuran --</option>
                  {duesTypes.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} (Default: Rp {d.defaultAmount.toLocaleString('id-ID')})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Total Tagihan (Rp) *</label>
                  <input
                    type="number"
                    required
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Jumlah Dibayar (Rp) *</label>
                  <input
                    type="number"
                    required
                    value={form.paidAmount}
                    onChange={(e) => setForm({ ...form, paidAmount: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Metode Pembayaran</label>
                  <select
                    value={form.paymentMethod}
                    onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  >
                    <option value="TUNAI">Tunai / Cash</option>
                    <option value="TRANSFER">Transfer Bank</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Catatan</label>
                  <input
                    type="text"
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    placeholder="Keterangan tambahan"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold"
                >
                  Batal
                </button>
                <button type="submit" className="px-5 py-2 bg-hapkido-navy text-white rounded-xl font-bold shadow-md">
                  Simpan Transaksi & Terbitkan Kuitansi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Receipt Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-sm text-slate-800">Kuitansi Pembayaran Resmi</h3>
              <button onClick={() => setSelectedReceipt(null)} className="p-1 text-slate-400 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Printable Kuitansi Box */}
            <div className="p-6 border-2 border-dashed border-slate-300 rounded-2xl space-y-4 text-xs bg-slate-50/50">
              <div className="text-center border-b border-slate-200 pb-3">
                <h2 className="font-extrabold text-sm text-slate-800 uppercase tracking-wide">DOJANG HAPKIDO INDONESIA</h2>
                <p className="text-[10px] text-slate-500">KUITANSI BUKTI PEMBAYARAN IURAN</p>
                <span className="font-mono text-[11px] font-bold text-hapkido-navy mt-1 inline-block">
                  No: {selectedReceipt.receiptNo || selectedReceipt.invoiceNo}
                </span>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Telah Terima Dari:</span>
                  <span className="font-bold text-slate-800">{selectedReceipt.member?.fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">NIA Anggota:</span>
                  <span className="font-mono font-bold text-slate-700">{selectedReceipt.member?.nia}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Untuk Pembayaran:</span>
                  <span className="font-semibold text-slate-800">{selectedReceipt.duesType?.name || 'Iuran Latihan'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Metode:</span>
                  <span className="font-semibold text-slate-800">{selectedReceipt.paymentMethod}</span>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl flex items-center justify-between border border-emerald-100">
                <span className="font-bold text-emerald-800">Jumlah Dibayar:</span>
                <span className="text-sm font-extrabold text-emerald-700">
                  Rp {selectedReceipt.paidAmount?.toLocaleString('id-ID')}
                </span>
              </div>

              <div className="text-right text-[10px] text-slate-400 pt-2">
                <p>Jakarta, {new Date(selectedReceipt.paymentDate || Date.now()).toLocaleDateString('id-ID')}</p>
                <p className="font-bold text-slate-700 mt-4">Pengurus Dojang Hapkido</p>
              </div>
            </div>

            <button
              onClick={() => window.print()}
              className="w-full py-2.5 bg-slate-800 text-white rounded-xl text-xs font-bold shadow-md hover:bg-slate-900 transition flex items-center justify-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Kuitansi Pembayaran</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
