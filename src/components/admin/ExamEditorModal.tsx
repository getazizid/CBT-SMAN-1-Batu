import React, { useState, useEffect } from 'react';
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
  Info,
  Shuffle
} from 'lucide-react';
import { Exam, OptionKey, OptionScoreMap, Question, QuestionOption } from '../../types';
import {
  ALL_SCHOOL_CLASSES,
  KELAS_X_OPTIONS,
  KELAS_XI_OPTIONS,
  KELAS_XII_OPTIONS,
  parseTargetClasses,
  sortClassList
} from '../../utils/constants';

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
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [academicYear, setAcademicYear] = useState('2025/2026 Ganjil');
  const [durationMinutes, setDurationMinutes] = useState(90);
  const [token, setToken] = useState('OSIS2026');
  const [passingGrade, setPassingGrade] = useState(75);
  const [teacherName, setTeacherName] = useState('Tim Pembina OSIS & Kesiswaan SMAN 1 Batu');
  const [defaultOptionScores, setDefaultOptionScores] = useState<OptionScoreMap>({
    A: 10,
    B: 8,
    C: 6,
    D: 4,
    E: 2,
  });
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [showInstantScore, setShowInstantScore] = useState<boolean>(true);
  const [shuffleQuestions, setShuffleQuestions] = useState<boolean>(false);
  const [shuffleOptions, setShuffleOptions] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'settings' | 'questions'>('settings');

  // Sync state whenever exam prop or isOpen changes so existing data is always loaded
  useEffect(() => {
    if (exam) {
      setTitle(exam.title || '');
      setSubject(exam.subject || '');
      setSelectedClasses(parseTargetClasses(exam.gradeClass));
      setAcademicYear(exam.academicYear || '2025/2026 Ganjil');
      setDurationMinutes(exam.durationMinutes || 90);
      setToken(exam.token || 'OSIS2026');
      setPassingGrade(exam.passingGrade || 75);
      setTeacherName(exam.teacherName || 'Tim Pembina OSIS & Kesiswaan SMAN 1 Batu');
      setDefaultOptionScores(
        exam.defaultOptionScores || { A: 10, B: 8, C: 6, D: 4, E: 2 }
      );
      setQuestions(exam.questions ? [...exam.questions] : []);
      setIsActive(exam.isActive ?? true);
      setShowInstantScore(exam.showInstantScore ?? true);
      setShuffleQuestions(exam.shuffleQuestions ?? false);
      setShuffleOptions(exam.shuffleOptions ?? false);
    } else {
      setTitle('');
      setSubject('');
      setSelectedClasses([...ALL_SCHOOL_CLASSES]);
      setAcademicYear('2025/2026 Ganjil');
      setDurationMinutes(90);
      setToken('BATU' + Math.floor(1000 + Math.random() * 9000));
      setPassingGrade(75);
      setTeacherName('Tim Pembina OSIS & Kesiswaan SMAN 1 Batu');
      setDefaultOptionScores({ A: 10, B: 8, C: 6, D: 4, E: 2 });
      setQuestions([]);
      setIsActive(true);
      setShowInstantScore(true);
      setShuffleQuestions(false);
      setShuffleOptions(false);
    }
    setActiveTab('settings');
  }, [exam, isOpen]);

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

  const toggleClass = (cls: string) => {
    setSelectedClasses((prev) =>
      prev.includes(cls) ? prev.filter((c) => c !== cls) : [...prev, cls]
    );
  };

  const handleSelectAllClasses = () => {
    setSelectedClasses([...ALL_SCHOOL_CLASSES]);
  };

  const handleSelectGradeX = () => {
    setSelectedClasses((prev) => Array.from(new Set([...prev, ...KELAS_X_OPTIONS])));
  };

  const handleSelectGradeXI = () => {
    setSelectedClasses((prev) => Array.from(new Set([...prev, ...KELAS_XI_OPTIONS])));
  };

  const handleSelectGradeXII = () => {
    setSelectedClasses((prev) => Array.from(new Set([...prev, ...KELAS_XII_OPTIONS])));
  };

  const handleClearClasses = () => {
    setSelectedClasses([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !subject.trim()) {
      alert('Harap isi judul ujian dan mata pelajaran.');
      return;
    }

    if (selectedClasses.length === 0) {
      alert('Pilih minimal 1 target kelas untuk paket ujian ini.');
      return;
    }

    const formattedGradeClass =
      selectedClasses.length === ALL_SCHOOL_CLASSES.length
        ? 'Semua Kelas (X, XI, XII)'
        : sortClassList(selectedClasses).join(', ');

    const saved: Exam = {
      id: exam?.id || `exam-${Date.now()}`,
      title: title.trim(),
      subject: subject.trim(),
      gradeClass: formattedGradeClass,
      academicYear,
      durationMinutes: Number(durationMinutes),
      token: token.trim().toUpperCase(),
      passingGrade: Number(passingGrade),
      teacherName: teacherName.trim(),
      defaultOptionScores,
      questions,
      shuffleQuestions,
      shuffleOptions,
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

              {/* Target Classes Selection Box (Checkboxes for 36 classes) */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-900 uppercase">
                      Target Kelas Peserta Ujian (Centangan)
                    </label>
                    <p className="text-[11px] text-slate-500">
                      Centang kelas yang berhak mengikuti paket ujian ini. Hanya siswa dari kelas terpilih yang dapat mengakses ujian.
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="bg-blue-100 text-blue-800 text-[11px] font-bold px-2.5 py-1 rounded-full border border-blue-200">
                      {selectedClasses.length === ALL_SCHOOL_CLASSES.length
                        ? 'Semua 36 Kelas Terpilih'
                        : `${selectedClasses.length} / 36 Kelas Terpilih`}
                    </span>
                    <button
                      type="button"
                      onClick={handleSelectAllClasses}
                      className="px-2 py-1 bg-white hover:bg-slate-100 text-slate-700 text-[11px] font-semibold rounded-lg border border-slate-200 shadow-xs cursor-pointer"
                    >
                      Pilih Semua
                    </button>
                    <button
                      type="button"
                      onClick={handleSelectGradeX}
                      className="px-2 py-1 bg-white hover:bg-slate-100 text-slate-700 text-[11px] font-semibold rounded-lg border border-slate-200 shadow-xs cursor-pointer"
                    >
                      + Semua X
                    </button>
                    <button
                      type="button"
                      onClick={handleSelectGradeXI}
                      className="px-2 py-1 bg-white hover:bg-slate-100 text-slate-700 text-[11px] font-semibold rounded-lg border border-slate-200 shadow-xs cursor-pointer"
                    >
                      + Semua XI
                    </button>
                    <button
                      type="button"
                      onClick={handleSelectGradeXII}
                      className="px-2 py-1 bg-white hover:bg-slate-100 text-slate-700 text-[11px] font-semibold rounded-lg border border-slate-200 shadow-xs cursor-pointer"
                    >
                      + Semua XII
                    </button>
                    <button
                      type="button"
                      onClick={handleClearClasses}
                      className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-semibold rounded-lg border border-rose-200 shadow-xs cursor-pointer"
                    >
                      Reset
                    </button>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  {/* Tingkat X */}
                  <div>
                    <span className="text-[11px] font-bold text-slate-700 block mb-1.5">
                      Tingkat Kelas X (X-1 s/d X-12):
                    </span>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-1.5">
                      {KELAS_X_OPTIONS.map((cls) => {
                        const isChecked = selectedClasses.includes(cls);
                        return (
                          <button
                            key={cls}
                            type="button"
                            onClick={() => toggleClass(cls)}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all flex items-center justify-between gap-1.5 cursor-pointer ${
                              isChecked
                                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-100'
                            }`}
                          >
                            <span>{cls}</span>
                            <span className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[9px] font-bold ${
                              isChecked ? 'bg-white text-blue-600' : 'border border-slate-300'
                            }`}>
                              {isChecked ? '✓' : ''}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Tingkat XI */}
                  <div>
                    <span className="text-[11px] font-bold text-slate-700 block mb-1.5">
                      Tingkat Kelas XI (XI-1 s/d XI-12):
                    </span>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-1.5">
                      {KELAS_XI_OPTIONS.map((cls) => {
                        const isChecked = selectedClasses.includes(cls);
                        return (
                          <button
                            key={cls}
                            type="button"
                            onClick={() => toggleClass(cls)}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all flex items-center justify-between gap-1.5 cursor-pointer ${
                              isChecked
                                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-100'
                            }`}
                          >
                            <span>{cls}</span>
                            <span className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[9px] font-bold ${
                              isChecked ? 'bg-white text-blue-600' : 'border border-slate-300'
                            }`}>
                              {isChecked ? '✓' : ''}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Tingkat XII */}
                  <div>
                    <span className="text-[11px] font-bold text-slate-700 block mb-1.5">
                      Tingkat Kelas XII (XII-1 s/d XII-12):
                    </span>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-1.5">
                      {KELAS_XII_OPTIONS.map((cls) => {
                        const isChecked = selectedClasses.includes(cls);
                        return (
                          <button
                            key={cls}
                            type="button"
                            onClick={() => toggleClass(cls)}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all flex items-center justify-between gap-1.5 cursor-pointer ${
                              isChecked
                                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-100'
                            }`}
                          >
                            <span>{cls}</span>
                            <span className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[9px] font-bold ${
                              isChecked ? 'bg-white text-blue-600' : 'border border-slate-300'
                            }`}>
                              {isChecked ? '✓' : ''}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

              {/* Randomization / Anti-Cheat Section */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                    <Shuffle className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 text-xs uppercase tracking-wide">
                      Pengacakan Soal & Pilihan Jawaban (Anti-Mencontek)
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Hasil akhir, penilaian, dan analisis butir soal tetap 100% tersinkronisasi akurat dengan kunci jawaban master.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {/* Shuffle Questions Toggle Card */}
                  <div
                    onClick={() => setShuffleQuestions(!shuffleQuestions)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                      shuffleQuestions
                        ? 'bg-purple-50/70 border-purple-300 text-purple-950 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      id="shuffle-questions-toggle"
                      checked={shuffleQuestions}
                      onChange={(e) => setShuffleQuestions(e.target.checked)}
                      className="w-4 h-4 text-purple-600 rounded cursor-pointer mt-0.5"
                    />
                    <div>
                      <label htmlFor="shuffle-questions-toggle" className="text-xs font-bold text-slate-900 cursor-pointer flex items-center gap-1.5">
                        <span>Acak Urutan Soal</span>
                        {shuffleQuestions && (
                          <span className="bg-purple-100 text-purple-700 text-[10px] font-semibold px-1.5 py-0.2 rounded">
                            Aktif
                          </span>
                        )}
                      </label>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                        Setiap siswa menerima urutan butir soal yang berbeda secara acak saat ujian berlangsung.
                      </p>
                    </div>
                  </div>

                  {/* Shuffle Options Toggle Card */}
                  <div
                    onClick={() => setShuffleOptions(!shuffleOptions)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                      shuffleOptions
                        ? 'bg-purple-50/70 border-purple-300 text-purple-950 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      id="shuffle-options-toggle"
                      checked={shuffleOptions}
                      onChange={(e) => setShuffleOptions(e.target.checked)}
                      className="w-4 h-4 text-purple-600 rounded cursor-pointer mt-0.5"
                    />
                    <div>
                      <label htmlFor="shuffle-options-toggle" className="text-xs font-bold text-slate-900 cursor-pointer flex items-center gap-1.5">
                        <span>Acak Pilihan Opsi (A-E)</span>
                        {shuffleOptions && (
                          <span className="bg-purple-100 text-purple-700 text-[10px] font-semibold px-1.5 py-0.2 rounded">
                            Aktif
                          </span>
                        )}
                      </label>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                        Pilihan ganda A, B, C, D, E pada setiap soal diacak secara dinamis bagi setiap peserta.
                      </p>
                    </div>
                  </div>
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
