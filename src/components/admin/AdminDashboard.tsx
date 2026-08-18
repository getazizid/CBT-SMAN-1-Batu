import React, { useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Download,
  Edit,
  Eye,
  EyeOff,
  FileSpreadsheet,
  Filter,
  GraduationCap,
  Key,
  KeyRound,
  ListOrdered,
  Lock,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sliders,
  Trash2,
  Upload,
  UserCheck,
  UserCog,
  UserPlus,
  Users,
  X
} from 'lucide-react';
import {
  AdminAccount,
  Exam,
  OptionScoreMap,
  Question,
  RegisteredStudent,
  StudentExamSubmission,
} from '../../types';
import { exportExamResultsToExcel } from '../../utils/exportTools';
import { AccountEditorModal } from './AccountEditorModal';
import { ExamEditorModal } from './ExamEditorModal';
import { StudentBatchImportModal } from './StudentBatchImportModal';
import { StudentDetailModal } from './StudentDetailModal';
import { StudentEditorModal } from './StudentEditorModal';
import { WordImportModal } from './WordImportModal';

interface AdminDashboardProps {
  exams: Exam[];
  submissions: StudentExamSubmission[];
  students: RegisteredStudent[];
  adminAccounts: AdminAccount[];
  currentAdmin: AdminAccount | null;
  enforceWhitelist: boolean;
  onUpdateExams: (exams: Exam[]) => void;
  onUpdateSubmissions: (submissions: StudentExamSubmission[]) => void;
  onUpdateStudents: (students: RegisteredStudent[]) => void;
  onUpdateAdminAccounts: (accounts: AdminAccount[]) => void;
  onToggleEnforceWhitelist: (enforce: boolean) => void;
  onLogoutAdmin: () => void;
}

type AdminTab = 'exams' | 'questions' | 'students' | 'submissions' | 'accounts';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  exams,
  submissions,
  students,
  adminAccounts,
  currentAdmin,
  enforceWhitelist,
  onUpdateExams,
  onUpdateSubmissions,
  onUpdateStudents,
  onUpdateAdminAccounts,
  onToggleEnforceWhitelist,
  onLogoutAdmin,
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('exams');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  const [selectedExamId, setSelectedExamId] = useState<string>(exams[0]?.id || '');
  const [searchStudent, setSearchStudent] = useState('');
  const [selectedClassFilter, setSelectedClassFilter] = useState('ALL');

  // Student management filters
  const [searchRegisteredStudent, setSearchRegisteredStudent] = useState('');
  const [studentClassFilter, setStudentClassFilter] = useState('ALL');
  const [studentStatusFilter, setStudentStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  // Account management state
  const [searchAccount, setSearchAccount] = useState('');
  const [showPasswordsMap, setShowPasswordsMap] = useState<Record<string, boolean>>({});
  const [isAccountEditorOpen, setIsAccountEditorOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<AdminAccount | null>(null);

  // Modals state
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [isWordImportOpen, setIsWordImportOpen] = useState(false);
  const [viewingSubmission, setViewingSubmission] = useState<StudentExamSubmission | null>(null);

  // Student Modals state
  const [isStudentEditorOpen, setIsStudentEditorOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<RegisteredStudent | null>(null);
  const [isStudentBatchImportOpen, setIsStudentBatchImportOpen] = useState(false);

  const currentExam = exams.find((e) => e.id === selectedExamId) || exams[0];

  // Filtered submissions
  const relevantSubmissions = submissions.filter((s) => {
    const matchExam = currentExam ? s.examId === currentExam.id : true;
    const matchSearch =
      s.studentName.toLowerCase().includes(searchStudent.toLowerCase()) ||
      s.studentNisn.includes(searchStudent);
    const matchClass = selectedClassFilter === 'ALL' || s.studentClass === selectedClassFilter;
    return matchExam && matchSearch && matchClass;
  });

  // Filtered registered students
  const filteredStudents = students.filter((std) => {
    const matchSearch =
      std.name.toLowerCase().includes(searchRegisteredStudent.toLowerCase()) ||
      std.nisn.includes(searchRegisteredStudent);
    const matchClass = studentClassFilter === 'ALL' || std.studentClass === studentClassFilter;
    const matchStatus =
      studentStatusFilter === 'ALL' ||
      (studentStatusFilter === 'ACTIVE' && std.isActive) ||
      (studentStatusFilter === 'INACTIVE' && !std.isActive);
    return matchSearch && matchClass && matchStatus;
  });

  // Filtered admin accounts
  const filteredAccounts = adminAccounts.filter((acc) => {
    return (
      acc.name.toLowerCase().includes(searchAccount.toLowerCase()) ||
      acc.username.toLowerCase().includes(searchAccount.toLowerCase()) ||
      acc.role.toLowerCase().includes(searchAccount.toLowerCase())
    );
  });

  // Action handlers for exams
  const handleToggleExamActive = (examId: string) => {
    const updated = exams.map((e) => (e.id === examId ? { ...e, isActive: !e.isActive } : e));
    onUpdateExams(updated);
  };

  const handleDeleteExam = (examId: string) => {
    if (exams.length <= 1) {
      alert('Minimal harus ada 1 paket ujian.');
      return;
    }
    if (confirm('Apakah Anda yakin ingin menghapus paket ujian ini?')) {
      const updated = exams.filter((e) => e.id !== examId);
      onUpdateExams(updated);
      if (selectedExamId === examId) {
        setSelectedExamId(updated[0]?.id || '');
      }
    }
  };

  const handleSaveExam = (savedExam: Exam) => {
    const exists = exams.some((e) => e.id === savedExam.id);
    let updated: Exam[];
    if (exists) {
      updated = exams.map((e) => (e.id === savedExam.id ? savedExam : e));
    } else {
      updated = [savedExam, ...exams];
    }
    onUpdateExams(updated);
    setSelectedExamId(savedExam.id);
  };

  const handleImportQuestions = (newQuestions: Question[]) => {
    if (!currentExam) return;
    const updatedExam: Exam = {
      ...currentExam,
      questions: newQuestions,
    };
    handleSaveExam(updatedExam);
  };

  const handleApplyPresetCurrentExam = (preset: OptionScoreMap) => {
    if (!currentExam) return;
    const updatedQuestions = currentExam.questions.map((q) => ({
      ...q,
      optionScores: { ...preset },
    }));
    const updatedExam: Exam = {
      ...currentExam,
      defaultOptionScores: preset,
      questions: updatedQuestions,
    };
    handleSaveExam(updatedExam);
  };

  const handleExportExcel = () => {
    if (!currentExam) return;
    exportExamResultsToExcel(currentExam, submissions);
  };

  // Student CRUD actions
  const handleSaveStudent = (saved: RegisteredStudent) => {
    const exists = students.some((s) => s.id === saved.id || s.nisn === saved.nisn);
    let updated: RegisteredStudent[];
    if (exists) {
      updated = students.map((s) => (s.id === saved.id || s.nisn === saved.nisn ? saved : s));
    } else {
      updated = [saved, ...students];
    }
    onUpdateStudents(updated);
  };

  const handleBatchImportStudents = (newStudents: RegisteredStudent[]) => {
    const existingNisns = new Set(students.map((s) => s.nisn));
    const toAdd = newStudents.filter((s) => !existingNisns.has(s.nisn));
    const updated = [...toAdd, ...students];
    onUpdateStudents(updated);
  };

  const handleToggleStudentActive = (studentId: string) => {
    const updated = students.map((s) => (s.id === studentId ? { ...s, isActive: !s.isActive } : s));
    onUpdateStudents(updated);
  };

  const handleDeleteStudent = (studentId: string) => {
    if (confirm('Hapus siswa ini dari daftar peserta ujian terverifikasi?')) {
      const updated = students.filter((s) => s.id !== studentId);
      onUpdateStudents(updated);
    }
  };

  const handleExportStudentsCSV = () => {
    const headers = 'NISN,Nama Siswa,Kelas,Password/PIN,Status,Jenis Kelamin\n';
    const rows = students
      .map(
        (s) =>
          `"${s.nisn}","${s.name}","${s.studentClass}","${s.password || '-'}","${
            s.isActive ? 'Aktif' : 'Nonaktif'
          }","${s.gender || 'L'}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Daftar_Siswa_CBT_SMAN1_Batu_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  // Account Management CRUD actions
  const handleSaveAccount = (saved: AdminAccount) => {
    const exists = adminAccounts.some((a) => a.id === saved.id || a.username === saved.username);
    let updated: AdminAccount[];
    if (exists) {
      updated = adminAccounts.map((a) =>
        a.id === saved.id || a.username === saved.username ? saved : a
      );
    } else {
      updated = [saved, ...adminAccounts];
    }
    onUpdateAdminAccounts(updated);
  };

  const handleDeleteAccount = (accId: string) => {
    if (adminAccounts.length <= 1) {
      alert('Minimal harus ada 1 akun Admin aktif dalam sistem.');
      return;
    }
    const target = adminAccounts.find((a) => a.id === accId);
    if (confirm(`Hapus akun admin/guru "${target?.name} (${target?.username})"?`)) {
      const updated = adminAccounts.filter((a) => a.id !== accId);
      onUpdateAdminAccounts(updated);
    }
  };

  const togglePasswordVisibility = (id: string) => {
    setShowPasswordsMap((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Distinct classes in submissions & registered students
  const availableClasses = Array.from(
    new Set([...submissions.map((s) => s.studentClass), ...students.map((s) => s.studentClass)])
  ).sort();

  // Navigation items with "Manajemen Akun"
  const navItems = [
    {
      id: 'exams' as AdminTab,
      label: 'Paket Ujian',
      icon: BookOpen,
      badge: `${exams.length}`,
    },
    {
      id: 'questions' as AdminTab,
      label: 'Editor Bank Soal',
      icon: ListOrdered,
      badge: currentExam ? `${currentExam.questions.length}` : undefined,
    },
    {
      id: 'students' as AdminTab,
      label: 'Data Siswa',
      icon: GraduationCap,
      badge: `${students.length}`,
    },
    {
      id: 'submissions' as AdminTab,
      label: 'Riwayat Siswa',
      icon: Users,
      badge: `${submissions.length}`,
    },
    {
      id: 'accounts' as AdminTab,
      label: 'Manajemen Akun',
      icon: UserCog,
      badge: `${adminAccounts.length}`,
    },
  ];

  const renderSimpleNav = () => (
    <nav className="space-y-1">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            id={`admin-nav-${item.id}`}
            onClick={() => {
              setActiveTab(item.id);
              setIsMobileDrawerOpen(false);
            }}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl flex items-center justify-between gap-3 text-xs transition-colors cursor-pointer ${
              isActive
                ? 'bg-blue-600 text-white font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Icon
                className={`w-4 h-4 shrink-0 ${
                  isActive ? 'text-white' : 'text-slate-400'
                }`}
              />
              <span className="truncate">{item.label}</span>
            </div>

            {item.badge && (
              <span
                className={`text-[11px] px-2 py-0.5 rounded-full font-bold shrink-0 ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {item.badge}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6">
      {/* Mobile Drawer Backdrop */}
      {isMobileDrawerOpen && (
        <div
          onClick={() => setIsMobileDrawerOpen(false)}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 lg:hidden"
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <aside
        className={`fixed top-0 left-0 bottom-0 w-64 bg-white z-50 p-4 shadow-2xl transition-transform duration-300 ease-in-out lg:hidden flex flex-col justify-between ${
          isMobileDrawerOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-100">
            <span className="font-semibold text-xs text-slate-500 uppercase tracking-wider">
              Menu Navigasi
            </span>
            <button
              onClick={() => setIsMobileDrawerOpen(false)}
              className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          {renderSimpleNav()}
        </div>

        {/* Mobile Logged In User Info */}
        {currentAdmin && (
          <div className="pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">{currentAdmin.name}</p>
                <p className="text-[11px] text-slate-500">{currentAdmin.role}</p>
              </div>
              <button
                onClick={onLogoutAdmin}
                className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg"
                title="Keluar / Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </aside>

      {/* Main Layout (Sidebar + Content) */}
      <div className="flex gap-5 items-start">
        {/* Simple Desktop Left Sidebar */}
        <aside
          className={`hidden lg:flex flex-col justify-between bg-white rounded-2xl p-3 border border-slate-200 shadow-xs transition-all duration-300 sticky top-20 shrink-0 ${
            isSidebarOpen ? 'w-56' : 'w-0 p-0 border-0 opacity-0 overflow-hidden pointer-events-none'
          }`}
        >
          {isSidebarOpen && (
            <>
              {renderSimpleNav()}

              {/* Logged in Admin indicator */}
              {currentAdmin && (
                <div className="mt-6 pt-3 border-t border-slate-100">
                  <div className="px-2 py-1.5 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 pr-1">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {currentAdmin.name}
                        </p>
                        <span className="text-[10px] text-blue-600 font-semibold block truncate">
                          {currentAdmin.role}
                        </span>
                      </div>
                      <button
                        onClick={onLogoutAdmin}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Keluar / Kunci Panel Admin"
                      >
                        <LogOut className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Top Control Bar */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
            {/* Left: Sidebar Toggle Button + Page Title */}
            <div className="flex items-center gap-3">
              {/* Desktop Toggle Button */}
              <button
                id="toggle-sidebar-btn"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="hidden lg:flex items-center justify-center p-2 rounded-xl border border-slate-200 text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer shadow-xs"
                title={isSidebarOpen ? 'Sembunyikan Sidebar' : 'Tampilkan Sidebar'}
              >
                {isSidebarOpen ? (
                  <PanelLeftClose className="w-4 h-4" />
                ) : (
                  <PanelLeftOpen className="w-4 h-4 text-blue-600" />
                )}
              </button>

              {/* Mobile Drawer Trigger Button */}
              <button
                onClick={() => setIsMobileDrawerOpen(true)}
                className="lg:hidden flex items-center justify-center p-2 rounded-xl border border-slate-200 text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer shadow-xs"
                title="Buka Menu Navigasi"
              >
                <Menu className="w-4 h-4" />
              </button>

              <div>
                <h2 className="font-bold text-base sm:text-lg text-slate-900 tracking-tight">
                  {activeTab === 'exams' && 'Paket Ujian'}
                  {activeTab === 'questions' && 'Editor Bank Soal'}
                  {activeTab === 'students' && 'Data Siswa & Hak Akses Login'}
                  {activeTab === 'submissions' && 'Riwayat Nilai Siswa'}
                  {activeTab === 'accounts' && 'Manajemen Akun Admin & Guru'}
                </h2>
                <p className="text-xs text-slate-500 hidden sm:block">
                  {activeTab === 'exams' && 'Daftar paket ujian, token, status aktif, dan pengaturan KKM.'}
                  {activeTab === 'questions' && 'Kelola soal dan pembobotan skor opsi jawaban A - E.'}
                  {activeTab === 'students' && 'Kelola daftar siswa yang ditentukan dan berhak login ke sistem ujian CBT.'}
                  {activeTab === 'submissions' && 'Rekapitulasi lembar jawaban siswa dan ekspor Excel.'}
                  {activeTab === 'accounts' && 'Kelola akun guru pengampu, proktor, serta username dan password admin.'}
                </p>
              </div>
            </div>

            {/* Right: Action Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Select Exam Dropdown when on Exams or Questions */}
              {(activeTab === 'exams' || activeTab === 'questions') && exams.length > 0 && (
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400 hidden md:inline">Paket:</span>
                  <select
                    value={selectedExamId}
                    onChange={(e) => setSelectedExamId(e.target.value)}
                    className="bg-slate-50 border border-slate-200 font-semibold text-slate-900 rounded-xl px-3 py-1.5 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none max-w-[200px] sm:max-w-xs truncate"
                  >
                    {exams.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.subject} ({e.questions.length} Soal &bull; Token: {e.token})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {activeTab === 'exams' && (
                <button
                  onClick={() => {
                    setEditingExam(null);
                    setIsEditorOpen(true);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-3.5 py-2 rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Buat Ujian Baru</span>
                </button>
              )}

              {activeTab === 'questions' && (
                <button
                  onClick={() => setIsWordImportOpen(true)}
                  className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer transition-all shadow-xs"
                >
                  <Upload className="w-4 h-4 text-blue-600" />
                  <span className="hidden sm:inline">Import Word (.docx)</span>
                </button>
              )}

              {activeTab === 'students' && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsStudentBatchImportOpen(true)}
                    className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold text-xs px-3 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer transition-all shadow-xs"
                    title="Import data siswa sekaligus dari Excel / CSV"
                  >
                    <Upload className="w-4 h-4 text-emerald-600" />
                    <span className="hidden sm:inline">Import Cepat (Batch)</span>
                  </button>

                  <button
                    onClick={() => {
                      setEditingStudent(null);
                      setIsStudentEditorOpen(true);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-3.5 py-2 rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition-all"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Tambah Siswa</span>
                  </button>
                </div>
              )}

              {activeTab === 'accounts' && (
                <button
                  onClick={() => {
                    setEditingAccount(null);
                    setIsAccountEditorOpen(true);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-3.5 py-2 rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Akun Baru</span>
                </button>
              )}
            </div>
          </div>

          {/* TAB 1: MANAJEMEN PAKET UJIAN */}
          {activeTab === 'exams' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {exams.map((exam) => {
                  const count = exam.questions.length;
                  const examSubmissions = submissions.filter((s) => s.examId === exam.id);
                  return (
                    <div
                      key={exam.id}
                      className={`bg-white rounded-2xl p-5 border shadow-xs flex flex-col justify-between transition-all ${
                        exam.isActive
                          ? 'border-blue-200 ring-1 ring-blue-50'
                          : 'border-slate-200 opacity-80'
                      }`}
                    >
                      <div>
                        {/* Top status */}
                        <div className="flex items-center justify-between mb-3">
                          <span
                            className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full uppercase ${
                              exam.isActive
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}
                          >
                            {exam.isActive ? 'Ujian Aktif' : 'Nonaktif'}
                          </span>

                          <div className="flex items-center gap-1 bg-slate-50 text-slate-800 border border-slate-200 px-2 py-0.5 rounded-md font-mono text-xs font-semibold">
                            <Key className="w-3 h-3 text-slate-500" />
                            <span>{exam.token}</span>
                          </div>
                        </div>

                        <h3 className="font-bold text-slate-900 text-base leading-snug mb-1">
                          {exam.subject}
                        </h3>
                        <p className="text-xs text-slate-500 font-medium line-clamp-2 mb-3">
                          {exam.title}
                        </p>

                        {/* Metadata details */}
                        <div className="bg-slate-50 p-3 rounded-xl space-y-1.5 text-xs text-slate-600 mb-4 border border-slate-100">
                          <div className="flex justify-between">
                            <span>Target Kelas:</span>
                            <span className="font-semibold text-slate-800">{exam.gradeClass}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Jumlah Soal:</span>
                            <span className="font-semibold text-blue-700">{count} / 50 Butir</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Alokasi Durasi:</span>
                            <span className="font-semibold text-slate-800">
                              {exam.durationMinutes} Menit
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>KKM Kelulusan:</span>
                            <span className="font-semibold text-emerald-700">
                              {exam.passingGrade}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Tampil Nilai ke Siswa:</span>
                            <span
                              className={`font-semibold ${
                                exam.showInstantScore ? 'text-blue-700' : 'text-slate-500'
                              }`}
                            >
                              {exam.showInstantScore ? 'Ditampilkan' : 'Disembunyikan'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Peserta Selesai:</span>
                            <span className="font-semibold text-slate-800">
                              {examSubmissions.length} Siswa
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                        <button
                          onClick={() => handleToggleExamActive(exam.id)}
                          className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                            exam.isActive
                              ? 'border-slate-200 text-slate-700 hover:bg-slate-50'
                              : 'border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                          }`}
                        >
                          {exam.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                        </button>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedExamId(exam.id);
                              setActiveTab('questions');
                            }}
                            className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                            title="Buka Bank Soal"
                          >
                            <ListOrdered className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingExam(exam);
                              setIsEditorOpen(true);
                            }}
                            className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                            title="Edit Paket Ujian & Pengaturan"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteExam(exam.id)}
                            className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                            title="Hapus Paket Ujian"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: EDITOR BANK SOAL */}
          {activeTab === 'questions' && currentExam && (
            <div className="space-y-5">
              {/* Quick Bobot Presets Banner */}
              <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-blue-600" />
                    <span>Pengaturan Bobot Nilai Serentak (Semua Soal)</span>
                  </h4>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Pilih preset untuk menerapkan nilai opsi bertingkat ke seluruh{' '}
                    {currentExam.questions.length} butir soal saat ini.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() =>
                      handleApplyPresetCurrentExam({ A: 10, B: 5, C: 4, D: 3, E: 2 })
                    }
                    className="bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer shadow-xs"
                    title="Preset: A=10, B=5, C=4, D=3, E=2"
                  >
                    10 - 5 - 4 - 3 - 2
                  </button>

                  <button
                    onClick={() =>
                      handleApplyPresetCurrentExam({ A: 5, B: 4, C: 3, D: 2, E: 1 })
                    }
                    className="bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer shadow-xs"
                    title="Preset: A=5, B=4, C=3, D=2, E=1"
                  >
                    5 - 4 - 3 - 2 - 1
                  </button>

                  <button
                    onClick={() =>
                      handleApplyPresetCurrentExam({ A: 10, B: 0, C: 0, D: 0, E: 0 })
                    }
                    className="bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer shadow-xs"
                    title="Hanya opsi A yang benar bernilai 10, lainnya 0"
                  >
                    Tunggal (A=10, Lain=0)
                  </button>
                </div>
              </div>

              {/* Questions List */}
              <div className="space-y-4">
                {currentExam.questions.length === 0 ? (
                  <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-xs space-y-3">
                    <p className="text-slate-500 text-sm">
                      Belum ada butir soal pada paket ujian ini.
                    </p>
                    <button
                      onClick={() => setIsWordImportOpen(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 py-2 rounded-xl shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Import Soal dari Word (.docx)</span>
                    </button>
                  </div>
                ) : (
                  currentExam.questions.map((question, qIdx) => (
                    <div
                      key={question.id || `q-${qIdx}`}
                      className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="bg-blue-600 text-white text-xs font-bold px-2.5 py-1 rounded-lg">
                            Soal No. {question.number || qIdx + 1}
                          </span>
                          {question.category && (
                            <span className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                              {question.category}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Question Text */}
                      <p className="text-slate-900 text-sm font-medium whitespace-pre-line leading-relaxed">
                        {question.text}
                      </p>

                      {/* Options & Weights Table */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 pt-2">
                        {question.options.map((opt) => {
                          const score = question.optionScores[opt.key] ?? 0;
                          return (
                            <div
                              key={opt.key}
                              className={`p-3 rounded-xl border text-xs flex flex-col justify-between space-y-2 ${
                                score === 10
                                  ? 'border-emerald-200 bg-emerald-50/50'
                                  : score > 0
                                  ? 'border-blue-100 bg-blue-50/30'
                                  : 'border-slate-200 bg-white'
                              }`}
                            >
                              <div className="flex items-start gap-2">
                                <span
                                  className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-[11px] shrink-0 ${
                                    score === 10
                                      ? 'bg-emerald-600 text-white'
                                      : score > 0
                                      ? 'bg-blue-600 text-white'
                                      : 'bg-slate-200 text-slate-700'
                                  }`}
                                >
                                  {opt.key}
                                </span>
                                <span className="text-slate-700 line-clamp-2 text-[11px]">
                                  {opt.text}
                                </span>
                              </div>

                              <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px]">
                                <span className="text-slate-400">Poin Bobot:</span>
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={score}
                                  onChange={(e) => {
                                    const newScore = parseInt(e.target.value, 10) || 0;
                                    const updatedQuestions = currentExam.questions.map((q, idx) => {
                                      if (idx === qIdx) {
                                        return {
                                          ...q,
                                          optionScores: {
                                            ...q.optionScores,
                                            [opt.key]: newScore,
                                          },
                                        };
                                      }
                                      return q;
                                    });
                                    handleSaveExam({
                                      ...currentExam,
                                      questions: updatedQuestions,
                                    });
                                  }}
                                  className="w-14 text-center font-bold bg-white border border-slate-200 rounded px-1 py-0.5 focus:ring-1 focus:ring-blue-500 focus:outline-none text-slate-900"
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Explanation */}
                      {question.explanation && (
                        <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600 border border-slate-100">
                          <span className="font-semibold text-slate-800">Pembahasan Guru: </span>
                          <span>{question.explanation}</span>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 3: DATA SISWA & HAK AKSES LOGIN */}
          {activeTab === 'students' && (
            <div className="space-y-4">
              {/* Whitelist Security Setting Card */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      enforceWhitelist ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {enforceWhitelist ? (
                      <ShieldCheck className="w-5 h-5" />
                    ) : (
                      <ShieldAlert className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                      <span>Restriksi Login Siswa Terdaftar (Whitelist)</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          enforceWhitelist
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {enforceWhitelist ? 'Aktif & Dibatasi' : 'Terbuka / Bebas'}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {enforceWhitelist
                        ? 'Hanya siswa yang telah terdaftar dan berstatus Aktif di bawah yang diizinkan login ke dalam sistem.'
                        : 'Siswa dapat login dengan mengisi NISN dan Nama secara bebas tanpa verifikasi daftar.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onToggleEnforceWhitelist(!enforceWhitelist)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer shadow-xs ${
                      enforceWhitelist
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                        : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    {enforceWhitelist ? 'Nonaktifkan Batasan' : 'Wajibkan Siswa Terdaftar'}
                  </button>
                </div>
              </div>

              {/* Controls Bar & Table */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-3 flex-1">
                    {/* Search */}
                    <div className="relative min-w-[220px]">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        placeholder="Cari nama atau NISN siswa..."
                        value={searchRegisteredStudent}
                        onChange={(e) => setSearchRegisteredStudent(e.target.value)}
                        className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>

                    {/* Class Filter */}
                    <div className="flex items-center gap-1.5 text-xs">
                      <Filter className="w-3.5 h-3.5 text-slate-400" />
                      <select
                        value={studentClassFilter}
                        onChange={(e) => setStudentClassFilter(e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      >
                        <option value="ALL">Semua Kelas ({students.length})</option>
                        {availableClasses.map((cls) => (
                          <option key={cls} value={cls}>
                            Kelas {cls}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Status Filter */}
                    <div className="flex items-center gap-1 text-xs">
                      <select
                        value={studentStatusFilter}
                        onChange={(e) =>
                          setStudentStatusFilter(e.target.value as 'ALL' | 'ACTIVE' | 'INACTIVE')
                        }
                        className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      >
                        <option value="ALL">Semua Status</option>
                        <option value="ACTIVE">Hanya Aktif</option>
                        <option value="INACTIVE">Hanya Nonaktif</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleExportStudentsCSV}
                      className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold text-xs px-3 py-1.5 rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition-all"
                      title="Download data siswa dalam format CSV / Excel"
                    >
                      <Download className="w-4 h-4 text-blue-600" />
                      <span className="hidden sm:inline">Ekspor CSV</span>
                    </button>
                  </div>
                </div>

                {/* Table of Registered Students */}
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                        <th className="py-3 px-3.5 text-center w-12">No</th>
                        <th className="py-3 px-3.5 font-mono">NISN (Username)</th>
                        <th className="py-3 px-3.5">Nama Lengkap Siswa</th>
                        <th className="py-3 px-3.5">Kelas</th>
                        <th className="py-3 px-3.5 font-mono">Password / PIN</th>
                        <th className="py-3 px-3.5 text-center">Status Izin</th>
                        <th className="py-3 px-3.5 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredStudents.length > 0 ? (
                        filteredStudents.map((std, idx) => (
                          <tr key={std.id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="py-3 px-3.5 text-center font-semibold text-slate-500">
                              {idx + 1}
                            </td>
                            <td className="py-3 px-3.5 font-mono font-bold text-slate-900">
                              {std.nisn}
                            </td>
                            <td className="py-3 px-3.5 font-semibold text-slate-900">
                              {std.name}
                              {std.notes && (
                                <span className="block text-[10px] text-slate-400 font-normal">
                                  {std.notes}
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-3.5 text-slate-700">{std.studentClass}</td>
                            <td className="py-3 px-3.5 font-mono text-slate-600">
                              {std.password ? (
                                <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200 font-semibold text-[11px]">
                                  {std.password}
                                </span>
                              ) : (
                                <span className="text-slate-400 italic">Gunakan Token</span>
                              )}
                            </td>
                            <td className="py-3 px-3.5 text-center">
                              <button
                                onClick={() => handleToggleStudentActive(std.id)}
                                className={`px-2.5 py-0.5 rounded-full font-semibold text-[10px] border cursor-pointer transition-colors ${
                                  std.isActive
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                    : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                                }`}
                                title="Klik untuk mengubah status aktif/nonaktif"
                              >
                                {std.isActive ? 'Diizinkan (Aktif)' : 'Diblokir (Nonaktif)'}
                              </button>
                            </td>
                            <td className="py-3 px-3.5 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  onClick={() => {
                                    setEditingStudent(std);
                                    setIsStudentEditorOpen(true);
                                  }}
                                  className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                                  title="Edit Data Siswa"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteStudent(std.id)}
                                  className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                                  title="Hapus Siswa"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="text-center py-8 text-slate-400">
                            Tidak ada siswa yang sesuai dengan filter pencarian.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: RIWAYAT NILAI SISWA */}
          {activeTab === 'submissions' && (
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
              {/* Controls Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-3 flex-1">
                  {/* Search */}
                  <div className="relative min-w-[240px]">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Cari nama siswa atau NISN..."
                      value={searchStudent}
                      onChange={(e) => setSearchStudent(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  {/* Class Filter */}
                  <div className="flex items-center gap-1.5 text-xs">
                    <Filter className="w-3.5 h-3.5 text-slate-400" />
                    <select
                      value={selectedClassFilter}
                      onChange={(e) => setSelectedClassFilter(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="ALL">Semua Kelas</option>
                      {availableClasses.map((cls) => (
                        <option key={cls} value={cls}>
                          Kelas {cls}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleExportExcel}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-3.5 py-2 rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition-all"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>Ekspor Excel (.xlsx)</span>
                  </button>
                </div>
              </div>

              {/* Submissions Table */}
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                      <th className="py-3 px-3.5 text-center w-12">No</th>
                      <th className="py-3 px-3.5">Nama Siswa</th>
                      <th className="py-3 px-3.5 font-mono">NISN</th>
                      <th className="py-3 px-3.5">Kelas</th>
                      <th className="py-3 px-3.5">Mata Pelajaran</th>
                      <th className="py-3 px-3.5 text-center">Nilai Akhir</th>
                      <th className="py-3 px-3.5 text-center">Status</th>
                      <th className="py-3 px-3.5 text-center">Pelanggaran</th>
                      <th className="py-3 px-3.5 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {relevantSubmissions.length > 0 ? (
                      relevantSubmissions.map((sub, idx) => (
                        <tr key={sub.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 px-3.5 text-center font-semibold text-slate-500">
                            {idx + 1}
                          </td>
                          <td className="py-3 px-3.5 font-bold text-slate-900">{sub.studentName}</td>
                          <td className="py-3 px-3.5 font-mono text-slate-600">{sub.studentNisn}</td>
                          <td className="py-3 px-3.5 text-slate-700">{sub.studentClass}</td>
                          <td className="py-3 px-3.5 text-slate-600">{sub.subject}</td>
                          <td className="py-3 px-3.5 text-center font-bold text-slate-900 text-sm">
                            {sub.finalScore}
                          </td>
                          <td className="py-3 px-3.5 text-center">
                            <span
                              className={`px-2 py-0.5 rounded-full font-semibold text-[10px] ${
                                sub.passed
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-rose-50 text-rose-700 border border-rose-200'
                              }`}
                            >
                              {sub.passed ? 'Tuntas' : 'Remedial'}
                            </span>
                          </td>
                          <td className="py-3 px-3.5 text-center">
                            {sub.cheatAttempts > 0 ? (
                              <span className="bg-amber-50 text-amber-800 px-2 py-0.5 rounded-md font-semibold text-[11px] border border-amber-200">
                                {sub.cheatAttempts}x Pindah Tab
                              </span>
                            ) : (
                              <span className="text-slate-400">0</span>
                            )}
                          </td>
                          <td className="py-3 px-3.5 text-center">
                            <button
                              onClick={() => setViewingSubmission(sub)}
                              className="px-2.5 py-1 text-[11px] font-semibold text-blue-600 hover:bg-blue-50 rounded-lg border border-blue-200 transition-colors cursor-pointer"
                            >
                              Lihat Detail
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={9} className="text-center py-8 text-slate-400">
                          Tidak ada data riwayat ujian yang sesuai dengan kriteria filter.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: MANAJEMEN AKUN ADMIN & GURU */}
          {activeTab === 'accounts' && (
            <div className="space-y-4">
              {/* Top Security Banner */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                      <span>Proteksi Akses Menu Admin & Guru</span>
                      <span className="bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                        Aktif
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Hanya pengguna dengan akun guru atau administrator yang terdaftar di bawah ini yang dapat membuka dan mengelola soal ujian.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setEditingAccount(null);
                    setIsAccountEditorOpen(true);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-3.5 py-2 rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition-all shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Akun Guru / Admin</span>
                </button>
              </div>

              {/* Accounts Table Card */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="relative min-w-[240px] flex-1 max-w-sm">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Cari nama, username, atau peran..."
                      value={searchAccount}
                      onChange={(e) => setSearchAccount(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <span className="text-xs text-slate-500 font-medium">
                    Total: {adminAccounts.length} Akun Terdaftar
                  </span>
                </div>

                {/* Table */}
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                        <th className="py-3 px-3.5 text-center w-12">No</th>
                        <th className="py-3 px-3.5">Nama Lengkap Guru / Admin</th>
                        <th className="py-3 px-3.5 font-mono">Username</th>
                        <th className="py-3 px-3.5">Password</th>
                        <th className="py-3 px-3.5">Peran / Hak Akses</th>
                        <th className="py-3 px-3.5">Email Pengampu</th>
                        <th className="py-3 px-3.5 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredAccounts.length > 0 ? (
                        filteredAccounts.map((acc, idx) => {
                          const isShowingPass = !!showPasswordsMap[acc.id];
                          const isCurrentActiveUser = currentAdmin?.username === acc.username;
                          return (
                            <tr
                              key={acc.id}
                              className={`hover:bg-slate-50/70 transition-colors ${
                                isCurrentActiveUser ? 'bg-blue-50/30' : ''
                              }`}
                            >
                              <td className="py-3 px-3.5 text-center font-semibold text-slate-500">
                                {idx + 1}
                              </td>
                              <td className="py-3 px-3.5 font-bold text-slate-900">
                                <div className="flex items-center gap-2">
                                  <span>{acc.name}</span>
                                  {isCurrentActiveUser && (
                                    <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-1.5 py-0.2 rounded">
                                      Anda
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="py-3 px-3.5 font-mono font-bold text-blue-700">
                                {acc.username}
                              </td>
                              <td className="py-3 px-3.5 font-mono">
                                <div className="flex items-center gap-1.5">
                                  <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200 font-semibold text-[11px] text-slate-800">
                                    {isShowingPass ? acc.password : '••••••••'}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => togglePasswordVisibility(acc.id)}
                                    className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
                                    title={isShowingPass ? 'Sembunyikan' : 'Tampilkan Password'}
                                  >
                                    {isShowingPass ? (
                                      <EyeOff className="w-3.5 h-3.5" />
                                    ) : (
                                      <Eye className="w-3.5 h-3.5" />
                                    )}
                                  </button>
                                </div>
                              </td>
                              <td className="py-3 px-3.5">
                                <span
                                  className={`px-2 py-0.5 rounded-full font-semibold text-[10px] border ${
                                    acc.role === 'Administrator'
                                      ? 'bg-purple-50 text-purple-700 border-purple-200'
                                      : acc.role === 'Proktor'
                                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                                      : 'bg-blue-50 text-blue-700 border-blue-200'
                                  }`}
                                >
                                  {acc.role}
                                </span>
                              </td>
                              <td className="py-3 px-3.5 text-slate-600">
                                {acc.email || '-'}
                              </td>
                              <td className="py-3 px-3.5 text-center">
                                <div className="flex items-center justify-center gap-1.5">
                                  <button
                                    onClick={() => {
                                      setEditingAccount(acc);
                                      setIsAccountEditorOpen(true);
                                    }}
                                    className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                                    title="Edit Akun & Ubah Password"
                                  >
                                    <Edit className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteAccount(acc.id)}
                                    disabled={adminAccounts.length <= 1}
                                    className={`p-1.5 rounded-lg border transition-colors ${
                                      adminAccounts.length <= 1
                                        ? 'text-slate-300 border-slate-100 cursor-not-allowed'
                                        : 'text-slate-600 hover:text-rose-600 hover:bg-rose-50 border-slate-200 cursor-pointer'
                                    }`}
                                    title={
                                      adminAccounts.length <= 1
                                        ? 'Tidak dapat menghapus satu-satunya akun admin'
                                        : 'Hapus Akun'
                                    }
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={7} className="text-center py-8 text-slate-400">
                            Tidak ada akun yang sesuai dengan pencarian.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Exam Modals */}
      <ExamEditorModal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        exam={editingExam}
        onSaveExam={handleSaveExam}
      />

      <WordImportModal
        isOpen={isWordImportOpen}
        onClose={() => setIsWordImportOpen(false)}
        onImportQuestions={handleImportQuestions}
        defaultScores={currentExam?.defaultOptionScores || { A: 10, B: 5, C: 4, D: 3, E: 2 }}
        currentQuestionCount={currentExam?.questions.length || 0}
      />

      <StudentDetailModal
        isOpen={!!viewingSubmission}
        onClose={() => setViewingSubmission(null)}
        submission={viewingSubmission}
        exam={currentExam}
      />

      {/* Student Management Modals */}
      <StudentEditorModal
        isOpen={isStudentEditorOpen}
        onClose={() => setIsStudentEditorOpen(false)}
        student={editingStudent}
        onSaveStudent={handleSaveStudent}
      />

      <StudentBatchImportModal
        isOpen={isStudentBatchImportOpen}
        onClose={() => setIsStudentBatchImportOpen(false)}
        onImportStudents={handleBatchImportStudents}
      />

      {/* Account Management Modal */}
      <AccountEditorModal
        isOpen={isAccountEditorOpen}
        onClose={() => setIsAccountEditorOpen(false)}
        account={editingAccount}
        onSaveAccount={handleSaveAccount}
      />
    </div>
  );
};
