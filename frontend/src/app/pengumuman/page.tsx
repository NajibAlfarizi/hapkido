"use client";

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { Megaphone, Plus, X, Pin } from 'lucide-react';

export default function PengumumanPage() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const [form, setForm] = useState({
    title: '',
    content: '',
    category: 'UMUM',
    isPinned: false,
  });

  const loadData = async () => {
    setLoading(true);
    const res = await apiFetch('/announcements');
    if (res.success) setAnnouncements(res.data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await apiFetch('/announcements', {
      method: 'POST',
      body: JSON.stringify(form),
    });

    if (res.success) {
      setShowAddModal(false);
      setForm({ title: '', content: '', category: 'UMUM', isPinned: false });
      loadData();
    } else {
      alert(res.message || 'Gagal mempublikasikan pengumuman.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-hapkido-red" />
            Pengumuman & Pemberitahuan Dojang
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Informasi pengumuman latihan, jadwal libur, event kejuaraan, dan pendaftaran ujian sabuk.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-hapkido-navy hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Pengumuman Baru</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <p className="text-xs text-slate-400 col-span-full text-center py-8">Memuat pengumuman...</p>
        ) : announcements.length > 0 ? (
          announcements.map((a) => (
            <div key={a.id} className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-3 relative">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 font-extrabold text-[10px] rounded uppercase">
                  {a.category}
                </span>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  {a.isPinned && <Pin className="w-4 h-4 text-hapkido-red fill-hapkido-red" />}
                  <span>{new Date(a.createdAt).toLocaleDateString('id-ID')}</span>
                </div>
              </div>

              <h3 className="font-extrabold text-slate-800 text-base">{a.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">{a.content}</p>
            </div>
          ))
        ) : (
          <p className="text-xs text-slate-400 col-span-full text-center py-8">Belum ada pengumuman.</p>
        )}
      </div>

      {/* Modal Add Announcement */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-800 text-base">Buat Pengumuman Dojang</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 text-slate-400 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Judul Pengumuman *</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Misal: Pemberitahuan Libur Latihan"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Kategori</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                >
                  <option value="UMUM">Umum</option>
                  <option value="LATIHAN">Latihan</option>
                  <option value="LIBUR">Libur</option>
                  <option value="EVENT">Event</option>
                  <option value="UJIAN">Ujian Sabuk</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Isi Pengumuman *</label>
                <textarea
                  rows={4}
                  required
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                ></textarea>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isPinned"
                  checked={form.isPinned}
                  onChange={(e) => setForm({ ...form, isPinned: e.target.checked })}
                  className="w-4 h-4 text-hapkido-red rounded"
                />
                <label htmlFor="isPinned" className="font-bold text-slate-700">
                  Sematkan Pengumuman di Bagian Atas (Pin Announcement)
                </label>
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
                  Publikasikan Pengumuman
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
