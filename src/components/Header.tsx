import React from 'react';
import { Lock, LogOut, ShieldCheck, UserCheck, Cloud, CloudOff, Sun, Moon } from 'lucide-react';
import { AdminAccount, Exam, UserRole } from '../types';
import { useTheme } from '../context/ThemeContext';

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
  const { theme, toggleTheme } = useTheme();

  const handleAdminClick = () => {
    if (currentAdmin) {
      onRoleChange('admin');
    } else {
      onOpenAdminLogin();
    }
  };

  return (
    <header className="bg-white/90 dark:bg-slate-900/90 text-slate-900 dark:text-slate-100 border-b border-slate-200/80 dark:border-slate-800/90 backdrop-blur-md shadow-xs sticky top-0 z-40 transition-colors duration-200">
      {/* Main navigation header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* School Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src="/logo-sman1-batu.png"
              alt="Logo SMAN 1 Batu"
              className="w-10 h-11 object-contain drop-shadow-sm transition-transform hover:scale-105"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900 dark:text-white">
                SMAN 1 BATU
              </h1>
              <span className="bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                CBT Portal
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block font-medium">
              Computer Based Test &bull; Sistem Asesmen Digital
            </p>
          </div>
        </div>

        {/* Right Section: Theme Toggle, Cloud Status & Role Switcher */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Cloud Connection Badge */}
          <div className="hidden md:flex items-center">
            {isCloudConnected ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80 shadow-xs">
                <Cloud className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Cloud Online</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 shadow-xs">
                <CloudOff className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                <span>Offline Cache</span>
              </span>
            )}
          </div>

          {/* Light / Dark Mode Toggle Button */}
          <button
            onClick={toggleTheme}
            id="theme-toggle-btn"
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800/90 hover:bg-slate-200/80 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700/80 transition-all cursor-pointer shadow-xs focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            title={theme === 'dark' ? 'Beralih ke Mode Terang (Light Mode)' : 'Beralih ke Mode Gelap (Dark Mode)'}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400 animate-in spin-in-90 duration-300" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700 animate-in spin-in-90 duration-300" />
            )}
          </button>

          {/* Role Switcher */}
          <div className="bg-slate-100/90 dark:bg-slate-800/90 p-1 rounded-2xl border border-slate-200 dark:border-slate-700/80 flex items-center gap-1">
            <button
              id="role-student-btn"
              onClick={() => onRoleChange('student')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                currentRole === 'student'
                  ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 shadow-xs font-bold border border-slate-200/80 dark:border-slate-600'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700/50'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Ruang Siswa</span>
            </button>

            <button
              id="role-admin-btn"
              onClick={handleAdminClick}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                currentRole === 'admin'
                  ? 'bg-blue-600 text-white shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700/50'
              }`}
            >
              {currentAdmin ? (
                <ShieldCheck className="w-4 h-4 text-white" />
              ) : (
                <Lock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
              )}
              <span>Admin & Guru</span>
            </button>
          </div>

          {/* If Logged in as Admin and in Admin view */}
          {currentRole === 'admin' && currentAdmin && (
            <button
              onClick={onLogoutAdmin}
              className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
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
