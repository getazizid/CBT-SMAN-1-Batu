import React, { useState, useEffect } from 'react';
import { AlertCircle, ArrowRight, CheckCircle2, Lock, User, ShieldCheck, ShieldAlert } from 'lucide-react';
import { Exam, RegisteredStudent } from '../../types';

interface StudentLoginProps {
  exams: Exam[];
  registeredStudents?: RegisteredStudent[];
  enforceWhitelist?: boolean;
  onStartExam: (
    exam: Exam,
    studentData: { name: string; nisn: string; studentClass: string }
  ) => void;
}

const CLASS_OPTIONS = [
  'X-1', 'X-2', 'X-3', 'X-4', 'X-5', 'X-6', 'X-7', 'X-8',
  'XI MIPA 1', 'XI MIPA 2', 'XI MIPA 3', 'XI MIPA 4', 'XI IPS 1', 'XI IPS 2', 'XI IPS 3',
  'XII MIPA 1', 'XII MIPA 2', 'XII MIPA 3', 'XII MIPA 4', 'XII IPS 1', 'XII IPS 2', 'XII IPS 3'
];

export const StudentLogin: React.FC<StudentLoginProps> = ({
  exams,
  registeredStudents = [],
  enforceWhitelist = true,
  onStartExam,
}) => {
  const activeExams = exams.filter((e) => e.isActive);
  const [selectedExamId, setSelectedExamId] = useState<string>(activeExams[0]?.id || '');
  const [username, setUsername] = useState('');
  const [studentName, setStudentName] = useState('');
  const [passwordToken, setPasswordToken] = useState('');
  const [studentClass, setStudentClass] = useState('XII MIPA 1');
  const [errorMsg, setErrorMsg] = useState('');
  const [matchedStudent, setMatchedStudent] = useState<RegisteredStudent | null>(null);

  const currentExam = exams.find((e) => e.id === selectedExamId) || activeExams[0];

  // Auto-detect & prefill student details when typing NISN
  useEffect(() => {
    const cleanNisn = username.trim();
    if (!cleanNisn) {
      setMatchedStudent(null);
      return;
    }

    const found = registeredStudents.find(
      (s) => s.nisn.toLowerCase() === cleanNisn.toLowerCase()
    );

    if (found) {
      setMatchedStudent(found);
      setStudentName(found.name);
      if (found.studentClass) {
        setStudentClass(found.studentClass);
      }
      setErrorMsg('');
    } else {
      setMatchedStudent(null);
    }
  }, [username, registeredStudents]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!currentExam) {
      setErrorMsg('Belum ada paket ujian aktif saat ini.');
      return;
    }
    if (!username.trim()) {
      setErrorMsg('Harap masukkan Username / Nomor Peserta (NISN).');
      return;
    }
    if (!studentName.trim()) {
      setErrorMsg('Harap masukkan Nama Lengkap Siswa.');
      return;
    }
    if (!passwordToken.trim()) {
      setErrorMsg('Harap masukkan Password / Token Ujian.');
      return;
    }

    const cleanInputNisn = username.trim();
    const foundStudent = registeredStudents.find(
      (s) => s.nisn.toLowerCase() === cleanInputNisn.toLowerCase()
    );

    // Whitelist check if enforced
    if (enforceWhitelist) {
      if (!foundStudent) {
        setErrorMsg(
          'NISN / Username Anda tidak terdaftar dalam database peserta ujian SMAN 1 Batu. Silakan hubungi proktor/pengawas ujian.'
        );
        return;
      }
      if (!foundStudent.isActive) {
        setErrorMsg(
          'Akun siswa Anda berstatus nonaktif. Akses ujian sedang ditutup oleh administrator/proktor.'
        );
        return;
      }
    }

    // Password / Token Verification:
    // Accept IF matches student's custom password OR matches currentExam.token
    const enteredPass = passwordToken.trim();
    const isTokenMatch =
      enteredPass.toUpperCase() === currentExam.token.trim().toUpperCase();
    const isStudentPassMatch =
      foundStudent?.password &&
      enteredPass.toLowerCase() === foundStudent.password.trim().toLowerCase();

    if (!isTokenMatch && !isStudentPassMatch) {
      setErrorMsg(
        `Password / Token Ujian tidak sesuai! (Gunakan token ujian: ${currentExam.token}${
          foundStudent?.password ? ' atau PIN akun Anda' : ''
        })`
      );
      return;
    }

    onStartExam(currentExam, {
      name: foundStudent ? foundStudent.name : studentName.trim(),
      nisn: cleanInputNisn,
      studentClass: foundStudent ? foundStudent.studentClass : studentClass,
    });
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-2xl p-6 sm:p-8 shadow-xs border border-slate-200">
        {/* Simple School Brand Header */}
        <div className="text-center mb-6">
          <img
            src="/logo-sman1-batu.png"
            alt="Logo SMAN 1 Batu"
            className="w-16 h-18 object-contain mx-auto mb-3 drop-shadow-xs"
          />
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Login Ujian CBT Siswa
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            SMAN 1 Batu &bull; Masukkan NISN terdaftar dan token ujian
          </p>
        </div>

        {errorMsg && (
          <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <p className="leading-relaxed">{errorMsg}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Exam Choice */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Mata Pelajaran Ujian
            </label>
            {activeExams.length > 0 ? (
              <select
                value={selectedExamId}
                onChange={(e) => setSelectedExamId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2.5 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none transition-all"
              >
                {activeExams.map((exam) => (
                  <option key={exam.id} value={exam.id}>
                    {exam.subject} - {exam.title} ({exam.durationMinutes} mnt)
                  </option>
                ))}
              </select>
            ) : (
              <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                Tidak ada paket ujian aktif saat ini.
              </div>
            )}
          </div>

          {/* Username / NISN */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                NISN / Username Siswa
              </label>
              {registeredStudents.length > 0 && (
                <span className="text-[11px] text-slate-400">
                  {enforceWhitelist ? 'Siswa Terdaftar' : 'Bebas'}
                </span>
              )}
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="Contoh: 0061829101"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl pl-10 pr-3.5 py-2.5 text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none font-mono transition-all"
              />
            </div>

            {/* Matched student verification feedback */}
            {matchedStudent && (
              <div
                className={`mt-1.5 px-3 py-1.5 rounded-lg text-[11px] flex items-center gap-1.5 font-medium ${
                  matchedStudent.isActive
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {matchedStudent.isActive ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>
                      Terverifikasi: <strong>{matchedStudent.name}</strong> ({matchedStudent.studentClass})
                    </span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    <span>Akun siswa ini berstatus nonaktif/diblokir</span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Student Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Nama Lengkap Siswa
            </label>
            <input
              type="text"
              placeholder="Contoh: Muhammad Bintang"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              required
              readOnly={!!matchedStudent}
              className={`w-full border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2.5 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all ${
                matchedStudent ? 'bg-slate-100 text-slate-700 cursor-not-allowed font-medium' : 'bg-slate-50 focus:bg-white'
              }`}
            />
          </div>

          {/* Class Select */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Kelas / Rombel
            </label>
            <select
              value={studentClass}
              onChange={(e) => setStudentClass(e.target.value)}
              disabled={!!matchedStudent}
              className={`w-full border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2.5 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all ${
                matchedStudent ? 'bg-slate-100 text-slate-700 cursor-not-allowed' : 'bg-slate-50 focus:bg-white'
              }`}
            >
              {CLASS_OPTIONS.map((cls) => (
                <option key={cls} value={cls}>
                  {cls}
                </option>
              ))}
            </select>
          </div>

          {/* Password / Token */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Password / Token Ujian
              </label>
              {currentExam && (
                <span
                  onClick={() => setPasswordToken(currentExam.token)}
                  className="text-[11px] text-blue-600 font-medium cursor-pointer hover:underline"
                >
                  Token: <strong>{currentExam.token}</strong>
                </span>
              )}
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="Masukkan Password / Token Ujian"
                value={passwordToken}
                onChange={(e) => setPasswordToken(e.target.value.toUpperCase())}
                required
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl pl-10 pr-3.5 py-2.5 text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none font-mono uppercase font-bold tracking-wider transition-all"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              id="start-exam-button"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer text-xs"
            >
              <span>Masuk & Mulai Ujian</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
