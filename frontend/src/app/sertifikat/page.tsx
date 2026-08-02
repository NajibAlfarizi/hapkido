"use client";

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { FileCheck, Plus, Printer, X, Shield } from 'lucide-react';

export default function SertifikatPage() {
  const [certs, setCerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCert, setSelectedCert] = useState<any>(null);

  const [form, setForm] = useState({
    type: 'UJIAN_SABUK',
    title: 'Sertifikat Kenaikan Sabuk Kuning (Geup 9)',
    recipientName: '',
    signedBy: 'Master Hapkido Indonesia',
  });

  const loadData = async () => {
    setLoading(true);
    const res = await apiFetch('/certificates');
    if (res.success) setCerts(res.data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await apiFetch('/certificates', {
      method: 'POST',
      body: JSON.stringify(form),
    });

    if (res.success) {
      setShowAddModal(false);
      loadData();
      setSelectedCert(res.data);
    } else {
      alert(res.message || 'Gagal menerbitkan sertifikat.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
            <FileCheck className="w-6 h-6 text-hapkido-navy" />
            Generator Sertifikat Resmi Dojang
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Penerbitan sertifikat kelulusan ujian sabuk, peserta event kejuaraan, dan pelatih lisensi.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-hapkido-navy hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Terbitkan Sertifikat Baru</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <p className="text-xs text-slate-400 col-span-full text-center py-8">Memuat sertifikat...</p>
        ) : certs.length > 0 ? (
          certs.map((c) => (
            <div key={c.id} className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 bg-blue-50 text-blue-800 font-extrabold text-[10px] rounded uppercase">
                  {c.type}
                </span>
                <span className="font-mono text-[10px] text-slate-400 font-bold">{c.certificateNo}</span>
              </div>

              <h3 className="font-extrabold text-slate-800 text-base">{c.recipientName}</h3>
              <p className="text-xs text-slate-600 font-medium">{c.title}</p>
              <p className="text-[11px] text-slate-400">Pemberi Lisensi: {c.signedBy}</p>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
                <button
                  onClick={() => setSelectedCert(c)}
                  className="px-3 py-1.5 bg-slate-800 text-white font-bold rounded-xl text-xs hover:bg-slate-900 transition flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Lihat & Cetak</span>
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-xs text-slate-400 col-span-full text-center py-8">Belum ada sertifikat terbit.</p>
        )}
      </div>

      {/* Modal Add Certificate */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-800 text-sm">Terbitkan Sertifikat Dojang</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 text-slate-400 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Penerima *</label>
                <input
                  type="text"
                  required
                  value={form.recipientName}
                  onChange={(e) => setForm({ ...form, recipientName: e.target.value })}
                  placeholder="Nama Lengkap Anggota / Pelatih"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Judul Sertifikat *</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Misal: Sertifikat Kelulusan Ujian Sabuk Kuning"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tanda Tangan Oleh</label>
                <input
                  type="text"
                  value={form.signedBy}
                  onChange={(e) => setForm({ ...form, signedBy: e.target.value })}
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
                  Terbitkan Sertifikat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Certificate Modal */}
      {selectedCert && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-sm text-slate-800">Preview Sertifikat Resmi</h3>
              <button onClick={() => setSelectedCert(null)} className="p-1 text-slate-400 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Printable Certificate Template Container */}
            <div className="p-8 border-4 border-double border-amber-600 bg-amber-50/30 rounded-2xl text-center space-y-4 font-serif">
              <div className="flex items-center justify-center gap-2">
                <div className="w-8 h-8 rounded-full bg-hapkido-red flex items-center justify-center text-white font-bold">
                  <Shield className="w-5 h-5" />
                </div>
                <h2 className="font-extrabold text-base text-slate-900 uppercase">PERGURUAN HAPKIDO INDONESIA</h2>
              </div>

              <p className="text-xs text-amber-900 font-bold uppercase tracking-widest">SERTIFIKAT KELULUSAN</p>
              <p className="text-[10px] font-mono text-slate-500">No: {selectedCert.certificateNo}</p>

              <div className="py-2">
                <p className="text-xs text-slate-600 italic">Diberikan Kepada:</p>
                <h1 className="text-xl font-extrabold text-hapkido-navy underline decoration-amber-500 underline-offset-4 mt-1">
                  {selectedCert.recipientName}
                </h1>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed font-sans">{selectedCert.title}</p>

              <div className="pt-6 flex items-center justify-between font-sans text-[11px] border-t border-amber-200">
                <div className="text-left">
                  <p className="text-slate-400">Tanggal Terbit:</p>
                  <p className="font-bold text-slate-800">{new Date(selectedCert.issueDate).toLocaleDateString('id-ID')}</p>
                </div>
                <div className="text-right">
                  <p className="text-slate-400">Ketua / Penguji:</p>
                  <p className="font-bold text-slate-800">{selectedCert.signedBy}</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => window.print()}
              className="w-full py-2.5 bg-slate-800 text-white rounded-xl text-xs font-bold shadow-md hover:bg-slate-900 transition flex items-center justify-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Sertifikat Resmi</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
