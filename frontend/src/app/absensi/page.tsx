"use client";

import { useState, useEffect, useRef } from 'react';
import { apiFetch } from '@/lib/api';
import {
  QrCode,
  Camera,
  UserCheck,
  Clock,
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
  XCircle,
  Plus,
  Play,
  StopCircle,
  Search
} from 'lucide-react';

export default function AbsensiPage() {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [selectedScheduleId, setSelectedScheduleId] = useState('');
  const [currentSession, setCurrentSession] = useState<any>(null);

  const [members, setMembers] = useState<any[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [attendanceStatus, setAttendanceStatus] = useState('HADIR');
  const [attendanceNotes, setAttendanceNotes] = useState('');

  // Scanner state
  const [scannerActive, setScannerActive] = useState(false);
  const [scanResultMsg, setScanResultMsg] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const scannerRef = useRef<any>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSchedulesAndMembers();
  }, []);

  const loadSchedulesAndMembers = async () => {
    setLoading(true);
    const [resSch, resMem] = await Promise.all([
      apiFetch('/schedules'),
      apiFetch('/members?status=AKTIF'),
    ]);

    if (resSch.success) setSchedules(resSch.data);
    if (resMem.success) setMembers(resMem.data);
    setLoading(false);
  };

  const handleOpenSession = async () => {
    if (!selectedScheduleId) {
      alert('Pilih jadwal latihan terlebih dahulu.');
      return;
    }

    const res = await apiFetch('/attendance/session/open', {
      method: 'POST',
      body: JSON.stringify({ scheduleId: selectedScheduleId }),
    });

    if (res.success) {
      loadSessionDetail(res.data.id);
    } else {
      alert(res.message || 'Gagal membuka sesi absensi.');
    }
  };

  const loadSessionDetail = async (sessionId: string) => {
    const res = await apiFetch(`/attendance/session/${sessionId}`);
    if (res.success) {
      setCurrentSession(res.data);
    }
  };

  // Start Camera HTML5 QR Scanner
  const startCameraScanner = async () => {
    setScannerActive(true);
    setScanResultMsg(null);

    // Import html5-qrcode dynamically
    const { Html5QrcodeScanner } = await import('html5-qrcode');

    setTimeout(() => {
      if (!scannerRef.current) {
        const scanner = new Html5QrcodeScanner(
          'qr-reader-container',
          { fps: 10, qrbox: { width: 250, height: 250 } },
          /* verbose= */ false
        );

        scanner.render(
          async (decodedText) => {
            handleScanSuccess(decodedText);
          },
          (error) => {
            // silent camera scan loop
          }
        );

        scannerRef.current = scanner;
      }
    }, 300);
  };

  const stopCameraScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.clear().catch(() => {});
      scannerRef.current = null;
    }
    setScannerActive(false);
  };

  const handleScanSuccess = async (qrData: string) => {
    if (!currentSession) {
      alert('Buka sesi absensi terlebih dahulu.');
      return;
    }

    const res = await apiFetch('/attendance/scan', {
      method: 'POST',
      body: JSON.stringify({
        sessionId: currentSession.id,
        qrData,
        status: attendanceStatus,
        notes: attendanceNotes,
      }),
    });

    if (res.success) {
      setScanResultMsg({ type: 'success', msg: res.message });
      loadSessionDetail(currentSession.id);
    } else {
      setScanResultMsg({ type: 'error', msg: res.message });
    }
  };

  const handleManualCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSession || !selectedMemberId) {
      alert('Pilih anggota terlebih dahulu.');
      return;
    }

    const res = await apiFetch('/attendance/manual', {
      method: 'POST',
      body: JSON.stringify({
        sessionId: currentSession.id,
        memberId: selectedMemberId,
        status: attendanceStatus,
        notes: attendanceNotes,
      }),
    });

    if (res.success) {
      setScanResultMsg({ type: 'success', msg: res.message });
      loadSessionDetail(currentSession.id);
    } else {
      setScanResultMsg({ type: 'error', msg: res.message });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
            <QrCode className="w-6 h-6 text-hapkido-red" />
            Sesi & Presensi QR Code
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Buka sesi latihan, lakukan Scan QR Kartu Anggota menggunakan kamera HP/Laptop, atau input presensi manual.
          </p>
        </div>

        {currentSession && (
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-extrabold flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-emerald-600" /> Sesi AKTIF Terbuka
            </span>
          </div>
        )}
      </div>

      {/* Step 1: Select Schedule & Open Session */}
      {!currentSession ? (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-4 max-w-xl mx-auto text-center">
          <div className="w-14 h-14 bg-hapkido-navy/10 text-hapkido-navy rounded-2xl mx-auto flex items-center justify-center">
            <Play className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-extrabold text-slate-800">Buka Sesi Latihan Hari Ini</h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Pilih jadwal latihan yang akan dilaksanakan untuk mulai menerima scan QR Code presensi peserta.
          </p>

          <div className="space-y-3 pt-2 text-left">
            <label className="block text-xs font-bold text-slate-700">Pilih Jadwal Latihan:</label>
            <select
              value={selectedScheduleId}
              onChange={(e) => setSelectedScheduleId(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:ring-2 focus:ring-hapkido-navy"
            >
              <option value="">-- Pilih Jadwal Latihan --</option>
              {schedules.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title} ({new Date(s.date).toLocaleDateString('id-ID')} &bull; {s.location})
                </option>
              ))}
            </select>

            <button
              onClick={handleOpenSession}
              disabled={!selectedScheduleId}
              className="w-full py-3 bg-gradient-to-r from-hapkido-navy to-slate-800 text-white rounded-xl text-xs font-bold shadow-md hover:opacity-95 transition disabled:opacity-50"
            >
              Mulai Sesi Absensi Latihan
            </button>
          </div>
        </div>
      ) : (
        /* Step 2: Active Session Attendance Console */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Scanner & Form Console */}
          <div className="lg:col-span-1 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <span className="text-[10px] font-extrabold uppercase text-hapkido-red">Sesi Latihan Terbuka</span>
              <h2 className="font-extrabold text-slate-800 text-base">{currentSession.schedule?.title}</h2>
              <p className="text-xs text-slate-500 mt-0.5">📍 {currentSession.schedule?.location}</p>
            </div>

            {/* Scan Status Feedback Alert */}
            {scanResultMsg && (
              <div
                className={`p-3.5 rounded-xl text-xs flex items-center gap-2 font-bold ${
                  scanResultMsg.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {scanResultMsg.type === 'success' ? (
                  <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                )}
                <span>{scanResultMsg.msg}</span>
              </div>
            )}

            {/* Attendance Status Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">Status Presensi:</label>
              <div className="grid grid-cols-3 gap-1.5">
                {['HADIR', 'TERLAMBAT', 'IZIN', 'SAKIT', 'ALPHA'].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setAttendanceStatus(st)}
                    className={`py-1.5 text-[10px] font-extrabold rounded-lg transition border ${
                      attendanceStatus === st
                        ? 'bg-hapkido-navy text-white border-hapkido-navy shadow-xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Camera Scan Button / Viewport */}
            <div className="space-y-3 pt-2">
              {!scannerActive ? (
                <button
                  onClick={startCameraScanner}
                  className="w-full py-3 bg-hapkido-red hover:bg-rose-600 text-white font-bold rounded-xl text-xs shadow-md transition flex items-center justify-center gap-2"
                >
                  <Camera className="w-4 h-4" />
                  <span>Aktifkan Kamera Scan QR</span>
                </button>
              ) : (
                <div className="space-y-2">
                  <div id="qr-reader-container" className="w-full overflow-hidden rounded-2xl border border-slate-200"></div>
                  <button
                    onClick={stopCameraScanner}
                    className="w-full py-2 bg-slate-200 text-slate-700 font-bold rounded-xl text-xs hover:bg-slate-300 transition"
                  >
                    Matikan Kamera
                  </button>
                </div>
              )}
            </div>

            {/* Manual Check-in Option */}
            <form onSubmit={handleManualCheckIn} className="border-t border-slate-100 pt-4 space-y-3">
              <h3 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Atau Presensi Manual:</h3>
              <select
                value={selectedMemberId}
                onChange={(e) => setSelectedMemberId(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-hapkido-navy"
              >
                <option value="">-- Pilih Nama Anggota --</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.fullName} ({m.nia})
                  </option>
                ))}
              </select>

              <button
                type="submit"
                disabled={!selectedMemberId}
                className="w-full py-2.5 bg-slate-800 text-white font-bold rounded-xl text-xs shadow-md hover:bg-slate-900 transition disabled:opacity-50"
              >
                Simpan Presensi Manual
              </button>
            </form>
          </div>

          {/* Attendance Live Feed & History Table */}
          <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-emerald-600" />
                Daftar Presensi Peserta ({currentSession.records?.length || 0})
              </h3>

              <button
                onClick={() => setCurrentSession(null)}
                className="px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-xl text-xs font-bold transition flex items-center gap-1"
              >
                <StopCircle className="w-3.5 h-3.5" />
                Tutup Sesi
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="p-3">Anggota</th>
                    <th className="p-3">Waktu Presensi</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Perekam</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {currentSession.records && currentSession.records.length > 0 ? (
                    currentSession.records.map((rec: any) => (
                      <tr key={rec.id} className="hover:bg-slate-50/80 transition">
                        <td className="p-3">
                          <p className="font-bold text-slate-800">{rec.member?.fullName}</p>
                          <p className="text-[10px] font-mono text-slate-400">{rec.member?.nia}</p>
                        </td>
                        <td className="p-3 font-semibold text-slate-600">
                          {new Date(rec.checkInTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                        </td>
                        <td className="p-3">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
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
                        <td className="p-3 text-slate-500 font-medium">{rec.recordedBy || 'System QR'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="text-center py-8 text-slate-400">
                        Belum ada peserta yang melakukan presensi pada sesi ini.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
