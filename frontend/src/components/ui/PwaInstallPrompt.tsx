"use client";

import { useState, useEffect } from 'react';
import { Download, X, Smartphone, Monitor, Shield, Sparkles, CheckCircle2 } from 'lucide-react';

export default function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // 1. Check if already running in standalone PWA mode
    const isAppStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    if (isAppStandalone) {
      setIsStandalone(true);
      return;
    }

    // 2. Register Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.log('SW registration fallback:', err);
      });
    }

    // 3. Detect iOS device
    const userAgent = window.navigator.userAgent.toLowerCase();
    const iosDetected = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(iosDetected);

    // 4. Capture native beforeinstallprompt event (Android & PC Chrome/Edge/Brave)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      const dismissed = localStorage.getItem('pwa_prompt_dismissed');
      if (!dismissed) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // If iOS and not dismissed, show custom iOS install banner
    if (iosDetected && !localStorage.getItem('pwa_prompt_dismissed')) {
      setShowPrompt(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted PWA install prompt');
      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa_prompt_dismissed', 'true');
  };

  if (isStandalone || !showPrompt) return null;

  return (
    <div className="fixed bottom-20 sm:bottom-6 left-4 right-4 sm:left-auto sm:right-6 z-50 max-w-md w-full animate-in slide-in-from-bottom-5 duration-300">
      <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-3xl p-5 shadow-2xl text-white space-y-4 relative overflow-hidden">
        {/* Decorative Top Gradient Line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-hapkido-red via-amber-400 to-emerald-400" />

        {/* Header Section */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-hapkido-red to-rose-700 flex items-center justify-center shadow-lg shrink-0 border border-white/20">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> PWA Application Ready
              </span>
              <h3 className="font-extrabold text-sm text-white leading-tight">
                Install Aplikasi Hapkido Dojang
              </h3>
            </div>
          </div>

          <button
            onClick={handleDismiss}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Description & Features */}
        <p className="text-xs text-slate-300 leading-relaxed">
          Pasang aplikasi di layar utama HP atau PC Anda untuk akses cepat 1-klik, scanner QR tanpa batas, dan tampilan fullscreen!
        </p>

        <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold text-slate-200 pt-1">
          <div className="flex items-center gap-1.5 bg-white/5 p-2 rounded-xl border border-white/10">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Shortcut Layar Utama</span>
          </div>
          <div className="flex items-center gap-1.5 bg-white/5 p-2 rounded-xl border border-white/10">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Performa Cepat Native</span>
          </div>
        </div>

        {/* Action Buttons */}
        {isIOS ? (
          <div className="bg-white/10 p-3 rounded-2xl text-xs space-y-1 text-slate-200">
            <p className="font-bold text-amber-300">Cara Instalasi di iOS (Safari):</p>
            <p>Ketuk tombol <span className="font-bold text-white">Share (Bagikan)</span> di bawah browser, lalu pilih <span className="font-bold text-emerald-400">'Add to Home Screen'</span>.</p>
          </div>
        ) : (
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handleDismiss}
              className="flex-1 py-2.5 bg-white/10 hover:bg-white/20 text-slate-200 rounded-xl text-xs font-bold transition"
            >
              Nanti Saja
            </button>
            <button
              onClick={handleInstallClick}
              disabled={!deferredPrompt}
              className="flex-1 py-2.5 bg-gradient-to-r from-hapkido-red to-rose-600 hover:opacity-95 text-white rounded-xl text-xs font-black shadow-lg shadow-rose-900/30 transition flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-50"
            >
              <Download className="w-4 h-4 animate-bounce" />
              <span>Install Sekarang</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
