"use client";

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { FileText, Download, Printer, FileSpreadsheet, Filter } from 'lucide-react';

export default function LaporanPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'anggota' | 'iuran' | 'keuangan'>('anggota');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [resM, resP] = await Promise.all([
      apiFetch('/members'),
      apiFetch('/payments'),
    ]);

    if (resM.success) setMembers(resM.data);
    if (resP.success) setPayments(resP.data);
    setLoading(false);
  };

  const exportToExcelCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';

    if (activeTab === 'anggota') {
      csvContent += 'NIA,Nama Lengkap,Jenis Kelamin,Status,No HP,Nama Ortu\n';
      members.forEach((m) => {
        csvContent += `"${m.nia}","${m.fullName}","${m.gender}","${m.status}","${m.phone || ''}","${m.parentName || ''}"\n`;
      });
    } else {
      csvContent += 'Invoice,Tanggal,Anggota,Jenis Iuran,Metode,Status,Dibayar\n';
      payments.forEach((p) => {
        csvContent += `"${p.invoiceNo}","${p.paymentDate}","${p.member?.fullName}","${p.duesType?.name}","${p.paymentMethod}","${p.status}","${p.paidAmount}"\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `laporan_dojang_hapkido_${activeTab}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
            <FileText className="w-6 h-6 text-hapkido-red" />
            Pusat Laporan & Export Data Dojang
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Rekap data laporan Anggota, Absensi, Iuran, Keuangan, dan Ujian Sabuk dengan fitur Export PDF, Excel & Print.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportToExcelCSV}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Excel / CSV</span>
          </button>
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak PDF / Print</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          onClick={() => setActiveTab('anggota')}
          className={`px-4 py-2.5 font-bold text-xs rounded-t-2xl transition border-b-2 ${
            activeTab === 'anggota'
              ? 'border-hapkido-red text-hapkido-red bg-white'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Laporan Data Anggota ({members.length})
        </button>
        <button
          onClick={() => setActiveTab('iuran')}
          className={`px-4 py-2.5 font-bold text-xs rounded-t-2xl transition border-b-2 ${
            activeTab === 'iuran'
              ? 'border-hapkido-red text-hapkido-red bg-white'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Laporan Transaksi Pembayaran Iuran ({payments.length})
        </button>
      </div>

      {/* Report Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          {activeTab === 'anggota' ? (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-500 uppercase">
                  <th className="p-4">NIA</th>
                  <th className="p-4">Nama Anggota</th>
                  <th className="p-4">Sabuk Saat Ini</th>
                  <th className="p-4">No HP</th>
                  <th className="p-4">Orang Tua / Wali</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {members.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-4 font-mono font-bold text-slate-700">{m.nia}</td>
                    <td className="p-4 font-bold text-slate-800">{m.fullName}</td>
                    <td className="p-4 font-semibold text-slate-700">{m.currentBelt?.name || 'Sabuk Putih'}</td>
                    <td className="p-4 text-slate-600">{m.phone || '-'}</td>
                    <td className="p-4 text-slate-600">{m.parentName || '-'}</td>
                    <td className="p-4 font-extrabold text-emerald-700">{m.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-500 uppercase">
                  <th className="p-4">Invoice</th>
                  <th className="p-4">Anggota</th>
                  <th className="p-4">Jenis Iuran</th>
                  <th className="p-4">Metode</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Nominal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-4 font-mono font-bold text-slate-700">{p.invoiceNo}</td>
                    <td className="p-4 font-bold text-slate-800">{p.member?.fullName}</td>
                    <td className="p-4 text-slate-700">{p.duesType?.name}</td>
                    <td className="p-4 font-bold text-slate-600">{p.paymentMethod}</td>
                    <td className="p-4 font-extrabold text-emerald-700">{p.status}</td>
                    <td className="p-4 font-bold text-slate-800">Rp {p.paidAmount.toLocaleString('id-ID')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
