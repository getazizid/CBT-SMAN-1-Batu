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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
        {/* School Logo & Title */}
        <div className="flex items-center gap-2.5">
          <img
            src="/logo-sman1-batu.png"
            alt="Logo SMAN 1 Batu"
            className="w-8 h-9 object-contain drop-shadow-xs"
          />
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-sm sm:text-base tracking-tight text-slate-900 dark:text-white">
              SMAN 1 BATU
            </span>
            <span className="bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              CBT
            </span>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Cloud Badge (only for admin view) */}
          {currentRole === 'admin' && (
            <div className="hidden sm:flex items-center">
              {isCloudConnected ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80 shadow-xs">
                  <Cloud className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Cloud Online</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 shadow-xs">
                  <CloudOff className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                  <span>Offline</span>
                </span>
              )}
            </div>
          )}

          {/* Light / Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            id="theme-toggle-btn"
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800/90 hover:bg-slate-200/80 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700/80 transition-all cursor-pointer shadow-xs focus:outline-none"
            title={theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </button>

          {/* Admin Switch / Login */}
          {currentRole === 'student' ? (
            <button
              id="role-admin-btn"
              onClick={handleAdminClick}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700/80 transition-all cursor-pointer shadow-xs"
              title="Akses Admin & Guru"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Admin</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                id="role-student-btn"
                onClick={() => onRoleChange('student')}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Ruang Siswa</span>
              </button>

              {currentAdmin && (
                <button
                  onClick={onLogoutAdmin}
                  className="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
                  title="Keluar dari Panel Admin"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Keluar Admin</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
