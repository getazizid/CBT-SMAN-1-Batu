import React, { useState, useEffect } from 'react';
import { X, User, Lock, Mail, Shield, CheckCircle2 } from 'lucide-react';
import { AdminAccount } from '../../types';

interface AccountEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: AdminAccount | null;
  onSaveAccount: (account: AdminAccount) => void;
}

export const AccountEditorModal: React.FC<AccountEditorModalProps> = ({
  isOpen,
  onClose,
  account,
  onSaveAccount,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'Administrator' | 'Guru Pengampu' | 'Proktor'>('Guru Pengampu');
  const [email, setEmail] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (account) {
      setUsername(account.username);
      setPassword(account.password);
      setName(account.name);
      setRole(account.role || 'Guru Pengampu');
      setEmail(account.email || '');
    } else {
      setUsername('');
      setPassword('');
      setName('');
      setRole('Guru Pengampu');
      setEmail('');
    }
    setErrorMsg('');
  }, [account, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setErrorMsg('Username wajib diisi.');
      return;
    }
    if (!password.trim()) {
      setErrorMsg('Password wajib diisi.');
      return;
    }
    if (!name.trim()) {
      setErrorMsg('Nama Lengkap Guru/Admin wajib diisi.');
      return;
    }

    const saved: AdminAccount = {
      id: account?.id || `adm-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      username: username.trim().toLowerCase(),
      password: password.trim(),
      name: name.trim(),
      role,
      ...(email.trim() ? { email: email.trim() } : {}),
      createdAt: account?.createdAt || new Date().toISOString(),
      ...(account?.lastLogin ? { lastLogin: account.lastLogin } : {}),
    };

    onSaveAccount(saved);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">
                {account ? 'Edit Akun Admin / Guru' : 'Tambah Akun Baru'}
              </h3>
              <p className="text-xs text-slate-500">
                Akses manajemen soal dan penilaian CBT SMAN 1 Batu
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 font-medium">
              {errorMsg}
            </div>
          )}

          {/* Full Name */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Nama Lengkap & Gelar <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Contoh: Dra. Sri Wahyuni, M.Pd."
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Username */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Username <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Contoh: guru_mtk"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Password akun"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none font-mono"
                />
              </div>
            </div>
          </div>

          {/* Role */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Peran / Hak Akses
            </label>
            <select
              value={role}
              onChange={(e) =>
                setRole(e.target.value as 'Administrator' | 'Guru Pengampu' | 'Proktor')
              }
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
            >
              <option value="Guru Pengampu">Guru Pengampu (Kelola Soal & Nilai)</option>
              <option value="Proktor">Proktor Ujian (Monitor Peserta & Token)</option>
              <option value="Administrator">Administrator (Semua Akses & Pengaturan Akun)</option>
            </select>
          </div>

          {/* Email */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Email Pengampu <span className="text-slate-400 font-normal">(Opsional)</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="email"
                placeholder="email@sman1batu.sch.id"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Simpan Akun</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
