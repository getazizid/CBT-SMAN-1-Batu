import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  CheckCircle,
  Clock,
  EyeOff,
  FileCheck,
  Printer,
  RotateCcw,
  ShieldCheck,
  TrendingUp,
  XCircle,
} from 'lucide-react';
import { Exam, StudentExamSubmission } from '../../types';

interface ExamResultReportProps {
  submission: StudentExamSubmission;
  exam: Exam;
  onBackToHome: () => void;
}

export const ExamResultReport: React.FC<ExamResultReportProps> = ({
  submission,
  exam,
  onBackToHome,
}) => {
  const showScore = exam.showInstantScore ?? true;

  useEffect(() => {
    if (showScore && submission.isPassed) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // Safe fallback
      }
    }
  }, [showScore, submission.isPassed]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 transition-colors duration-200">
      {/* Top Banner / Actions (Hidden during print) */}
      <div className="print:hidden flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <span className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1.5 shadow-xs">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Ujian Berhasil Diselesaikan</span>
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-2 tracking-tight">
            {showScore ? 'Laporan Hasil Asesmen' : 'Konfirmasi Penyelesaian Ujian'}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          {showScore && (
            <button
              onClick={handlePrint}
              className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs flex items-center gap-2 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              <span>Cetak Hasil</span>
            </button>
          )}
          <button
            onClick={onBackToHome}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-md hover:shadow-lg hover:shadow-blue-500/20 flex items-center gap-2 transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Kembali ke Beranda</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl dark:shadow-2xl dark:shadow-blue-950/20 border border-slate-200/90 dark:border-slate-800 p-6 sm:p-10 print:shadow-none print:border-none print:p-0 print:bg-white print:text-black transition-colors duration-200">
        {/* Official School Header */}
        <div className="border-b-2 border-slate-900 dark:border-slate-700 print:border-black pb-5 mb-8 text-center relative flex items-center justify-between gap-4">
          <img
            src="/logo-sman1-batu.png"
            alt="Logo SMAN 1 Batu"
            className="w-16 h-18 sm:w-20 sm:h-22 object-contain shrink-0"
          />
          <div className="flex-1 text-center">
            <div className="text-xs font-bold uppercase tracking-widest text-slate-600 dark:text-slate-400 print:text-black">
              Pemerintah Provinsi Jawa Timur &bull; Dinas Pendidikan
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-950 dark:text-white print:text-black uppercase tracking-tight mt-1">
              SMA NEGERI 1 BATU
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-400 print:text-black">
              Jl. Ngaglik No. 1, Sisir, Kec. Batu, Kota Batu, Jawa Timur 65314 &bull; Telp. (0341) 591310
            </p>
            <div className="mt-3 inline-block bg-slate-100 dark:bg-slate-800 print:bg-slate-100 text-slate-800 dark:text-slate-200 print:text-black text-xs font-bold px-4 py-1 rounded-full uppercase border border-slate-200 dark:border-slate-700 print:border-black">
              {showScore ? 'LEMBAR HASIL ASESMEN CBT' : 'BUKTI TANDA TERIMA UJIAN CBT'}
            </div>
          </div>
          <div className="w-16 sm:w-20 shrink-0 hidden sm:block">
            {/* Symmetrical placeholder for printing alignment */}
          </div>
        </div>

        {/* Student & Exam Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 dark:bg-slate-800/60 print:bg-slate-50 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 print:border-black mb-8 text-xs sm:text-sm">
          <div className="space-y-2">
            <div className="flex">
              <span className="w-36 text-slate-500 dark:text-slate-400 print:text-black">Nama Siswa:</span>
              <span className="font-bold text-slate-900 dark:text-white print:text-black">{submission.studentName}</span>
            </div>
            <div className="flex">
              <span className="w-36 text-slate-500 dark:text-slate-400 print:text-black">NISN:</span>
              <span className="font-mono font-semibold text-slate-900 dark:text-white print:text-black">{submission.studentNisn}</span>
            </div>
            <div className="flex">
              <span className="w-36 text-slate-500 dark:text-slate-400 print:text-black">Kelas / Rombel:</span>
              <span className="font-semibold text-slate-900 dark:text-white print:text-black">{submission.studentClass}</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex">
              <span className="w-36 text-slate-500 dark:text-slate-400 print:text-black">Mata Pelajaran:</span>
              <span className="font-bold text-blue-700 dark:text-blue-400 print:text-black">{submission.subject}</span>
            </div>
            <div className="flex">
              <span className="w-36 text-slate-500 dark:text-slate-400 print:text-black">Judul Ujian:</span>
              <span className="font-semibold text-slate-900 dark:text-white print:text-black">{submission.examTitle}</span>
            </div>
            <div className="flex">
              <span className="w-36 text-slate-500 dark:text-slate-400 print:text-black">Waktu Selesai:</span>
              <span className="font-mono text-slate-700 dark:text-slate-300 print:text-black">
                {new Date(submission.submittedAt).toLocaleString('id-ID')}
              </span>
            </div>
          </div>
        </div>

        {/* CONDITION 1: IF SCORE DISPLAY IS ENABLED */}
        {showScore ? (
          <>
            {/* Score Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-4">
              {/* Final Score */}
              <div className="bg-slate-900 dark:bg-slate-800 text-white rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-xs border border-slate-800 dark:border-slate-700">
                <div className="text-[11px] uppercase tracking-widest text-slate-400 font-bold mb-1">
                  Nilai Akhir
                </div>
                <div className="text-5xl sm:text-6xl font-extrabold text-white tracking-tight my-2">
                  {submission.finalScoreScale100}
                </div>
                <div className="text-xs text-slate-300 dark:text-slate-400">
                  Skala Penilaian 0 - 100
                </div>
              </div>

              {/* KKM Passing Status */}
              <div
                className={`rounded-2xl p-6 flex flex-col items-center justify-center text-center border ${
                  submission.isPassed
                    ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200'
                    : 'bg-rose-50/80 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-950 dark:text-rose-200'
                }`}
              >
                {submission.isPassed ? (
                  <CheckCircle className="w-10 h-10 text-emerald-600 dark:text-emerald-400 mb-2" />
                ) : (
                  <XCircle className="w-10 h-10 text-rose-600 dark:text-rose-400 mb-2" />
                )}
                <div className="text-[11px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400">
                  Kriteria Kelulusan (KKM: {submission.passingGrade})
                </div>
                <div className={`text-xl font-extrabold mt-1 ${submission.isPassed ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}`}>
                  {submission.isPassed ? 'TUNTAS (LULUS)' : 'REMEDIAL'}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  {submission.isPassed
                    ? 'Selamat! Nilai Anda telah memenuhi kriteria ketuntasan.'
                    : 'Nilai belum mencapai standar KKM mata pelajaran.'}
                </p>
              </div>

              {/* Time & Integrity Info */}
              <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 flex flex-col justify-center text-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                    <span>Waktu Pengerjaan:</span>
                  </span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {Math.floor(submission.durationSecondsUsed / 60)} menit {submission.durationSecondsUsed % 60} dtk
                  </span>
                </div>

                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                    <span>Integritas Pengerjaan:</span>
                  </span>
                  <span className={`font-bold ${submission.tabSwitchCount === 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400'}`}>
                    {submission.tabSwitchCount === 0 ? 'Tertib (0 Pelanggaran)' : `${submission.tabSwitchCount}x Pindah Tab/App`}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                    <span>Jumlah Soal Dijawab:</span>
                  </span>
                  <span className="font-bold text-blue-700 dark:text-blue-400">
                    {Object.keys(submission.answers).length} / {exam.questions.length} Soal
                  </span>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* CONDITION 2: IF SCORE DISPLAY IS DISABLED BY TEACHER */
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 text-center mb-4 space-y-4">
            <div className="w-14 h-14 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-2xl border border-blue-100 dark:border-blue-900 flex items-center justify-center mx-auto">
              <FileCheck className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Ujian Telah Berhasil Diserahkan
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1">
                Seluruh jawaban Anda telah tersimpan dengan aman pada basis data pengawas CBT SMAN 1 Batu.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 max-w-lg mx-auto text-left text-xs space-y-2">
              <div className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-200">
                <EyeOff className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                <span>Pengaturan Tampilan Nilai</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Sesuai kebijakan ujian ini, nilai akhir tidak ditampilkan langsung di layar siswa. Rekapitulasi perolehan nilai resmi akan diumumkan oleh guru pengampu setelah seluruh peserta selesai mengerjakan.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
