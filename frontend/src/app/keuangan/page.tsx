"use client";

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { PieChart as PieIcon, Wallet, ArrowDownRight, ArrowUpRight, DollarSign } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';

export default function KeuanganPage() {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/finance/summary').then((res) => {
      if (res.success) setSummary(res.data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-10 h-10 border-4 border-hapkido-navy border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold text-slate-500">Memuat laporan keuangan...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <h1 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
          <PieIcon className="w-6 h-6 text-hapkido-navy" />
          Laporan Kas & Grafik Keuangan Dojang
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Ringkasan pemasukan iuran, total pengeluaran operasional, saldo kas bersih, dan perbandingan arus kas bulanan.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase">
            <span>Total Pemasukan</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-emerald-600">
            Rp {(summary?.totalIncome || 0).toLocaleString('id-ID')}
          </p>
          <p className="text-[11px] text-slate-400 font-medium">Akumulasi iuran & event</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase">
            <span>Total Pengeluaran</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-rose-600">
            Rp {(summary?.totalExpense || 0).toLocaleString('id-ID')}
          </p>
          <p className="text-[11px] text-slate-400 font-medium">Biaya operasional dojang</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase">
            <span>Saldo Kas Bersih</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-800">
            Rp {(summary?.netBalance || 0).toLocaleString('id-ID')}
          </p>
          <p className="text-[11px] text-slate-400 font-medium">Saldo kas saat ini</p>
        </div>
      </div>

      {/* Chart Visualization */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <h2 className="font-extrabold text-slate-800 text-base border-b border-slate-100 pb-3">
          Grafik Arus Kas Pemasukan vs Pengeluaran
        </h2>

        <div className="h-80 w-full pt-4">
          {summary?.chartData && summary.chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={summary.chartData} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tickLine={false} style={{ fontSize: '11px', fontWeight: 600 }} />
                <YAxis tickLine={false} style={{ fontSize: '11px' }} />
                <Tooltip
                  formatter={(value: any) => [`Rp ${Number(value).toLocaleString('id-ID')}`, '']}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', fontWeight: 600 }} />
                <Bar dataKey="pemasukan" name="Pemasukan (Rp)" fill="#22c55e" radius={[6, 6, 0, 0]} />
                <Bar dataKey="pengeluaran" name="Pengeluaran (Rp)" fill="#ef4444" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-xs text-slate-400 text-center py-16">Belum ada data statistik grafik kas.</p>
          )}
        </div>
      </div>
    </div>
  );
}
