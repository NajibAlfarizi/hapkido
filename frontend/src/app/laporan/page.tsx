"use client";

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { FileText, Download, Printer, FileSpreadsheet, Filter, Shield, Users, CreditCard } from 'lucide-react';

export default function LaporanPage() {
  const [dojangs, setDojangs] = useState<any[]>([]);
  const [selectedDojangId, setSelectedDojangId] = useState<string>('');
  
  const [members, setMembers] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'anggota' | 'iuran'>('anggota');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [resD, resM, resP] = await Promise.all([
      apiFetch('/dojangs'),
      apiFetch('/members'),
      apiFetch('/payments'),
    ]);

    if (resD.success) setDojangs(resD.data);
    if (resM.success) setMembers(resM.data);
    if (resP.success) setPayments(resP.data);
    setLoading(false);
  };

  // Filter data per Dojang
  const filteredMembers = selectedDojangId
    ? members.filter((m) => m.dojangId === selectedDojangId)
    : members;

  const filteredPayments = selectedDojangId
    ? payments.filter((p) => p.member?.dojangId === selectedDojangId || p.dojangId === selectedDojangId)
    : payments;

  const selectedDojangObj = dojangs.find((d) => d.id === selectedDojangId);
  const dojangNameTag = selectedDojangObj ? selectedDojangObj.code : 'SEMUA_DOJANG';

  const exportToExcelCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';

    if (activeTab === 'anggota') {
      csvContent += 'Cabang Dojang,NIA,Nama Lengkap,Tingkatan Sabuk,Jenis Kelamin,Status,No HP,Orang Tua / Wali\n';
      filteredMembers.forEach((m) => {
        const dojangName = m.dojang?.name || 'Cabang Utama';
        const beltName = m.currentBelt?.name || 'Sabuk Putih';
        csvContent += `"${dojangName}","${m.nia}","${m.fullName}","${beltName}","${m.gender}","${m.status}","${m.phone || ''}","${m.parentName || ''}"\n`;
      });
    } else {
      csvContent += 'Cabang Dojang,Invoice,Tanggal,Anggota,Jenis Iuran,Metode,Status,Nominal (Rp)\n';
      filteredPayments.forEach((p) => {
        const dojangName = p.member?.dojang?.name || p.dojang?.name || 'Cabang Utama';
        const invoice = p.invoiceNo || '-';
        const dateStr = p.paymentDate ? new Date(p.paymentDate).toLocaleDateString('id-ID') : '-';
        const memberName = p.member?.fullName || 'Peserta';
        const duesName = p.duesType?.name || 'Iuran';
        csvContent += `"${dojangName}","${invoice}","${dateStr}","${memberName}","${duesName}","${p.paymentMethod}","${p.status}","${p.paidAmount}"\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `laporan_hapkido_${activeTab}_${dojangNameTag}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
            <FileText className="w-6 h-6 text-hapkido-red" />
            Pusat Laporan & Export Data Dojang
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Rekap data laporan Anggota & Pembayaran Iuran per Cabang Dojang dengan Export CSV/Excel & Cetak PDF.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportToExcelCSV}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-1.5 active:scale-95"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Excel / CSV</span>
          </button>
          <button
            onClick={() => window.print()}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-1.5 active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak PDF / Print</span>
          </button>
        </div>
      </div>

      {/* Filter Bar per Dojang Branch */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="p-2 bg-slate-100 text-hapkido-navy rounded-xl">
            <Filter className="w-4 h-4" />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">Filter Cabang Dojang:</label>
            <span className="text-xs font-extrabold text-slate-800">
              {selectedDojangObj ? selectedDojangObj.name : 'Menampilkan Semua Cabang Dojang'}
            </span>
          </div>
        </div>

        <div className="w-full sm:w-72">
          <select
            value={selectedDojangId}
            onChange={(e) => setSelectedDojangId(e.target.value)}
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-hapkido-navy"
          >
            <option value="">-- Semua Cabang Dojang --</option>
            {dojangs.map((d) => (
              <option key={d.id} value={d.id}>
                📍 {d.name} ({d.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          onClick={() => setActiveTab('anggota')}
          className={`px-4 py-2.5 font-bold text-xs rounded-t-2xl transition border-b-2 flex items-center gap-2 ${
            activeTab === 'anggota'
              ? 'border-hapkido-red text-hapkido-red bg-white'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Laporan Data Anggota ({filteredMembers.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('iuran')}
          className={`px-4 py-2.5 font-bold text-xs rounded-t-2xl transition border-b-2 flex items-center gap-2 ${
            activeTab === 'iuran'
              ? 'border-hapkido-red text-hapkido-red bg-white'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Laporan Transaksi Pembayaran Iuran ({filteredPayments.length})</span>
        </button>
      </div>

      {/* Report Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          {activeTab === 'anggota' ? (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-500 uppercase">
                  <th className="p-4">Cabang Dojang</th>
                  <th className="p-4">NIA</th>
                  <th className="p-4">Nama Anggota</th>
                  <th className="p-4">Sabuk Saat Ini</th>
                  <th className="p-4">No HP</th>
                  <th className="p-4">Orang Tua / Wali</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMembers.length > 0 ? (
                  filteredMembers.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50/80 transition">
                      <td className="p-4 font-bold text-hapkido-navy">
                        <span className="px-2 py-0.5 bg-slate-100 rounded text-[11px]">
                          {m.dojang?.name || 'Cabang Utama'}
                        </span>
                      </td>
                      <td className="p-4 font-mono font-bold text-slate-700">{m.nia}</td>
                      <td className="p-4 font-bold text-slate-800">{m.fullName}</td>
                      <td className="p-4 font-semibold text-slate-700">{m.currentBelt?.name || 'Sabuk Putih'}</td>
                      <td className="p-4 text-slate-600">{m.phone || '-'}</td>
                      <td className="p-4 text-slate-600">{m.parentName || '-'}</td>
                      <td className="p-4 font-extrabold text-emerald-700">{m.status}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-slate-400 font-medium">
                      Tidak ada data anggota untuk cabang Dojang ini.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-500 uppercase">
                  <th className="p-4">Cabang Dojang</th>
                  <th className="p-4">Invoice</th>
                  <th className="p-4">Anggota</th>
                  <th className="p-4">Jenis Iuran</th>
                  <th className="p-4">Metode</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Nominal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPayments.length > 0 ? (
                  filteredPayments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition">
                      <td className="p-4 font-bold text-hapkido-navy">
                        <span className="px-2 py-0.5 bg-slate-100 rounded text-[11px]">
                          {p.member?.dojang?.name || p.dojang?.name || 'Cabang Utama'}
                        </span>
                      </td>
                      <td className="p-4 font-mono font-bold text-slate-700">{p.invoiceNo || '-'}</td>
                      <td className="p-4 font-bold text-slate-800">{p.member?.fullName || 'Peserta'}</td>
                      <td className="p-4 text-slate-700">{p.duesType?.name || 'Iuran'}</td>
                      <td className="p-4 font-bold text-slate-600">{p.paymentMethod}</td>
                      <td className="p-4 font-extrabold text-emerald-700">{p.status}</td>
                      <td className="p-4 font-bold text-slate-800">Rp {p.paidAmount?.toLocaleString('id-ID')}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-slate-400 font-medium">
                      Tidak ada transaksi iuran untuk cabang Dojang ini.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
