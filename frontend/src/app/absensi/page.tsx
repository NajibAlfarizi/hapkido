"use client";

import { useState, useEffect, useRef } from 'react';
import { apiFetch } from '@/lib/api';
import jsQR from 'jsqr';
import {
  QrCode,
  Camera,
  UserCheck,
  CheckCircle,
  AlertCircle,
  Play,
  StopCircle,
  CameraOff,
  Sparkles,
  Volume2,
} from 'lucide-react';

interface ScanNotification {
  type: 'success' | 'error' | 'duplicate' | 'processing';
  title: string;
  msg: string;
  memberName?: string;
  nia?: string;
  status?: string;
  checkInTime?: string;
}

export default function AbsensiPage() {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [selectedScheduleId, setSelectedScheduleId] = useState('');
  const [currentSession, setCurrentSession] = useState<any>(null);

  const [members, setMembers] = useState<any[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [attendanceStatus, setAttendanceStatus] = useState('HADIR');

  // Scanner state
  const [scannerActive, setScannerActive] = useState(false);
  const [scanNotification, setScanNotification] = useState<ScanNotification | null>(null);
  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastScannedRef = useRef<string>('');

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSchedulesAndMembers();
    return () => {
      stopCameraScanner();
    };
  }, []);

  const playBeep = (type: 'success' | 'error' | 'duplicate') => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'success') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
        osc.frequency.setValueAtTime(1320, ctx.currentTime + 0.1); // E6
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.25);
      } else if (type === 'duplicate') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(520, ctx.currentTime);
        osc.frequency.setValueAtTime(440, ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.3);
      } else {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(320, ctx.currentTime);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.35);
      }
    } catch (e) {
      // Audio context fallback ignore
    }
  };

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

  // ====== High-Performance Native Camera QR Scanner ======
  const startCameraScanner = async () => {
    setScannerActive(true);
    setScanNotification(null);
    lastScannedRef.current = '';

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } },
      });
      streamRef.current = stream;

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.setAttribute('playsinline', 'true');
          videoRef.current.play();

          videoRef.current.onloadedmetadata = () => {
            scanLoop();
          };
        }
      }, 100);
    } catch (err: any) {
      console.error('Camera error:', err);
      setScanNotification({
        type: 'error',
        title: 'Kamera Gagal',
        msg: 'Gagal mengakses kamera. Pastikan izin kamera sudah diberikan.',
      });
      setScannerActive(false);
    }
  };

  const scanLoop = () => {
    if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);

    scanIntervalRef.current = setInterval(() => {
      if (!videoRef.current || !canvasRef.current) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (video.readyState !== video.HAVE_ENOUGH_DATA) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      // Fast synchronous jsQR scan
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert',
      });

      if (code && code.data && code.data !== lastScannedRef.current) {
        lastScannedRef.current = code.data;
        handleScanSuccess(code.data);

        // Reset after 3.5 seconds to allow next scan
        setTimeout(() => {
          lastScannedRef.current = '';
        }, 3500);
      }
    }, 180); // Fast scan loop (every 180ms)
  };

  const stopCameraScanner = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setScannerActive(false);
  };

  const handleScanSuccess = async (qrData: string) => {
    if (!currentSession) {
      setScanNotification({
        type: 'error',
        title: 'Sesi Belum Dibuka',
        msg: 'Buka sesi absensi terlebih dahulu.',
      });
      return;
    }

    // Instant Feedback while request is sent
    setScanNotification({
      type: 'processing',
      title: 'Memproses Presensi...',
      msg: `Mendeteksi QR Code (${qrData.substring(0, 16)}...)`,
    });

    const res = await apiFetch('/attendance/scan', {
      method: 'POST',
      body: JSON.stringify({
        sessionId: currentSession.id,
        qrData,
        status: attendanceStatus,
        notes: 'Presensi via Scan QR Code',
      }),
    });

    if (res.success) {
      playBeep('success');
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
      }

      setScanNotification({
        type: 'success',
        title: 'PRESENSI BERHASIL DETEKSI! 🟢',
        msg: res.message,
        memberName: res.data?.member?.fullName || 'Anggota Dojang',
        nia: res.data?.member?.nia,
        status: res.data?.status || attendanceStatus,
        checkInTime: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      });
      loadSessionDetail(currentSession.id);
    } else {
      const isDup = res.message?.toLowerCase().includes('sudah');
      playBeep(isDup ? 'duplicate' : 'error');

      setScanNotification({
        type: isDup ? 'duplicate' : 'error',
        title: isDup ? 'ANGGOTA SUDAH PRESENSI ⚠️' : 'GAGAL PRESENSI ❌',
        msg: res.message || 'Presensi gagal diproses.',
      });
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
        notes: 'Presensi manual oleh admin/pelatih',
      }),
    });

    if (res.success) {
      playBeep('success');
      setScanNotification({
        type: 'success',
        title: 'PRESENSI MANUAL BERHASIL! 🟢',
        msg: res.message,
        memberName: res.data?.member?.fullName,
        nia: res.data?.member?.nia,
        status: res.data?.status || attendanceStatus,
        checkInTime: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      });
      setSelectedMemberId('');
      loadSessionDetail(currentSession.id);
    } else {
      playBeep('error');
      setScanNotification({
        type: 'error',
        title: 'GAGAL PRESENSI ❌',
        msg: res.message,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
            <QrCode className="w-6 h-6 text-hapkido-red" />
            Sesi & Presensi Realtime QR Code
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Buka sesi latihan, lakukan Scan QR Kartu Anggota menggunakan kamera HP/Laptop dengan audio & notifikasi instant.
          </p>
        </div>

        {currentSession && (
          <div className="flex items-center gap-2">
            <span className="px-3.5 py-1.5 bg-emerald-100 text-emerald-800 rounded-full text-xs font-extrabold flex items-center gap-1.5 shadow-xs">
              <CheckCircle className="w-4 h-4 text-emerald-600 animate-pulse" /> Sesi AKTIF Terbuka
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
                  {s.title} (Hari {s.dayOfWeek} &bull; {s.startTime}-{s.endTime} &bull; {s.location})
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
              <p className="text-xs text-slate-500 mt-0.5">📍 {currentSession.schedule?.location} &bull; {currentSession.schedule?.dayOfWeek} {currentSession.schedule?.startTime}-{currentSession.schedule?.endTime}</p>
            </div>

            {/* Prominent Real-time Scan Notification Overlay & Card */}
            {scanNotification && (
              <div
                className={`p-4 rounded-2xl border-2 shadow-lg transition-all transform animate-in zoom-in-95 duration-200 space-y-2 ${
                  scanNotification.type === 'success'
                    ? 'bg-emerald-500 text-white border-emerald-400 shadow-emerald-200'
                    : scanNotification.type === 'duplicate'
                    ? 'bg-amber-500 text-white border-amber-400 shadow-amber-200'
                    : scanNotification.type === 'processing'
                    ? 'bg-blue-600 text-white border-blue-400 animate-pulse'
                    : 'bg-rose-600 text-white border-rose-400 shadow-rose-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <Volume2 className="w-3 h-3" /> {scanNotification.title}
                  </span>
                  {scanNotification.checkInTime && (
                    <span className="text-[10px] font-mono font-bold bg-black/20 px-2 py-0.5 rounded">
                      ⏰ {scanNotification.checkInTime}
                    </span>
                  )}
                </div>

                {scanNotification.memberName ? (
                  <div className="pt-1 space-y-1">
                    <h3 className="text-lg font-black tracking-tight leading-tight">{scanNotification.memberName}</h3>
                    <div className="flex items-center gap-2 text-xs font-semibold">
                      <span className="bg-white/30 px-2 py-0.5 rounded font-mono font-bold">{scanNotification.nia}</span>
                      <span className="bg-black/20 px-2 py-0.5 rounded font-extrabold uppercase">{scanNotification.status}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs font-semibold leading-relaxed pt-1">{scanNotification.msg}</p>
                )}
              </div>
            )}

            {/* Attendance Status Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">Set Status Presensi Scan:</label>
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
                  className="w-full py-3 bg-hapkido-red hover:bg-rose-600 text-white font-bold rounded-xl text-xs shadow-md transition flex items-center justify-center gap-2 active:scale-95"
                >
                  <Camera className="w-4 h-4" />
                  <span>Aktifkan Kamera Scan QR</span>
                </button>
              ) : (
                <div className="space-y-2">
                  <div className="relative w-full overflow-hidden rounded-3xl border-4 border-hapkido-navy bg-slate-950 aspect-[4/3] shadow-inner">
                    <video
                      ref={videoRef}
                      className="w-full h-full object-cover"
                      playsInline
                      muted
                      autoPlay
                    />
                    {/* Scan Overlay Aim Box */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none p-4">
                      <div className="w-44 h-44 border-4 border-emerald-400 rounded-3xl relative animate-pulse shadow-[0_0_20px_rgba(52,211,153,0.5)]">
                        <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-white -mt-1 -ml-1 rounded-tl" />
                        <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-white -mt-1 -mr-1 rounded-tr" />
                        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-white -mb-1 -ml-1 rounded-bl" />
                        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-white -mb-1 -mr-1 rounded-br" />
                      </div>
                      <span className="mt-3 bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-md">
                        📷 Pasang Kartu QR di dalam kotak
                      </span>
                    </div>
                  </div>
                  <canvas ref={canvasRef} className="hidden" />
                  <button
                    onClick={stopCameraScanner}
                    className="w-full py-2.5 bg-slate-200 text-slate-700 font-bold rounded-xl text-xs hover:bg-slate-300 transition flex items-center justify-center gap-2"
                  >
                    <CameraOff className="w-3.5 h-3.5" />
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
                onClick={() => {
                  stopCameraScanner();
                  setCurrentSession(null);
                }}
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
