"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { removeAuthToken } from '@/lib/api';
import { Bell, LogOut, User, Download, Shield, Menu } from 'lucide-react';

interface HeaderProps {
  user?: any;
  onToggleMobileMenu?: () => void;
}

export default function Header({ user, onToggleMobileMenu }: HeaderProps) {
  const router = useRouter();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallPWA = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          setIsInstallable(false);
        }
        setDeferredPrompt(null);
      });
    }
  };

  const handleLogout = () => {
    removeAuthToken();
    router.push('/login');
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-xs px-4 py-3 flex items-center justify-between">
      {/* Left: Mobile Title / Toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileMenu}
          className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-hapkido-red flex md:hidden items-center justify-center text-white font-bold">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-800 leading-tight">Dojang Hapkido</h2>
            <p className="text-[10px] text-slate-500 hidden sm:block">Sistem Informasi Beladiri</p>
          </div>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* PWA Install Button */}
        {isInstallable && (
          <button
            onClick={handleInstallPWA}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-hapkido-red to-rose-600 text-white rounded-lg text-xs font-semibold shadow-xs hover:opacity-90 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Install App PWA</span>
          </button>
        )}

        {/* User Badge */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-hapkido-navy text-white flex items-center justify-center text-xs font-bold shadow-xs">
            {user?.name?.substring(0, 2).toUpperCase() || 'AD'}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-bold text-slate-800 leading-tight">{user?.name || 'Administrator'}</p>
            <span className="inline-block px-1.5 py-0.5 text-[9px] font-extrabold uppercase rounded bg-slate-100 text-hapkido-navy">
              {user?.role || 'ADMIN'}
            </span>
          </div>
          <button
            onClick={handleLogout}
            title="Keluar / Logout"
            className="p-2 text-slate-400 hover:text-hapkido-red hover:bg-rose-50 rounded-lg transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
