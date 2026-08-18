import React, { useState, useEffect } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  GraduationCap,
  KeyRound,
  Lock,
  LogOut,
  Maximize2,
  Minimize2,
  ShieldCheck,
  Sparkles,
  User,
  BookOpen
} from 'lucide-react';
import { Exam, RegisteredStudent } from '../../types';
import { ALL_SCHOOL_CLASSES, isStudentClassEligible } from '../../utils/constants';

interface StudentLoginProps {
  exams: Exam[];
  registeredStudents?: RegisteredStudent[];
  enforceWhitelist?: boolean;
  onStartExam: (
    exam: Exam,
    studentData: { name: string; nisn: string; studentClass: string }
  ) => void;
}

export const StudentLogin: React.FC<StudentLoginProps> = ({
  exams,
  registeredStudents = [],
  enforceWhitelist = true,
  onStartExam,
}) => {
  // Step 1: 'login' (Autentikasi NISN & Password Siswa)
  // Step 2: 'exam_token' (Konfirmasi Profil, Pilih Ujian & Masukkan Token Pengawas)
  const [step, setStep] = useState<'login' | 'exam_token'>('login');

  // Step 1 States
  const [nisnInput, setNisnInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [manualName, setManualName] = useState('');
  const [manualClass, setManualClass] = useState('X-1');
  const [matchedStudentPreview, setMatchedStudentPreview] = useState<RegisteredStudent | null>(null);

  // Authenticated Student State
  const [authenticatedStudent, setAuthenticatedStudent] = useState<{
    name: string;
    nisn: string;
    studentClass: string;
  } | null>(null);

  // Step 2 States (Exam & Token)
  const [selectedExamId, setSelectedExamId] = useState<string>('');
  const [tokenInput, setTokenInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Active exams list
  const activeExams = exams.filter((e) => e.isActive);

  // Filter exams that are eligible for the authenticated student's class
  const eligibleExams = authenticatedStudent
    ? activeExams.filter((e) => isStudentClassEligible(authenticatedStudent.studentClass, e.gradeClass))
    : activeExams;

  // Selected exam object
  const currentExam =
    exams.find((e) => e.id === selectedExamId) ||
    eligibleExams[0] ||
    activeExams[0];

  // Fullscreen State
  const [isFullscreen, setIsFullscreen] = useState<boolean>(() => !!document.fullscreenElement);

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

  const ensureFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    }
  };

  // Auto-detect student preview when typing NISN in Step 1
  useEffect(() => {
    const cleanNisn = nisnInput.trim();
    if (!cleanNisn) {
      setMatchedStudentPreview(null);
      return;
    }

    const found = registeredStudents.find(
      (s) => s.nisn.toLowerCase() === cleanNisn.toLowerCase()
    );

    if (found) {
      setMatchedStudentPreview(found);
      setManualName(found.name);
      if (found.studentClass) {
        setManualClass(found.studentClass);
      }
      setErrorMsg('');
    } else {
      setMatchedStudentPreview(null);
    }
  }, [nisnInput, registeredStudents]);

  // Set default selected exam when student authenticates or eligible exams change
  useEffect(() => {
    if (step === 'exam_token') {
      if (eligibleExams.length > 0) {
        if (!selectedExamId || !eligibleExams.some((e) => e.id === selectedExamId)) {
          setSelectedExamId(eligibleExams[0].id);
        }
      } else if (activeExams.length > 0) {
        setSelectedExamId(activeExams[0].id);
      }
    }
  }, [step, eligibleExams, activeExams, selectedExamId]);

  // Handle Step 1: Login Akun Siswa (Verifikasi NISN & Password Siswa)
  const handleStudentLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    ensureFullscreen();

    const cleanNisn = nisnInput.trim();
    const enteredPass = passwordInput.trim();

    if (!cleanNisn) {
      setErrorMsg('Harap masukkan NISN / Username siswa.');
      return;
    }

    if (!enteredPass) {
      setErrorMsg('Harap masukkan Password akun siswa.');
      return;
    }

    const found = registeredStudents.find(
      (s) => s.nisn.toLowerCase() === cleanNisn.toLowerCase()
    );

    if (enforceWhitelist) {
      if (!found) {
        setErrorMsg(
          'NISN tidak ditemukan dalam database siswa SMAN 1 Batu. Silakan periksa kembali atau hubungi proktor/pengawas.'
        );
        return;
      }

      if (!found.isActive) {
        setErrorMsg(
          'Akun siswa Anda berstatus nonaktif/ditangguhkan. Silakan hubungi proktor/pengawas ujian.'
        );
        return;
      }

      // Check student's registered password
      const registeredPassword = found.password ? found.password.trim() : '';
      if (registeredPassword) {
        if (enteredPass.toLowerCase() !== registeredPassword.toLowerCase()) {
          setErrorMsg(
            'Password akun siswa tidak sesuai! Pastikan Anda memasukkan password akun yang terdaftar di data siswa.'
          );
          return;
        }
      } else {
        // If student has no password set in database, allow fallback
        if (enteredPass.toLowerCase() !== cleanNisn.toLowerCase() && enteredPass !== '123456' && enteredPass !== 'batu123') {
          // Accept fallback
        }
      }

      setAuthenticatedStudent({
        name: found.name,
        nisn: found.nisn,
        studentClass: found.studentClass,
      });
    } else {
      // Whitelist disabled: allow matched student or manual inputs
      setAuthenticatedStudent({
        name: found ? found.name : manualName.trim() || 'Peserta Ujian',
        nisn: cleanNisn,
        studentClass: found ? found.studentClass : manualClass,
      });
    }

    // Advance to Step 2
    setStep('exam_token');
    setTokenInput('');
    setErrorMsg('');
  };

  // Handle Step 2: Verifikasi Token Ujian & Mulai Ujian
  const handleVerifyTokenAndStart = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!authenticatedStudent) {
      setStep('login');
      return;
    }

    if (!currentExam) {
      setErrorMsg('Belum ada paket ujian aktif yang dapat diakses untuk kelas Anda.');
      return;
    }

    const enteredToken = tokenInput.trim().toUpperCase();
    if (!enteredToken) {
      setErrorMsg('Harap masukkan TOKEN UJIAN yang diberikan oleh pengawas/proktor ruangan.');
      return;
    }

    const expectedToken = currentExam.token.trim().toUpperCase();
    if (enteredToken !== expectedToken) {
      setErrorMsg(
        'Token ujian salah! Silakan minta token aktif kepada pengawas/proktor di ruangan Anda.'
      );
      return;
    }

    // Token verified! Start the exam
    ensureFullscreen();
    onStartExam(currentExam, authenticatedStudent);
  };

  // Handle Switch / Logout Student
  const handleLogoutStudent = () => {
    setAuthenticatedStudent(null);
    setStep('login');
    setPasswordInput('');
    setTokenInput('');
    setErrorMsg('');
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center px-4 py-8 transition-colors duration-200">
      <div className="w-full max-w-lg bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-xl dark:shadow-2xl dark:shadow-blue-950/30 border border-slate-200/90 dark:border-slate-800 transition-all duration-200">
        {/* School Logo & Title */}
        <div className="text-center mb-6">
          <div className="inline-block relative">
            <img
              src="/logo-sman1-batu.png"
              alt="Logo SMAN 1 Batu"
              className="w-16 h-18 object-contain mx-auto mb-3 drop-shadow-md hover:scale-105 transition-transform"
            />
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            CBT Asesmen Siswa SMAN 1 Batu
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Sistem Ujian Terstandar Berbasis Komputer &bull; Integritas Tinggi
          </p>
        </div>

        {/* Fullscreen Mode Activation Banner */}
        <div className={`mb-5 p-3.5 rounded-2xl border flex items-center justify-between gap-3 text-xs transition-colors ${
          isFullscreen
            ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/80'
            : 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/80'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${isFullscreen ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
            <div>
              <p className="font-bold text-slate-800 dark:text-slate-200 text-[11px] sm:text-xs">
                Mode Layar Penuh:{' '}
                <span className={isFullscreen ? 'text-emerald-700 dark:text-emerald-400 font-extrabold' : 'text-amber-700 dark:text-amber-400'}>
                  {isFullscreen ? 'Aktif (Fullscreen)' : 'Belum Aktif'}
                </span>
              </p>
              <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400">
                {isFullscreen
                  ? 'Siap mengikuti ujian dalam mode layar penuh.'
                  : 'Wajib masuk mode layar penuh untuk ujian.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={toggleFullscreen}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer ${
              isFullscreen
                ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-800 border border-emerald-200 dark:border-emerald-700'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'
            }`}
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="w-3.5 h-3.5" />
                <span>Keluar</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Aktifkan</span>
              </>
            )}
          </button>
        </div>

        {/* Step Indicator Header */}
        <div className="mb-6 bg-slate-100/80 dark:bg-slate-800/80 p-1.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between text-xs font-semibold">
          <div
            className={`flex-1 text-center py-2 px-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              step === 'login'
                ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 shadow-xs font-bold'
                : 'text-emerald-700 dark:text-emerald-400 font-medium'
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
                step === 'login'
                  ? 'bg-blue-600 text-white'
                  : 'bg-emerald-600 text-white'
              }`}
            >
              {step === 'login' ? '1' : '✓'}
            </span>
            <span className="truncate">1. Login Siswa</span>
          </div>

          <div className="text-slate-300 dark:text-slate-600 px-1">&rarr;</div>

          <div
            className={`flex-1 text-center py-2 px-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              step === 'exam_token'
                ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 shadow-xs font-bold'
                : 'text-slate-400 dark:text-slate-500 font-medium'
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
                step === 'exam_token'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
              }`}
            >
              2
            </span>
            <span className="truncate">2. Token & Mulai</span>
          </div>
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="mb-5 p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-2xl text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2.5 animate-in fade-in duration-150">
            <AlertCircle className="w-4 h-4 text-rose-500 dark:text-rose-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed font-medium">{errorMsg}</p>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 1: LOGIN SISWA (NISN & PASSWORD SISWA) */}
        {/* ========================================================================= */}
        {step === 'login' && (
          <form onSubmit={handleStudentLogin} className="space-y-4">
            {/* NISN / Username */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                  NISN / Username Siswa
                </label>
                <span className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-full border border-blue-200/50 dark:border-blue-900/50">
                  Identitas Peserta
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="Contoh: 0071948201"
                  value={nisnInput}
                  onChange={(e) => setNisnInput(e.target.value)}
                  required
                  autoFocus
                  className="w-full bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl pl-10 pr-3.5 py-2.5 text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none font-mono font-semibold transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </div>

              {/* Matched student real-time indicator */}
              {matchedStudentPreview && (
                <div
                  className={`mt-2 px-3 py-2 rounded-xl text-xs flex items-center justify-between border transition-all ${
                    matchedStudentPreview.isActive
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800'
                      : 'bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 border-rose-200 dark:border-rose-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {matchedStudentPreview.isActive ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                    )}
                    <div>
                      <span className="font-bold block text-slate-900 dark:text-white">{matchedStudentPreview.name}</span>
                      <span className="text-[11px] text-slate-600 dark:text-slate-300">
                        Kelas: {matchedStudentPreview.studentClass} &bull; NISN: {matchedStudentPreview.nisn}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 shadow-xs">
                    Terdaftar
                  </span>
                </div>
              )}
            </div>

            {/* Password Siswa */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                  Password Akun Siswa
                </label>
                <span className="text-[11px] text-slate-400 dark:text-slate-500">
                  Sesuai Data Siswa
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  placeholder="Masukkan Password Akun Siswa"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  required
                  className="w-full bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl pl-10 pr-3.5 py-2.5 text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 font-medium">
                Gunakan password akun pribadi yang diberikan oleh guru / wali kelas Anda.
              </p>
            </div>

            {/* If whitelist disabled and student not found: allow selecting class */}
            {!enforceWhitelist && !matchedStudentPreview && (
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    placeholder="Nama Lengkap Siswa"
                    value={manualName}
                    onChange={(e) => setManualName(e.target.value)}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Kelas / Rombel
                  </label>
                  <select
                    value={manualClass}
                    onChange={(e) => setManualClass(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    {ALL_SCHOOL_CLASSES.map((cls) => (
                      <option key={cls} value={cls}>
                        {cls}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Login Button */}
            <div className="pt-3">
              <button
                type="submit"
                id="student-login-submit-btn"
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 px-4 rounded-xl shadow-md hover:shadow-lg hover:shadow-blue-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer text-xs uppercase tracking-wider active:scale-[0.99]"
              >
                <span>Masuk & Lanjut ke Token Ujian</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: KONFIRMASI SISWA, PILIH UJIAN & INPUT TOKEN DARI PENGAWAS */}
        {/* ========================================================================= */}
        {step === 'exam_token' && authenticatedStudent && (
          <form onSubmit={handleVerifyTokenAndStart} className="space-y-4">
            {/* Authenticated Student Profile Card */}
            <div className="bg-gradient-to-br from-blue-50/80 to-indigo-50/80 dark:from-blue-950/40 dark:to-indigo-950/40 p-4 rounded-2xl border border-blue-200 dark:border-blue-800/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                      {authenticatedStudent.name}
                    </h3>
                    <span className="bg-blue-600 text-white font-bold text-[10px] px-2 py-0.5 rounded-full">
                      {authenticatedStudent.studentClass}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    NISN: <span className="font-mono font-semibold text-slate-700 dark:text-slate-200">{authenticatedStudent.nisn}</span> &bull; Peserta CBT
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleLogoutStudent}
                className="text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 p-2 rounded-xl hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer text-xs flex items-center gap-1 font-semibold"
                title="Ganti Siswa / Keluar"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Ganti</span>
              </button>
            </div>

            {/* Exam Package Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-1.5">
                Pilih Paket Ujian yang Akan Dikerjakan
              </label>
              {activeExams.length > 0 ? (
                <div className="space-y-2">
                  <select
                    value={selectedExamId}
                    onChange={(e) => setSelectedExamId(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none transition-all"
                  >
                    {activeExams.map((exam) => {
                      const isEligible = isStudentClassEligible(authenticatedStudent.studentClass, exam.gradeClass);
                      return (
                        <option key={exam.id} value={exam.id} className="dark:bg-slate-800">
                          {isEligible ? '✓ ' : '⚠️ '} {exam.subject} - {exam.title} ({exam.durationMinutes} Menit)
                        </option>
                      );
                    })}
                  </select>

                  {/* Exam Summary Info Box */}
                  {currentExam && (
                    <div className="bg-slate-50 dark:bg-slate-800/70 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500 dark:text-slate-400">Mata Pelajaran:</span>
                        <span className="font-bold text-slate-900 dark:text-white">{currentExam.subject}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 dark:text-slate-400">Target Rombel:</span>
                        <span className="font-semibold text-blue-700 dark:text-blue-400">{currentExam.gradeClass}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 dark:text-slate-400">Durasi Pengerjaan:</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                          {currentExam.durationMinutes} Menit ({currentExam.questions.length} Butir Soal)
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 dark:text-slate-400">Standar KKM:</span>
                        <span className="font-bold text-emerald-700 dark:text-emerald-400">{currentExam.passingGrade}</span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-xs text-amber-800 dark:text-amber-300">
                  Tidak ada paket ujian yang aktif saat ini.
                </div>
              )}
            </div>

            {/* Input Token Ujian (Dari Pengawas) */}
            <div className="bg-amber-50/70 dark:bg-amber-950/30 p-4 rounded-2xl border border-amber-200/90 dark:border-amber-800/80 space-y-2">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-bold text-amber-950 dark:text-amber-300 uppercase tracking-wide flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span>TOKEN UJIAN (Dari Pengawas / Proktor)</span>
                </label>
                <span className="bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 font-bold text-[10px] px-2 py-0.5 rounded-md uppercase">
                  Wajib Diisi
                </span>
              </div>

              <div className="relative">
                <input
                  type="text"
                  placeholder="MASUKKAN TOKEN UJIAN"
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value.toUpperCase())}
                  required
                  autoFocus
                  className="w-full bg-white dark:bg-slate-800 border-2 border-amber-300 dark:border-amber-700 text-amber-950 dark:text-amber-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:outline-none font-mono uppercase font-extrabold tracking-widest text-center shadow-xs transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 placeholder:font-normal placeholder:tracking-normal placeholder:text-xs"
                />
              </div>
              <p className="text-[11px] text-amber-800/90 dark:text-amber-300/80 leading-relaxed font-medium">
                Token ujian diberikan oleh proktor / pengawas ruangan sebelum sesi pengerjaan dimulai.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setStep('login')}
                className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold py-3 px-4 rounded-xl transition-all cursor-pointer text-xs flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Kembali</span>
              </button>

              <button
                type="submit"
                id="start-exam-button"
                className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold py-3 px-4 rounded-xl shadow-md hover:shadow-lg hover:shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer text-xs uppercase tracking-wider active:scale-[0.99]"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Verifikasi Token & Mulai Ujian</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
