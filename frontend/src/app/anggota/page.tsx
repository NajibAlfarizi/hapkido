"use client";

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { QRCodeSVG } from 'qrcode.react';
import {
  Users,
  Plus,
  Search,
  Printer,
  Edit,
  Trash2,
  X,
  Shield,
  Phone,
  UserCheck,
  Award,
  AlertCircle
} from 'lucide-react';

export default function AnggotaPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [belts, setBelts] = useState<any[]>([]);
  const [dojangs, setDojangs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [selectedBelt, setSelectedBelt] = useState('');
  const [selectedDojang, setSelectedDojang] = useState('');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMemberCard, setSelectedMemberCard] = useState<any>(null);

  // Form state
  const [form, setForm] = useState({
    id: '',
    dojangId: '',
    fullName: '',
    nickname: '',
    gender: 'LAKILAKI',
    birthPlace: '',
    birthDate: '',
    phone: '',
    email: '',
    address: '',
    parentName: '',
    parentPhone: '',
    parentJob: '',
    emergencyContact: '',
    currentBeltId: '',
  });

  const loadData = async () => {
    setLoading(true);
    const query = new URLSearchParams();
    if (search) query.append('search', search);
    if (selectedBelt) query.append('beltId', selectedBelt);
    if (selectedDojang) query.append('dojangId', selectedDojang);

    const [resMembers, resBelts, resDojangs] = await Promise.all([
      apiFetch(`/members?${query.toString()}`),
      apiFetch('/belts'),
      apiFetch('/dojangs'),
    ]);

    if (resMembers.success) setMembers(resMembers.data);
    if (resBelts.success) setBelts(resBelts.data);
    if (resDojangs.success) setDojangs(resDojangs.data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [search, selectedBelt, selectedDojang]);

  const handleSaveMember = async (e: React.FormEvent) => {
    e.preventDefault();
    const isEdit = Boolean(form.id);
    const endpoint = isEdit ? `/members/${form.id}` : '/members';
    const method = isEdit ? 'PUT' : 'POST';

    const res = await apiFetch(endpoint, {
      method,
      body: JSON.stringify(form),
    });

    if (res.success) {
      setShowAddModal(false);
      resetForm();
      loadData();
    } else {
      alert(res.message || 'Gagal menyimpan data anggota.');
    }
  };

  const handleDeleteMember = async (id: string, name: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus anggota ${name}?`)) {
      const res = await apiFetch(`/members/${id}`, { method: 'DELETE' });
      if (res.success) loadData();
    }
  };

  const openEdit = (m: any) => {
    setForm({
      id: m.id,
      dojangId: m.dojangId || '',
      fullName: m.fullName || '',
      nickname: m.nickname || '',
      gender: m.gender || 'LAKILAKI',
      birthPlace: m.birthPlace || '',
      birthDate: m.birthDate ? m.birthDate.substring(0, 10) : '',
      phone: m.phone || '',
      email: m.email || '',
      address: m.address || '',
      parentName: m.parentName || '',
      parentPhone: m.parentPhone || '',
      parentJob: m.parentJob || '',
      emergencyContact: m.emergencyContact || '',
      currentBeltId: m.currentBeltId || '',
    });
    setShowAddModal(true);
  };

  const resetForm = () => {
    setForm({
      id: '',
      dojangId: '',
      fullName: '',
      nickname: '',
      gender: 'LAKILAKI',
      birthPlace: '',
      birthDate: '',
      phone: '',
      email: '',
      address: '',
      parentName: '',
      parentPhone: '',
      parentJob: '',
      emergencyContact: '',
      currentBeltId: '',
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
            <Users className="w-6 h-6 text-hapkido-red" />
            Manajemen Anggota Dojang
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Pengelolaan data anggota, pendaftaran cabang dojang, Nomor Induk Anggota (NIA), ortu/wali, & Kartu QR.
          </p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setShowAddModal(true);
          }}
          className="px-4 py-2.5 bg-hapkido-navy hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Anggota Baru</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama anggota, NIA, No HP, atau Nama Ortu..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-hapkido-navy"
          />
        </div>

        {/* Filter Dojang */}
        <select
          value={selectedDojang}
          onChange={(e) => setSelectedDojang(e.target.value)}
          className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-hapkido-navy focus:outline-none focus:ring-2 focus:ring-hapkido-navy"
        >
          <option value="">-- Semua Cabang Dojang --</option>
          {dojangs.map((d) => (
            <option key={d.id} value={d.id}>
              📍 {d.name} ({d.code})
            </option>
          ))}
        </select>

        {/* Filter Sabuk */}
        <select
          value={selectedBelt}
          onChange={(e) => setSelectedBelt(e.target.value)}
          className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-hapkido-navy"
        >
          <option value="">-- Semua Tingkatan Sabuk --</option>
          {belts.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
      </div>

      {/* Members Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="p-4">Anggota / NIA</th>
                <th className="p-4">Cabang Dojang</th>
                <th className="p-4">Tingkatan Sabuk</th>
                <th className="p-4">Data Orang Tua / Wali</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400">
                    Memuat data anggota...
                  </td>
                </tr>
              ) : members.length > 0 ? (
                members.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-hapkido-navy text-white flex items-center justify-center font-bold text-xs uppercase shadow-xs">
                          {m.fullName.substring(0, 2)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-sm">{m.fullName}</p>
                          <span className="inline-block px-2 py-0.5 bg-slate-100 font-mono font-bold text-[10px] text-slate-600 rounded">
                            {m.nia}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <span className="px-2.5 py-1 bg-blue-50 text-blue-800 font-bold text-xs rounded-lg">
                        {m.dojang?.name || 'Dojang Pusat'}
                      </span>
                    </td>

                    <td className="p-4">
                      <span
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold"
                        style={{
                          backgroundColor: m.currentBelt?.badgeColor ? `${m.currentBelt.badgeColor}25` : '#f1f5f9',
                          color: '#1e293b',
                        }}
                      >
                        <Award className="w-3.5 h-3.5" />
                        {m.currentBelt?.name || 'Sabuk Putih'}
                      </span>
                    </td>

                    <td className="p-4">
                      <p className="font-bold text-slate-700">{m.parentName || '-'}</p>
                      <p className="text-[11px] text-slate-400">{m.parentPhone ? `📞 ${m.parentPhone}` : ''}</p>
                    </td>

                    <td className="p-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                          m.status === 'AKTIF'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        {m.status}
                      </span>
                    </td>

                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setSelectedMemberCard(m)}
                          title="Lihat & Cetak Kartu QR Anggota"
                          className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEdit(m)}
                          title="Edit Anggota"
                          className="p-1.5 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-lg transition"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteMember(m.id, m.fullName)}
                          title="Hapus Anggota"
                          className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400">
                    Tidak ada data anggota ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Add / Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h2 className="text-lg font-extrabold text-slate-800">
                {form.id ? 'Edit Data Anggota' : 'Form Tambah Anggota Baru'}
              </h2>
              <button onClick={() => setShowAddModal(false)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMember} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Pilih Cabang Dojang *</label>
                <select
                  required
                  value={form.dojangId}
                  onChange={(e) => setForm({ ...form, dojangId: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-hapkido-navy focus:bg-white focus:ring-2 focus:ring-hapkido-navy"
                >
                  <option value="">-- Pilih Cabang Dojang --</option>
                  {dojangs.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap *</label>
                  <input
                    type="text"
                    required
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-hapkido-navy"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nama Panggilan</label>
                  <input
                    type="text"
                    value={form.nickname}
                    onChange={(e) => setForm({ ...form, nickname: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-hapkido-navy"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Jenis Kelamin *</label>
                  <select
                    value={form.gender}
                    onChange={(e) => setForm({ ...form, gender: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-hapkido-navy"
                  >
                    <option value="LAKILAKI">Laki-laki</option>
                    <option value="PEREMPUAN">Perempuan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tingkatan Sabuk</label>
                  <select
                    value={form.currentBeltId}
                    onChange={(e) => setForm({ ...form, currentBeltId: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-hapkido-navy"
                  >
                    <option value="">-- Pilih Sabuk Awal --</option>
                    {belts.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">No HP Anggota</label>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="0812xxxx"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-hapkido-navy"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nama Orang Tua / Wali</label>
                  <input
                    type="text"
                    value={form.parentName}
                    onChange={(e) => setForm({ ...form, parentName: e.target.value })}
                    placeholder="Nama bapak/ibu wali"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-hapkido-navy"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">No HP Orang Tua / Wali</label>
                  <input
                    type="text"
                    value={form.parentPhone}
                    onChange={(e) => setForm({ ...form, parentPhone: e.target.value })}
                    placeholder="0813xxxx"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-hapkido-navy"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Kontak Darurat</label>
                  <input
                    type="text"
                    value={form.emergencyContact}
                    onChange={(e) => setForm({ ...form, emergencyContact: e.target.value })}
                    placeholder="Misal: 0812xxx (Ibu)"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-hapkido-navy"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Alamat Tempat Tinggal</label>
                <textarea
                  rows={2}
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-hapkido-navy"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-600"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-hapkido-navy hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-md"
                >
                  Simpan Data Anggota
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Code Digital Badge Card Preview Modal */}
      {selectedMemberCard && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-6 text-center">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-sm text-slate-800">Kartu Digital QR Anggota</h3>
              <button onClick={() => setSelectedMemberCard(null)} className="p-1 text-slate-400 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Printable ID Card Container */}
            <div className="bg-gradient-to-br from-hapkido-navy via-slate-800 to-hapkido-red p-6 rounded-2xl text-white shadow-lg space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-md bg-hapkido-red flex items-center justify-center">
                    <Shield className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-xs font-extrabold tracking-wider">
                    {selectedMemberCard.dojang?.name || 'DOJANG HAPKIDO'}
                  </span>
                </div>
                <span className="px-2 py-0.5 bg-white/20 rounded text-[9px] font-mono font-bold">
                  {selectedMemberCard.nia}
                </span>
              </div>

              <div className="bg-white p-3 rounded-xl inline-block shadow-md">
                <QRCodeSVG value={selectedMemberCard.nia} size={130} />
              </div>

              <div>
                <h2 className="text-base font-extrabold leading-tight text-white">{selectedMemberCard.fullName}</h2>
                <p className="text-xs text-hapkido-lightBlue font-semibold mt-1">
                  Sabuk: {selectedMemberCard.currentBelt?.name || 'Sabuk Putih'}
                </p>
              </div>
            </div>

            <button
              onClick={() => window.print()}
              className="w-full py-2.5 bg-slate-800 text-white rounded-xl text-xs font-bold shadow-md hover:bg-slate-900 transition flex items-center justify-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Kartu QR Anggota</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
