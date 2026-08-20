import React, { useState, useEffect, useRef } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  Flag,
  HelpCircle,
  Maximize2,
  Minimize2,
  Moon,
  Send,
  ShieldAlert,
  Sun,
  Type,
  User,
  X
} from 'lucide-react';
import { Exam, OptionKey, Question, StudentAnswerDetail, StudentExamSubmission } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import {
  clearStoredExamProgress,
  getStoredExamProgress,
  saveStoredActiveStudentSession,
  saveStoredExamProgress,
} from '../../utils/storage';
import {
  exitAppFullscreen,
  isCurrentlyFullscreen,
  isFullscreenSupported,
  isIOSDevice,
  requestAppFullscreen,
} from '../../utils/deviceHelper';

interface ExamRoomProps {
  exam: Exam;
  studentData: {
    name: string;
    nisn: string;
    studentClass: string;
  };
  onSubmitExam: (submission: StudentExamSubmission) => void;
  onExitExam: () => void;
}

interface DisplayOption {
  displayKey: OptionKey; // 'A', 'B', 'C', 'D', 'E' shown to student
  originalKey: OptionKey; // original option key
  text: string;
  originalScore: number;
}

interface DisplayQuestion {
  displayNumber: number; // 1 to N shown in room
  originalQuestion: Question;
  text: string;
  imageUrl?: string;
  options: DisplayOption[];
  explanation?: string;
  category?: string;
}

export const ExamRoom: React.FC<ExamRoomProps> = ({
  exam,
  studentData,
  onSubmitExam,
  onExitExam,
}) => {
  const { theme, toggleTheme } = useTheme();
  // Check if there is previously saved in-progress exam data
  const initialSaved = useRef(getStoredExamProgress(exam.id, studentData.nisn)).current;

  // Generate or restore randomized question & option list
  const [displayQuestions] = useState<DisplayQuestion[]>(() => {
    if (initialSaved?.displayQuestions && Array.isArray(initialSaved.displayQuestions) && initialSaved.displayQuestions.length > 0) {
      return initialSaved.displayQuestions;
    }

    let qList = [...exam.questions];
    if (exam.shuffleQuestions) {
      // Fisher-Yates shuffle
      for (let i = qList.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [qList[i], qList[j]] = [qList[j], qList[i]];
      }
    }

    const standardOptionKeys: OptionKey[] = ['A', 'B', 'C', 'D', 'E'];

    return qList.map((q, qIdx) => {
      let optList = [...q.options];
      if (exam.shuffleOptions) {
        // Fisher-Yates shuffle for options
        for (let i = optList.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [optList[i], optList[j]] = [optList[j], optList[i]];
        }
      }

      const displayOptions: DisplayOption[] = optList.map((opt, optIdx) => {
        const displayKey = standardOptionKeys[optIdx] || opt.key;
        return {
          displayKey,
          originalKey: opt.key,
          text: opt.text,
          originalScore: q.optionScores[opt.key] ?? 0,
        };
      });

      return {
        displayNumber: qIdx + 1,
        originalQuestion: q,
        text: q.text,
        imageUrl: q.imageUrl,
        options: displayOptions,
        explanation: q.explanation,
        category: q.category,
      };
    });
  });

  const [currentIndex, setCurrentIndex] = useState<number>(() => initialSaved?.currentIndex ?? 0);
  
  // Student display answers: key = displayNumber (1..N), value = displayOptionKey ('A'..'E')
  const [displayAnswers, setDisplayAnswers] = useState<{ [displayNumber: number]: OptionKey }>(
    () => initialSaved?.displayAnswers || {}
  );
  // Map of originalQuestion.id -> selected original OptionKey (for accurate grading)
  const [answersByQuestionId, setAnswersByQuestionId] = useState<Record<string, OptionKey>>(() => initialSaved?.answersByQuestionId ?? {});

  // Flagged/Doubtful questions
  const [flaggedDisplayNumbers, setFlaggedDisplayNumbers] = useState<number[]>(() => initialSaved?.flaggedDisplayNumbers ?? []);

  // Time remaining in seconds
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(() => {
    if (typeof initialSaved?.timeLeftSeconds === 'number' && initialSaved.timeLeftSeconds > 0) {
      return initialSaved.timeLeftSeconds;
    }
    return exam.durationMinutes * 60;
  });

  const [fontSize, setFontSize] = useState<'sm' | 'md' | 'lg'>('md');
  const [showSubmitModal, setShowSubmitModal] = useState<boolean>(false);
  const [tabSwitchCount, setTabSwitchCount] = useState<number>(() => initialSaved?.tabSwitchCount ?? 0);
  const [showCheatWarning, setShowCheatWarning] = useState<boolean>(false);
  const [showQuestionGridMobile, setShowQuestionGridMobile] = useState<boolean>(false);
  const [showRestoredNotice, setShowRestoredNotice] = useState<boolean>(() => !!initialSaved);

  const startTimeRef = useRef<string>(initialSaved?.startTime ?? new Date().toISOString());
  const lastViolationTimeRef = useRef<number>(0);
  const currentQuestion = displayQuestions[currentIndex] || displayQuestions[0];

  // Auto-save exam progress continuously to localStorage
  useEffect(() => {
    saveStoredExamProgress(exam.id, studentData.nisn, {
      examId: exam.id,
      studentNisn: studentData.nisn,
      studentData,
      displayQuestions,
      answersByQuestionId,
      displayAnswers,
      flaggedDisplayNumbers,
      timeLeftSeconds,
      tabSwitchCount,
      currentIndex,
      startTime: startTimeRef.current,
      lastSavedAt: new Date().toISOString(),
    });
  }, [
    exam.id,
    studentData,
    displayQuestions,
    answersByQuestionId,
    displayAnswers,
    flaggedDisplayNumbers,
    timeLeftSeconds,
    tabSwitchCount,
    currentIndex,
  ]);

  // Window beforeunload protection
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = 'Ujian sedang berlangsung!';
      return 'Ujian sedang berlangsung!';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // Timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const fsSupported = isFullscreenSupported();
  const isIOS = isIOSDevice();
  const [isFullscreen, setIsFullscreen] = useState<boolean>(() => 
    fsSupported ? isCurrentlyFullscreen() : true
  );

  const toggleFullscreen = () => {
    if (!fsSupported) return;
    if (!isCurrentlyFullscreen()) {
      requestAppFullscreen();
    } else {
      exitAppFullscreen();
    }
  };

  // Anti-cheat detector & Fullscreen enforcer
  useEffect(() => {
    if (fsSupported && !isCurrentlyFullscreen()) {
      requestAppFullscreen();
    }

    const playAlertSound = () => {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(587.33, ctx.currentTime);
          osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1);
          gain.gain.setValueAtTime(0.25, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.35);
        }
      } catch {}
    };

    const recordViolation = () => {
      const now = Date.now();
      if (now - lastViolationTimeRef.current < 1500) return;
      lastViolationTimeRef.current = now;
      setTabSwitchCount((prev) => prev + 1);
      setShowCheatWarning(true);
      playAlertSound();
    };

    const handleFullscreenChange = () => {
      if (!fsSupported) return;
      const isFs = isCurrentlyFullscreen();
      setIsFullscreen(isFs);
      if (!isFs) recordViolation();
    };

    const handleVisibilityChange = () => {
      if (document.hidden || document.visibilityState === 'hidden') recordViolation();
    };

    const handlePageHide = () => recordViolation();

    const handleWindowBlur = () => {
      if (isIOS) {
        if (document.hidden || document.visibilityState === 'hidden') recordViolation();
      } else {
        recordViolation();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key.toUpperCase()))) {
        e.preventDefault();
        recordViolation();
      }
    };

    const preventDefault = (e: Event) => e.preventDefault();

    if (fsSupported) {
      document.addEventListener('fullscreenchange', handleFullscreenChange);
      document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    }
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', handlePageHide);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('contextmenu', preventDefault);
    document.addEventListener('copy', preventDefault);
    document.addEventListener('cut', preventDefault);
    document.addEventListener('paste', preventDefault);

    return () => {
      if (fsSupported) {
        document.removeEventListener('fullscreenchange', handleFullscreenChange);
        document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', handlePageHide);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('contextmenu', preventDefault);
      document.removeEventListener('copy', preventDefault);
      document.removeEventListener('cut', preventDefault);
      document.removeEventListener('paste', preventDefault);
    };
  }, [fsSupported, isIOS]);

  const handleSelectOption = (opt: DisplayOption) => {
    const currentQ = displayQuestions[currentIndex];
    if (!currentQ) return;

    setAnswersByQuestionId((prev) => ({
      ...prev,
      [currentQ.originalQuestion.id]: opt.originalKey,
    }));

    setDisplayAnswers((prev) => ({
      ...prev,
      [currentQ.displayNumber]: opt.displayKey,
    }));
  };

  const toggleFlagCurrent = () => {
    const currentQ = displayQuestions[currentIndex];
    if (!currentQ) return;
    const dNum = currentQ.displayNumber;
    setFlaggedDisplayNumbers((prev) =>
      prev.includes(dNum) ? prev.filter((n) => n !== dNum) : [...prev, dNum]
    );
  };

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isLowTime = timeLeftSeconds < 300; // < 5 minutes

  const answeredCount = Object.keys(displayAnswers).length;
  const totalCount = displayQuestions.length;
  const unansweredCount = totalCount - answeredCount;
  const flaggedCount = flaggedDisplayNumbers.length;

  const calculateResults = (): StudentExamSubmission => {
    let totalScoreEarned = 0;
    let maxPossibleScore = 0;
    const answersDetail: StudentAnswerDetail[] = [];
    const finalAnswersMap: Record<number, OptionKey> = {};

    // Synchronize 100% with master questions (original number 1..50 & original answer key)
    exam.questions.forEach((origQ) => {
      const selectedOriginalKey = answersByQuestionId[origQ.id] || null;
      if (selectedOriginalKey) {
        finalAnswersMap[origQ.number] = selectedOriginalKey;
      }

      const qScores = origQ.optionScores;
      const maxInQuestion = Math.max(...(Object.values(qScores) as number[]));
      maxPossibleScore += maxInQuestion;

      let scoreEarned = 0;
      let isHighest = false;

      if (selectedOriginalKey && qScores[selectedOriginalKey] !== undefined) {
        scoreEarned = qScores[selectedOriginalKey];
        isHighest = scoreEarned === maxInQuestion;
      }

      totalScoreEarned += scoreEarned;

      answersDetail.push({
        questionNumber: origQ.number,
        questionId: origQ.id,
        selectedOption: selectedOriginalKey,
        scoreEarned,
        maxScore: maxInQuestion,
        isHighestScore: isHighest,
      });
    });

    const finalScoreScale100 =
      maxPossibleScore > 0
        ? Math.round((totalScoreEarned / maxPossibleScore) * 100 * 10) / 10
        : 0;

    const isPassed = finalScoreScale100 >= exam.passingGrade;
    const endTime = new Date().toISOString();
    const durationUsed = exam.durationMinutes * 60 - timeLeftSeconds;

    // Map flagged numbers back to original question numbers
    const flaggedOriginalNumbers = displayQuestions
      .filter((dq) => flaggedDisplayNumbers.includes(dq.displayNumber))
      .map((dq) => dq.originalQuestion.number);

    return {
      id: `sub-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      examId: exam.id,
      examTitle: exam.title,
      subject: exam.subject,
      studentName: studentData.name,
      studentNisn: studentData.nisn,
      studentClass: studentData.studentClass,
      startTime: startTimeRef.current,
      endTime,
      durationSecondsUsed: durationUsed,
      answers: finalAnswersMap,
      flaggedQuestions: flaggedOriginalNumbers,
      answersDetail,
      totalScoreEarned,
      maxPossibleScore,
      finalScoreScale100,
      isPassed,
      passingGrade: exam.passingGrade,
      tabSwitchCount,
      submittedAt: endTime,
      deviceInfo: `${navigator.userAgent.includes('Mobile') ? 'Mobile' : 'Desktop'} Browser`,
    };
  };

  const handleManualSubmit = () => {
    clearStoredExamProgress(exam.id, studentData.nisn);
    saveStoredActiveStudentSession(null);
    const submission = calculateResults();
    onSubmitExam(submission);
  };

  const handleAutoSubmit = () => {
    clearStoredExamProgress(exam.id, studentData.nisn);
    saveStoredActiveStudentSession(null);
    const submission = calculateResults();
    onSubmitExam(submission);
  };

  const getFontSizeClass = () => {
    if (fontSize === 'sm') return 'text-base sm:text-lg leading-relaxed';
    if (fontSize === 'lg') return 'text-xl sm:text-2xl leading-loose';
    return 'text-lg sm:text-xl leading-relaxed';
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-200">
      {/* Restored Session Notification Banner */}
      {showRestoredNotice && (
        <div className="bg-emerald-600 dark:bg-emerald-700 text-white px-4 py-2.5 text-xs font-semibold flex items-center justify-between z-30 shadow-xs animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-200 shrink-0" />
            <span>
              <strong>Sesi Pulih Otomatis:</strong> Jawaban & sisa waktu ujian Anda sebelumnya berhasil dimuat kembali secara utuh.
            </span>
          </div>
          <button
            onClick={() => setShowRestoredNotice(false)}
            className="text-white hover:text-emerald-100 p-1 rounded-lg text-xs cursor-pointer"
            title="Tutup Notifikasi"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top sticky exam bar */}
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md text-slate-900 dark:text-slate-100 px-4 sm:px-6 py-3 border-b border-slate-200/80 dark:border-slate-800 shadow-xs sticky top-0 z-30 flex flex-wrap items-center justify-between gap-3 transition-colors duration-200">
        <div className="flex items-center gap-3">
          <div className="bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-bold px-2.5 py-1 rounded-xl text-xs">
            CBT ROOM
          </div>
          <div>
            <h2 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white truncate max-w-[200px] sm:max-w-md">
              {exam.subject}
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-700 dark:text-slate-200">{studentData.name}</span>
              <span>&bull;</span>
              <span>{studentData.studentClass}</span>
            </div>
          </div>
        </div>

        {/* Center: Timer */}
        <div
          className={`flex items-center gap-2 px-4 py-1.5 rounded-2xl font-mono text-sm sm:text-base font-bold transition-all ${isLowTime
              ? 'bg-rose-600 text-white animate-pulse shadow-md'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-xs'
            }`}
        >
          <Clock className={`w-4 h-4 ${isLowTime ? 'text-white' : 'text-blue-600 dark:text-blue-400'}`} />
          <span>Sisa Waktu: {formatTimer(timeLeftSeconds)}</span>
        </div>

        {/* Right tools */}
        <div className="flex items-center gap-2">
          {/* Light / Dark Mode Toggle in Exam Room */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer shadow-xs"
            title={theme === 'dark' ? 'Beralih ke Mode Terang (Light Mode)' : 'Beralih ke Mode Gelap (Dark Mode)'}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </button>

          {/* Fullscreen toggle button */}
          <button
            onClick={toggleFullscreen}
            className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            title={isFullscreen ? 'Keluar Mode Layar Penuh' : 'Masuk Mode Layar Penuh (Fullscreen)'}
          >
            {isFullscreen ? (
              <Minimize2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            ) : (
              <Maximize2 className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
            )}
            <span className="hidden sm:inline font-semibold text-[11px]">
              {isFullscreen ? 'Keluar Fullscreen' : 'Fullscreen'}
            </span>
          </button>

          {/* Font size toggle */}
          <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-1 text-xs">
            <button
              onClick={() => setFontSize('sm')}
              className={`px-2 py-0.5 rounded-lg cursor-pointer transition-all ${fontSize === 'sm'
                  ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 font-bold shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              title="Ukuran Font Kecil"
            >
              A-
            </button>
            <button
              onClick={() => setFontSize('md')}
              className={`px-2 py-0.5 rounded-lg cursor-pointer transition-all ${fontSize === 'md'
                  ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 font-bold shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              title="Ukuran Font Normal"
            >
              A
            </button>
            <button
              onClick={() => setFontSize('lg')}
              className={`px-2 py-0.5 rounded-lg cursor-pointer transition-all ${fontSize === 'lg'
                  ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 font-bold shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              title="Ukuran Font Besar"
            >
              A+
            </button>
          </div>

          {/* Mobile Question Grid Toggle Button */}
          <button
            onClick={() => setShowQuestionGridMobile(!showQuestionGridMobile)}
            className="lg:hidden bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 shadow-xs"
          >
            <span>Daftar Soal</span>
            <span className="bg-blue-600 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
              {answeredCount}/{totalCount}
            </span>
          </button>
        </div>
      </div>

      {/* Persistent Fullscreen Enforcement Warning Bar (if exited) */}
      {!isFullscreen && (
        <div className="bg-rose-600 text-white px-4 py-2.5 text-xs font-semibold flex items-center justify-between z-20 sticky top-[57px] shadow-md animate-pulse">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-300 shrink-0" />
            <span>
              <strong>PERINGATAN:</strong> Mode Layar Penuh (Fullscreen) tidak aktif/terlepas! Anda wajib mengerjakan dalam layar penuh.
            </span>
          </div>
          <button
            onClick={enforceFullscreen}
            className="bg-white text-rose-700 hover:bg-rose-50 px-3.5 py-1 rounded-xl text-xs font-extrabold shrink-0 flex items-center gap-1.5 shadow-xs cursor-pointer transition-all"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Aktifkan Fullscreen</span>
          </button>
        </div>
      )}

      {/* Main Exam Area */}
      <div className="max-w-7xl mx-auto w-full p-4 sm:p-6 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Question Panel (Left - 8/12) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-200/90 dark:border-slate-800 min-h-[500px] flex flex-col justify-between transition-colors duration-200">
            <div>
              {/* Question Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
                <div className="flex items-center gap-2.5">
                  <span className="bg-blue-600 text-white font-bold text-xs sm:text-sm px-3 py-1 rounded-xl shadow-xs">
                    Soal No. {currentQuestion.displayNumber}
                  </span>
                  <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                    dari {totalCount} soal
                  </span>
                </div>

                {/* Anti-cheat status or multiple choice badge */}
                <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700 flex items-center gap-1.5">
                  <span>Pilihan Ganda (A - E)</span>
                  {(exam.shuffleQuestions || exam.shuffleOptions) && (
                    <span className="bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-bold px-1.5 py-0.2 rounded text-[10px]">
                      Acak
                    </span>
                  )}
                </div>
              </div>

              {/* Question Text */}
              <div className={`text-slate-900 dark:text-slate-100 font-medium ${getFontSizeClass()} mb-8 whitespace-pre-line select-none leading-relaxed`}>
                {currentQuestion.text}
              </div>

              {/* Options list */}
              <div className="space-y-3">
                {currentQuestion.options.map((opt) => {
                  const isSelected = displayAnswers[currentQuestion.displayNumber] === opt.displayKey;
                  return (
                    <button
                      key={opt.displayKey}
                      id={`option-btn-${opt.displayKey}`}
                      onClick={() => handleSelectOption(opt)}
                      className={`w-full text-left p-4 rounded-2xl border transition-all flex items-start gap-4 cursor-pointer group ${isSelected
                          ? 'border-blue-600 dark:border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 shadow-xs text-slate-900 dark:text-white ring-2 ring-blue-500/20'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50/80 dark:hover:bg-slate-800/80'
                        }`}
                    >
                      {/* Option Key Badge */}
                      <div
                        className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${isSelected
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover:bg-slate-200 dark:group-hover:bg-slate-700'
                          }`}
                      >
                        {opt.displayKey}
                      </div>

                      {/* Option text */}
                      <div className="flex-1 text-slate-800 dark:text-slate-200 text-base sm:text-lg font-normal pt-0.5 select-none leading-relaxed">
                        {opt.text}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom Action Controls */}
            <div className="pt-6 mt-8 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
              {/* Prev Button */}
              <button
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
                className={`px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm flex items-center gap-1.5 transition-all cursor-pointer ${currentIndex === 0
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed border border-slate-200 dark:border-slate-800'
                    : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-xs'
                  }`}
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Sebelumnya</span>
              </button>

              {/* Ragu-ragu Button */}
              <button
                id="doubt-flag-btn"
                onClick={toggleFlagCurrent}
                className={`px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm flex items-center gap-1.5 transition-all cursor-pointer ${flaggedDisplayNumbers.includes(currentQuestion.displayNumber)
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/80 hover:bg-amber-100 dark:hover:bg-amber-900/50'
                  }`}
              >
                <Flag className="w-4 h-4" />
                <span>
                  {flaggedDisplayNumbers.includes(currentQuestion.displayNumber) ? 'Ditandai Ragu-Ragu' : 'Ragu-Ragu'}
                </span>
              </button>

              {/* Next or Finish Button */}
              {currentIndex < totalCount - 1 ? (
                <button
                  onClick={() => setCurrentIndex((prev) => Math.min(totalCount - 1, prev + 1))}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Selanjutnya</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  id="finish-exam-btn"
                  onClick={() => setShowSubmitModal(true)}
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs sm:text-sm px-6 py-2.5 rounded-xl shadow-md hover:shadow-lg hover:shadow-emerald-500/20 flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Selesai & Kumpulkan</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Question Grid (Right - 4/12) */}
        <div
          className={`lg:col-span-4 bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-xs border border-slate-200/90 dark:border-slate-800 transition-colors duration-200 ${showQuestionGridMobile ? 'fixed inset-4 z-40 overflow-y-auto block bg-white dark:bg-slate-900' : 'hidden lg:block'
            }`}
        >
          {showQuestionGridMobile && (
            <div className="flex justify-between items-center pb-3 mb-3 border-b border-slate-100 dark:border-slate-800 lg:hidden">
              <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Nomor Soal</h3>
              <button
                onClick={() => setShowQuestionGridMobile(false)}
                className="p-1 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}

          <div className="flex items-center justify-between mb-4">
            <h3 className="font-extrabold text-slate-900 dark:text-white text-sm">Navigasi Soal</h3>
            <span className="text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/70 border border-blue-200/80 dark:border-blue-800/80 px-2.5 py-0.5 rounded-full">
              {answeredCount}/{totalCount} Terisi
            </span>
          </div>

          {/* Status legend */}
          <div className="grid grid-cols-3 gap-2 text-[11px] mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span className="text-slate-600 dark:text-slate-400">Terjawab</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span className="text-slate-600 dark:text-slate-400">Ragu-ragu</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700"></span>
              <span className="text-slate-600 dark:text-slate-400">Kosong</span>
            </div>
          </div>

          {/* Number Grid 1 to N */}
          <div className="grid grid-cols-5 gap-2 max-h-[380px] overflow-y-auto p-1">
            {displayQuestions.map((q, idx) => {
              const isAnswered = displayAnswers[q.displayNumber] !== undefined;
              const isFlagged = flaggedDisplayNumbers.includes(q.displayNumber);
              const isCurrent = idx === currentIndex;

              let btnBg = 'bg-slate-50 dark:bg-slate-800/70 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700/80';
              if (isFlagged) {
                btnBg = 'bg-amber-500 text-white font-bold border-amber-600 shadow-xs';
              } else if (isAnswered) {
                btnBg = 'bg-emerald-600 text-white font-bold border-emerald-700 shadow-xs';
              }

              return (
                <button
                  key={q.originalQuestion.id}
                  onClick={() => {
                    setCurrentIndex(idx);
                    if (showQuestionGridMobile) setShowQuestionGridMobile(false);
                  }}
                  className={`h-10 rounded-xl text-xs font-bold transition-all border flex flex-col items-center justify-center relative cursor-pointer ${btnBg} ${isCurrent ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-slate-900 scale-105 shadow-xs' : ''
                    }`}
                >
                  <span>{q.displayNumber}</span>
                  {isAnswered && (
                    <span className="text-[9px] font-mono opacity-90 leading-none">
                      {displayAnswers[q.displayNumber]}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Submit Big Button in Grid */}
          <div className="pt-5 mt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setShowSubmitModal(true)}
              className="w-full bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold py-3 px-4 rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer border border-slate-800 dark:border-slate-700"
            >
              <Send className="w-4 h-4 text-emerald-400" />
              <span>Konfirmasi Pengumpulan</span>
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Submit Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-4 border border-blue-100 dark:border-blue-900">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-center text-slate-900 dark:text-white mb-1">
              Konfirmasi Selesai Ujian
            </h3>
            <p className="text-xs text-center text-slate-500 dark:text-slate-400 mb-6">
              Apakah Anda yakin ingin mengakhiri dan mengumpulkan lembar jawaban ujian ini?
            </p>

            {/* Summary card */}
            <div className="bg-slate-50 dark:bg-slate-800/80 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 mb-6 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Total Soal:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{totalCount} Soal</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Sudah Dijawab:</span>
                <span className="font-bold text-emerald-700 dark:text-emerald-400">{answeredCount} Soal</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Belum Dijawab:</span>
                <span className={`font-bold ${unansweredCount > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-800 dark:text-slate-200'}`}>
                  {unansweredCount} Soal
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Status Ragu-Ragu:</span>
                <span className={`font-bold ${flaggedCount > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-800 dark:text-slate-200'}`}>
                  {flaggedCount} Soal
                </span>
              </div>
            </div>

            {unansweredCount > 0 && (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 rounded-2xl text-amber-800 dark:text-amber-300 text-xs mb-6 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <span>
                  Masih ada <strong>{unansweredCount} soal</strong> yang belum Anda jawab. Jawaban kosong bernilai 0 poin.
                </span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="w-full py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cek Kembali
              </button>
              <button
                id="confirm-final-submit-btn"
                onClick={handleManualSubmit}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
              >
                Ya, Kumpulkan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Anti-Cheat Alert Modal */}
      {showCheatWarning && (
        <div className="fixed inset-0 bg-slate-900/70 dark:bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-rose-200 dark:border-rose-900 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-4 border border-rose-100 dark:border-rose-900">
              <ShieldAlert className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-center text-slate-900 dark:text-white mb-1">
              Peringatan Sistem Pengawas
            </h3>
            <p className="text-xs text-center text-slate-500 dark:text-slate-400 mb-4">
              Sistem mendeteksi Anda meninggalkan jendela ujian (berpindah tab, membuka aplikasi lain, atau keluar dari Mode Layar Penuh/Fullscreen).
            </p>

            <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-2xl p-3.5 text-xs text-rose-900 dark:text-rose-200 mb-5 space-y-1.5">
              <p className="font-semibold text-rose-800 dark:text-rose-300 flex items-center justify-between">
                <span>Jumlah Pelanggaran:</span>
                <span className="bg-rose-600 text-white px-2 py-0.5 rounded-md font-bold text-xs">
                  {tabSwitchCount} Kali
                </span>
              </p>
              <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                Ujian mewajibkan tampilan <strong>Layar Penuh (Fullscreen)</strong>. Dilarang membuka tab browser lain, aplikasi lain, maupun klik di luar layar ujian. Seluruh pelanggaran terekam otomatis dan dilaporkan kepada proktor/guru pengawas.
              </p>
            </div>

            <button
              onClick={() => {
                setShowCheatWarning(false);
                enforceFullscreen();
              }}
              className="w-full py-3 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-sm cursor-pointer transition-colors flex items-center justify-center gap-2"
            >
              <Maximize2 className="w-4 h-4" />
              <span>Kembalikan Layar Penuh & Lanjutkan Ujian</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
