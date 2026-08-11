"use client";

import { useState, useEffect } from 'react';
import { apiFetch, getCurrentUser } from '@/lib/api';
import { useConfirm, useLoading } from '@/context/UiContext';
import { Shield, Plus, X, MapPin, Phone, Mail, Users, Calendar, Clock, Trash2 } from 'lucide-react';

export default function DojangPage() {
  const confirm = useConfirm();
  const { showLoading, hideLoading } = useLoading();
  const [userRole, setUserRole] = useState('ADMIN');
  const [dojangs, setDojangs] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [trainers, setTrainers] = useState<any[]>([]);
  const [selectedDojangId, setSelectedDojangId] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = getCurrentUser();
    if (user?.role) setUserRole(user.role);
  }, []);

  const isParent = userRole === 'ORANG_TUA';

  const [showAddDojangModal, setShowAddDojangModal] = useState(false);
  const [showAddScheduleModal, setShowAddScheduleModal] = useState(false);

  const [dojangForm, setDojangForm] = useState({
    code: '',
    name: '',
    address: '',
    phone: '',
    email: '',
    headTrainerName: '',
  });

  const [scheduleForm, setScheduleForm] = useState({
    dojangId: '',
    trainerId: '',
    dayOfWeek: 'SELASA',
    startTime: '16:00',
    endTime: '18:00',
    location: 'Hall Dojang Utama',
  });

  const loadData = async () => {
    setLoading(true);
    const query = selectedDojangId ? `?dojangId=${selectedDojangId}` : '';
    const [resDojang, resSch, resTr] = await Promise.all([
      apiFetch('/dojangs'),
      apiFetch(`/schedules${query}`),
      apiFetch('/trainers'),
    ]);

    if (resDojang.success) setDojangs(resDojang.data);
    if (resSch.success) setSchedules(resSch.data);
    if (resTr.success) setTrainers(resTr.data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [selectedDojangId]);

  const handleSaveDojang = async (e: React.FormEvent) => {
    e.preventDefault();
    showLoading('Menyimpan cabang dojang baru...');
    const res = await apiFetch('/dojangs', {
      method: 'POST',
      body: JSON.stringify(dojangForm),
    });
    hideLoading();

    if (res.success) {
      setShowAddDojangModal(false);
      setDojangForm({ code: '', name: '', address: '', phone: '', email: '', headTrainerName: '' });
      loadData();
    } else {
      alert(res.message || 'Gagal menyimpan cabang dojang.');
    }
  };

  const handleSaveSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    showLoading('Menyimpan jadwal latihan...');
    const res = await apiFetch('/schedules', {
      method: 'POST',
      body: JSON.stringify(scheduleForm),
    });
    hideLoading();

    if (res.success) {
      setShowAddScheduleModal(false);
      setScheduleForm({
        dojangId: '',
        trainerId: '',
        dayOfWeek: 'SELASA',
        startTime: '16:00',
        endTime: '18:00',
        location: 'Hall Dojang Utama',
      });
      loadData();
    } else {
      alert(res.message || 'Gagal menyimpan jadwal hari latihan.');
    }
  };

  const handleDeleteDojang = async (id: string, name: string) => {
    const ok = await confirm({
      title: 'Hapus Cabang Dojang',
      message: `Apakah Anda yakin ingin menghapus cabang ${name}? Data anggota terkait cabang ini mungkin akan terpengaruh.`,
      confirmText: 'Ya, Hapus Cabang',
      cancelText: 'Batal',
      variant: 'danger',
    });

    if (ok) {
      showLoading('Menghapus cabang dojang...');
      const res = await apiFetch(`/dojangs/${id}`, { method: 'DELETE' });
      hideLoading();
      if (res.success) loadData();
    }
  };

  const handleDeleteSchedule = async (id: string, title: string) => {
    const ok = await confirm({
      title: 'Hapus Jadwal Latihan',
      message: `Apakah Anda yakin ingin menghapus jadwal "${title}"?`,
      confirmText: 'Ya, Hapus Jadwal',
      cancelText: 'Batal',
      variant: 'danger',
    });

    if (ok) {
      showLoading('Menghapus jadwal...');
      const res = await apiFetch(`/schedules/${id}`, { method: 'DELETE' });
      hideLoading();
      if (res.success) loadData();
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
            <Shield className="w-6 h-6 text-hapkido-navy" />
            Jadwal Hari Latihan & Cabang Dojang
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Pengelolaan cabang Dojang Hapkido, isolasi data anggota per cabang, dan penentuan hari latihan rutin mingguan.
          </p>
        </div>

        {!isParent && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddDojangModal(true)}
              className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4 text-hapkido-red" />
              <span>Tambah Cabang Dojang</span>
            </button>
            <button
              onClick={() => setShowAddScheduleModal(true)}
              className="px-4 py-2.5 bg-hapkido-navy hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Atur Hari Latihan</span>
            </button>
          </div>
        )}
      </div>

      {/* Dojang Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {loading ? (
          <p className="text-xs text-slate-400 col-span-full text-center py-8">Memuat cabang Dojang...</p>
        ) : dojangs.length > 0 ? (
          dojangs.map((d) => (
            <div
              key={d.id}
              onClick={() => setSelectedDojangId(selectedDojangId === d.id ? '' : d.id)}
              className={`p-6 rounded-3xl border cursor-pointer transition space-y-4 ${
                selectedDojangId === d.id
                  ? 'bg-hapkido-navy text-white border-hapkido-navy shadow-md'
                  : 'bg-white text-slate-800 border-slate-200/80 hover:border-slate-300 shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`px-2.5 py-1 font-mono font-extrabold text-[10px] rounded uppercase ${
                    selectedDojangId === d.id ? 'bg-hapkido-red text-white' : 'bg-slate-100 text-hapkido-navy'
                  }`}
                >
                  {d.code}
                </span>
                {!isParent && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteDojang(d.id, d.name);
                    }}
                    className={`p-1.5 rounded-lg transition ${
                      selectedDojangId === d.id ? 'text-white/70 hover:bg-white/10' : 'text-slate-400 hover:bg-slate-100'
                    }`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div>
                <h3 className="font-extrabold text-base leading-tight">{d.name}</h3>
                <p className={`text-xs mt-1 ${selectedDojangId === d.id ? 'text-slate-200' : 'text-slate-500'}`}>
                  📍 {d.address || 'Alamat cabang belum diatur'}
                </p>
              </div>

              <div className={`pt-3 border-t text-xs flex items-center justify-between font-medium ${
                selectedDojangId === d.id ? 'border-white/10' : 'border-slate-100'
              }`}>
                <span className="flex items-center gap-1 font-bold">
                  <Users className="w-4 h-4" /> {d._count?.members || 0} Anggota Cabang
                </span>
                <span className="text-[11px] font-bold">
                  {d.headTrainerName || 'Sabum'}
                </span>
              </div>
            </div>
          ))
        ) : (
          <p className="text-xs text-slate-400 col-span-full text-center py-8">Belum ada cabang Dojang terdaftar.</p>
        )}
      </div>

      {/* Schedules Section per Dojang */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
            <Calendar className="w-5 h-5 text-hapkido-red" />
            Jadwal Hari Latihan Rutin
            {selectedDojangId && (
              <span className="text-xs font-bold text-hapkido-navy">
                ({dojangs.find((d) => d.id === selectedDojangId)?.name})
              </span>
            )}
          </h2>

          {selectedDojangId && (
            <button
              onClick={() => setSelectedDojangId('')}
              className="text-xs font-bold text-slate-500 hover:underline"
            >
              Tampilkan Semua Cabang
            </button>
          )}
        </div>

        <div className="space-y-3">
          {schedules.length > 0 ? (
            schedules.map((s) => (
              <div key={s.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 bg-hapkido-navy text-white font-extrabold text-xs rounded-lg uppercase">
                      HARI {s.dayOfWeek}
                    </span>
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-800 font-extrabold text-[10px] rounded uppercase">
                      {s.dojang?.name || 'Semua Dojang'}
                    </span>
                  </div>
                  <h3 className="text-sm font-extrabold text-slate-800 mt-1">{s.title}</h3>
                  <p className="text-xs text-slate-500 flex items-center gap-3">
                    <span>⏰ Jam {s.startTime || '16:00'} - {s.endTime || '18:00'} WIB</span>
                    <span>📍 {s.location}</span>
                  </p>
                  {s.notes && <p className="text-[11px] text-slate-400">Materi: {s.notes}</p>}
                </div>

                <div className="flex items-center gap-2 self-start sm:self-center">
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-extrabold text-xs rounded-full">
                    {s.status}
                  </span>
                  {!isParent && (
                    <button
                      onClick={() => handleDeleteSchedule(s.id, s.title)}
                      className="p-1.5 text-rose-500 hover:bg-rose-100 rounded-lg transition"
                      title="Hapus Jadwal Latihan"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-400 text-center py-6">Belum ada jadwal hari latihan terdaftar pada cabang ini.</p>
          )}
        </div>
      </div>

      {/* Modal Add Dojang Branch */}
      {showAddDojangModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-800 text-sm">Daftarkan Cabang Dojang Baru</h3>
              <button onClick={() => setShowAddDojangModal(false)} className="p-1 text-slate-400 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveDojang} className="space-y-3 text-xs">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kode Cabang *</label>
                  <input
                    type="text"
                    required
                    maxLength={5}
                    value={dojangForm.code}
                    onChange={(e) => setDojangForm({ ...dojangForm, code: e.target.value })}
                    placeholder="JKT / BDG"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold uppercase"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Nama Cabang Dojang *</label>
                  <input
                    type="text"
                    required
                    value={dojangForm.name}
                    onChange={(e) => setDojangForm({ ...dojangForm, name: e.target.value })}
                    placeholder="Misal: Dojang Hapkido Cabang Bandung"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Kepala Pelatih / Penanggung Jawab</label>
                <select
                  value={dojangForm.headTrainerName}
                  onChange={(e) => setDojangForm({ ...dojangForm, headTrainerName: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800"
                >
                  <option value="">-- Pilih Pelatih Terdaftar --</option>
                  {trainers.map((t) => (
                    <option key={t.id} value={t.user?.name || ''}>
                      {t.user?.name} {t.isHead ? '⭐ (Head Sabum)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">No HP Dojang</label>
                  <input
                    type="text"
                    value={dojangForm.phone}
                    onChange={(e) => setDojangForm({ ...dojangForm, phone: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email Cabang</label>
                  <input
                    type="email"
                    value={dojangForm.email}
                    onChange={(e) => setDojangForm({ ...dojangForm, email: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Alamat Dojang Cabang</label>
                <textarea
                  rows={2}
                  value={dojangForm.address}
                  onChange={(e) => setDojangForm({ ...dojangForm, address: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddDojangModal(false)}
                  className="px-3 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold"
                >
                  Batal
                </button>
                <button type="submit" className="px-4 py-2 bg-hapkido-navy text-white rounded-xl font-bold shadow-md">
                  Simpan Cabang Dojang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Add Schedule (Hari Latihan Rutin) */}
      {showAddScheduleModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-800 text-sm">Atur Jadwal Hari Latihan Rutin</h3>
              <button onClick={() => setShowAddScheduleModal(false)} className="p-1 text-slate-400 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveSchedule} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Pilih Cabang Dojang *</label>
                <select
                  required
                  value={scheduleForm.dojangId}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, dojangId: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                >
                  <option value="">-- Pilih Cabang Dojang --</option>
                  {dojangs.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Pelatih Instruktur (Penanggung Jawab)</label>
                <select
                  value={scheduleForm.trainerId}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, trainerId: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800"
                >
                  <option value="">-- Pilih Pelatih Instruktur --</option>
                  {trainers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.user?.name} {t.isHead ? '⭐ (Head Sabum)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Hari Latihan Rutin *</label>
                <select
                  value={scheduleForm.dayOfWeek}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, dayOfWeek: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-hapkido-navy"
                >
                  <option value="SENIN">SENIN</option>
                  <option value="SELASA">SELASA</option>
                  <option value="RABU">RABU</option>
                  <option value="KAMIS">KAMIS</option>
                  <option value="JUMAT">JUMAT</option>
                  <option value="SABTU">SABTU</option>
                  <option value="MINGGU">MINGGU</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Jam Mulai</label>
                  <input
                    type="time"
                    value={scheduleForm.startTime}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, startTime: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Jam Selesai</label>
                  <input
                    type="time"
                    value={scheduleForm.endTime}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, endTime: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Lokasi Dojang / Hall</label>
                <input
                  type="text"
                  value={scheduleForm.location}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, location: e.target.value })}
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
                  Simpan Hari Latihan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
