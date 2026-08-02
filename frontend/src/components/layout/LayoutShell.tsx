"use client";

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import Header from './Header';
import MobileBottomNav from './MobileBottomNav';
import { getCurrentUser } from '@/lib/api';
import { X, Shield, LayoutDashboard, Users, UserCheck, QrCode, Calendar, Award, CreditCard, TrendingDown, PieChart, Megaphone, Trophy, Package, FileCheck, FileText, ShieldAlert, Settings } from 'lucide-react';
import Link from 'next/link';

interface LayoutShellProps {
  children: React.ReactNode;
}

export default function LayoutShell({ children }: LayoutShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // If on login page, skip layout shell
    if (pathname === '/login') return;

    const currUser = getCurrentUser();
    if (!currUser) {
      router.push('/login');
    } else {
      setUser(currUser);
    }
  }, [pathname, router]);

  if (pathname === '/login') {
    return <>{children}</>;
  }

  const allMenu = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'PELATIH'] },
    { name: 'Anggota Dojang', href: '/anggota', icon: Users, roles: ['ADMIN'] },
    { name: 'Pelatih Dojang', href: '/pelatih', icon: UserCheck, roles: ['ADMIN'] },
    { name: 'Absensi (Scan QR)', href: '/absensi', icon: QrCode, roles: ['ADMIN', 'PELATIH'] },
    { name: 'Jadwal & Dojang', href: '/dojang', icon: Calendar, roles: ['ADMIN', 'PELATIH'] },
    { name: 'Tingkatan Sabuk', href: '/sabuk', icon: Award, roles: ['ADMIN', 'PELATIH'] },
    { name: 'Iuran & Pembayaran', href: '/pembayaran', icon: CreditCard, roles: ['ADMIN'] },
    { name: 'Pengeluaran', href: '/pengeluaran', icon: TrendingDown, roles: ['ADMIN'] },
    { name: 'Keuangan Dojang', href: '/keuangan', icon: PieChart, roles: ['ADMIN'] },
    { name: 'Pengumuman', href: '/pengumuman', icon: Megaphone, roles: ['ADMIN', 'PELATIH'] },
    { name: 'Event & Kejuaraan', href: '/event', icon: Trophy, roles: ['ADMIN', 'PELATIH'] },
    { name: 'Inventaris', href: '/inventaris', icon: Package, roles: ['ADMIN'] },
    { name: 'Sertifikat', href: '/sertifikat', icon: FileCheck, roles: ['ADMIN'] },
    { name: 'Laporan', href: '/laporan', icon: FileText, roles: ['ADMIN'] },
    { name: 'Audit Log', href: '/audit-log', icon: ShieldAlert, roles: ['ADMIN'] },
    { name: 'Pengaturan', href: '/pengaturan', icon: Settings, roles: ['ADMIN'] },
  ];

  const filteredMenu = allMenu.filter(m => m.roles.includes(user?.role || 'ADMIN'));

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-800">
      {/* Desktop Sidebar */}
      <Sidebar userRole={user?.role} />

      {/* Main Content Container */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
        <Header user={user} onToggleMobileMenu={() => setIsMobileMenuOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <MobileBottomNav userRole={user?.role} onOpenMoreMenu={() => setIsMobileMenuOpen(true)} />

      {/* Mobile Full Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex justify-end md:hidden">
          <div className="w-4/5 max-w-sm bg-white h-full shadow-2xl flex flex-col p-4 overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-hapkido-navy p-1 flex items-center justify-center text-white font-bold">
                  <img src="/hapkido-logo.png" alt="Hapkido Logo" className="w-full h-full object-contain" />
                </div>
                <h3 className="font-extrabold text-xs text-slate-800 uppercase">HAPKIDO PADANG PANJANG</h3>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-1 flex-1">
              {filteredMenu.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition ${
                      isActive
                        ? 'bg-hapkido-navy text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-hapkido-red' : 'text-slate-400'}`} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>

            <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-400">
              <p>Dojang Hapkido &bull; Mobile PWA</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
