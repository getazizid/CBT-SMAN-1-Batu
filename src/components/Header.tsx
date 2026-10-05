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
    <header className="bg-blue-600 dark:bg-blue-950 text-white border-b border-blue-700 dark:border-blue-900 shadow-sm sticky top-0 z-40 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
        {/* School Logo & Title */}
        <div className="flex items-center gap-2.5">
          <img
            src="/logo-sman1-batu.png"
            alt="Logo SMAN 1 Batu"
            className="w-8 h-9 object-contain drop-shadow-xs"
          />
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-sm sm:text-base tracking-tight text-white">
              SMAN 1 BATU
            </span>
            <span className="bg-white/15 text-white border border-white/30 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider backdrop-blur-xs">
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
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold bg-emerald-500/20 text-emerald-100 border border-emerald-400/40 shadow-xs">
                  <Cloud className="w-3.5 h-3.5 text-emerald-300" />
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Cloud Online</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold bg-white/10 text-white/80 border border-white/20 shadow-xs">
                  <CloudOff className="w-3.5 h-3.5 text-white/60" />
                  <span>Offline</span>
                </span>
              )}
            </div>
          )}

          {/* Light / Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            id="theme-toggle-btn"
            className="p-2 rounded-xl text-white/90 hover:text-white bg-blue-700/80 hover:bg-blue-700 dark:bg-blue-900/80 dark:hover:bg-blue-800 border border-blue-500/40 dark:border-blue-800/80 transition-colors cursor-pointer shadow-xs focus:outline-none"
            title={theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-300" />
            ) : (
              <Moon className="w-4 h-4 text-blue-100" />
            )}
          </button>

          {/* Admin Switch / Login */}
          {currentRole === 'student' ? (
            <button
              id="role-admin-btn"
              onClick={handleAdminClick}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-blue-700/90 hover:bg-blue-800 dark:bg-blue-900 dark:hover:bg-blue-800 border border-blue-500/50 dark:border-blue-800 transition-colors cursor-pointer shadow-xs"
              title="Akses Admin & Guru"
            >
              <Lock className="w-3.5 h-3.5 text-blue-200" />
              <span>Admin</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                id="role-student-btn"
                onClick={() => onRoleChange('student')}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 bg-blue-700/90 hover:bg-blue-800 dark:bg-blue-900 dark:hover:bg-blue-800 text-white border border-blue-500/50 dark:border-blue-800 transition-colors cursor-pointer"
              >
                <UserCheck className="w-3.5 h-3.5 text-blue-200" />
                <span>Ruang Siswa</span>
              </button>

              {currentAdmin && (
                <button
                  onClick={onLogoutAdmin}
                  className="flex items-center gap-1.5 text-xs text-rose-100 hover:text-white bg-rose-600/85 hover:bg-rose-600 border border-rose-500/50 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
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
