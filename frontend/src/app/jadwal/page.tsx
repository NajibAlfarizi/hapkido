"use client";

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { Calendar, Plus, X, MapPin, Clock, UserCheck } from 'lucide-react';

export default function JadwalPage() {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [trainers, setTrainers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [showAddClassModal, setShowAddClassModal] = useState(false);
  const [showAddScheduleModal, setShowAddScheduleModal] = useState(false);

  const [classForm, setClassForm] = useState({
    name: '',
    levelCategory: 'REGULER',
    trainerId: '',
    dayOfWeek: 'SELASA',
    startTime: '16:00',
    endTime: '18:00',
    location: 'Dojang Utama Hall A',
    description: '',
  });

  const [scheduleForm, setScheduleForm] = useState({
    classId: '',
    trainerId: '',
    date: '',
    title: '',
    location: 'Dojang Utama Hall A',
    notes: '',
  });

  const loadData = async () => {
    setLoading(true);
    const [resSch, resClass, resTr] = await Promise.all([
      apiFetch('/schedules'),
      apiFetch('/schedules/classes'),
      apiFetch('/trainers'),
    ]);

    if (resSch.success) setSchedules(resSch.data);
    if (resClass.success) setClasses(resClass.data);
    if (resTr.success) setTrainers(resTr.data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveClass = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await apiFetch('/schedules/classes', {
      method: 'POST',
      body: JSON.stringify(classForm),
    });

    if (res.success) {
      setShowAddClassModal(false);
      loadData();
    } else {
      alert(res.message || 'Gagal menyimpan kelas.');
    }
  };

  const handleSaveSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await apiFetch('/schedules', {
      method: 'POST',
      body: JSON.stringify(scheduleForm),
    });

    if (res.success) {
      setShowAddScheduleModal(false);
      loadData();
    } else {
      alert(res.message || 'Gagal menyimpan jadwal latihan.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-hapkido-navy" />
            Jadwal & Kelas Latihan Hapkido
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Pengaturan kelas reguler, hari latihan, lokasi, dan penjadwalan sesi mingguan.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddClassModal(true)}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Kelas</span>
          </button>
          <button
            onClick={() => setShowAddScheduleModal(true)}
            className="px-4 py-2 bg-hapkido-navy hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Sesi Latihan</span>
          </button>
        </div>
      </div>

      {/* Grid: Kelas & Jadwal List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Regular Classes List */}
        <div className="lg:col-span-1 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <h2 className="font-extrabold text-slate-800 text-base border-b border-slate-100 pb-3">Daftar Kelas Dojang</h2>

          <div className="space-y-3">
            {classes.length > 0 ? (
              classes.map((c) => (
                <div key={c.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-800 font-extrabold text-[10px] rounded">
                      {c.dayOfWeek}
                    </span>
                    <span className="text-xs font-bold text-slate-600">
                      {c.startTime} - {c.endTime} WIB
                    </span>
                  </div>
                  <h3 className="font-extrabold text-slate-800 text-sm">{c.name}</h3>
                  <p className="text-xs text-slate-500">📍 {c.location}</p>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 text-center py-6">Belum ada kelas terdaftar.</p>
            )}
          </div>
        </div>

        {/* Training Schedules Cards */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <h2 className="font-extrabold text-slate-800 text-base border-b border-slate-100 pb-3">Agendakan Sesi Latihan</h2>

          <div className="space-y-3">
            {schedules.length > 0 ? (
              schedules.map((s) => (
                <div key={s.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-extrabold text-slate-800 text-sm">{s.title}</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      📅 {new Date(s.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })} &bull; 📍 {s.location}
                    </p>
                    {s.notes && <p className="text-[11px] text-slate-400 mt-0.5">Catatan: {s.notes}</p>}
                  </div>
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-extrabold text-xs rounded-full self-start sm:self-center">
                    {s.status}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 text-center py-6">Belum ada agenda latihan.</p>
            )}
          </div>
        </div>
      </div>

      {/* Modal Add Class */}
      {showAddClassModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-800 text-sm">Buat Kelas Latihan Rutin</h3>
              <button onClick={() => setShowAddClassModal(false)} className="p-1 text-slate-400 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveClass} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Kelas *</label>
                <input
                  type="text"
                  required
                  value={classForm.name}
                  onChange={(e) => setClassForm({ ...classForm, name: e.target.value })}
                  placeholder="Contoh: Kelas Reguler Sore"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Hari *</label>
                  <select
                    value={classForm.dayOfWeek}
                    onChange={(e) => setClassForm({ ...classForm, dayOfWeek: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  >
                    {['SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU', 'MINGGU'].map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kategori</label>
                  <select
                    value={classForm.levelCategory}
                    onChange={(e) => setClassForm({ ...classForm, levelCategory: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  >
                    <option value="REGULER">Reguler</option>
                    <option value="PRESTASI">Prestasi</option>
                    <option value="PRIVAT">Privat</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Jam Mulai</label>
                  <input
                    type="text"
                    value={classForm.startTime}
                    onChange={(e) => setClassForm({ ...classForm, startTime: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Jam Selesai</label>
                  <input
                    type="text"
                    value={classForm.endTime}
                    onChange={(e) => setClassForm({ ...classForm, endTime: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Lokasi Latihan</label>
                <input
                  type="text"
                  value={classForm.location}
                  onChange={(e) => setClassForm({ ...classForm, location: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddClassModal(false)}
                  className="px-3 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold"
                >
                  Batal
                </button>
                <button type="submit" className="px-4 py-2 bg-hapkido-navy text-white rounded-xl font-bold shadow-md">
                  Simpan Kelas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Add Schedule */}
      {showAddScheduleModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-800 text-sm">Buat Sesi Agenda Latihan</h3>
              <button onClick={() => setShowAddScheduleModal(false)} className="p-1 text-slate-400 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveSchedule} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Judul Latihan *</label>
                <input
                  type="text"
                  required
                  value={scheduleForm.title}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, title: e.target.value })}
                  placeholder="Contoh: Latihan Rutin Fisik & Nakbop"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tanggal *</label>
                <input
                  type="date"
                  required
                  value={scheduleForm.date}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, date: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Lokasi</label>
                <input
                  type="text"
                  value={scheduleForm.location}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, location: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Catatan / Materi</label>
                <input
                  type="text"
                  value={scheduleForm.notes}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, notes: e.target.value })}
                  placeholder="Catatan tambahan untuk pelatih/anggota"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddScheduleModal(false)}
                  className="px-3 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold"
                >
                  Batal
                </button>
                <button type="submit" className="px-4 py-2 bg-hapkido-navy text-white rounded-xl font-bold shadow-md">
                  Simpan Sesi Latihan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
