import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
  ExternalLink,
  Eye,
  Filter,
  GraduationCap,
  HelpCircle,
  Laptop,
  Maximize2,
  Play,
  Radio,
  RefreshCw,
  RotateCcw,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Trash2,
  User,
  Users,
  Volume2,
  VolumeX,
  X
} from 'lucide-react';
import { Exam, LiveStudentSession, Question, StudentExamSubmission } from '../../types';
import {
  clearAllLiveSessionsForExam,
  deleteLiveSessionFromFirestore,
  subscribeToLiveSessions,
} from '../../utils/firebaseService';
import { ALL_SCHOOL_CLASSES, sortClassList } from '../../utils/constants';

interface LiveMonitorTabProps {
  exams: Exam[];
  selectedExamId: string;
  onSelectExam: (examId: string) => void;
  onSwitchToExamsTab?: () => void;
  submissions?: StudentExamSubmission[];
  onResetStudentSubmission?: (submission: StudentExamSubmission) => Promise<void>;
}

export const LiveMonitorTab: React.FC<LiveMonitorTabProps> = ({
  exams,
  selectedExamId,
  onSelectExam,
  onSwitchToExamsTab,
  submissions,
  onResetStudentSubmission,
}) => {
  const [liveSessions, setLiveSessions] = useState<LiveStudentSession[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [classFilter, setClassFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'WARNING' | 'SUBMITTED'>('ALL');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [selectedStudentDetail, setSelectedStudentDetail] = useState<LiveStudentSession | null>(null);
  const [selectedQuestionDetail, setSelectedQuestionDetail] = useState<Question | null>(null);

  // Audio Context for proctor cheat alert siren
  const prevViolationsRef = useRef<number>(0);
  const playAlertSiren = () => {
    try {
      if (typeof window === 'undefined') return;
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        if (ctx.state === 'suspended') ctx.resume().catch(() => {});
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(520, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(780, ctx.currentTime + 0.15);
        osc.frequency.exponentialRampToValueAtTime(520, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.18, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      }
    } catch {
      // Audio autoplay permission ignore
    }
  };

  const currentExam = useMemo(() => {
    return exams.find((e) => e.id === selectedExamId) || exams[0] || null;
  }, [exams, selectedExamId]);

  // Subscribe to real-time live sessions for selected exam
  // Automatically unsubscribes on unmount (100% Free Spark Tier protection)
  useEffect(() => {
    if (!selectedExamId) {
      setLiveSessions([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const unsub = subscribeToLiveSessions(
      selectedExamId,
      (remoteSessions) => {
        setLiveSessions(remoteSessions);
        setIsLoading(false);

        // Check if new violation occurred and trigger sound alert
        const totalViolations = remoteSessions.reduce(
          (sum, s) => sum + (s.violationCount || 0),
          0
        );
        if (totalViolations > prevViolationsRef.current && soundEnabled) {
          playAlertSiren();
        }
        prevViolationsRef.current = totalViolations;
      },
      () => {
        setIsLoading(false);
      }
    );

    return () => {
      unsub();
    };
  }, [selectedExamId, soundEnabled]);

  // Extract all available classes for filtering (hanya kelas yang sedang aktif ujian)
  const availableClasses = useMemo(() => {
    const list = new Set<string>();
    liveSessions.forEach((s) => {
      if (s.studentClass && s.studentClass.trim()) list.add(s.studentClass.trim());
    });
    return ['ALL', ...sortClassList(Array.from(list))];
  }, [liveSessions]);

  // Reset filter kelas jika kelas tersebut sudah tidak ada lagi di sesi aktif
  useEffect(() => {
    if (classFilter !== 'ALL' && !availableClasses.includes(classFilter)) {
      setClassFilter('ALL');
    }
  }, [availableClasses, classFilter]);

  // Filtered live sessions
  const filteredSessions = useMemo(() => {
    return liveSessions.filter((s) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        s.studentName.toLowerCase().includes(q) ||
        s.studentNisn.toLowerCase().includes(q) ||
        s.studentClass.toLowerCase().includes(q);

      const matchClass = classFilter === 'ALL' || s.studentClass === classFilter;

      let matchStatus = true;
      if (statusFilter === 'ACTIVE') {
        matchStatus = s.status === 'active';
      } else if (statusFilter === 'WARNING') {
        matchStatus = s.status === 'warning_exit' || (s.violationCount || 0) > 0;
      } else if (statusFilter === 'SUBMITTED') {
        matchStatus = s.status === 'submitted';
      }

      return matchSearch && matchClass && matchStatus;
    });
  }, [liveSessions, searchQuery, classFilter, statusFilter]);

  // Statistical calculations for proctor overview
  const stats = useMemo(() => {
    const total = liveSessions.length;
    const active = liveSessions.filter((s) => s.status === 'active').length;
    const warning = liveSessions.filter(
      (s) => s.status === 'warning_exit' || (s.violationCount || 0) > 0
    ).length;
    const currentlyOut = liveSessions.filter((s) => s.status === 'warning_exit').length;
    const submitted = liveSessions.filter((s) => s.status === 'submitted').length;

    const totalScore = liveSessions.reduce((sum, s) => sum + (s.scoreScale100 || 0), 0);
    const avgScore = total > 0 ? Math.round((totalScore / total) * 10) / 10 : 0;

    const totalAnswered = liveSessions.reduce((sum, s) => sum + (s.answeredCount || 0), 0);
    const totalQuestionsPossible = liveSessions.reduce((sum, s) => sum + (s.totalQuestions || 1), 0);
    const avgProgressPct =
      totalQuestionsPossible > 0 ? Math.round((totalAnswered / totalQuestionsPossible) * 100) : 0;

    return {
      total,
      active,
      warning,
      currentlyOut,
      submitted,
      avgScore,
      avgProgressPct,
    };
  }, [liveSessions]);

  const handleClearCompleted = async () => {
    if (!confirm('Hapus seluruh data siswa yang sudah selesai dikumpulkan dari layar pantau?')) return;
    const submittedList = liveSessions.filter((s) => s.status === 'submitted');
    for (const s of submittedList) {
      await deleteLiveSessionFromFirestore(s.id);
    }
  };

  const handleResetLiveStudent = async (session: LiveStudentSession) => {
    if (!onResetStudentSubmission) return;

    if (
      !confirm(
        `Reset ujian siswa "${session.studentName}" (NISN: ${session.studentNisn})?\n\nTindakan ini akan:\n1. Menghapus riwayat pengerjaan siswa dari sistem & Cloud Firestore\n2. Membuka blokir pengerjaan agar siswa dapat login dan mengerjakan ulang dengan waktu penuh.`
      )
    ) {
      return;
    }

    // Cari submission yang cocok dari daftar submissions jika ada
    const matchedSub = (submissions || []).find(
      (s) =>
        s.studentNisn.trim().toLowerCase() === session.studentNisn.trim().toLowerCase() &&
        (s.examId === session.examId ||
          s.examId === session.examId.replace('exam-ct-informatika-30', 'exam-ct-inf-x-30'))
    );

    const targetSub: StudentExamSubmission = matchedSub || {
      id: `sub-reset-${session.studentNisn}-${Date.now()}`,
      examId: session.examId,
      examTitle: session.examTitle || '',
      subject: '',
      studentName: session.studentName,
      studentNisn: session.studentNisn,
      studentClass: session.studentClass,
      startTime: session.startTime || new Date().toISOString(),
      answers: {},
      flaggedQuestions: [],
      answersDetail: [],
      totalScoreEarned: session.scoreScale100 || 0,
      maxPossibleScore: 100,
      finalScoreScale100: session.scoreScale100 || 0,
      isPassed: false,
      tabSwitchCount: session.violationCount || 0,
      submittedAt: session.lastActiveAt || new Date().toISOString(),
    };

    await onResetStudentSubmission(targetSub);
    await deleteLiveSessionFromFirestore(session.id);
    await deleteLiveSessionFromFirestore(session.studentNisn);
    setLiveSessions((prev) => prev.filter((s) => s.id !== session.id && s.studentNisn !== session.studentNisn));
    if (selectedStudentDetail?.id === session.id) {
      setSelectedStudentDetail(null);
    }
    alert(`✅ Akses ujian siswa "${session.studentName}" berhasil direset! Siswa sekarang dapat login kembali.`);
  };

  const handleResetAllLive = async () => {
    if (!currentExam) return;
    if (!confirm(`Hapus dan reset seluruh sesi pantau aktif untuk paket "${currentExam.subject}"?`)) return;
    await clearAllLiveSessionsForExam(currentExam.id);
  };

  const formatTimer = (seconds: number) => {
    if (seconds <= 0) return '00:00';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Check if session is offline (no signal for > 45s)
  const isSessionOffline = (lastActiveAt?: string, status?: string) => {
    if (status === 'submitted') return false;
    if (!lastActiveAt) return true;
    const diff = (Date.now() - new Date(lastActiveAt).getTime()) / 1000;
    return diff > 45;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Proctor Status Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/90 dark:border-slate-800 shadow-sm transition-all">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-100 dark:border-rose-900 shrink-0 relative">
              <Radio className="w-6 h-6 animate-pulse" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full"></span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">
                  Live Proctoring Room
                </h3>
                <span className="bg-emerald-100 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Quizizz Pro Mode
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Pemantauan layar penuh siswa, deteksi pelanggaran keluar/pindah aplikasi, dan progress jawaban benar/salah secara langsung.
              </p>
            </div>
          </div>

          {/* Top Controls: Exam Selector & Sound Alert */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Exam Selector */}
            <div className="flex items-center gap-2 text-xs">
              <span className="font-semibold text-slate-500 dark:text-slate-400 hidden sm:inline">Paket Ujian:</span>
              <select
                value={selectedExamId}
                onChange={(e) => onSelectExam(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-900 dark:text-white rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none max-w-[220px] sm:max-w-xs truncate"
              >
                {exams.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.subject} ({e.questions.length} Soal • Token: {e.token})
                  </option>
                ))}
              </select>
            </div>

            {/* Sound Toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-all cursor-pointer ${
                soundEnabled
                  ? 'bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'
              }`}
              title={soundEnabled ? 'Bunyi sirine alarm aktif jika ada siswa keluar' : 'Alarm dibisukan'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-rose-600" /> : <VolumeX className="w-4 h-4" />}
              <span className="hidden sm:inline">{soundEnabled ? 'Alarm ON' : 'Alarm OFF'}</span>
            </button>

            {/* Reset / Actions Menu */}
            <button
              onClick={handleClearCompleted}
              disabled={stats.submitted === 0}
              className="text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              title="Bersihkan siswa yang sudah mengumpulkan dari layar pantau"
            >
              Bersihkan Selesai
            </button>
          </div>
        </div>

        {/* 5 Realtime Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-6">
          <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/60">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-1">
              Total Terhubung
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {stats.total}
              </span>
              <span className="text-xs text-slate-500">Siswa</span>
            </div>
          </div>

          <div className="bg-emerald-50/70 dark:bg-emerald-950/40 p-3.5 rounded-2xl border border-emerald-200 dark:border-emerald-800/60">
            <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 block mb-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Layar Penuh Tertib</span>
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-emerald-700 dark:text-emerald-400">
                {stats.active}
              </span>
              <span className="text-xs text-emerald-600 dark:text-emerald-400">
                ({stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}%)
              </span>
            </div>
          </div>

          <div
            className={`p-3.5 rounded-2xl border transition-all ${
              stats.currentlyOut > 0
                ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-300 dark:border-rose-800 animate-pulse'
                : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700/60'
            }`}
          >
            <span className="text-[11px] font-bold text-rose-800 dark:text-rose-300 block mb-1 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
              <span>Keluar / Pelanggaran</span>
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-rose-600 dark:text-rose-400">
                {stats.currentlyOut}
              </span>
              <span className="text-xs text-rose-600 dark:text-rose-400">
                ({stats.warning} pernah keluar)
              </span>
            </div>
          </div>

          <div className="bg-blue-50/70 dark:bg-blue-950/40 p-3.5 rounded-2xl border border-blue-200 dark:border-blue-800/60">
            <span className="text-[11px] font-bold text-blue-800 dark:text-blue-300 block mb-1">
              Rata-rata Skor Live
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-blue-700 dark:text-blue-300">
                {stats.avgScore}
              </span>
              <span className="text-xs text-blue-600 dark:text-blue-400">/ 100</span>
            </div>
          </div>

          <div className="col-span-2 sm:col-span-1 bg-violet-50/70 dark:bg-violet-950/40 p-3.5 rounded-2xl border border-violet-200 dark:border-violet-800/60">
            <span className="text-[11px] font-bold text-violet-800 dark:text-violet-300 block mb-1">
              Rata-rata Progres Soal
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-violet-700 dark:text-violet-300">
                {stats.avgProgressPct}%
              </span>
              <span className="text-xs text-violet-600 dark:text-violet-400">
                ({stats.submitted} Selesai)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama siswa atau NISN..."
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Class Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="bg-transparent text-slate-700 dark:text-slate-200 font-semibold focus:outline-none cursor-pointer"
            >
              {availableClasses.map((cls) => {
                const count = cls === 'ALL'
                  ? liveSessions.length
                  : liveSessions.filter((s) => s.studentClass === cls).length;
                return (
                  <option key={cls} value={cls}>
                    {cls === 'ALL' ? `Semua Kelas (${count})` : `Kelas ${cls} (${count})`}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Status Tabs */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                statusFilter === 'ALL'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Semua ({liveSessions.length})
            </button>
            <button
              onClick={() => setStatusFilter('ACTIVE')}
              className={`px-3 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                statusFilter === 'ACTIVE'
                  ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              🟢 Aktif ({stats.active})
            </button>
            <button
              onClick={() => setStatusFilter('WARNING')}
              className={`px-3 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                statusFilter === 'WARNING'
                  ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              🔴 Keluar ({stats.warning})
            </button>
            <button
              onClick={() => setStatusFilter('SUBMITTED')}
              className={`px-3 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                statusFilter === 'SUBMITTED'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              🔵 Selesai ({stats.submitted})
            </button>
          </div>
        </div>
      </div>

      {/* Live Student Cards Grid */}
      {filteredSessions.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-10 border border-slate-200/90 dark:border-slate-800 text-center">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-4 border border-blue-200 dark:border-blue-800 shadow-inner">
            <Radio className="w-8 h-8" />
          </div>
          <h4 className="font-extrabold text-base text-slate-900 dark:text-white mb-1">
            Belum Ada Siswa yang Terhubung
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-5 leading-relaxed">
            Ketika siswa memasukkan Token Ujian ({currentExam?.token || '---'}) dan masuk ke CBT Room, layar pengerjaan, status fullscreen, jawaban benar/salah, dan pelanggaran mereka akan otomatis muncul <strong>realtime</strong> di sini.
          </p>
          {onSwitchToExamsTab && (
            <button
              onClick={onSwitchToExamsTab}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Periksa Pengaturan Paket Ujian
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSessions.map((session) => {
            const isOut = session.status === 'warning_exit';
            const isSubmitted = session.status === 'submitted';
            const isOffline = isSessionOffline(session.lastActiveAt, session.status);
            const totalQ = session.totalQuestions || currentExam?.questions.length || 1;
            const correctQ = session.correctCount || 0;
            const incorrectQ = session.incorrectCount || 0;
            const answeredQ = session.answeredCount || 0;
            const unansweredQ = Math.max(0, totalQ - answeredQ);

            // Progress percentages for 3-part progress bar
            const correctPct = (correctQ / totalQ) * 100;
            const incorrectPct = (incorrectQ / totalQ) * 100;

            const isPassed = (session.scoreScale100 || 0) >= (currentExam?.passingGrade || 75);

            return (
              <div
                key={session.id}
                className={`bg-white dark:bg-slate-900 rounded-3xl p-5 border transition-all duration-200 shadow-sm relative overflow-hidden flex flex-col justify-between ${
                  isOut
                    ? 'border-rose-500 dark:border-rose-600 ring-2 ring-rose-500/20 shadow-rose-500/10'
                    : isSubmitted
                    ? 'border-blue-200 dark:border-blue-900/60 opacity-90'
                    : isOffline
                    ? 'border-amber-300 dark:border-amber-800'
                    : 'border-slate-200/90 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600'
                }`}
              >
                {/* Out of fullscreen flashing warning banner */}
                {isOut && (
                  <div className="bg-rose-600 text-white -mx-5 -mt-5 px-4 py-1.5 text-[11px] font-extrabold flex items-center justify-between mb-4 animate-pulse">
                    <div className="flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>TERDETEKSI KELUAR DARI UJIAN!</span>
                    </div>
                    <span>{session.violationCount || 1}x Pelanggaran</span>
                  </div>
                )}

                <div>
                  {/* Top card row: Name, Class, and Device */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="min-w-0">
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white truncate" title={session.studentName}>
                        {session.studentName}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{session.studentClass}</span>
                        <span>•</span>
                        <span className="font-mono">{session.studentNisn}</span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="shrink-0">
                      {isSubmitted ? (
                        <span className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                          Selesai
                        </span>
                      ) : isOut ? (
                        <span className="px-2.5 py-1 rounded-xl text-[11px] font-extrabold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-800 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-ping"></span>
                          <span>Keluar</span>
                        </span>
                      ) : isOffline ? (
                        <span className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                          Offline (&gt;45s)
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          <span>Layar Penuh</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Device and Current Question Badge */}
                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mb-3 bg-slate-50 dark:bg-slate-800/60 px-3 py-1.5 rounded-xl border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-1.5">
                      {session.deviceType === 'iPhone' || session.deviceType === 'iPad' ? (
                        <Smartphone className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300" />
                      ) : session.deviceType === 'Android' ? (
                        <Smartphone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <Laptop className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      )}
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {session.deviceInfo || session.deviceType}
                      </span>
                    </div>

                    <div className="font-mono font-bold text-slate-700 dark:text-slate-200">
                      Soal #{session.currentQuestionNumber || 1} / {totalQ}
                    </div>
                  </div>

                  {/* Realtime 3-Segment Progress Bar (Benar, Salah, Belum) */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-[11px] mb-1.5">
                      <span className="font-semibold text-slate-600 dark:text-slate-400">
                        Progres Jawaban:
                      </span>
                      <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">
                        {answeredQ}/{totalQ} Soal ({Math.round((answeredQ / totalQ) * 100)}%)
                      </span>
                    </div>

                    <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                      {/* Green: Benar */}
                      <div
                        style={{ width: `${correctPct}%` }}
                        className="bg-emerald-500 h-full transition-all duration-300"
                        title={`${correctQ} Jawaban Benar`}
                      ></div>
                      {/* Red: Salah */}
                      <div
                        style={{ width: `${incorrectPct}%` }}
                        className="bg-rose-500 h-full transition-all duration-300"
                        title={`${incorrectQ} Jawaban Salah`}
                      ></div>
                    </div>

                    {/* Breakdown counts */}
                    <div className="flex items-center justify-between text-[10px] mt-1 text-slate-500 dark:text-slate-400">
                      <span className="text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                        {correctQ} Benar
                      </span>
                      <span className="text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 inline-block"></span>
                        {incorrectQ} Salah
                      </span>
                      <span className="text-slate-400 dark:text-slate-500 font-medium">
                        {unansweredQ} Belum
                      </span>
                    </div>
                  </div>

                  {/* Live Score Display */}
                  <div className="bg-slate-50 dark:bg-slate-800/80 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 mb-4 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Skor Sementara
                      </span>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span
                          className={`text-xl font-black ${
                            isPassed
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-amber-600 dark:text-amber-400'
                          }`}
                        >
                          {session.scoreScale100 ?? 0}
                        </span>
                        <span className="text-xs text-slate-400">/ 100</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Sisa Waktu
                      </span>
                      <div className="text-sm font-mono font-bold text-slate-700 dark:text-slate-200 mt-0.5 flex items-center justify-end gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{formatTimer(session.timeLeftSeconds || 0)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Violation detail notice if any */}
                  {(session.violationCount || 0) > 0 && (
                    <div className="mb-4 p-2.5 rounded-xl bg-rose-50/70 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-[11px] text-rose-800 dark:text-rose-300 flex items-start gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <strong>{session.violationCount}x Pelanggaran:</strong>{' '}
                        <span>{session.lastViolationReason || 'Keluar Layar Penuh'}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Inspect & Reset Action Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedStudentDetail(session)}
                    className="flex-1 py-2 px-3 bg-slate-100 hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 hover:text-blue-600 dark:text-slate-200 dark:hover:text-blue-400 rounded-xl font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 border border-slate-200/80 dark:border-slate-700"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Periksa</span>
                  </button>
                  {onResetStudentSubmission && (
                    <button
                      onClick={() => handleResetLiveStudent(session)}
                      className="py-2 px-3 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/60 text-amber-700 dark:text-amber-300 rounded-xl font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1 border border-amber-200 dark:border-amber-800"
                      title="Reset Ujian & Buka Akses Agar Siswa Dapat Mengerjakan Ulang"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Live Student Answer Sheet Inspector */}
      {selectedStudentDetail && (
        <div className="fixed inset-0 bg-slate-900/70 dark:bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-3xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    {selectedStudentDetail.studentName}
                  </h3>
                  <span className="bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[11px] font-bold px-2 py-0.5 rounded-lg">
                    {selectedStudentDetail.studentClass}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  NISN: <span className="font-mono font-bold">{selectedStudentDetail.studentNisn}</span> • Perangkat: <span className="font-semibold">{selectedStudentDetail.deviceInfo}</span>
                </p>
              </div>

              <button
                onClick={() => {
                  setSelectedStudentDetail(null);
                  setSelectedQuestionDetail(null);
                }}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-5">
              <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-2xl">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Skor Sementara</span>
                <span className="text-xl font-black text-blue-600 dark:text-blue-400">
                  {selectedStudentDetail.scoreScale100} / 100
                </span>
              </div>
              <div className="bg-emerald-50 dark:bg-emerald-950/40 p-3 rounded-2xl border border-emerald-100 dark:border-emerald-900">
                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 block uppercase">Benar</span>
                <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                  {selectedStudentDetail.correctCount || 0} Soal
                </span>
              </div>
              <div className="bg-rose-50 dark:bg-rose-950/40 p-3 rounded-2xl border border-rose-100 dark:border-rose-900">
                <span className="text-[10px] font-bold text-rose-700 dark:text-rose-400 block uppercase">Salah</span>
                <span className="text-xl font-black text-rose-600 dark:text-rose-400">
                  {selectedStudentDetail.incorrectCount || 0} Soal
                </span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-2xl">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Pelanggaran</span>
                <span className="text-xl font-black text-rose-600">
                  {selectedStudentDetail.violationCount || 0} Kali
                </span>
              </div>
            </div>

            {/* Questions Grid 1 to N */}
            <div>
              <h4 className="font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wider mb-3">
                Lembar Jawaban Realtime (Klik nomor soal untuk cek rincian)
              </h4>

              <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 mb-6">
                {(currentExam?.questions || []).map((q, idx) => {
                  const studentAns = selectedStudentDetail.answers?.[q.id];
                  const scores = q.optionScores || {};
                  const maxScore = Math.max(...(Object.values(scores) as number[]), 0);
                  const earnedScore = studentAns ? scores[studentAns] ?? 0 : 0;
                  const isCorrect = studentAns && earnedScore === maxScore && maxScore > 0;
                  const isWrong = studentAns && !isCorrect;
                  const isSelected = selectedQuestionDetail?.id === q.id;

                  return (
                    <button
                      key={q.id}
                      onClick={() => setSelectedQuestionDetail(q)}
                      className={`p-2 rounded-xl text-center border font-bold text-xs transition-all cursor-pointer relative ${
                        isSelected
                          ? 'ring-2 ring-blue-500 scale-105'
                          : ''
                      } ${
                        isCorrect
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                          : isWrong
                          ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'
                      }`}
                    >
                      <span className="block text-[10px] font-mono text-slate-400">#{idx + 1}</span>
                      <span className="block font-black text-sm">{studentAns || '-'}</span>
                    </button>
                  );
                })}
              </div>

              {/* Question Preview Box when clicked */}
              {selectedQuestionDetail && (
                <div className="bg-slate-50 dark:bg-slate-800/70 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs animate-in fade-in duration-150">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-extrabold text-blue-600 dark:text-blue-400">
                      Rincian Soal #{selectedQuestionDetail.number}
                    </span>
                    <button
                      onClick={() => setSelectedQuestionDetail(null)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      Tutup
                    </button>
                  </div>

                  <p className="font-medium text-slate-800 dark:text-slate-200 mb-3">
                    {selectedQuestionDetail.text}
                  </p>

                  <div className="space-y-1.5">
                    {selectedQuestionDetail.options.map((opt) => {
                      const studentChosen = selectedStudentDetail.answers?.[selectedQuestionDetail.id] === opt.key;
                      const score = selectedQuestionDetail.optionScores?.[opt.key] ?? 0;
                      const maxScore = Math.max(
                        ...(Object.values(selectedQuestionDetail.optionScores || {}) as number[]),
                        0
                      );
                      const isMax = score === maxScore && maxScore > 0;

                      return (
                        <div
                          key={opt.key}
                          className={`p-2 rounded-xl flex items-center justify-between text-xs border ${
                            studentChosen
                              ? isMax
                                ? 'bg-emerald-100 dark:bg-emerald-950/80 border-emerald-400 font-bold text-emerald-900 dark:text-emerald-200'
                                : 'bg-rose-100 dark:bg-rose-950/80 border-rose-400 font-bold text-rose-900 dark:text-rose-200'
                              : isMax
                              ? 'bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-200 text-slate-700 dark:text-slate-300'
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-lg bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-bold text-[11px]">
                              {opt.key}
                            </span>
                            <span>{opt.text}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            {studentChosen && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/70 dark:bg-black/30">
                                Pilihan Siswa
                              </span>
                            )}
                            <span className="font-mono font-bold text-[11px]">
                              +{score} Poin
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
              {onResetStudentSubmission ? (
                <button
                  onClick={() => handleResetLiveStudent(selectedStudentDetail)}
                  className="py-2 px-4 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/50 dark:hover:bg-amber-900/60 text-amber-700 dark:text-amber-300 font-bold text-xs rounded-xl border border-amber-200 dark:border-amber-800 cursor-pointer flex items-center gap-1.5 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Ujian Siswa Ini</span>
                </button>
              ) : <div></div>}

              <button
                onClick={() => {
                  setSelectedStudentDetail(null);
                  setSelectedQuestionDetail(null);
                }}
                className="py-2 px-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs rounded-xl shadow-xs cursor-pointer hover:opacity-90"
              >
                Tutup Inspeksi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
