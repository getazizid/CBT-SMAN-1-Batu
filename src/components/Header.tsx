import React from 'react';
import { Lock, LogOut, ShieldCheck, UserCheck, Cloud, CloudOff } from 'lucide-react';
import { AdminAccount, Exam, UserRole } from '../types';

interface HeaderProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  currentAdmin: AdminAccount | null;
  onOpenAdminLogin: () => void;
  onLogoutAdmin: () => void;
  activeExam?: Exam | null;
  onResetDemo?: () => void;
  isCloudConnected?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onRoleChange,
  currentAdmin,
  onOpenAdminLogin,
  onLogoutAdmin,
  isCloudConnected = false,
}) => {
  const handleAdminClick = () => {
    if (currentAdmin) {
      onRoleChange('admin');
    } else {
      onOpenAdminLogin();
    }
  };

  return (
    <header className="bg-white text-slate-900 border-b border-slate-200 shadow-xs sticky top-0 z-40">
      {/* Main navigation header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* School Logo & Title */}
        <div className="flex items-center gap-3">
          <img
            src="/logo-sman1-batu.png"
            alt="Logo SMAN 1 Batu"
            className="w-10 h-11 object-contain drop-shadow-xs"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-base sm:text-lg tracking-tight text-slate-900">
                SMAN 1 BATU
              </h1>
              <span className="bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                CBT Portal
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              Computer Based Test &bull; Kota Batu
            </p>
          </div>
        </div>

        {/* Right Section: Cloud Status & Role Switcher */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Cloud Connection Badge */}
          <div className="hidden md:flex items-center">
            {isCloudConnected ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-xs">
                <Cloud className="w-3.5 h-3.5 text-emerald-600" />
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Cloud Online</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200 shadow-xs">
                <CloudOff className="w-3.5 h-3.5 text-slate-400" />
                <span>Offline Cache</span>
              </span>
            )}
          </div>

          {/* Role Switcher */}
          <div className="bg-slate-100 p-1 rounded-xl border border-slate-200 flex items-center gap-1">
            <button
              id="role-student-btn"
              onClick={() => onRoleChange('student')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                currentRole === 'student'
                  ? 'bg-white text-blue-700 shadow-xs font-bold border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Ruang Siswa</span>
            </button>

            <button
              id="role-admin-btn"
              onClick={handleAdminClick}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                currentRole === 'admin'
                  ? 'bg-blue-600 text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              {currentAdmin ? (
                <ShieldCheck className="w-4 h-4" />
              ) : (
                <Lock className="w-3.5 h-3.5 text-slate-400" />
              )}
              <span>Admin & Guru</span>
            </button>
          </div>

          {/* If Logged in as Admin and in Admin view */}
          {currentRole === 'admin' && currentAdmin && (
            <button
              onClick={onLogoutAdmin}
              className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
              title="Kunci / Keluar dari Panel Admin"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Kunci Panel</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
