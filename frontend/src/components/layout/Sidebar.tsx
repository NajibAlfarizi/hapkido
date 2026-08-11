"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Award,
  Calendar,
  QrCode,
  CreditCard,
  TrendingDown,
  PieChart,
  Megaphone,
  Trophy,
  Package,
  FileCheck,
  FileText,
  ShieldAlert,
  Settings,
  Shield
} from 'lucide-react';

interface SidebarProps {
  userRole?: string;
}

export default function Sidebar({ userRole = 'ADMIN' }: SidebarProps) {
  const pathname = usePathname();

  const menuItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'PELATIH'] },
    { name: 'Dashboard Anak', href: '/orangtua', icon: LayoutDashboard, roles: ['ORANG_TUA'] },
    { name: 'Anggota Dojang', href: '/anggota', icon: Users, roles: ['ADMIN'] },
    { name: 'Pelatih Dojang', href: '/pelatih', icon: UserCheck, roles: ['ADMIN'] },
    { name: 'Kelola Orang Tua', href: '/admin/orangtua', icon: Users, roles: ['ADMIN'] },
    { name: 'Absensi (Scan QR)', href: '/absensi', icon: QrCode, roles: ['ADMIN', 'PELATIH'] },
    { name: 'Jadwal & Dojang', href: '/dojang', icon: Calendar, roles: ['ADMIN', 'PELATIH', 'ORANG_TUA'] },
    { name: 'Tingkatan Sabuk', href: '/sabuk', icon: Award, roles: ['ADMIN', 'PELATIH'] },
    { name: 'Iuran & Bayar', href: '/pembayaran', icon: CreditCard, roles: ['ADMIN'] },
    { name: 'Pengeluaran', href: '/pengeluaran', icon: TrendingDown, roles: ['ADMIN'] },
    { name: 'Keuangan Dojang', href: '/keuangan', icon: PieChart, roles: ['ADMIN'] },
    { name: 'Pengumuman', href: '/pengumuman', icon: Megaphone, roles: ['ADMIN', 'PELATIH', 'ORANG_TUA'] },
    { name: 'Event & Kejuaraan', href: '/event', icon: Trophy, roles: ['ADMIN', 'PELATIH', 'ORANG_TUA'] },
    { name: 'Inventaris Tool', href: '/inventaris', icon: Package, roles: ['ADMIN'] },
    { name: 'Sertifikat', href: '/sertifikat', icon: FileCheck, roles: ['ADMIN'] },
    { name: 'Laporan Dojang', href: '/laporan', icon: FileText, roles: ['ADMIN'] },
    { name: 'Audit Log', href: '/audit-log', icon: ShieldAlert, roles: ['ADMIN'] },
    { name: 'Pengaturan', href: '/pengaturan', icon: Settings, roles: ['ADMIN'] },
  ];

  const filteredItems = menuItems.filter((item) => item.roles.includes(userRole));

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 h-screen sticky top-0 shadow-sm z-30 shrink-0">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-100 flex items-center gap-3 bg-gradient-to-r from-hapkido-navy to-slate-800 text-white">
        <div className="w-10 h-10 rounded-xl bg-white/10 p-1 flex items-center justify-center shadow-md shrink-0">
          <img src="/hapkido-logo.png" alt="Hapkido Logo" className="w-full h-full object-contain" />
        </div>
        <div>
          <h1 className="font-extrabold text-xs tracking-wider leading-tight text-white uppercase">HAPKIDO PADANG PANJANG</h1>
          <p className="text-[10px] text-hapkido-lightBlue font-medium">Sistem Informasi Dojang</p>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {filteredItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                isActive
                  ? 'bg-hapkido-navy text-white shadow-md shadow-slate-200'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-hapkido-navy'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-hapkido-red' : 'text-slate-400'}`} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>

      {/* Footer info */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50 text-xs text-slate-400 text-center">
        <p className="font-semibold text-slate-600">Perguruan Hapkido</p>
        <p>V1.0.0 &bull; Mobile Ready PWA</p>
      </div>
    </aside>
  );
}
