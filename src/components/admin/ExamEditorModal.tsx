import React, { useState } from 'react';
import {
  Clock,
  FileEdit,
  Key,
  Layers,
  Plus,
  Save,
  Trash2,
  X,
  Sliders,
  Sparkles,
  Info
} from 'lucide-react';
import { Exam, OptionKey, OptionScoreMap, Question, QuestionOption } from '../../types';

interface ExamEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  exam: Exam | null;
  onSaveExam: (exam: Exam) => void;
}

export const ExamEditorModal: React.FC<ExamEditorModalProps> = ({
  isOpen,
  onClose,
  exam,
  onSaveExam,
}) => {
  const [title, setTitle] = useState(exam?.title || '');
  const [subject, setSubject] = useState(exam?.subject || '');
  const [gradeClass, setGradeClass] = useState(exam?.gradeClass || 'Kelas XII - Semua Jurusan');
  const [academicYear, setAcademicYear] = useState(exam?.academicYear || '2025/2026 Ganjil');
  const [durationMinutes, setDurationMinutes] = useState(exam?.durationMinutes || 60);
  const [token, setToken] = useState(exam?.token || 'BATU' + Math.floor(1000 + Math.random() * 9000));
  const [passingGrade, setPassingGrade] = useState(exam?.passingGrade || 75);
  const [teacherName, setTeacherName] = useState(exam?.teacherName || 'Guru Pengampu');
  const [defaultOptionScores, setDefaultOptionScores] = useState<OptionScoreMap>(
    exam?.defaultOptionScores || { A: 10, B: 5, C: 4, D: 3, E: 2 }
  );
  const [questions, setQuestions] = useState<Question[]>(exam?.questions || []);
  const [isActive, setIsActive] = useState<boolean>(exam?.isActive ?? true);
  const [showInstantScore, setShowInstantScore] = useState<boolean>(exam?.showInstantScore ?? true);
  const [activeTab, setActiveTab] = useState<'settings' | 'questions'>('settings');

  if (!isOpen) return null;

  const handleApplyPresetToAll = (preset: OptionScoreMap) => {
    setDefaultOptionScores(preset);
    const updated = questions.map((q) => ({
      ...q,
      optionScores: { ...preset },
    }));
    setQuestions(updated);
  };

  const handleAddQuestion = () => {
    if (questions.length >= 50) {
      alert('Kapasitas maksimal bank soal adalah 50 butir.');
      return;
    }

    const nextNum = questions.length + 1;
    const newQ: Question = {
      id: `q-${Date.now()}-${nextNum}`,
      number: nextNum,
      text: `Pertanyaan nomor ${nextNum}...`,
      options: [
        { key: 'A', text: 'Pilihan Jawaban A' },
        { key: 'B', text: 'Pilihan Jawaban B' },
        { key: 'C', text: 'Pilihan Jawaban C' },
        { key: 'D', text: 'Pilihan Jawaban D' },
        { key: 'E', text: 'Pilihan Jawaban E' },
      ],
      optionScores: { ...defaultOptionScores },
      correctOption: 'A',
      explanation: 'Penjelasan materi soal.',
    };

    setQuestions([...questions, newQ]);
  };

  const handleRemoveQuestion = (index: number) => {
    const updated = questions.filter((_, i) => i !== index).map((q, idx) => ({
      ...q,
      number: idx + 1,
    }));
    setQuestions(updated);
  };

  const handleUpdateQuestion = (index: number, field: keyof Question, value: any) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  };

  const handleUpdateOptionText = (qIndex: number, optKey: OptionKey, text: string) => {
    const updated = [...questions];
    const q = updated[qIndex];
    const opts = q.options.map((o) => (o.key === optKey ? { ...o, text } : o));
    updated[qIndex] = { ...q, options: opts };
    setQuestions(updated);
  };

  const handleUpdateOptionScore = (qIndex: number, optKey: OptionKey, score: number) => {
    const updated = [...questions];
    const q = updated[qIndex];
    updated[qIndex] = {
      ...q,
      optionScores: {
        ...q.optionScores,
        [optKey]: score,
      },
    };
    setQuestions(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !subject.trim()) {
      alert('Harap isi judul ujian dan mata pelajaran.');
      return;
    }

    const saved: Exam = {
      id: exam?.id || `exam-${Date.now()}`,
      title: title.trim(),
      subject: subject.trim(),
      gradeClass,
      academicYear,
      durationMinutes: Number(durationMinutes),
      token: token.trim().toUpperCase(),
      passingGrade: Number(passingGrade),
      teacherName: teacherName.trim(),
      defaultOptionScores,
      questions,
      shuffleQuestions: exam?.shuffleQuestions ?? false,
      shuffleOptions: exam?.shuffleOptions ?? false,
      showInstantScore,
      showExplanationAfter: exam?.showExplanationAfter ?? true,
      allowReview: exam?.allowReview ?? true,
      maxCheatViolations: 3,
      isActive,
      createdAt: exam?.createdAt || new Date().toISOString(),
    };

    onSaveExam(saved);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-900 flex items-center justify-center font-bold">
              <FileEdit className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                {exam ? 'Edit Paket Ujian & Bobot Nilai' : 'Buat Paket Ujian Baru'}
              </h3>
              <p className="text-xs text-slate-500">
                Pengaturan umum, alokasi waktu, token, dan bobot opsi (A/B/C/D/E)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="px-6 pt-3 bg-slate-50/50 border-b border-slate-200 flex gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 text-xs font-semibold rounded-t-xl transition-all cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-white text-blue-600 border-t border-x border-slate-200 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            1. Pengaturan Ujian & Token
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('questions')}
            className={`px-4 py-2 text-xs font-semibold rounded-t-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'questions'
                ? 'bg-white text-blue-600 border-t border-x border-slate-200 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>2. Editor Soal & Bobot Opsi</span>
            <span className="bg-blue-50 text-blue-700 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
              {questions.length} / 50
            </span>
          </button>
        </div>

        {/* Body content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'settings' ? (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Judul Ujian / Asesmen
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Contoh: Penilaian Sumatif Akhir Semester Karakter"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Mata Pelajaran
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Contoh: Pendidikan Karakter & Literasi"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Target Kelas
                  </label>
                  <input
                    type="text"
                    value={gradeClass}
                    onChange={(e) => setGradeClass(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Durasi Pengerjaan (Menit)
                  </label>
                  <input
                    type="number"
                    min={5}
                    max={300}
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    KKM (Passing Grade)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={passingGrade}
                    onChange={(e) => setPassingGrade(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Token Masuk Ujian
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={token}
                      onChange={(e) => setToken(e.target.value.toUpperCase())}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono font-semibold uppercase tracking-wider focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setToken('BATU' + Math.floor(1000 + Math.random() * 9000))}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                    >
                      Acak
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Guru Pengampu
                  </label>
                  <input
                    type="text"
                    value={teacherName}
                    onChange={(e) => setTeacherName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Default Preset Weight Card */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <Sliders className="w-4 h-4 text-blue-600" />
                    <h4 className="font-semibold text-slate-900 text-xs uppercase">
                      Preset Bobot Nilai Bawaan (Opsi A - E)
                    </h4>
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleApplyPresetToAll({ A: 10, B: 5, C: 4, D: 3, E: 2 })}
                      className="bg-white hover:bg-slate-100 text-blue-600 border border-slate-200 text-[10px] font-semibold px-2 py-1 rounded-lg transition-colors cursor-pointer"
                    >
                      Set A:10, B:5, C:4, D:3, E:2
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyPresetToAll({ A: 10, B: 0, C: 0, D: 0, E: 0 })}
                      className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-semibold px-2 py-1 rounded-lg transition-colors cursor-pointer"
                    >
                      Set Standar (A:10, Lain:0)
                    </button>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500">
                  Nilai ini akan otomatis diterapkan saat Anda menambahkan butir soal baru, atau tekan tombol preset di atas untuk mengubah seluruh soal seketika.
                </p>

                <div className="grid grid-cols-5 gap-2 pt-1">
                  {(['A', 'B', 'C', 'D', 'E'] as OptionKey[]).map((k) => (
                    <div key={k} className="bg-white p-2 rounded-xl border border-slate-200 text-center">
                      <span className="text-[11px] font-semibold text-slate-900 block">Opsi {k}</span>
                      <input
                        type="number"
                        value={defaultOptionScores[k]}
                        onChange={(e) =>
                          setDefaultOptionScores({
                            ...defaultOptionScores,
                            [k]: Number(e.target.value),
                          })
                        }
                        className="w-full text-center font-bold text-blue-600 text-xs mt-1 border border-slate-200 rounded-lg py-1 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Switches */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="active-toggle"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                  />
                  <label htmlFor="active-toggle" className="text-xs font-semibold text-slate-800 cursor-pointer">
                    Aktifkan Paket Ujian Ini untuk Diakses Siswa di Halaman Depan
                  </label>
                </div>

                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="instant-score-toggle"
                    checked={showInstantScore}
                    onChange={(e) => setShowInstantScore(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded cursor-pointer mt-0.5"
                  />
                  <div>
                    <label htmlFor="instant-score-toggle" className="text-xs font-semibold text-slate-800 cursor-pointer">
                      Tampilkan Nilai ke Siswa Setelah Selesai Mengerjakan Ujian
                    </label>
                    <p className="text-[11px] text-slate-500">
                      Jika dinonaktifkan, siswa tidak akan melihat angka nilai atau status kelulusan, melainkan hanya tanda terima konfirmasi bahwa ujian telah berhasil dikirim.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Questions Tab */
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    Daftar Butir Soal ({questions.length} / 50)
                  </h4>
                  <p className="text-xs text-slate-500">
                    Setiap opsi memiliki pengaturan nilai bobot tersendiri.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAddQuestion}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 py-2 rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Soal Baru</span>
                </button>
              </div>

              {questions.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                  <p className="text-xs text-slate-500 mb-3">Belum ada soal pada paket ini.</p>
                  <button
                    type="button"
                    onClick={handleAddQuestion}
                    className="bg-blue-600 text-white font-semibold text-xs px-4 py-2 rounded-xl"
                  >
                    Tambah Soal Pertama
                  </button>
                </div>
              ) : (
                <div className="space-y-5">
                  {questions.map((q, qIdx) => (
                    <div
                      key={q.id || qIdx}
                      className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4 relative"
                    >
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <span className="font-semibold text-xs text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
                          Nomor {q.number}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleRemoveQuestion(qIdx)}
                          className="text-rose-500 hover:text-rose-700 p-1 rounded-lg hover:bg-rose-50 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Hapus</span>
                        </button>
                      </div>

                      {/* Question text */}
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 uppercase mb-1">
                          Teks Pertanyaan
                        </label>
                        <textarea
                          rows={3}
                          value={q.text}
                          onChange={(e) => handleUpdateQuestion(qIdx, 'text', e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      </div>

                      {/* Options & Weight Editor */}
                      <div className="space-y-2">
                        <label className="block text-[11px] font-semibold text-slate-700 uppercase">
                          Opsi Jawaban & Bobot Nilai Poin
                        </label>

                        {(['A', 'B', 'C', 'D', 'E'] as OptionKey[]).map((optKey) => {
                          const currentOpt = q.options.find((o) => o.key === optKey);
                          const optScore = q.optionScores[optKey] ?? 0;
                          return (
                            <div key={optKey} className="flex items-center gap-2">
                              <span className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 font-semibold text-xs flex items-center justify-center shrink-0">
                                {optKey}
                              </span>

                              <input
                                type="text"
                                value={currentOpt?.text || ''}
                                onChange={(e) => handleUpdateOptionText(qIdx, optKey, e.target.value)}
                                placeholder={`Teks pilihan opsi ${optKey}...`}
                                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                              />

                              <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl px-2 py-1 shrink-0">
                                <span className="text-[10px] font-medium text-slate-500">Nilai:</span>
                                <input
                                  type="number"
                                  value={optScore}
                                  onChange={(e) => handleUpdateOptionScore(qIdx, optKey, Number(e.target.value))}
                                  className="w-12 text-center font-bold text-xs text-blue-700 focus:outline-none"
                                />
                                <span className="text-[10px] text-slate-400">p</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Explanation */}
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 uppercase mb-1">
                          Pembahasan / Penjelasan Soal (Opsional)
                        </label>
                        <input
                          type="text"
                          value={q.explanation || ''}
                          onChange={(e) => handleUpdateQuestion(qIdx, 'explanation', e.target.value)}
                          placeholder="Penjelasan materi untuk ditampilkan di laporan nilai siswa..."
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Footer Action */}
          <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              Batal
            </button>

            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-xs flex items-center gap-2 cursor-pointer transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Pengaturan Ujian</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
