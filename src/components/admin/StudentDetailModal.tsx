import React from 'react';
import { CheckCircle2, Clock, Printer, ShieldAlert, User, X, XCircle } from 'lucide-react';
import { Exam, OptionKey, StudentExamSubmission } from '../../types';

interface StudentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  submission: StudentExamSubmission | null;
  exam: Exam | null;
}

export const StudentDetailModal: React.FC<StudentDetailModalProps> = ({
  isOpen,
  onClose,
  submission,
  exam,
}) => {
  if (!isOpen || !submission) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-900 flex items-center justify-center font-bold">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Lembar Hasil Ujian Siswa
              </h3>
              <p className="text-xs text-slate-500">
                {submission.studentName} &bull; {submission.studentClass} ({submission.studentNisn})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Hasil</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Summary KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-slate-500 block mb-1">Nilai Akhir (0-100)</span>
              <span className="text-2xl font-bold text-blue-700">
                {submission.finalScoreScale100}
              </span>
              <span className="text-[11px] text-slate-400 block mt-0.5">
                {submission.totalScoreEarned} / {submission.maxPossibleScore} total poin
              </span>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-slate-500 block mb-1">Status Kelulusan</span>
              <span
                className={`text-xs font-semibold inline-block px-2 py-0.5 rounded-full ${
                  submission.isPassed
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}
              >
                {submission.isPassed ? 'TUNTAS (LULUS)' : 'REMEDIAL'}
              </span>
              <span className="text-[11px] text-slate-400 block mt-1">
                KKM Target: {submission.passingGrade}
              </span>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-slate-500 block mb-1">Waktu Pengerjaan</span>
              <span className="text-sm font-semibold text-slate-800 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>{Math.round(submission.durationSecondsUsed / 60)} Menit</span>
              </span>
              <span className="text-[11px] text-slate-400 block mt-0.5">
                {new Date(submission.submittedAt).toLocaleTimeString('id-ID')}
              </span>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-slate-500 block mb-1">Integritas CBT</span>
              <span
                className={`text-sm font-semibold ${
                  submission.tabSwitchCount === 0 ? 'text-emerald-700' : 'text-amber-700'
                }`}
              >
                {submission.tabSwitchCount === 0
                  ? 'Bersih (0 Tab Switch)'
                  : `${submission.tabSwitchCount}x Pindah Tab`}
              </span>
              <span className="text-[11px] text-slate-400 block mt-0.5">
                {submission.deviceInfo || 'Browser'}
              </span>
            </div>
          </div>

          {/* Detailed Question by Question Table */}
          <div>
            <h4 className="font-semibold text-slate-900 text-xs uppercase tracking-wider mb-3">
              Rincian Jawaban & Poin Tiap Butir Soal
            </h4>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <th className="py-2.5 px-3 w-10 text-center">No</th>
                    <th className="py-2.5 px-3">Potongan Pertanyaan</th>
                    <th className="py-2.5 px-3 text-center w-24">Pilihan Siswa</th>
                    <th className="py-2.5 px-3 text-center w-28">Poin Didapat</th>
                    <th className="py-2.5 px-3 w-40">Detail Bobot Soal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {exam?.questions.map((q) => {
                    const selected = submission.answers[q.number] || null;
                    const score = selected ? (q.optionScores[selected] ?? 0) : 0;
                    const maxScore = Math.max(...(Object.values(q.optionScores) as number[]));

                    return (
                      <tr key={q.id} className="hover:bg-slate-50/60">
                        <td className="py-2.5 px-3 font-semibold text-center text-slate-600">
                          {q.number}
                        </td>
                        <td className="py-2.5 px-3">
                          <p className="text-slate-800 font-medium line-clamp-1">{q.text}</p>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {selected ? (
                            <span className="font-mono font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200">
                              {selected}
                            </span>
                          ) : (
                            <span className="text-rose-500 font-semibold">Kosong</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-center font-semibold">
                          <span
                            className={
                              score === maxScore
                                ? 'text-emerald-700'
                                : score > 0
                                ? 'text-blue-600'
                                : 'text-rose-600'
                            }
                          >
                            +{score} poin
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-[10px] text-slate-500 font-mono">
                          {Object.entries(q.optionScores)
                            .map(([k, val]) => `${k}:${val}p`)
                            .join(' ')}
                        </td>
                      </tr>
                    );
                  }) || (
                    <tr>
                      <td colSpan={5} className="text-center py-4 text-slate-400">
                        Tidak ada data butir soal.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-white border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl cursor-pointer transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
