import React, { useState, useEffect } from 'react';
import {
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  Play,
  User,
  LogOut,
} from 'lucide-react';
import { Exam, RegisteredStudent } from '../../types';
import { ALL_SCHOOL_CLASSES, isStudentClassEligible } from '../../utils/constants';
import { getStoredStudents } from '../../utils/storage';
import {
  isCurrentlyFullscreen,
  isFullscreenSupported,
  requestAppFullscreen,
} from '../../utils/deviceHelper';

// Helper to strip invisible characters, non-breaking spaces, and trim
const sanitizeText = (val: string): string => {
  return val.replace(/[\u200B-\u200D\uFEFF\u00A0]/g, '').trim();
};

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
  // Step 1: 'login' (NISN & Password Siswa)
  // Step 2: 'exam_token' (Konfirmasi Profil & Token Ujian)
  const [step, setStep] = useState<'login' | 'exam_token'>('login');

  // Step 1 States
  const [nisnInput, setNisnInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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

  const fsSupported = isFullscreenSupported();

  const ensureFullscreen = () => {
    if (!fsSupported) return;
    if (!isCurrentlyFullscreen()) {
      requestAppFullscreen();
    }
  };

  // Helper to get students list with local storage fallback
  const getEffectiveStudents = (): RegisteredStudent[] => {
    if (registeredStudents && registeredStudents.length > 0) {
      return registeredStudents;
    }
    return getStoredStudents();
  };

  // Auto-detect student preview when typing NISN
  useEffect(() => {
    const cleanNisn = sanitizeText(nisnInput);
    if (!cleanNisn) {
      setMatchedStudentPreview(null);
      return;
    }

    const studentList = getEffectiveStudents();
    const found = studentList.find(
      (s) => sanitizeText(s.nisn).toLowerCase() === cleanNisn.toLowerCase()
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

  // Handle Step 1: Login Siswa
  const handleStudentLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanNisn = sanitizeText(nisnInput);
    const enteredPass = sanitizeText(passwordInput);

    if (!cleanNisn) {
      setErrorMsg('Harap masukkan NISN siswa.');
      return;
    }

    if (!enteredPass) {
      setErrorMsg('Harap masukkan password akun siswa.');
      return;
    }

    const studentList = getEffectiveStudents();
    const found = studentList.find(
      (s) => sanitizeText(s.nisn).toLowerCase() === cleanNisn.toLowerCase()
    );

    if (enforceWhitelist) {
      if (!found) {
        setErrorMsg('NISN tidak terdaftar dalam database siswa. Hubungi proktor/pengawas.');
        return;
      }

      if (!found.isActive) {
        setErrorMsg('Akun siswa berstatus nonaktif. Silakan hubungi proktor/pengawas.');
        return;
      }

      const registeredPassword = found.password ? sanitizeText(found.password) : '';
      if (registeredPassword) {
        if (enteredPass.toLowerCase() !== registeredPassword.toLowerCase() && enteredPass !== registeredPassword) {
          setErrorMsg('Password salah! Masukkan password akun siswa yang benar.');
          return;
        }
      } else {
        if (enteredPass.toLowerCase() !== cleanNisn.toLowerCase() && enteredPass !== '123456' && enteredPass !== 'batu123') {
          // Fallback allowed
        }
      }

      setAuthenticatedStudent({
        name: found.name,
        nisn: found.nisn,
        studentClass: found.studentClass,
      });
    } else {
      setAuthenticatedStudent({
        name: found ? found.name : manualName.trim() || 'Peserta Ujian',
        nisn: cleanNisn,
        studentClass: found ? found.studentClass : manualClass,
      });
    }

    // Lanjut ke Step 2
    setStep('exam_token');
    setTokenInput('');
    setErrorMsg('');
  };

  // Handle Step 2: Verifikasi Token & Mulai
  const handleVerifyTokenAndStart = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!authenticatedStudent) {
      setStep('login');
      return;
    }

    if (!currentExam) {
      setErrorMsg('Belum ada paket ujian aktif untuk kelas Anda.');
      return;
    }

    const enteredToken = tokenInput.trim().toUpperCase();
    if (!enteredToken) {
      setErrorMsg('Harap masukkan Token Ujian dari pengawas ruangan.');
      return;
    }

    const expectedToken = currentExam.token.trim().toUpperCase();
    if (enteredToken !== expectedToken) {
      setErrorMsg('Token ujian tidak sesuai! Silakan periksa kembali token dari pengawas.');
      return;
    }

    // Aktifkan fullscreen dan mulai ujian
    ensureFullscreen();
    onStartExam(currentExam, authenticatedStudent);
  };

  const handleLogoutStudent = () => {
    setAuthenticatedStudent(null);
    setStep('login');
    setPasswordInput('');
    setTokenInput('');
    setErrorMsg('');
  };

  return (
    <div className="min-h-[calc(100vh-120px)] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm sm:max-w-md bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 shadow-lg dark:shadow-2xl border border-slate-200/80 dark:border-slate-800 transition-all">
        {/* Brand / Logo Minimal */}
        <div className="text-center mb-6">
          <img
            src="/logo-sman1-batu.png"
            alt="Logo SMAN 1 Batu"
            className="w-14 h-16 object-contain mx-auto mb-3 drop-shadow-xs"
          />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            {step === 'login' ? 'Login Peserta Ujian' : 'Konfirmasi Peserta'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {step === 'login'
              ? 'Masukkan NISN dan password akun Anda'
              : 'Periksa data diri dan masukkan token dari pengawas'}
          </p>
        </div>

        {/* Notifikasi Error Ringkas */}
        {errorMsg && (
          <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-xl text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <p className="leading-snug">{errorMsg}</p>
          </div>
        )}

        {/* STEP 1: FORM LOGIN SISWA */}
        {step === 'login' && (
          <form onSubmit={handleStudentLogin} className="space-y-4">
            {/* Input NISN */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                NISN / No. Peserta
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="Contoh: 0071948201"
                  value={nisnInput}
                  onChange={(e) => setNisnInput(e.target.value)}
                  required
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  autoComplete="username"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl pl-10 pr-3.5 py-2.5 text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none transition-all placeholder:text-slate-400"
                />
              </div>

              {/* Status nama siswa ringkas */}
              {matchedStudentPreview && (
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1.5 flex items-center gap-1">
                  <span>✓</span>
                  <span>{matchedStudentPreview.name} &bull; Kelas {matchedStudentPreview.studentClass}</span>
                </p>
              )}
            </div>

            {/* Input Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Masukkan password akun"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  required
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  autoComplete="current-password"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl pl-10 pr-10 py-2.5 text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none transition-all placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Form Input Manual Siswa jika Whitelist dimatikan & data siswa belum ada */}
            {!enforceWhitelist && !matchedStudentPreview && (
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    placeholder="Nama Anda"
                    value={manualName}
                    onChange={(e) => setManualName(e.target.value)}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Kelas
                  </label>
                  <select
                    value={manualClass}
                    onChange={(e) => setManualClass(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
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

            {/* Tombol Masuk */}
            <div className="pt-2">
              <button
                type="submit"
                id="student-login-submit-btn"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-xl shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer text-xs uppercase tracking-wider"
              >
                <span>Masuk</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: KONFIRMASI PROFIL & INPUT TOKEN */}
        {step === 'exam_token' && authenticatedStudent && (
          <form onSubmit={handleVerifyTokenAndStart} className="space-y-4">
            {/* Box Profil Singkat */}
            <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-700 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                    {authenticatedStudent.name}
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                    NISN: <span className="font-mono font-medium text-slate-700 dark:text-slate-300">{authenticatedStudent.nisn}</span> &bull; Kelas {authenticatedStudent.studentClass}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleLogoutStudent}
                  className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-700 transition-colors"
                  title="Ganti Siswa"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>

              {/* Pilihan Ujian */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700/80">
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Mata Pelajaran Ujian
                </label>
                {activeExams.length > 0 ? (
                  <select
                    value={selectedExamId}
                    onChange={(e) => setSelectedExamId(e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    {activeExams.map((exam) => (
                      <option key={exam.id} value={exam.id}>
                        {exam.subject} - {exam.title} ({exam.durationMinutes} Menit)
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-xs text-amber-600 dark:text-amber-400">Tidak ada paket ujian aktif.</p>
                )}
              </div>
            </div>

            {/* Input Token Ujian */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Token Ujian (Dari Pengawas)</span>
              </label>
              <input
                type="text"
                placeholder="MASUKKAN TOKEN"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value.toUpperCase())}
                required
                autoCapitalize="characters"
                autoCorrect="off"
                spellCheck={false}
                autoComplete="off"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none font-mono uppercase font-bold tracking-widest text-center transition-all placeholder:text-slate-400 placeholder:font-normal placeholder:tracking-normal placeholder:text-xs"
              />
            </div>

            {/* Tombol Aksi */}
            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={handleLogoutStudent}
                className="w-1/3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold py-2.5 px-3 rounded-xl transition-colors cursor-pointer text-xs text-center"
              >
                Batal
              </button>
              <button
                type="submit"
                id="start-exam-button"
                className="w-2/3 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-3 rounded-xl shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer text-xs uppercase tracking-wider"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Mulai Ujian</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
