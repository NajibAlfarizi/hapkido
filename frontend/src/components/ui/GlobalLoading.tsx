"use client";

interface GlobalLoadingProps {
  isLoading: boolean;
  message?: string;
}

export default function GlobalLoading({ isLoading, message = 'Memuat data...' }: GlobalLoadingProps) {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center p-4 bg-slate-900/50 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white/95 rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/20 flex flex-col items-center max-w-xs w-full text-center space-y-4 animate-in zoom-in-95 duration-200">
        <div className="relative w-16 h-16 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-4 border-hapkido-navy/20 border-t-hapkido-red animate-spin" />
          <div className="w-10 h-10 rounded-2xl bg-hapkido-navy p-2 flex items-center justify-center shadow-inner">
            <img src="/hapkido-logo.png" alt="Hapkido Logo" className="w-full h-full object-contain animate-pulse" />
          </div>
        </div>
        <div>
          <h4 className="text-xs font-black text-slate-800 tracking-wider uppercase">Hapkido Padang Panjang</h4>
          <p className="text-xs text-slate-500 font-medium mt-1 animate-pulse">{message}</p>
        </div>
      </div>
    </div>
  );
}
