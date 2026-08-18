import React, { useState } from 'react';
import { X, ShieldCheck, Lock, User, ArrowRight, AlertCircle, KeyRound } from 'lucide-react';
import { AdminAccount } from '../../types';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  adminAccounts: AdminAccount[];
  onLoginSuccess: (account: AdminAccount) => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  adminAccounts,
  onLoginSuccess,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanUsername = username.trim();
    const cleanPassword = password.trim();

    if (!cleanUsername || !cleanPassword) {
      setErrorMsg('Harap masukkan Username dan Password.');
      return;
    }

    const matched = adminAccounts.find(
      (acc) =>
        acc.username.toLowerCase() === cleanUsername.toLowerCase() &&
        acc.password === cleanPassword
    );

    if (!matched) {
      setErrorMsg('Username atau Password Admin/Guru salah! Silakan coba lagi.');
      return;
    }

    // Success
    const updatedAccount = {
      ...matched,
      lastLogin: new Date().toISOString(),
    };
    onLoginSuccess(updatedAccount);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">
                Login Panel Admin & Guru
              </h3>
              <p className="text-xs text-slate-500">
                SMAN 1 Batu &bull; Akses Terproteksi
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <p className="font-medium leading-relaxed">{errorMsg}</p>
            </div>
          )}

          {/* Quick Demo Info */}
          <div className="bg-blue-50/60 border border-blue-200/80 rounded-xl p-3 text-[11px] text-slate-600 flex items-start gap-2">
            <KeyRound className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-blue-950 block">Akun Bawaan Sistem:</span>
              <p className="text-slate-600 mt-0.5">
                Username: <code className="bg-white px-1.5 py-0.2 rounded border font-mono font-bold text-blue-700">admin</code> &bull; Password: <code className="bg-white px-1.5 py-0.2 rounded border font-mono font-bold text-blue-700">admin123</code>
              </p>
            </div>
          </div>

          {/* Username Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Username Admin / Guru
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="Masukkan username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoFocus
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl pl-10 pr-3.5 py-2.5 text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none font-medium transition-all"
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[11px] text-blue-600 hover:underline cursor-pointer font-medium"
              >
                {showPassword ? 'Sembunyikan' : 'Lihat'}
              </button>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Masukkan password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl pl-10 pr-3.5 py-2.5 text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none font-medium transition-all"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <span>Masuk Sebagai Admin</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
