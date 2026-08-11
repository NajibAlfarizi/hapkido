"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { removeAuthToken, apiFetch } from '@/lib/api';
import { useSocket } from '@/hooks/useSocket';
import { Bell, LogOut, User, Download, Shield, Menu, Check, ExternalLink, Volume2 } from 'lucide-react';

interface HeaderProps {
  user?: any;
  onToggleMobileMenu?: () => void;
}

export default function Header({ user, onToggleMobileMenu }: HeaderProps) {
  const router = useRouter();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  // Notification state
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Real-time socket listener
  useSocket((newNotif) => {
    setNotifications((prev) => [newNotif, ...prev]);
    setUnreadCount((prev) => prev + 1);

    // Play subtle audio alert if supported
    try {
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
      audio.volume = 0.3;
      audio.play().catch(() => {});
    } catch (e) {}
  });

  useEffect(() => {
    fetchNotifications();

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Close dropdown on outside click
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotifDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchNotifications = async () => {
    const res = await apiFetch('/notifications');
    if (res.success) {
      setNotifications(res.data || []);
      setUnreadCount(res.unreadCount || 0);
    }
  };

  const handleMarkAsRead = async (id: string, linkUrl?: string) => {
    await apiFetch(`/notifications/${id}/read`, { method: 'PUT' });
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    if (linkUrl) {
      setShowNotifDropdown(false);
      router.push(linkUrl);
    }
  };

  const handleMarkAllRead = async () => {
    await apiFetch('/notifications/read-all', { method: 'PUT' });
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

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

        {/* Real-Time Notification Bell Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowNotifDropdown(!showNotifDropdown)}
            className="relative p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition"
            title="Notifikasi"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 px-1.5 py-0.5 bg-hapkido-red text-white font-extrabold text-[10px] rounded-full animate-pulse border border-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notification Dropdown Drawer */}
          {showNotifDropdown && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-3xl border border-slate-200 shadow-2xl z-50 overflow-hidden text-xs">
              <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                    <Bell className="w-4 h-4 text-hapkido-red" />
                    Notifikasi Real-Time
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">{unreadCount} belum dibaca</p>
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[11px] font-bold text-hapkido-navy hover:underline"
                  >
                    Tandai Semua Dibaca
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {notifications.length > 0 ? (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => handleMarkAsRead(n.id, n.linkUrl)}
                      className={`p-4 transition cursor-pointer hover:bg-slate-50 flex items-start gap-3 ${
                        !n.isRead ? 'bg-blue-50/50' : ''
                      }`}
                    >
                      <div
                        className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${
                          !n.isRead ? 'bg-hapkido-red' : 'bg-transparent'
                        }`}
                      />
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-extrabold text-slate-800 text-xs leading-tight">{n.title}</h4>
                          <span className="text-[9px] text-slate-400 font-mono">
                            {new Date(n.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-slate-600 text-[11px] leading-relaxed">{n.message}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-slate-400">
                    Belum ada notifikasi baru.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

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
