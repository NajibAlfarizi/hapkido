"use client";

import { useEffect } from 'react';
import { AlertTriangle, AlertCircle, HelpCircle, CheckCircle, X } from 'lucide-react';

export type ConfirmVariant = 'danger' | 'warning' | 'info' | 'success';

export interface ConfirmOptions {
  title: string;
  message: string | React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmVariant;
}

interface ConfirmationDialogProps {
  isOpen: boolean;
  options: ConfirmOptions | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmationDialog({
  isOpen,
  options,
  onConfirm,
  onCancel,
}: ConfirmationDialogProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen || !options) return null;

  const {
    title,
    message,
    confirmText = 'Lanjutkan',
    cancelText = 'Batal',
    variant = 'danger',
  } = options;

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          icon: AlertTriangle,
          iconBg: 'bg-rose-100 text-rose-600',
          confirmBtn: 'bg-rose-600 hover:bg-rose-700 text-white focus:ring-rose-500',
          badgeText: 'Konfirmasi Tindakan',
        };
      case 'warning':
        return {
          icon: AlertCircle,
          iconBg: 'bg-amber-100 text-amber-600',
          confirmBtn: 'bg-amber-600 hover:bg-amber-700 text-white focus:ring-amber-500',
          badgeText: 'Peringatan',
        };
      case 'info':
        return {
          icon: HelpCircle,
          iconBg: 'bg-blue-100 text-hapkido-navy',
          confirmBtn: 'bg-hapkido-navy hover:bg-slate-800 text-white focus:ring-slate-700',
          badgeText: 'Informasi',
        };
      case 'success':
        return {
          icon: CheckCircle,
          iconBg: 'bg-emerald-100 text-emerald-600',
          confirmBtn: 'bg-emerald-600 hover:bg-emerald-700 text-white focus:ring-emerald-500',
          badgeText: 'Konfirmasi',
        };
    }
  };

  const styles = getVariantStyles();
  const IconComponent = styles.icon;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden transform animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        <div className="p-6 sm:p-7">
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-2xl ${styles.iconBg} flex items-center justify-center shrink-0 shadow-xs`}>
              <IconComponent className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0 pt-0.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                {styles.badgeText}
              </span>
              <h3 className="text-lg font-bold text-slate-900 leading-snug">{title}</h3>
              <div className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                {message}
              </div>
            </div>
            <button
              onClick={onCancel}
              className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition"
              aria-label="Tutup modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs sm:text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-slate-300 cursor-pointer"
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className={`px-5 py-2.5 rounded-xl ${styles.confirmBtn} text-xs sm:text-sm font-bold shadow-md transition focus:outline-none focus:ring-2 active:scale-95 cursor-pointer`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
