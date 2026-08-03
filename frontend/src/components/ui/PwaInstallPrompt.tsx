"use client";

import { useState, useEffect } from 'react';
import { Download, X, Smartphone, Monitor, Shield, Sparkles, CheckCircle2, Share, MoreVertical } from 'lucide-react';

export default function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);

  useEffect(() => {
    // 1. Check standalone mode
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
        console.log('SW registration:', err);
      });
    }

    // 3. Detect device & browser
    const userAgent = window.navigator.userAgent.toLowerCase();
    const iosDetected = /iphone|ipad|ipod/.test(userAgent);
    const mobileDetected = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);

    setIsIOS(iosDetected);
    setIsMobile(mobileDetected);

    // 4. Capture native beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // ALWAYS show install banner if not in standalone mode
    const timer = setTimeout(() => {
      const dismissed = localStorage.getItem('pwa_prompt_dismissed_v2');
      if (!dismissed) {
        setShowPrompt(true);
      }
    }, 1200);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      clearTimeout(timer);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setShowPrompt(false);
      }
    } else {
      // Show manual step-by-step guide for mobile / HTTP browsers
      setShowGuideModal(true);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa_prompt_dismissed_v2', 'true');
  };

  if (isStandalone || (!showPrompt && !showGuideModal)) return null;

  return (
    <>
      {/* Floating Bottom Banner for Mobile & PC */}
      {showPrompt && (
        <div className="fixed bottom-20 sm:bottom-6 left-3 right-3 sm:left-auto sm:right-6 z-50 max-w-md w-full animate-in slide-in-from-bottom-5 duration-300">
          <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-3xl p-4 sm:p-5 shadow-2xl text-white space-y-3.5 relative overflow-hidden">
            {/* Top Gradient Line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-hapkido-red via-amber-400 to-emerald-400" />

            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-hapkido-red to-rose-700 flex items-center justify-center shadow-lg shrink-0 border border-white/20">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Aplikasi Web PWA
                  </span>
                  <h3 className="font-extrabold text-sm text-white leading-tight">
                    {isMobile ? 'Install Shortcut di HP Anda' : 'Install Aplikasi Hapkido Dojang'}
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

            {/* Description */}
            <p className="text-xs text-slate-300 leading-relaxed">
              Pasang aplikasi di layar utama HP/PC untuk akses cepat 1-klik, scanner QR cepat, dan tanpa mengetik URL lagi!
            </p>

            <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold text-slate-200">
              <div className="flex items-center gap-1.5 bg-white/5 p-2 rounded-xl border border-white/10">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Akses 1-Klik Layar Utama</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/5 p-2 rounded-xl border border-white/10">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Performa Fullscreen</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={handleDismiss}
                className="flex-1 py-2.5 bg-white/10 hover:bg-white/20 text-slate-200 rounded-xl text-xs font-bold transition"
              >
                Nanti Saja
              </button>
              <button
                onClick={handleInstallClick}
                className="flex-1 py-2.5 bg-gradient-to-r from-hapkido-red to-rose-600 hover:opacity-95 text-white rounded-xl text-xs font-black shadow-lg shadow-rose-900/30 transition flex items-center justify-center gap-1.5 active:scale-95"
              >
                <Download className="w-4 h-4 animate-bounce" />
                <span>Install Sekarang</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Instruction Guide (Fallback for Mobile / Custom Install) */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-sm w-full p-6 shadow-2xl text-white space-y-4 relative animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-sm text-amber-400 flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-hapkido-red" />
                Panduan Instalasi di HP / Mobile
              </h3>
              <button
                onClick={() => setShowGuideModal(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isIOS ? (
              <div className="space-y-3 text-xs text-slate-300">
                <p className="font-semibold text-white">Langkah Pasang di iPhone / iPad (Safari):</p>
                <ol className="space-y-2 list-decimal list-inside bg-slate-800/60 p-3.5 rounded-2xl border border-slate-700/50">
                  <li className="leading-relaxed">
                    Ketuk ikon <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-600 text-white rounded font-bold"><Share className="w-3 h-3" /> Share (Bagikan)</span> di bagian bawah Safari.
                  </li>
                  <li className="leading-relaxed">
                    Gulir ke bawah dan pilih opsi <span className="font-bold text-emerald-400">'Add to Home Screen' (Tambah ke Layar Utama)</span>.
                  </li>
                  <li className="leading-relaxed">
                    Ketuk <span className="font-bold text-white">'Tambah'</span> di sudut kanan atas.
                  </li>
                </ol>
              </div>
            ) : (
              <div className="space-y-3 text-xs text-slate-300">
                <p className="font-semibold text-white">Langkah Pasang di Android (Chrome / Edge / Brave):</p>
                <ol className="space-y-2.5 list-decimal list-inside bg-slate-800/60 p-3.5 rounded-2xl border border-slate-700/50">
                  <li className="leading-relaxed">
                    Ketuk menu <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-700 text-white rounded font-bold"><MoreVertical className="w-3.5 h-3.5" /> Titik Tiga (⋮)</span> di kanan atas browser HP.
                  </li>
                  <li className="leading-relaxed">
                    Pilih menu <span className="font-bold text-emerald-400">'Tambahkan ke Layar Utama'</span> atau <span className="font-bold text-emerald-400">'Install Aplikasi'</span>.
                  </li>
                  <li className="leading-relaxed">
                    Klik <span className="font-bold text-white">'Install'</span> untuk menyelesaikan pendaftaran shortcut.
                  </li>
                </ol>
              </div>
            )}

            <button
              onClick={() => {
                setShowGuideModal(false);
                setShowPrompt(false);
                localStorage.setItem('pwa_prompt_dismissed_v2', 'true');
              }}
              className="w-full py-2.5 bg-hapkido-red hover:bg-rose-600 text-white font-bold rounded-xl text-xs shadow-md transition"
            >
              Saya Mengerti
            </button>
          </div>
        </div>
      )}
    </>
  );
}
