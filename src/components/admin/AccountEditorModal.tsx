import React, { useState, useEffect } from 'react';
import { X, User, Lock, Mail, Shield, CheckCircle2, BookOpen } from 'lucide-react';
import { AdminAccount } from '../../types';

interface AccountEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: AdminAccount | null;
  availableSubjects?: string[];
  onSaveAccount: (account: AdminAccount) => void;
}

export const AccountEditorModal: React.FC<AccountEditorModalProps> = ({
  isOpen,
  onClose,
  account,
  availableSubjects = [],
  onSaveAccount,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'Administrator' | 'Guru Pengampu' | 'Proktor'>('Guru Pengampu');
  const [email, setEmail] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [customSubjectInput, setCustomSubjectInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (account) {
      setUsername(account.username);
      setPassword(account.password);
      setName(account.name);
      setRole(account.role || 'Guru Pengampu');
      setEmail(account.email || '');
      if (account.subjects && account.subjects.length > 0) {
        setSelectedSubjects(account.subjects);
      } else if (account.subject) {
        setSelectedSubjects(account.subject.split(',').map((s) => s.trim()).filter(Boolean));
      } else {
        setSelectedSubjects([]);
      }
    } else {
      setUsername('');
      setPassword('');
      setName('');
      setRole('Guru Pengampu');
      setEmail('');
      setSelectedSubjects([]);
    }
    setCustomSubjectInput('');
    setErrorMsg('');
  }, [account, isOpen]);

  if (!isOpen) return null;

  const handleAddSubject = (subjectName: string) => {
    const clean = subjectName.trim();
    if (!clean) return;
    if (!selectedSubjects.some((s) => s.toLowerCase() === clean.toLowerCase())) {
      setSelectedSubjects((prev) => [...prev, clean]);
    }
    setCustomSubjectInput('');
  };

  const handleRemoveSubject = (subjectName: string) => {
    setSelectedSubjects((prev) =>
      prev.filter((s) => s.toLowerCase() !== subjectName.toLowerCase())
    );
  };

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
    if (role === 'Guru Pengampu' && selectedSubjects.length === 0) {
      setErrorMsg('Guru Pengampu wajib memilih atau menambahkan minimal 1 Mata Pelajaran.');
      return;
    }

    const saved: AdminAccount = {
      id: account?.id || `adm-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      username: username.trim().toLowerCase(),
      password: password.trim(),
      name: name.trim(),
      role,
      ...(role === 'Guru Pengampu'
        ? {
            subject: selectedSubjects.join(', '),
            subjects: selectedSubjects,
          }
        : {}),
      ...(email.trim() ? { email: email.trim() } : {}),
      createdAt: account?.createdAt || new Date().toISOString(),
      ...(account?.lastLogin ? { lastLogin: account.lastLogin } : {}),
    };

    onSaveAccount(saved);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs transition-colors duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md shadow-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                {account ? 'Edit Akun Admin / Guru' : 'Tambah Akun Baru'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Akses manajemen soal dan penilaian CBT SMAN 1 Batu
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-2xl text-rose-700 dark:text-rose-300 font-medium">
              {errorMsg}
            </div>
          )}

          {/* Full Name */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Nama Lengkap & Gelar <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Contoh: Dra. Sri Wahyuni, M.Pd."
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none font-medium placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Username */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Username <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Contoh: guru_mtk"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-3 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl font-mono focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Password akun"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none font-mono placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </div>
            </div>
          </div>

          {/* Role */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Peran / Hak Akses
            </label>
            <select
              value={role}
              onChange={(e) =>
                setRole(e.target.value as 'Administrator' | 'Guru Pengampu' | 'Proktor')
              }
              className="w-full px-3 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl font-semibold focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none"
            >
              <option value="Guru Pengampu">Guru Pengampu (Kelola Soal & Nilai)</option>
              <option value="Proktor">Proktor Ujian (Monitor Peserta & Token)</option>
              <option value="Administrator">Administrator (Semua Akses & Pengaturan Akun)</option>
            </select>
          </div>

          {/* Mata Pelajaran (Khusus Guru Pengampu) */}
          {role === 'Guru Pengampu' && (
            <div className="p-3.5 bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 rounded-2xl space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="block font-bold text-slate-800 dark:text-blue-200 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Mata Pelajaran yang Diampu <span className="text-rose-500">*</span></span>
                </label>
                <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold bg-blue-100 dark:bg-blue-900/60 px-2 py-0.5 rounded-full">
                  {selectedSubjects.length} Dipilih
                </span>
              </div>

              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Sinkron dengan paket ujian di CBT. Guru hanya dapat melihat soal, nilai, dan sesi ujian sesuai mata pelajaran ini (tidak campur antar guru).
              </p>

              {/* Chips mata pelajaran terpilih */}
              {selectedSubjects.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {selectedSubjects.map((subj) => (
                    <span
                      key={subj}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-blue-600 text-white font-semibold text-[11px] shadow-xs"
                    >
                      <span>{subj}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSubject(subj)}
                        className="hover:bg-blue-700 rounded-full p-0.5 cursor-pointer transition-colors"
                        title="Hapus mata pelajaran"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Pilih dari daftar mapel CBT */}
              <div>
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      handleAddSubject(e.target.value);
                      e.target.value = '';
                    }
                  }}
                  defaultValue=""
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="" disabled>
                    + Pilih Mata Pelajaran (Sinkron dari CBT)
                  </option>
                  {availableSubjects && availableSubjects.length > 0 ? (
                    availableSubjects.map((s) => (
                      <option
                        key={s}
                        value={s}
                        disabled={selectedSubjects.some((sel) => sel.toLowerCase() === s.toLowerCase())}
                      >
                        {s} {selectedSubjects.some((sel) => sel.toLowerCase() === s.toLowerCase()) ? '✓ (Sudah dipilih)' : ''}
                      </option>
                    ))
                  ) : (
                    <option value="Informatika - Computational Thinking">
                      Informatika - Computational Thinking
                    </option>
                  )}
                </select>
              </div>

              {/* Tambah mapel manual jika belum ada di CBT */}
              <div className="flex items-center gap-1.5 pt-0.5">
                <input
                  type="text"
                  placeholder="Atau ketik mapel manual (cth: Sejarah Indonesia)..."
                  value={customSubjectInput}
                  onChange={(e) => setCustomSubjectInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSubject(customSubjectInput);
                    }
                  }}
                  className="flex-1 px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
                <button
                  type="button"
                  onClick={() => handleAddSubject(customSubjectInput)}
                  disabled={!customSubjectInput.trim()}
                  className="px-3 py-2 text-xs bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl font-bold cursor-pointer transition-colors shadow-xs"
                >
                  Tambah
                </button>
              </div>
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Email Pengampu <span className="text-slate-400 font-normal">(Opsional)</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-2.5" />
              <input
                type="email"
                placeholder="email@sman1batu.sch.id"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
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
