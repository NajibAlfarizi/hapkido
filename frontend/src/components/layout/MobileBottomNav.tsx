"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, QrCode, CreditCard, Menu } from 'lucide-react';

interface MobileBottomNavProps {
  userRole?: string;
  onOpenMoreMenu?: () => void;
}

export default function MobileBottomNav({ userRole = 'ADMIN', onOpenMoreMenu }: MobileBottomNavProps) {
  const pathname = usePathname();

  const navs = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Anggota', href: '/anggota', icon: Users, roles: ['ADMIN'] },
    { name: 'Absensi QR', href: '/absensi', icon: QrCode },
    { name: 'Pembayaran', href: '/pembayaran', icon: CreditCard, roles: ['ADMIN'] },
  ];

  const filtered = navs.filter((n) => !n.roles || n.roles.includes(userRole));

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-40 px-2 py-1.5 flex items-center justify-around shadow-lg">
      {filtered.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition ${
              isActive ? 'text-hapkido-red font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Icon className={`w-5 h-5 ${isActive ? 'text-hapkido-red scale-110' : 'text-slate-400'}`} />
            <span className="text-[10px] mt-0.5">{item.name}</span>
          </Link>
        );
      })}

      <button
        onClick={onOpenMoreMenu}
        className="flex flex-col items-center justify-center py-1 px-3 text-slate-500 hover:text-slate-800"
      >
        <Menu className="w-5 h-5 text-slate-400" />
        <span className="text-[10px] mt-0.5">Menu</span>
      </button>
    </nav>
  );
}
