"use client";

import { useState, useEffect } from 'react';
import { apiFetch, getCurrentUser } from '@/lib/api';
import Link from 'next/link';
import {
  Users,
  UserCheck,
  UserX,
  QrCode,
  Wallet,
  AlertTriangle,
  Calendar,
  Megaphone,
  PlusCircle,
  CreditCard,
  ChevronRight,
  TrendingUp
} from 'lucide-react';

import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const curr = getCurrentUser();
    if (curr?.role === 'ORANG_TUA') {
      router.push('/orangtua');
      return;
    }

    setUser(curr);

    apiFetch('/reports/dashboard').then((res) => {
      if (res.success) {
        setData(res.data);
      }
      setLoading(false);
    });
  }, [router]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-10 h-10 border-4 border-hapkido-red border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold text-slate-500">Memuat statistik Dojang Hapkido...</p>
      </div>
    );
  }

  const isAdmin = user?.role === 'ADMIN';

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-hapkido-navy via-slate-800 to-hapkido-red rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-extrabold uppercase text-hapkido-lightBlue mb-2">
            Perguruan Hapkido Indonesia
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Selamat Datang, {user?.name || 'Sabum Nim'}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-200 mt-1 max-w-xl">
            {isAdmin
              ? 'Sistem Manajemen Dojang terpadu untuk keanggotaan, kurikulum sabuk, presensi QR Code, dan laporan keuangan.'
              : 'Panel Pelatih Dojang untuk memantau jadwal mengajar, presensi QR anggota, dan pengumuman.'}
          </p>

          {/* Quick actions */}
          <div className="flex flex-wrap gap-2.5 mt-5">
            <Link
              href="/absensi"
              className="px-4 py-2 bg-hapkido-red hover:bg-rose-600 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-1.5"
            >
              <QrCode className="w-4 h-4" />
              <span>Scan QR Absensi</span>
            </Link>

            {isAdmin && (
              <>
                <Link
                  href="/anggota"
                  className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Tambah Anggota</span>
                </Link>
                <Link
                  href="/pembayaran"
                  className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Input Pembayaran</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Anggota */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Anggota</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-800">{data?.totalMembers || 0}</p>
          <div className="flex items-center gap-2 text-[11px] font-medium text-slate-500 mt-2">
            <span className="text-emerald-600 font-bold flex items-center gap-0.5">
              <UserCheck className="w-3 h-3" /> {data?.activeMembers || 0} Aktif
            </span>
            <span>&bull;</span>
            <span className="text-slate-400">{data?.inactiveMembers || 0} Nonaktif</span>
          </div>
        </div>

        {/* Kehadiran Hari Ini */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Kehadiran Hari Ini</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <QrCode className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-800">{data?.todayAttendanceCount || 0}</p>
          <p className="text-[11px] font-medium text-slate-500 mt-2">Peserta Terpresensi Hari Ini</p>
        </div>

        {/* Pendapatan Bulan Ini */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Iuran Bulan Ini</span>
            <div className="w-9 h-9 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-slate-800">
            Rp {(data?.incomeThisMonth || 0).toLocaleString('id-ID')}
          </p>
          <p className="text-[11px] font-semibold text-emerald-600 mt-2 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> Total Kas Masuk
          </p>
        </div>

        {/* Total Tunggakan */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Tunggakan</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-amber-600">
            Rp {(data?.totalArrears || 0).toLocaleString('id-ID')}
          </p>
          <p className="text-[11px] font-medium text-slate-500 mt-2">Belum Dilunasi</p>
        </div>
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Training Schedules */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-hapkido-navy text-white flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
              <h2 className="font-bold text-slate-800 text-base">Jadwal Latihan Mendatang</h2>
            </div>
            <Link href="/jadwal" className="text-xs font-bold text-hapkido-navy hover:underline flex items-center">
              Lihat Semua <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="space-y-3">
            {data?.upcomingSchedules && data.upcomingSchedules.length > 0 ? (
              data.upcomingSchedules.map((sch: any) => (
                <div
                  key={sch.id}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-100/80 transition"
                >
                  <div className="space-y-1">
                    <span className="inline-block px-2.5 py-0.5 text-[10px] font-extrabold bg-blue-100 text-blue-700 rounded-md">
                      {sch.class?.name || 'Kelas Reguler'}
                    </span>
                    <h3 className="font-bold text-slate-800 text-sm">{sch.title}</h3>
                    <p className="text-xs text-slate-500">
                      📍 {sch.location} &bull; Pelatih: {sch.trainer?.user?.name || 'Sabeum'}
                    </p>
                  </div>
                  <div className="text-right sm:border-l sm:pl-4 border-slate-200 shrink-0">
                    <p className="text-xs font-extrabold text-hapkido-red uppercase">
                      {sch.date && !isNaN(new Date(sch.date).getTime())
                        ? new Date(sch.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' })
                        : `Hari ${sch.dayOfWeek || 'Latihan'}`}
                    </p>
                    <p className="text-[11px] font-semibold text-slate-500 mt-0.5">
                      {sch.startTime || sch.class?.startTime || '16:00'} - {sch.endTime || sch.class?.endTime || '18:00'} WIB
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 text-center py-6">Belum ada jadwal latihan mendatang.</p>
            )}
          </div>
        </div>

        {/* Announcements Widget */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4 flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-hapkido-red text-white flex items-center justify-center">
                <Megaphone className="w-4 h-4" />
              </div>
              <h2 className="font-bold text-slate-800 text-base">Pengumuman Terbaru</h2>
            </div>
            <Link href="/pengumuman" className="text-xs font-bold text-hapkido-red hover:underline">
              Semua
            </Link>
          </div>

          <div className="space-y-3 flex-1">
            {data?.recentAnnouncements && data.recentAnnouncements.length > 0 ? (
              data.recentAnnouncements.map((anc: any) => (
                <div key={anc.id} className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-100 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 bg-amber-200/60 text-amber-900 font-extrabold text-[9px] rounded uppercase">
                      {anc.category}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(anc.createdAt).toLocaleDateString('id-ID')}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-800 text-xs">{anc.title}</h4>
                  <p className="text-[11px] text-slate-600 line-clamp-2">{anc.content}</p>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 text-center py-6">Belum ada pengumuman.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
