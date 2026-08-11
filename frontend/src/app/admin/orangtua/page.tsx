"use client";

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import {
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Trash2,
  Edit,
  UserCheck,
  Search,
  AlertCircle,
  UserPlus
} from 'lucide-react';

export default function AdminOrangTuaPage() {
  const [parentAccounts, setParentAccounts] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);

  const [selectedParent, setSelectedParent] = useState<any>(null);
  const [showManageModal, setShowManageModal] = useState(false);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [targetStatus, setTargetStatus] = useState('AKTIF');

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [resParents, resMembers] = await Promise.all([
      apiFetch('/admin/parent-accounts'),
      apiFetch('/members?status=AKTIF'),
    ]);

    if (resParents.success) setParentAccounts(resParents.data || []);
    if (resMembers.success) setMembers(resMembers.data || []);
    setLoading(false);
  };

  const [memberSearch, setMemberSearch] = useState('');

  const handleOpenManageModal = (parent: any) => {
    setSelectedParent(parent);
    setTargetStatus(parent.status);
    const linkedIds = parent.children ? parent.children.map((c: any) => c.member?.id).filter(Boolean) : [];
    setSelectedMemberIds(linkedIds);
    setMemberSearch('');
    setShowManageModal(true);
  };

  const handleToggleMemberSelect = (memberId: string) => {
    if (selectedMemberIds.includes(memberId)) {
      setSelectedMemberIds(selectedMemberIds.filter((id) => id !== memberId));
    } else {
      setSelectedMemberIds([...selectedMemberIds, memberId]);
    }
  };

  const handleSaveParentApproval = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedParent) return;

    setSubmitting(true);
    setMsg(null);

    const res = await apiFetch(`/admin/parent-accounts/${selectedParent.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        status: targetStatus,
        memberIds: selectedMemberIds,
      }),
    });

    setSubmitting(false);

    if (res.success) {
      setMsg({ type: 'success', text: res.message });
      setShowManageModal(false);
      loadData();
    } else {
      setMsg({ type: 'error', text: res.message || 'Gagal menyetujui akun orang tua.' });
    }
  };

  const handleDeleteParent = async (parentId: string, parentName: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus akun orang tua '${parentName}'?`)) return;

    const res = await apiFetch(`/admin/parent-accounts/${parentId}`, {
      method: 'DELETE',
    });

    if (res.success) {
      setMsg({ type: 'success', text: res.message });
      loadData();
    } else {
      setMsg({ type: 'error', text: res.message || 'Gagal menghapus akun.' });
    }
  };

  const filteredParents = parentAccounts.filter((p) => {
    const matchSearch =
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.username?.toLowerCase().includes(search.toLowerCase()) ||
      p.phone?.includes(search);
    const matchStatus = filterStatus === 'ALL' ? true : p.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const pendingCount = parentAccounts.filter((p) => p.status === 'PENDING').length;

  // Collect map of memberId -> parentName for all OTHER parent accounts
  const memberToOtherParentMap = new Map<string, string>();
  parentAccounts.forEach((p) => {
    if (selectedParent && p.id === selectedParent.id) return; // Skip currently selected parent
    if (p.children && Array.isArray(p.children)) {
      p.children.forEach((c: any) => {
        if (c.member?.id) {
          memberToOtherParentMap.set(c.member.id, p.name);
        }
      });
    }
  });

  // Filter members for modal: exclude members already linked to ANOTHER parent
  const filteredModalMembers = members.filter((m) => {
    const isLinkedToOtherParent = memberToOtherParentMap.has(m.id);
    if (isLinkedToOtherParent) return false;

    const matchSearch =
      m.fullName?.toLowerCase().includes(memberSearch.toLowerCase()) ||
      m.nia?.toLowerCase().includes(memberSearch.toLowerCase());

    return matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-hapkido-navy" />
            Manajemen Akun Orang Tua
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Setujui (Approve) pendaftaran akun Orang Tua dan hubungkan ke data Anggota (anak) dojang.
          </p>
        </div>

        {pendingCount > 0 && (
          <div className="px-4 py-2 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-2 text-xs font-bold text-amber-800 shrink-0">
            <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
            <span>{pendingCount} Akun Menunggu Persetujuan</span>
          </div>
        )}
      </div>

      {msg && (
        <div
          className={`p-4 rounded-2xl text-xs flex items-center gap-2 font-bold ${
            msg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {msg.type === 'success' ? <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" /> : <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />}
          <span>{msg.text}</span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama / username / No. HP..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:ring-2 focus:ring-hapkido-navy"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="font-bold text-slate-500 shrink-0">Status Akun:</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700"
          >
            <option value="ALL">Semua Status</option>
            <option value="PENDING">PENDING (Menunggu)</option>
            <option value="AKTIF">AKTIF (Disetujui)</option>
            <option value="NONAKTIF">NONAKTIF</option>
          </select>
        </div>
      </div>

      {/* Parent Accounts Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="p-4">Orang Tua / Wali</th>
                <th className="p-4">Kontak</th>
                <th className="p-4">Status Akun</th>
                <th className="p-4">Anak (Anggota Terhubung)</th>
                <th className="p-4">Tgl Daftar</th>
                <th className="p-4 text-right">Aksi / Kelola</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400">Memuat akun orang tua...</td>
                </tr>
              ) : filteredParents.length > 0 ? (
                filteredParents.map((parent) => (
                  <tr key={parent.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-4">
                      <p className="font-extrabold text-slate-800">{parent.name}</p>
                      <p className="text-[11px] text-slate-400 font-mono">@{parent.username}</p>
                    </td>
                    <td className="p-4">
                      <p className="font-semibold text-slate-700">{parent.phone || '-'}</p>
                      <p className="text-[11px] text-slate-400">{parent.email || '-'}</p>
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                          parent.status === 'AKTIF'
                            ? 'bg-emerald-100 text-emerald-800'
                            : parent.status === 'PENDING'
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {parent.status === 'PENDING' && <Clock className="w-3 h-3 text-amber-600" />}
                        {parent.status === 'AKTIF' && <CheckCircle className="w-3 h-3 text-emerald-600" />}
                        <span>{parent.status}</span>
                      </span>
                    </td>
                    <td className="p-4">
                      {parent.children && parent.children.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {parent.children.map((c: any) => (
                            <span key={c.member?.id} className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-lg text-[10px] font-bold">
                              {c.member?.fullName} ({c.member?.nia})
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Belum terhubung ke anak</span>
                      )}
                    </td>
                    <td className="p-4 text-slate-500 font-semibold">
                      {new Date(parent.createdAt).toLocaleDateString('id-ID')}
                    </td>
                    <td className="p-4 text-right space-x-1">
                      <button
                        onClick={() => handleOpenManageModal(parent)}
                        className={`px-3 py-1.5 rounded-xl font-bold transition inline-flex items-center gap-1 ${
                          parent.status === 'PENDING'
                            ? 'bg-amber-500 text-white hover:bg-amber-600 shadow-xs'
                            : 'bg-hapkido-navy text-white hover:bg-slate-800'
                        }`}
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>{parent.status === 'PENDING' ? 'Setujui (Approve)' : 'Kelola'}</span>
                      </button>
                      <button
                        onClick={() => handleDeleteParent(parent.id, parent.name)}
                        className="p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition"
                        title="Hapus Akun"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400">Tidak ada data akun orang tua.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Manage / Approve Parent Account */}
      {showManageModal && selectedParent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-800 text-sm">Persetujuan & Relasi Akun Orang Tua</h3>
                <p className="text-xs text-slate-500">{selectedParent.name} (@{selectedParent.username})</p>
              </div>
              <button onClick={() => setShowManageModal(false)} className="text-slate-400 hover:text-slate-600 text-lg font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveParentApproval} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Status Akun *</label>
                <select
                  value={targetStatus}
                  onChange={(e) => setTargetStatus(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700"
                >
                  <option value="AKTIF">AKTIF (Disetujui - Bisa Login)</option>
                  <option value="PENDING">PENDING (Menunggu Persetujuan)</option>
                  <option value="NONAKTIF">NONAKTIF (Tidak Bisa Login)</option>
                </select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-slate-700">Hubungkan ke Anggota (Anak):</label>
                  {selectedMemberIds.length > 0 && (
                    <span className="text-[10px] font-extrabold text-hapkido-navy bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                      {selectedMemberIds.length} Anak Dipilih
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500">Pilih anggota anak (hanya menampilkan anggota yang belum terhubung ke orang tua lain):</p>

                {/* Search Input for Child Name / NIA */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={memberSearch}
                    onChange={(e) => setMemberSearch(e.target.value)}
                    placeholder="🔍 Cari nama anak / Nomor Induk Anggota (NIA)..."
                    className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-xs focus:bg-white focus:ring-2 focus:ring-hapkido-navy transition"
                  />
                  {memberSearch && (
                    <button
                      type="button"
                      onClick={() => setMemberSearch('')}
                      className="absolute right-2.5 top-2 text-[10px] font-bold text-slate-400 hover:text-slate-600 bg-slate-200 hover:bg-slate-300 px-1.5 py-0.5 rounded"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div className="max-h-56 overflow-y-auto border border-slate-200 rounded-2xl p-2 space-y-1.5 bg-slate-50">
                  {filteredModalMembers.length > 0 ? (
                    filteredModalMembers.map((m) => {
                      const isSelected = selectedMemberIds.includes(m.id);
                      return (
                        <label
                          key={m.id}
                          onClick={() => handleToggleMemberSelect(m.id)}
                          className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition border ${
                            isSelected ? 'bg-hapkido-navy/10 border-hapkido-navy font-bold text-hapkido-navy shadow-2xs' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}}
                              className="rounded border-slate-300 text-hapkido-navy focus:ring-hapkido-navy"
                            />
                            <span>{m.fullName}</span>
                          </div>
                          <span className="font-mono text-[10px] text-slate-400">{m.nia}</span>
                        </label>
                      );
                    })
                  ) : (
                    <div className="p-6 text-center text-slate-400 text-xs">
                      Anak dengan nama / NIA "{memberSearch}" tidak ditemukan.
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowManageModal(false)}
                  className="px-3 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-hapkido-navy text-white rounded-xl font-bold shadow-md hover:bg-slate-800 transition disabled:opacity-50"
                >
                  {submitting ? 'Simpan...' : 'Simpan Persetujuan & Relasi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
