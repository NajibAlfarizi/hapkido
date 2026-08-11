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
  AlertTriangle,
  ChevronRight,
  Shield,
  Phone
} from 'lucide-react';

export default function OrangTuaDashboard() {
  const [children, setChildren] = useState<any[]>([]);
  const [selectedChildIndex, setSelectedChildIndex] = useState(0);
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

  // Compute Current Month Dues Status
  const currentMonthName = new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  const now = new Date();
  const currentMonthIndex = now.getMonth();
  const currentYear = now.getFullYear();

  const thisMonthPayments = currentChild?.payments?.filter((p: any) => {
    if (!p.paymentDate) return false;
    const d = new Date(p.paymentDate);
    return d.getMonth() === currentMonthIndex && d.getFullYear() === currentYear;
  }) || [];

  const isLunas = thisMonthPayments.some((p: any) => p.status === 'LUNAS');
  const isPendingVerification = thisMonthPayments.some((p: any) => p.status === 'BELUM_BAYAR');

  let duesStatusType: 'LUNAS' | 'MENUNGGU' | 'BELUM';
  if (isLunas) {
    duesStatusType = 'LUNAS';
  } else if (isPendingVerification) {
    duesStatusType = 'MENUNGGU';
  } else {
    duesStatusType = 'BELUM';
  }

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
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-10 h-10 border-4 border-hapkido-red border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold text-slate-500">Memuat dashboard orang tua...</p>
      </div>
    );
  }

  if (children.length === 0) {
    return (
      <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center max-w-lg mx-auto space-y-4 shadow-sm">
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
      {/* Top Banner & Child Switcher */}
      <div className="bg-gradient-to-r from-hapkido-navy via-slate-800 to-slate-900 p-6 sm:p-8 rounded-3xl text-white shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-extrabold tracking-wider uppercase text-hapkido-lightBlue bg-white/10 px-3 py-1 rounded-full">
              Portal Orang Tua / Wali
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold mt-2">Informasi Perkembangan & Iuran Anak</h1>
            <p className="text-xs text-slate-300 mt-1">Pantau status iuran bulanan, kehadiran latihan, dan tingkat sabuk anak Anda.</p>
          </div>

          <button
            onClick={() => {
              // Default to Monthly Dues type if available
              const defaultDues = duesTypes.find((d) => d.category === 'BULANAN');
              setUploadForm({
                duesTypeId: defaultDues?.id || '',
                amount: defaultDues?.defaultAmount ? String(defaultDues.defaultAmount) : '',
                proofUrl: '',
                notes: `Iuran Bulan ${currentMonthName}`,
              });
              setShowUploadModal(true);
            }}
            className="px-4 py-2.5 bg-hapkido-red hover:bg-rose-600 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-2 shrink-0 self-start sm:self-auto"
          >
            <Upload className="w-4 h-4" />
            <span>Bayar / Upload Bukti Transfer</span>
          </button>
        </div>

        {/* Multi-Child Selector */}
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

      {currentChild && (
        <>
          {/* Billing Alert Banner (Highlight Monthly Dues Status) */}
          <div
            className={`p-5 rounded-3xl border shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
              duesStatusType === 'LUNAS'
                ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                : duesStatusType === 'MENUNGGU'
                ? 'bg-amber-50/80 border-amber-200 text-amber-900'
                : 'bg-rose-50/80 border-rose-200 text-rose-900'
            }`}
          >
            <div className="flex items-start gap-3.5">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                  duesStatusType === 'LUNAS'
                    ? 'bg-emerald-500 text-white'
                    : duesStatusType === 'MENUNGGU'
                    ? 'bg-amber-500 text-white'
                    : 'bg-rose-500 text-white'
                }`}
              >
                {duesStatusType === 'LUNAS' && <CheckCircle className="w-6 h-6" />}
                {duesStatusType === 'MENUNGGU' && <Clock className="w-6 h-6 animate-pulse" />}
                {duesStatusType === 'BELUM' && <AlertTriangle className="w-6 h-6 animate-bounce" />}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-black/10">
                    Status Iuran Bulanan ({currentMonthName})
                  </span>
                </div>
                <h3 className="font-extrabold text-base mt-0.5">
                  {duesStatusType === 'LUNAS' && `Iuran Bulanan ${currentChild.nickname || currentChild.fullName} Sudah Lunas`}
                  {duesStatusType === 'MENUNGGU' && `Bukti Transfer Iuran ${currentMonthName} Menunggu Verifikasi Admin`}
                  {duesStatusType === 'BELUM' && `Iuran Bulanan (${currentMonthName}) Belum Dibayar`}
                </h3>
                <p className="text-xs mt-1 opacity-90">
                  {duesStatusType === 'LUNAS' && `Terima kasih! Iuran bulanan ${currentChild.fullName} untuk bulan ${currentMonthName} telah terverifikasi LUNAS.`}
                  {duesStatusType === 'MENUNGGU' && `Bukti pembayaran telah berhasil dikirim dan sedang dalam verifikasi oleh Admin Dojang.`}
                  {duesStatusType === 'BELUM' && `Mohon segera melakukan pembayaran iuran bulanan tepat waktu untuk mendukung kelancaran kegiatan latihan.`}
                </p>
              </div>
            </div>

            {duesStatusType !== 'LUNAS' && (
              <button
                onClick={() => {
                  const defaultDues = duesTypes.find((d) => d.category === 'BULANAN');
                  setUploadForm({
                    duesTypeId: defaultDues?.id || '',
                    amount: defaultDues?.defaultAmount ? String(defaultDues.defaultAmount) : '',
                    proofUrl: '',
                    notes: `Iuran Bulan ${currentMonthName}`,
                  });
                  setShowUploadModal(true);
                }}
                className="px-4 py-2.5 bg-hapkido-navy hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-md transition shrink-0 self-stretch sm:self-auto text-center"
              >
                Upload Bukti Transfer Sekarang
              </button>
            )}
          </div>

          {/* Child Identity & Belt Card */}
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

          {/* Main Dashboard Layout (2 Columns) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Main Section (2 Cols) */}
            <div className="lg:col-span-2 space-y-6">
              {/* Jadwal Latihan Rutin */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-hapkido-red" />
                    Jadwal Hari & Jam Latihan Rutin
                  </h3>
                  <span className="text-xs font-bold text-slate-500">{currentChild.dojang?.name}</span>
                </div>

                <div className="space-y-3">
                  {currentChild.dojang?.schedules && currentChild.dojang.schedules.length > 0 ? (
                    currentChild.dojang.schedules.map((s: any) => (
                      <div key={s.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-1 bg-hapkido-navy text-white font-extrabold text-xs rounded-lg uppercase">
                              HARI {s.dayOfWeek}
                            </span>
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-extrabold text-[10px] rounded-full">
                              AKTIF
                            </span>
                          </div>
                          <h4 className="text-sm font-extrabold text-slate-800 mt-1">{s.title}</h4>
                          <p className="text-xs text-slate-600 flex items-center gap-3">
                            <span className="font-bold text-hapkido-red">⏰ Jam {s.startTime || '16:00'} - {s.endTime || '18:00'} WIB</span>
                            <span>📍 {s.location}</span>
                          </p>
                          {s.notes && <p className="text-[11px] text-slate-400">Materi: {s.notes}</p>}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 text-center py-6">Belum ada jadwal latihan terdaftar untuk cabang ini.</p>
                  )}
                </div>
              </div>

              {/* Riwayat Absensi Terbaru */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-emerald-600" />
                    Riwayat Kehadiran Presensi Terbaru
                  </h3>
                </div>

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
                        currentChild.attendance.slice(0, 5).map((rec: any) => (
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

              {/* Riwayat Pembayaran Terbaru */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-hapkido-navy" />
                    Riwayat Pembayaran & Bukti Transfer
                  </h3>
                  <button
                    onClick={() => {
                      const defaultDues = duesTypes.find((d) => d.category === 'BULANAN');
                      setUploadForm({
                        duesTypeId: defaultDues?.id || '',
                        amount: defaultDues?.defaultAmount ? String(defaultDues.defaultAmount) : '',
                        proofUrl: '',
                        notes: `Iuran Bulan ${currentMonthName}`,
                      });
                      setShowUploadModal(true);
                    }}
                    className="px-3 py-1.5 bg-hapkido-red text-white text-xs font-bold rounded-xl shadow-xs hover:bg-rose-600 transition flex items-center gap-1"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Bukti Bayar</span>
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
            </div>

            {/* Right Sidebar Section (1 Col) */}
            <div className="space-y-6">
              {/* Info Dojang & Kontak Pelatih */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
                <h3 className="font-extrabold text-slate-800 text-sm border-b border-slate-100 pb-3 flex items-center gap-2">
                  <Building className="w-4 h-4 text-hapkido-navy" />
                  Informasi Cabang Dojang
                </h3>

                <div className="space-y-2.5 text-xs">
                  <div>
                    <span className="text-slate-400 font-semibold block">Cabang Dojang:</span>
                    <span className="font-extrabold text-slate-800">{currentChild.dojang?.name || 'Dojang Pusat'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold block">Alamat Dojang:</span>
                    <span className="font-medium text-slate-700">{currentChild.dojang?.address || 'Jl. Perguruan Hapkido No. 1'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold block">Pelatih Kepala:</span>
                    <span className="font-bold text-hapkido-navy">{currentChild.dojang?.headTrainerName || 'Master Sabeum'}</span>
                  </div>
                </div>
              </div>

              {/* Information Tarif Iuran Standard */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
                <h3 className="font-extrabold text-slate-800 text-sm border-b border-slate-100 pb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-hapkido-red" />
                  Daftar Tarif Iuran Dojang
                </h3>

                <div className="space-y-2 text-xs">
                  {duesTypes.map((dt) => (
                    <div key={dt.id} className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
                      <div>
                        <p className="font-bold text-slate-800">{dt.name}</p>
                        <p className="text-[10px] text-slate-400">{dt.category}</p>
                      </div>
                      <span className="font-extrabold text-emerald-700">
                        Rp {dt.defaultAmount?.toLocaleString('id-ID')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Data Profil Anak Summary */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-3 text-xs">
                <h3 className="font-extrabold text-slate-800 text-sm border-b border-slate-100 pb-3">
                  Detail Profil Singkat Anak
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-400 font-medium">Jenis Kelamin:</span>
                    <span className="font-semibold text-slate-700">{currentChild.gender === 'LAKILAKI' ? 'Laki-Laki' : 'Perempuan'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-400 font-medium">Tempat, Tgl Lahir:</span>
                    <span className="font-semibold text-slate-700">
                      {currentChild.birthPlace || '-'}, {currentChild.birthDate ? new Date(currentChild.birthDate).toLocaleDateString('id-ID') : '-'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-400 font-medium">Nama Wali:</span>
                    <span className="font-bold text-slate-800">{currentChild.parentName || '-'}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400 font-medium">No. HP Wali:</span>
                    <span className="font-semibold text-slate-700">{currentChild.parentPhone || '-'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Modal Upload Bukti Transfer */}
      {showUploadModal && currentChild && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-800 text-sm">Upload Bukti Transfer ({currentChild.nickname || currentChild.fullName})</h3>
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
                  onChange={(e) => {
                    const selectedDues = duesTypes.find((d) => d.id === e.target.value);
                    setUploadForm({
                      ...uploadForm,
                      duesTypeId: e.target.value,
                      amount: selectedDues?.defaultAmount ? String(selectedDues.defaultAmount) : uploadForm.amount,
                    });
                  }}
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
                  placeholder="Misal: Pembayaran Iuran Bulan Agustus 2026 via Transfer Bank"
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
