"use client";

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { Trophy, Plus, X, Calendar, MapPin, Users } from 'lucide-react';

export default function EventPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showRegModal, setShowRegModal] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState('');

  const [eventForm, setEventForm] = useState({
    title: '',
    category: 'KEJUARAAN',
    dateStart: '',
    location: '',
    feeAmount: 250000,
    description: '',
  });

  const [regForm, setRegForm] = useState({
    memberId: '',
    notes: '',
  });

  const loadData = async () => {
    setLoading(true);
    const [resEv, resMem] = await Promise.all([
      apiFetch('/events'),
      apiFetch('/members?status=AKTIF'),
    ]);

    if (resEv.success) setEvents(resEv.data);
    if (resMem.success) setMembers(resMem.data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await apiFetch('/events', {
      method: 'POST',
      body: JSON.stringify(eventForm),
    });

    if (res.success) {
      setShowAddModal(false);
      loadData();
    } else {
      alert(res.message || 'Gagal membuat event.');
    }
  };

  const handleRegisterMember = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await apiFetch('/events/register', {
      method: 'POST',
      body: JSON.stringify({
        eventId: selectedEventId,
        ...regForm,
      }),
    });

    if (res.success) {
      setShowRegModal(false);
      loadData();
    } else {
      alert(res.message || 'Gagal memproses pendaftaran peserta.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-hapkido-gold" />
            Event, Kejuaraan & Seminar
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Pengelolaan agenda kejuaraan Hapkido, seminar beladiri, latihan gabungan, dan pendaftaran peserta.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-hapkido-navy hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Event Baru</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          <p className="text-xs text-slate-400 col-span-full text-center py-8">Memuat agenda event...</p>
        ) : events.length > 0 ? (
          events.map((ev) => (
            <div key={ev.id} className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 bg-violet-100 text-violet-800 font-extrabold text-[10px] rounded uppercase">
                  {ev.category}
                </span>
                <span className="text-xs font-bold text-emerald-600">
                  Biaya: Rp {(ev.feeAmount || 0).toLocaleString('id-ID')}
                </span>
              </div>

              <div>
                <h3 className="font-extrabold text-slate-800 text-base">{ev.title}</h3>
                <p className="text-xs text-slate-500 mt-1">
                  📅 {new Date(ev.dateStart).toLocaleDateString('id-ID')} &bull; 📍 {ev.location}
                </p>
                {ev.description && <p className="text-xs text-slate-600 mt-2">{ev.description}</p>}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600">
                  👥 {ev.regs?.length || 0} Peserta Terdaftar
                </span>
                <button
                  onClick={() => {
                    setSelectedEventId(ev.id);
                    setShowRegModal(true);
                  }}
                  className="px-3 py-1.5 bg-slate-800 text-white font-bold rounded-xl text-xs hover:bg-slate-900 transition flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Daftarkan Peserta</span>
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-xs text-slate-400 col-span-full text-center py-8">Belum ada agenda event.</p>
        )}
      </div>

      {/* Modal Add Event */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-800 text-sm">Buat Event / Kejuaraan Baru</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 text-slate-400 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveEvent} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Judul Event *</label>
                <input
                  type="text"
                  required
                  value={eventForm.title}
                  onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                  placeholder="Misal: Kejuaraan Hapkido Antar Dojang 2026"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kategori</label>
                  <select
                    value={eventForm.category}
                    onChange={(e) => setEventForm({ ...eventForm, category: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  >
                    <option value="KEJUARAAN">Kejuaraan</option>
                    <option value="SEMINAR">Seminar</option>
                    <option value="LATIHAN_GABUNGAN">Latihan Gabungan</option>
                    <option value="UJIAN_SABUK">Ujian Sabuk</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Biaya Pendaftaran</label>
                  <input
                    type="number"
                    value={eventForm.feeAmount}
                    onChange={(e) => setEventForm({ ...eventForm, feeAmount: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tanggal Mulai *</label>
                <input
                  type="date"
                  required
                  value={eventForm.dateStart}
                  onChange={(e) => setEventForm({ ...eventForm, dateStart: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Lokasi Event *</label>
                <input
                  type="text"
                  required
                  value={eventForm.location}
                  onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                  placeholder="Gor Olahraga / Gelanggang"
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
                  Simpan Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Register Member for Event */}
      {showRegModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-800 text-sm">Daftarkan Peserta Event</h3>
              <button onClick={() => setShowRegModal(false)} className="p-1 text-slate-400 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterMember} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Pilih Anggota *</label>
                <select
                  required
                  value={regForm.memberId}
                  onChange={(e) => setRegForm({ ...regForm, memberId: e.target.value })}
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
                <label className="block font-bold text-slate-700 mb-1">Catatan Tambahan</label>
                <input
                  type="text"
                  value={regForm.notes}
                  onChange={(e) => setRegForm({ ...regForm, notes: e.target.value })}
                  placeholder="Misal: Kategori Tanding Kelas Under 50kg"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowRegModal(false)}
                  className="px-3 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold"
                >
                  Batal
                </button>
                <button type="submit" className="px-4 py-2 bg-hapkido-navy text-white rounded-xl font-bold shadow-md">
                  Daftarkan Peserta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
