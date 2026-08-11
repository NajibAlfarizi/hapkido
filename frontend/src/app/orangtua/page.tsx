"use client";

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import {
  Users,
  Award,
  Calendar,
  CreditCard,
  Upload,
  CheckCircle,
  Clock,
  AlertCircle,
  Building,
  UserCheck,
  FileText,
  DollarSign,
  Plus
} from 'lucide-react';

export default function OrangTuaDashboard() {
  const [children, setChildren] = useState<any[]>([]);
  const [selectedChildIndex, setSelectedChildIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'profil' | 'absensi' | 'pembayaran' | 'jadwal'>('profil');
  const [duesTypes, setDuesTypes] = useState<any[]>([]);

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    duesTypeId: '',
    amount: '',
    proofUrl: '',
    notes: '',
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [resChild, resDues] = await Promise.all([
      apiFetch('/parent/children'),
      apiFetch('/dues/types'),
    ]);

    if (resChild.success) setChildren(resChild.data || []);
    if (resDues.success) setDuesTypes(resDues.data || []);
    setLoading(false);
  };

  const currentChild = children[selectedChildIndex] || null;

  const handleUploadPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentChild) return;

    setSubmitting(true);
    setMsg(null);

    const res = await apiFetch('/parent/payment-proof', {
      method: 'POST',
      body: JSON.stringify({
        memberId: currentChild.id,
        duesTypeId: uploadForm.duesTypeId,
        amount: uploadForm.amount,
        proofUrl: uploadForm.proofUrl,
        notes: uploadForm.notes,
      }),
    });

    setSubmitting(false);

    if (res.success) {
      setMsg({ type: 'success', text: res.message });
      setShowUploadModal(false);
      setUploadForm({ duesTypeId: '', amount: '', proofUrl: '', notes: '' });
      loadData();
    } else {
      setMsg({ type: 'error', text: res.message || 'Gagal mengunggah bukti bayar.' });
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500 font-semibold">
        Memuat data dashboard orang tua...
      </div>
    );
  }

  if (children.length === 0) {
    return (
      <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center max-w-lg mx-auto space-y-4">
        <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl mx-auto flex items-center justify-center">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-extrabold text-slate-800">Akun Belum Terhubung ke Data Anak</h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          Akun Anda telah disetujui, tetapi belum dihubungkan dengan data Anggota (anak). Silakan hubungi Admin Dojang untuk menghubungkan akun Anda dengan Nomor Induk Anggota (NIA) anak Anda.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Banner & Child Selector */}
      <div className="bg-gradient-to-r from-hapkido-navy via-slate-800 to-slate-900 p-6 sm:p-8 rounded-3xl text-white shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-extrabold tracking-wider uppercase text-hapkido-lightBlue bg-white/10 px-3 py-1 rounded-full">
              Portal Orang Tua / Wali
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold mt-2">Data Perkembangan & Iuran Anak</h1>
            <p className="text-xs text-slate-300 mt-1">Pantau kehadiran, sabuk, dan status pembayaran iuran anak Anda secara online.</p>
          </div>

          <button
            onClick={() => setShowUploadModal(true)}
            className="px-4 py-2.5 bg-hapkido-red hover:bg-rose-600 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-2 shrink-0 self-start sm:self-auto"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Bukti Bayar Iuran</span>
          </button>
        </div>

        {/* Child Selector Tabs */}
        {children.length > 1 && (
          <div className="pt-3 border-t border-white/10 flex items-center gap-2 overflow-x-auto">
            <span className="text-xs font-bold text-slate-300 shrink-0">Pilih Anak:</span>
            {children.map((child, idx) => (
              <button
                key={child.id}
                onClick={() => setSelectedChildIndex(idx)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                  selectedChildIndex === idx
                    ? 'bg-white text-hapkido-navy shadow-md'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {child.fullName} ({child.nia})
              </button>
            ))}
          </div>
        )}
      </div>

      {msg && (
        <div
          className={`p-4 rounded-2xl text-xs flex items-center gap-2 font-bold ${
            msg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {msg.type === 'success' ? <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" /> : <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />}
          <span>{msg.text}</span>
        </div>
      )}

      {/* Selected Child Header Card */}
      {currentChild && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center font-extrabold text-slate-500 text-xl overflow-hidden shrink-0">
              {currentChild.photoUrl ? (
                <img src={currentChild.photoUrl} alt={currentChild.fullName} className="w-full h-full object-cover" />
              ) : (
                currentChild.fullName.charAt(0)
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-extrabold text-slate-800">{currentChild.fullName}</h2>
                <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-extrabold rounded-full">
                  {currentChild.status}
                </span>
              </div>
              <p className="text-xs font-mono text-slate-500 mt-0.5">NIA: {currentChild.nia}</p>
              <p className="text-xs text-slate-600 mt-1 flex items-center gap-1 font-medium">
                <Building className="w-3.5 h-3.5 text-slate-400" />
                <span>{currentChild.dojang?.name || 'Dojang Pusat'}</span>
              </p>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 text-right self-stretch sm:self-auto flex sm:flex-col justify-between items-center sm:items-end">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Tingkatan Sabuk Saat Ini</span>
            <span className="text-sm font-extrabold text-hapkido-navy mt-0.5">
              {currentChild.beltHistory?.[0]?.beltLevel?.name || 'Sabuk Putih (Geup 10)'}
            </span>
          </div>
        </div>
      )}

      {/* Feature Tabs */}
      <div className="flex border-b border-slate-200 gap-2 overflow-x-auto">
        {[
          { id: 'profil', label: 'Profil Anak', icon: Users },
          { id: 'absensi', label: 'Riwayat Absensi', icon: UserCheck },
          { id: 'pembayaran', label: 'Riwayat Pembayaran', icon: CreditCard },
          { id: 'jadwal', label: 'Jadwal Latihan', icon: Calendar },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 font-bold text-xs transition shrink-0 ${
                isActive ? 'border-hapkido-navy text-hapkido-navy' : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {currentChild && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs">
          {activeTab === 'profil' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div className="space-y-3">
                <h3 className="font-extrabold text-slate-800 text-sm border-b pb-2">Informasi Pribadi</h3>
                <div className="grid grid-cols-3 py-1">
                  <span className="text-slate-400 font-medium">Nama Lengkap</span>
                  <span className="col-span-2 font-bold text-slate-800">{currentChild.fullName}</span>
                </div>
                <div className="grid grid-cols-3 py-1">
                  <span className="text-slate-400 font-medium">Jenis Kelamin</span>
                  <span className="col-span-2 font-semibold text-slate-700">{currentChild.gender === 'LAKILAKI' ? 'Laki-Laki' : 'Perempuan'}</span>
                </div>
                <div className="grid grid-cols-3 py-1">
                  <span className="text-slate-400 font-medium">Tempat, Tgl Lahir</span>
                  <span className="col-span-2 font-semibold text-slate-700">
                    {currentChild.birthPlace || '-'}, {currentChild.birthDate ? new Date(currentChild.birthDate).toLocaleDateString('id-ID') : '-'}
                  </span>
                </div>
                <div className="grid grid-cols-3 py-1">
                  <span className="text-slate-400 font-medium">Alamat</span>
                  <span className="col-span-2 font-semibold text-slate-700">{currentChild.address || '-'}</span>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-extrabold text-slate-800 text-sm border-b pb-2">Data Orang Tua / Kontak Emergency</h3>
                <div className="grid grid-cols-3 py-1">
                  <span className="text-slate-400 font-medium">Nama Orang Tua</span>
                  <span className="col-span-2 font-bold text-slate-800">{currentChild.parentName || '-'}</span>
                </div>
                <div className="grid grid-cols-3 py-1">
                  <span className="text-slate-400 font-medium">No. HP Orang Tua</span>
                  <span className="col-span-2 font-semibold text-slate-700">{currentChild.parentPhone || '-'}</span>
                </div>
                <div className="grid grid-cols-3 py-1">
                  <span className="text-slate-400 font-medium">Pekerjaan</span>
                  <span className="col-span-2 font-semibold text-slate-700">{currentChild.parentJob || '-'}</span>
                </div>
                <div className="grid grid-cols-3 py-1">
                  <span className="text-slate-400 font-medium">Kontak Darurat</span>
                  <span className="col-span-2 font-semibold text-slate-700">{currentChild.emergencyContact || '-'}</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'absensi' && (
            <div className="space-y-4">
              <h3 className="font-extrabold text-slate-800 text-sm">Riwayat Presensi Latihan Terbaru</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase">
                      <th className="p-3">Waktu Presensi</th>
                      <th className="p-3">Sesi / Latihan</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Catatan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {currentChild.attendance && currentChild.attendance.length > 0 ? (
                      currentChild.attendance.map((rec: any) => (
                        <tr key={rec.id} className="hover:bg-slate-50 transition">
                          <td className="p-3 font-semibold text-slate-700">
                            {new Date(rec.checkInTime).toLocaleDateString('id-ID')} &bull; {new Date(rec.checkInTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                          </td>
                          <td className="p-3 font-bold text-slate-800">{rec.session?.schedule?.title || 'Latihan Rutin'}</td>
                          <td className="p-3">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                                rec.status === 'HADIR'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : rec.status === 'TERLAMBAT'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {rec.status}
                            </span>
                          </td>
                          <td className="p-3 text-slate-500">{rec.notes || '-'}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="text-center py-6 text-slate-400">Belum ada riwayat presensi.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'pembayaran' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-slate-800 text-sm">Riwayat Pembayaran Iuran</h3>
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="px-3.5 py-2 bg-hapkido-red text-white rounded-xl text-xs font-bold hover:bg-rose-600 transition flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Bukti Transfer</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase">
                      <th className="p-3">No Invoice</th>
                      <th className="p-3">Jenis Iuran</th>
                      <th className="p-3">Jumlah</th>
                      <th className="p-3">Tgl Pembayaran</th>
                      <th className="p-3">Metode</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {currentChild.payments && currentChild.payments.length > 0 ? (
                      currentChild.payments.map((p: any) => (
                        <tr key={p.id} className="hover:bg-slate-50 transition">
                          <td className="p-3 font-mono font-bold text-slate-700">{p.invoiceNo}</td>
                          <td className="p-3 font-bold text-slate-800">{p.duesType?.name || 'Iuran Bulanan'}</td>
                          <td className="p-3 font-bold text-emerald-700">Rp {p.amount?.toLocaleString('id-ID')}</td>
                          <td className="p-3 font-semibold text-slate-600">{new Date(p.paymentDate).toLocaleDateString('id-ID')}</td>
                          <td className="p-3 font-medium text-slate-600">{p.paymentMethod}</td>
                          <td className="p-3">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                                p.status === 'LUNAS'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : p.status === 'BELUM_BAYAR'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {p.status === 'BELUM_BAYAR' ? 'MENUNGGU VERIFIKASI' : p.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="text-center py-6 text-slate-400">Belum ada riwayat pembayaran.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'jadwal' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-extrabold text-slate-800 text-sm">Jadwal Latihan Rutin ({currentChild.fullName})</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Cabang Dojang: <span className="font-bold text-slate-700">{currentChild.dojang?.name || 'Dojang Pusat'}</span>
                  </p>
                </div>
              </div>

              {/* Dojang Branch Info */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1.5 text-xs">
                <p className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Building className="w-4 h-4 text-hapkido-navy" />
                  <span>{currentChild.dojang?.name || 'Dojang Pusat'}</span>
                </p>
                <p className="text-slate-600 pl-5">📍 {currentChild.dojang?.address || 'Alamat cabang belum diatur'}</p>
                <p className="text-slate-600 pl-5">👤 Pelatih Kepala: <span className="font-semibold">{currentChild.dojang?.headTrainerName || 'Master Sabeum'}</span></p>
              </div>

              {/* Schedule List */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-700 text-xs uppercase tracking-wider">Hari & Jam Latihan Rutin Mingguan:</h4>
                {currentChild.dojang?.schedules && currentChild.dojang.schedules.length > 0 ? (
                  currentChild.dojang.schedules.map((s: any) => (
                    <div key={s.id} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 bg-hapkido-navy text-white font-extrabold text-[11px] rounded-lg uppercase">
                            HARI {s.dayOfWeek}
                          </span>
                          <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 font-extrabold text-[10px] rounded-full">
                            AKTIF
                          </span>
                        </div>
                        <h4 className="text-sm font-extrabold text-slate-800 mt-1">{s.title}</h4>
                        <p className="text-xs text-slate-600 flex items-center gap-3">
                          <span className="font-semibold text-hapkido-red">⏰ {s.startTime || '16:00'} - {s.endTime || '18:00'} WIB</span>
                          <span>📍 {s.location}</span>
                        </p>
                        {s.notes && <p className="text-[11px] text-slate-500">Materi: {s.notes}</p>}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 bg-slate-50 rounded-2xl text-center text-slate-400 text-xs">
                    Belum ada jadwal latihan rutin terdaftar untuk cabang dojang ini.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal Upload Bukti Transfer */}
      {showUploadModal && currentChild && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-800 text-sm">Upload Bukti Bayar Iuran ({currentChild.nickname || currentChild.fullName})</h3>
              <button onClick={() => setShowUploadModal(false)} className="text-slate-400 hover:text-slate-600 text-lg font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleUploadPayment} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Jenis Iuran *</label>
                <select
                  required
                  value={uploadForm.duesTypeId}
                  onChange={(e) => setUploadForm({ ...uploadForm, duesTypeId: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                >
                  <option value="">-- Pilih Jenis Iuran --</option>
                  {duesTypes.map((dt) => (
                    <option key={dt.id} value={dt.id}>
                      {dt.name} (Rp {dt.defaultAmount?.toLocaleString('id-ID')})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Jumlah Yang Dibayarkan (Rp) *</label>
                <input
                  type="number"
                  required
                  value={uploadForm.amount}
                  onChange={(e) => setUploadForm({ ...uploadForm, amount: e.target.value })}
                  placeholder="Contoh: 150000"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">URL / Link Foto Bukti Transfer (Opsional)</label>
                <input
                  type="url"
                  value={uploadForm.proofUrl}
                  onChange={(e) => setUploadForm({ ...uploadForm, proofUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Catatan Tambahan</label>
                <textarea
                  rows={2}
                  value={uploadForm.notes}
                  onChange={(e) => setUploadForm({ ...uploadForm, notes: e.target.value })}
                  placeholder="Misal: Pembayaran Iuran Bulan Agustus 2026 via BCA"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-3 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-hapkido-navy text-white rounded-xl font-bold shadow-md hover:bg-slate-800 transition disabled:opacity-50"
                >
                  {submitting ? 'Mengirim...' : 'Kirim Bukti Pembayaran'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
