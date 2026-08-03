"use client";

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { useConfirm, useLoading } from '@/context/UiContext';
import { Award, Plus, Calendar, CheckCircle, X, Trash2, Pencil } from 'lucide-react';

export default function SabukPage() {
  const confirm = useConfirm();
  const { showLoading, hideLoading } = useLoading();
  const [beltLevels, setBeltLevels] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [showAddBeltModal, setShowAddBeltModal] = useState(false);
  const [editingBeltId, setEditingBeltId] = useState<string | null>(null);
  const [showAddExamModal, setShowAddExamModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);

  const [selectedExamId, setSelectedExamId] = useState('');

  // Form states
  const [beltForm, setBeltForm] = useState({
    name: '',
    geupRank: 8,
    badgeColor: '#22C55E',
    examFeeDefault: 150000,
    requirements: '',
    description: '',
  });

  const [examForm, setExamForm] = useState({
    title: '',
    date: '',
    location: 'Dojang Utama Hall A',
    examiner: 'Master Hapkido Indonesia',
    feeAmount: 125000,
    description: '',
  });

  const [resultForm, setResultForm] = useState({
    memberId: '',
    targetBeltId: '',
    score: 85,
    result: 'LULUS',
    notes: '',
  });

  const loadData = async () => {
    setLoading(true);
    const [resBelts, resExams, resMem] = await Promise.all([
      apiFetch('/belts'),
      apiFetch('/belts/exams'),
      apiFetch('/members?status=AKTIF'),
    ]);

    if (resBelts.success) setBeltLevels(resBelts.data);
    if (resExams.success) setExams(resExams.data);
    if (resMem.success) setMembers(resMem.data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAddBelt = () => {
    setEditingBeltId(null);
    setBeltForm({
      name: '',
      geupRank: 8,
      badgeColor: '#22C55E',
      examFeeDefault: 150000,
      requirements: '',
      description: '',
    });
    setShowAddBeltModal(true);
  };

  const handleOpenEditBelt = (b: any) => {
    setEditingBeltId(b.id);
    setBeltForm({
      name: b.name || '',
      geupRank: b.geupRank ?? 8,
      badgeColor: b.badgeColor || '#22C55E',
      examFeeDefault: b.examFeeDefault || 150000,
      requirements: b.requirements || '',
      description: b.description || '',
    });
    setShowAddBeltModal(true);
  };

  const handleSaveBelt = async (e: React.FormEvent) => {
    e.preventDefault();
    showLoading(editingBeltId ? 'Memperbarui tingkatan sabuk...' : 'Menyimpan tingkatan sabuk...');

    const endpoint = editingBeltId ? `/belts/${editingBeltId}` : '/belts';
    const method = editingBeltId ? 'PUT' : 'POST';

    const res = await apiFetch(endpoint, {
      method,
      body: JSON.stringify(beltForm),
    });
    hideLoading();

    if (res.success) {
      setShowAddBeltModal(false);
      setEditingBeltId(null);
      setBeltForm({
        name: '',
        geupRank: 8,
        badgeColor: '#22C55E',
        examFeeDefault: 150000,
        requirements: '',
        description: '',
      });
      loadData();
    } else {
      alert(res.message || 'Gagal menyimpan tingkatan sabuk.');
    }
  };

  const handleDeleteBelt = async (id: string, name: string) => {
    const ok = await confirm({
      title: 'Hapus Tingkatan Sabuk',
      message: `Apakah Anda yakin ingin menghapus tingkatan ${name}?`,
      confirmText: 'Ya, Hapus Sabuk',
      cancelText: 'Batal',
      variant: 'danger',
    });

    if (ok) {
      showLoading('Menghapus tingkatan sabuk...');
      const res = await apiFetch(`/belts/${id}`, { method: 'DELETE' });
      hideLoading();
      if (res.success) {
        loadData();
      } else {
        alert(res.message || 'Gagal menghapus tingkatan sabuk.');
      }
    }
  };

  const handleSaveExam = async (e: React.FormEvent) => {
    e.preventDefault();
    showLoading('Menyimpan jadwal ujian sabuk...');
    const res = await apiFetch('/belts/exams', {
      method: 'POST',
      body: JSON.stringify(examForm),
    });
    hideLoading();

    if (res.success) {
      setShowAddExamModal(false);
      loadData();
    } else {
      alert(res.message || 'Gagal menyimpan ujian.');
    }
  };

  const handleSubmitResult = async (e: React.FormEvent) => {
    e.preventDefault();
    showLoading('Menyimpan hasil ujian sabuk...');
    const res = await apiFetch('/belts/results', {
      method: 'POST',
      body: JSON.stringify({
        beltExamId: selectedExamId,
        ...resultForm,
      }),
    });
    hideLoading();

    if (res.success) {
      setShowResultModal(false);
      loadData();
    } else {
      alert(res.message || 'Gagal menyimpan hasil ujian.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
            <Award className="w-6 h-6 text-hapkido-red" />
            Tingkatan Sabuk & Ujian Kenaikan
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Kurikulum tingkatan Geup hingga Dan, kelola & edit tingkatan sabuk oleh Admin, pendaftaran ujian & sertifikat.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenAddBelt}
            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 text-hapkido-red" />
            <span>Tambah Tingkatan Sabuk</span>
          </button>
          <button
            onClick={() => setShowAddExamModal(true)}
            className="px-4 py-2.5 bg-hapkido-navy hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Jadwalkan Ujian Sabuk</span>
          </button>
        </div>
      </div>

      {/* Grid: Belt Hierarchy & Exam Events */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Belt Hierarchy List */}
        <div className="lg:col-span-1 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="font-extrabold text-slate-800 text-base">Hirarki Sabuk Hapkido ({beltLevels.length})</h2>
          </div>

            {beltLevels.map((b) => {
              const isDarkBadge =
                b.geupRank <= 0 ||
                ['#0F172A', '#991B1B', '#78350F', '#000000', '#1E293B'].includes((b.badgeColor || '').toUpperCase());
              return (
                <div key={b.id} className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 space-y-1.5 hover:bg-slate-100/60 transition">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold shadow-2xs leading-tight"
                      style={{
                        backgroundColor: b.badgeColor || '#e2e8f0',
                        color: isDarkBadge ? '#ffffff' : '#0f172a',
                      }}
                    >
                      <Award className="w-3.5 h-3.5 shrink-0" />
                      {b.name}
                    </span>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[10px] font-extrabold text-slate-500">
                      Rp {(b.examFeeDefault || 0).toLocaleString('id-ID')}
                    </span>
                    <button
                      onClick={() => handleOpenEditBelt(b)}
                      title="Edit Sabuk"
                      className="p-1 text-slate-500 hover:text-hapkido-navy hover:bg-slate-200 rounded transition"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteBelt(b.id, b.name)}
                      title="Hapus Sabuk"
                      className="p-1 text-rose-500 hover:bg-rose-100 rounded transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                {b.requirements && <p className="text-[11px] text-slate-600 font-medium leading-relaxed">{b.requirements}</p>}
              </div>
            ))}
          </div>
        </div>

        {/* Exams & Input Results */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <h2 className="font-extrabold text-slate-800 text-base border-b border-slate-100 pb-3">Agendakan & Hasil Ujian Sabuk</h2>

          <div className="space-y-4">
            {exams.length > 0 ? (
              exams.map((ex) => (
                <div key={ex.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 pb-3">
                    <div>
                      <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 font-extrabold text-[10px] rounded uppercase">
                        {ex.status}
                      </span>
                      <h3 className="font-extrabold text-slate-800 text-base mt-1">{ex.title}</h3>
                      <p className="text-xs text-slate-500">
                        📅 {new Date(ex.date).toLocaleDateString('id-ID')} &bull; 📍 {ex.location} &bull; Penguji: {ex.examiner}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedExamId(ex.id);
                        setShowResultModal(true);
                      }}
                      className="px-3.5 py-2 bg-hapkido-red hover:bg-rose-600 text-white font-bold rounded-xl text-xs shadow-xs transition flex items-center justify-center gap-1.5 self-start sm:self-center"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Input Hasil Ujian</span>
                    </button>
                  </div>

                  {/* Exam Results Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="text-[10px] font-bold text-slate-400 uppercase border-b border-slate-200">
                          <th className="py-2">Peserta</th>
                          <th className="py-2">Sabuk Target</th>
                          <th className="py-2">Nilai</th>
                          <th className="py-2">Hasil</th>
                          <th className="py-2">No. Sertifikat</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {ex.results && ex.results.length > 0 ? (
                          ex.results.map((res: any) => (
                            <tr key={res.id}>
                              <td className="py-2 font-bold text-slate-800">{res.member?.fullName}</td>
                              <td className="py-2 font-semibold text-slate-600">{res.targetBelt?.name}</td>
                              <td className="py-2 font-bold text-blue-700">{res.score || '-'}</td>
                              <td className="py-2">
                                <span
                                  className={`inline-block px-2 py-0.5 rounded text-[10px] font-extrabold ${
                                    res.result === 'LULUS' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                                  }`}
                                >
                                  {res.result}
                                </span>
                              </td>
                              <td className="py-2 font-mono text-[10px] text-slate-500">{res.certificateNo || '-'}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={5} className="py-4 text-center text-slate-400">
                              Belum ada nilai ujian yang diinput.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 text-center py-6">Belum ada agenda ujian kenaikan sabuk.</p>
            )}
          </div>
        </div>
      </div>

      {/* Modal Add / Edit Belt Level */}
      {showAddBeltModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-800 text-sm">
                {editingBeltId ? 'Edit Tingkatan Sabuk' : 'Tambah Tingkatan Sabuk Baru'}
              </h3>
              <button onClick={() => setShowAddBeltModal(false)} className="p-1 text-slate-400 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveBelt} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Tingkatan Sabuk *</label>
                <input
                  type="text"
                  required
                  value={beltForm.name}
                  onChange={(e) => setBeltForm({ ...beltForm, name: e.target.value })}
                  placeholder="Contoh: Sabuk Hijau Strip (Geup 7)"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Peringkat (Geup/Dan) *</label>
                  <input
                    type="number"
                    required
                    value={beltForm.geupRank}
                    onChange={(e) => setBeltForm({ ...beltForm, geupRank: Number(e.target.value) })}
                    placeholder="10=Putih, 9=Kuning, 0=Dan 1"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Warna Badge (Hex/Color)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={beltForm.badgeColor}
                      onChange={(e) => setBeltForm({ ...beltForm, badgeColor: e.target.value })}
                      className="w-10 h-9 p-0.5 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer"
                    />
                    <input
                      type="text"
                      value={beltForm.badgeColor}
                      onChange={(e) => setBeltForm({ ...beltForm, badgeColor: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px] font-semibold"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Biaya Ujian Default (Rp)</label>
                <input
                  type="number"
                  value={beltForm.examFeeDefault}
                  onChange={(e) => setBeltForm({ ...beltForm, examFeeDefault: Number(e.target.value) })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Syarat Teknik & Kurikulum</label>
                <textarea
                  rows={3}
                  value={beltForm.requirements}
                  onChange={(e) => setBeltForm({ ...beltForm, requirements: e.target.value })}
                  placeholder="Misal: Teknik Nakbop Samping, Hoshinsool 1-5, Hyung Dan 1"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddBeltModal(false)}
                  className="px-3 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold"
                >
                  Batal
                </button>
                <button type="submit" className="px-4 py-2 bg-hapkido-navy text-white rounded-xl font-bold shadow-md">
                  {editingBeltId ? 'Perbarui Sabuk' : 'Simpan Tingkatan Sabuk'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Add Exam */}
      {showAddExamModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-800 text-sm">Buat Jadwal Ujian Kenaikan Sabuk</h3>
              <button onClick={() => setShowAddExamModal(false)} className="p-1 text-slate-400 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveExam} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Judul Ujian *</label>
                <input
                  type="text"
                  required
                  value={examForm.title}
                  onChange={(e) => setExamForm({ ...examForm, title: e.target.value })}
                  placeholder="Ujian Kenaikan Sabuk Geup Periode Agustus"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tanggal Ujian *</label>
                  <input
                    type="date"
                    required
                    value={examForm.date}
                    onChange={(e) => setExamForm({ ...examForm, date: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Biaya Pendaftaran</label>
                  <input
                    type="number"
                    value={examForm.feeAmount}
                    onChange={(e) => setExamForm({ ...examForm, feeAmount: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Lokasi Ujian</label>
                <input
                  type="text"
                  value={examForm.location}
                  onChange={(e) => setExamForm({ ...examForm, location: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Penguji (Sabum Nim)</label>
                <input
                  type="text"
                  value={examForm.examiner}
                  onChange={(e) => setExamForm({ ...examForm, examiner: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddExamModal(false)}
                  className="px-3 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold"
                >
                  Batal
                </button>
                <button type="submit" className="px-4 py-2 bg-hapkido-navy text-white rounded-xl font-bold shadow-md">
                  Simpan Jadwal Ujian
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Input Result */}
      {showResultModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-800 text-sm">Input Nilai & Hasil Ujian</h3>
              <button onClick={() => setShowResultModal(false)} className="p-1 text-slate-400 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmitResult} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Pilih Peserta Anggota *</label>
                <select
                  required
                  value={resultForm.memberId}
                  onChange={(e) => setResultForm({ ...resultForm, memberId: e.target.value })}
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
                <label className="block font-bold text-slate-700 mb-1">Target Kenaikan Sabuk *</label>
                <select
                  required
                  value={resultForm.targetBeltId}
                  onChange={(e) => setResultForm({ ...resultForm, targetBeltId: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                >
                  <option value="">-- Pilih Sabuk Target --</option>
                  {beltLevels.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nilai Ujian (0-100)</label>
                  <input
                    type="number"
                    value={resultForm.score}
                    onChange={(e) => setResultForm({ ...resultForm, score: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Hasil Kelulusan *</label>
                  <select
                    value={resultForm.result}
                    onChange={(e) => setResultForm({ ...resultForm, result: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  >
                    <option value="LULUS">LULUS</option>
                    <option value="TIDAK_LULUS">TIDAK LULUS</option>
                    <option value="MENUNGGU">MENUNGGU</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowResultModal(false)}
                  className="px-3 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold"
                >
                  Batal
                </button>
                <button type="submit" className="px-4 py-2 bg-hapkido-red text-white rounded-xl font-bold shadow-md">
                  Simpan Hasil Ujian
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
