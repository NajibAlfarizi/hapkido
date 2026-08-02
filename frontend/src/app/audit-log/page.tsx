"use client";

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { ShieldAlert, Activity, User } from 'lucide-react';

export default function AuditLogPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/audit-logs').then((res) => {
      if (res.success) setLogs(res.data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <h1 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-hapkido-navy" />
          Audit Log Aktivitas Sistem
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Pencatatan riwayat aktivitas pengguna (Login, Logout, Tambah Data, Edit, Hapus) untuk keamanan dan transparansi.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-500 uppercase">
                <th className="p-4">Waktu</th>
                <th className="p-4">Pengguna</th>
                <th className="p-4">Aksi</th>
                <th className="p-4">Modul / Entitas</th>
                <th className="p-4">Rincian Aktivitas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-slate-400">
                    Memuat audit log...
                  </td>
                </tr>
              ) : logs.length > 0 ? (
                logs.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-4 text-slate-500 font-medium">
                      {new Date(l.createdAt).toLocaleString('id-ID')}
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-slate-800">{l.userName}</p>
                      <span className="text-[10px] font-extrabold uppercase text-slate-400">{l.userRole}</span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-extrabold ${
                          l.action === 'LOGIN'
                            ? 'bg-blue-100 text-blue-800'
                            : l.action === 'CREATE'
                            ? 'bg-emerald-100 text-emerald-800'
                            : l.action === 'UPDATE'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {l.action}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-slate-700">{l.entity}</td>
                    <td className="p-4 text-slate-600 font-medium">{l.details}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-slate-400">
                    Belum ada log aktivitas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
