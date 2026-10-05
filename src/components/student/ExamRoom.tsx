import React, { useState, useEffect, useRef } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  Flag,
  HelpCircle,
  Lock,
  Maximize2,
  Minimize2,
  Moon,
  Radio,
  Send,
  ShieldAlert,
  Smartphone,
  Sun,
  Type,
  User,
  X
} from 'lucide-react';
import { Exam, LiveStudentSession, OptionKey, Question, StudentAnswerDetail, StudentExamSubmission } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import {
  clearStoredExamProgress,
  getStoredExamProgress,
  saveStoredActiveStudentSession,
  saveStoredExamProgress,
} from '../../utils/storage';
import {
  exitAppFullscreen,
  getDeviceCategory,
  getDeviceInfoString,
  isAndroidDevice,
  isCurrentlyFullscreen,
  isFullscreenSupported,
  isIOSDevice,
  isIOSStandalone,
  requestAppFullscreen,
} from '../../utils/deviceHelper';
import { saveLiveSessionToFirestore } from '../../utils/firebaseService';


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
    if (
      initialSaved?.displayQuestions &&
      Array.isArray(initialSaved.displayQuestions) &&
      initialSaved.displayQuestions.length > 0
    ) {
      return initialSaved.displayQuestions;
    }

    const rawQuestions =
      exam && Array.isArray(exam.questions)
        ? exam.questions
        : [];

    let qList = [...rawQuestions];
    if (exam?.shuffleQuestions) {
      // Fisher-Yates shuffle
      for (let i = qList.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [qList[i], qList[j]] = [qList[j], qList[i]];
      }
    }

    const standardOptionKeys: OptionKey[] = ['A', 'B', 'C', 'D', 'E'];

    return qList.map((q, qIdx) => {
      let optList = Array.isArray(q.options) ? [...q.options] : [];
      if (exam?.shuffleOptions && optList.length > 0) {
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
          originalScore: q.optionScores?.[opt.key] ?? 0,
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
    return (exam?.durationMinutes || 60) * 60;
  });

  const [fontSize, setFontSize] = useState<'sm' | 'md' | 'lg'>('md');
  const [showSubmitModal, setShowSubmitModal] = useState<boolean>(false);
  const [tabSwitchCount, setTabSwitchCount] = useState<number>(() => initialSaved?.tabSwitchCount ?? 0);
  const [showCheatWarning, setShowCheatWarning] = useState<boolean>(false);
  const [lastViolationReason, setLastViolationReason] = useState<string>('');
  const [showQuestionGridMobile, setShowQuestionGridMobile] = useState<boolean>(false);
  const [showRestoredNotice, setShowRestoredNotice] = useState<boolean>(() => !!initialSaved);
  const [isScreenshotShieldActive, setIsScreenshotShieldActive] = useState<boolean>(false);

  const fsSupported = isFullscreenSupported();
  const isIOS = isIOSDevice();
  const isAndroid = isAndroidDevice();
  const [isFullscreen, setIsFullscreen] = useState<boolean>(() => 
    fsSupported ? isCurrentlyFullscreen() : true
  );
  // Initial entry gate: require student to tap Safe Mode confirmation on iPhone, Android & PC
  const [needsInitialFullscreen, setNeedsInitialFullscreen] = useState<boolean>(() => {
    if (initialSaved) {
      if (!isIOS && fsSupported && !isCurrentlyFullscreen()) return true;
      return false;
    }
    return true;
  });

  const startTimeRef = useRef<string>(initialSaved?.startTime ?? new Date().toISOString());
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Anti-cheat refs to prevent stale closure and double-counting
  const tabSwitchCountRef = useRef<number>(initialSaved?.tabSwitchCount ?? 0);
  const showCheatWarningRef = useRef<boolean>(false);
  const lastViolationReasonRef = useRef<string>('');
  const isBlurredRef = useRef<boolean>(false);
  const wasHiddenRef = useRef<boolean>(false);
  const lastViolationTimeRef = useRef<number>(0);
  const lastHeartbeatTimeRef = useRef<number>(Date.now());
  const handleAutoSubmitRef = useRef<() => void>(() => {});

  useEffect(() => {
    tabSwitchCountRef.current = tabSwitchCount;
  }, [tabSwitchCount]);

  useEffect(() => {
    showCheatWarningRef.current = showCheatWarning;
  }, [showCheatWarning]);

  useEffect(() => {
    lastViolationReasonRef.current = lastViolationReason;
  }, [lastViolationReason]);

  const currentQuestion = displayQuestions[currentIndex] || displayQuestions[0] || {
    displayNumber: 1,
    originalQuestion: { id: 'fallback', number: 1, text: '', options: [], optionScores: {} },
    text: 'Memuat data soal...',
    options: [],
  };

  // Compute live progress and score breakdown for instant proctor display
  const getLiveStats = () => {
    let answered = 0;
    let correct = 0;
    let incorrect = 0;
    let earned = 0;
    let max = 0;

    const masterQuestions =
      exam?.questions && Array.isArray(exam.questions)
        ? exam.questions
        : [];

    masterQuestions.forEach((q) => {
      const scores = q.optionScores || {};
      const maxScore = Math.max(...(Object.values(scores) as number[]), 0);
      max += maxScore;

      const selectedKey = answersByQuestionId[q.id];
      if (selectedKey) {
        answered++;
        const score = scores[selectedKey] ?? 0;
        earned += score;
        if (score === maxScore && maxScore > 0) {
          correct++;
        } else {
          incorrect++;
        }
      }
    });

    const scoreScale100 = max > 0 ? Math.round((earned / max) * 100 * 10) / 10 : 0;
    const total = masterQuestions.length || displayQuestions.length;

    return {
      answeredCount: answered,
      unansweredCount: total - answered,
      correctCount: correct,
      incorrectCount: incorrect,
      scoreEarned: earned,
      maxScore: max,
      scoreScale100,
      totalQuestions: total,
    };
  };

  // Sync state to Firebase Live Proctor collection (Safe for Free Tier Spark & Vercel)
  const syncLiveToFirebase = (
    statusOverride?: 'active' | 'warning_exit' | 'offline' | 'submitted',
    violationsOverride?: number,
    violationReason?: string
  ) => {
    const stats = getLiveStats();
    const currentStatus = statusOverride || (showCheatWarning ? 'warning_exit' : 'active');
    const vCount = violationsOverride !== undefined ? violationsOverride : tabSwitchCount;

    const liveSession: LiveStudentSession = {
      id: `${exam.id}_${studentData.nisn}`,
      examId: exam.id,
      examTitle: exam.title,
      studentNisn: studentData.nisn,
      studentName: studentData.name,
      studentClass: studentData.studentClass,
      status: currentStatus,
      violationCount: vCount,
      lastViolationAt: vCount > 0 ? new Date().toISOString() : undefined,
      lastViolationReason: violationReason || lastViolationReason,
      isFullscreen: !showCheatWarning && isCurrentlyFullscreen(),
      deviceType: getDeviceCategory(),
      deviceInfo: getDeviceInfoString(),
      currentQuestionIndex: currentIndex,
      currentQuestionNumber: currentIndex + 1,
      totalQuestions: stats.totalQuestions,
      answeredCount: stats.answeredCount,
      unansweredCount: stats.unansweredCount,
      flaggedCount: flaggedDisplayNumbers.length,
      correctCount: stats.correctCount,
      incorrectCount: stats.incorrectCount,
      scoreEarned: stats.scoreEarned,
      maxScore: stats.maxScore,
      scoreScale100: stats.scoreScale100,
      timeLeftSeconds,
      answers: answersByQuestionId,
      lastActiveAt: new Date().toISOString(),
      startedAt: startTimeRef.current,
    };

    saveLiveSessionToFirestore(liveSession);
  };

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

  // Debounced live sync to Firestore when answers or question position changes (2.5s debounce)
  useEffect(() => {
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }
    syncTimeoutRef.current = setTimeout(() => {
      syncLiveToFirebase();
    }, 2500);

    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [answersByQuestionId, currentIndex, flaggedDisplayNumbers]);

  // Keep-alive heartbeat every 30 seconds to update remaining time & online status
  useEffect(() => {
    // Initial sync
    syncLiveToFirebase();

    const interval = setInterval(() => {
      syncLiveToFirebase();
    }, 45000);

    return () => clearInterval(interval);
  }, []);

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

  // Exam countdown timer based on wall clock time (cannot cheat by pausing app or freezing background)
  useEffect(() => {
    const totalDurationSeconds = (exam?.durationMinutes || 60) * 60;
    const startMs = new Date(startTimeRef.current).getTime();

    const updateTimer = () => {
      const elapsedSeconds = Math.max(0, Math.floor((Date.now() - startMs) / 1000));
      const remaining = Math.max(0, totalDurationSeconds - elapsedSeconds);
      setTimeLeftSeconds(remaining);

      if (remaining <= 0) {
        handleAutoSubmitRef.current();
      }
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [exam?.durationMinutes]);

  // Setup iOS Fullscreen CSS & Viewport lock and anti-callout protection
  useEffect(() => {
    document.body.classList.add('cbt-exam-active');
    if (isIOS) {
      document.documentElement.classList.add('cbt-ios-fullscreen');
      window.scrollTo(0, 0);
    }
    return () => {
      document.body.classList.remove('cbt-exam-active');
      if (isIOS) {
        document.documentElement.classList.remove('cbt-ios-fullscreen');
      }
    };
  }, [isIOS]);

  // Auto-scroll to top smoothly whenever moving between questions (especially helpful on mobile / iPhone)
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentIndex]);

  const toggleFullscreen = () => {
    if (!fsSupported) return;
    if (!isCurrentlyFullscreen()) {
      requestAppFullscreen();
    } else {
      exitAppFullscreen();
    }
  };

  const enforceFullscreen = () => {
    if (!fsSupported) return;
    requestAppFullscreen();
  };

  // 1. Fast 200ms Watchdog Heartbeat Delta: Catches background freeze and throttled JavaScript
  useEffect(() => {
    if (needsInitialFullscreen) return;
    lastHeartbeatTimeRef.current = Date.now();

    const watchdogInterval = setInterval(() => {
      const now = Date.now();
      const delta = now - lastHeartbeatTimeRef.current;
      lastHeartbeatTimeRef.current = now;

      // In active browsing, delta is ~200ms. If delta > 650ms, the JS thread was frozen in background,
      // phone was locked, or student opened notification shade / chat!
      if (delta > 650) {
        const secondsAway = Math.round(delta / 100) / 10;
        const reason = isIOS
          ? `Membuka Chat / Notifikasi di iPhone (${secondsAway} detik di latar belakang)`
          : isAndroid
          ? `Membuka Chat / Notifikasi di Android (${secondsAway} detik di latar belakang)`
          : `Meninggalkan Ujian di Latar Belakang (${secondsAway} detik)`;
        recordViolation(reason);
      }
    }, 200);

    return () => clearInterval(watchdogInterval);
  }, [needsInitialFullscreen, isIOS, isAndroid]);

  // 2. Compositor requestAnimationFrame gap loop: Catches iOS Notification Center, Quick-Reply banner, Control Center
  useEffect(() => {
    if (needsInitialFullscreen) return;
    let lastRafTime = performance.now();
    let rafId: number;
    let isRunning = true;

    const checkRaf = (now: DOMHighResTimeStamp) => {
      if (!isRunning) return;
      const gap = now - lastRafTime;
      lastRafTime = now;

      // Normal 60fps frame is ~16.6ms. If gap > 450ms, iOS compositor was suspended by system overlay
      if (gap > 450) {
        const sec = Math.round(gap / 100) / 10;
        recordViolation(
          isIOS
            ? `Membuka Notifikasi / Pusat Kontrol / Balas Chat di iPhone (Terjeda ${sec}s)`
            : `Membuka Notifikasi / Balas Chat (Terjeda ${sec}s)`
        );
      }
      rafId = requestAnimationFrame(checkRaf);
    };

    rafId = requestAnimationFrame(checkRaf);
    return () => {
      isRunning = false;
      cancelAnimationFrame(rafId);
    };
  }, [needsInitialFullscreen, isIOS]);

  // 3. Fast 150ms document.hasFocus() checker: Catches active notification typing & sheet focus
  useEffect(() => {
    if (needsInitialFullscreen) return;
    let unfocusedTicks = 0;

    const focusInterval = setInterval(() => {
      if (typeof document !== 'undefined' && typeof document.hasFocus === 'function') {
        if (!document.hasFocus()) {
          unfocusedTicks++;
          if (unfocusedTicks >= 3) {
            recordViolation(
              isIOS
                ? 'Membuka Notifikasi / Pusat Kontrol / Balas Chat di iPhone'
                : isAndroid
                ? 'Membuka Notifikasi / Split-Screen / Balas Chat di Android'
                : 'Jendela Ujian Kehilangan Fokus (Window Blur)'
            );
          }
        } else {
          unfocusedTicks = 0;
        }
      }
    }, 150);

    return () => clearInterval(focusInterval);
  }, [needsInitialFullscreen, isIOS, isAndroid]);

  // 4. Background AudioContext Interruption Detector (Specialized for iOS Safari only)
  // When Notification Center, Control Center, or incoming call/banner interrupts iOS,
  // CoreAudio immediately suspends or interrupts the active AudioContext.
  useEffect(() => {
    if (needsInitialFullscreen || !isIOS) return;

    let audioCtx: AudioContext | null = null;
    let osc: OscillatorNode | null = null;

    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        audioCtx = new AudioCtxClass();
        if (audioCtx.state === 'suspended') {
          audioCtx.resume().catch(() => {});
        }

        const gainNode = audioCtx.createGain();
        gainNode.gain.value = 0.0001; // Inaudible
        osc = audioCtx.createOscillator();
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        osc.start();

        audioCtx.onstatechange = () => {
          if (audioCtx && (audioCtx.state === 'suspended' || (audioCtx.state as string) === 'interrupted')) {
            if (!showCheatWarningRef.current && !needsInitialFullscreen) {
              recordViolation(
                isIOS
                  ? 'Membuka Notifikasi / Pusat Kontrol di iPhone (Audio Interrupted)'
                  : 'Interupsi Sistem / Beralih Aplikasi'
              );
            }
          }
        };
      }
    } catch {
      // Ignore audio context errors on unsupported browsers
    }

    return () => {
      try {
        if (osc) osc.stop();
        if (audioCtx && audioCtx.state !== 'closed') {
          audioCtx.close().catch(() => {});
        }
      } catch {}
    };
  }, [needsInitialFullscreen, isIOS]);

  // Back navigation trap to prevent swiping back or back button
  useEffect(() => {
    window.history.pushState({ cbtLocked: true }, '', window.location.href);

    const handlePopState = () => {
      window.history.pushState({ cbtLocked: true }, '', window.location.href);
      if (!needsInitialFullscreen) {
        recordViolation('Mencoba Menekan Tombol Kembali (Back Navigation)');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [needsInitialFullscreen]);

  // Anti-cheat detector & Fullscreen enforcer (Multi-layer Mobile & Desktop Protection)
  const playAlertSound = () => {
    try {
      if (typeof window === 'undefined') return;
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        if (ctx.state === 'suspended') {
          ctx.resume().catch(() => {});
        }
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(650, now);
        osc.frequency.setValueAtTime(950, now + 0.12);
        osc.frequency.setValueAtTime(650, now + 0.24);
        osc.frequency.setValueAtTime(950, now + 0.36);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.55);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.55);
      }
    } catch {}
  };

  const recordViolation = (reason: string = 'Keluar Layar Penuh / Pindah Aplikasi') => {
    const now = Date.now();

    // If exam is already locked with the warning modal, don't increment duplicate count for same departure
    if (showCheatWarningRef.current) {
      return;
    }

    // Debounce rapid cascading events (e.g. blur + visibilitychange firing within 1500ms)
    if (now - lastViolationTimeRef.current < 1500) {
      return;
    }
    lastViolationTimeRef.current = now;

    const nextCount = tabSwitchCountRef.current + 1;
    tabSwitchCountRef.current = nextCount;
    setTabSwitchCount(nextCount);
    setLastViolationReason(reason);
    lastViolationReasonRef.current = reason;
    setShowCheatWarning(true);
    showCheatWarningRef.current = true;
    playAlertSound();

    // Send IMMEDIATE live notification to Proktor Admin
    syncLiveToFirebase('warning_exit', nextCount, reason);

    // Immediate save to localStorage to persist count across any potential reload
    saveStoredExamProgress(exam.id, studentData.nisn, {
      examId: exam.id,
      studentNisn: studentData.nisn,
      studentData,
      displayQuestions,
      answersByQuestionId,
      displayAnswers,
      flaggedDisplayNumbers,
      timeLeftSeconds,
      tabSwitchCount: nextCount,
      currentIndex,
      startTime: startTimeRef.current,
      lastSavedAt: new Date().toISOString(),
    });
  };

  useEffect(() => {
    if (needsInitialFullscreen) return;

    // 1. Window Blur: Fired when notification center, control center, floating app, or chat is opened
    const handleWindowBlur = (e?: Event) => {
      // Ignore if event target is an internal DOM element (e.g. clicking buttons, options, radio buttons)
      if (e && e.target && e.target !== window && e.target !== document) {
        return;
      }
      // Double-check if document actually still has focus
      if (typeof document !== 'undefined' && typeof document.hasFocus === 'function') {
        if (document.hasFocus()) {
          return;
        }
      }
      isBlurredRef.current = true;
      const reason = isIOS
        ? 'Membuka Notifikasi / Pusat Kontrol / Balas Chat di iPhone'
        : isAndroid
        ? 'Membuka Notifikasi / Split-Screen / Balas Chat di Android'
        : 'Jendela Ujian Kehilangan Fokus (Window Blur)';
      recordViolation(reason);
    };

    // 2. Window Focus: Fired when student returns from notification / chat / other app
    const handleWindowFocus = () => {
      const wasBlurred = isBlurredRef.current;
      isBlurredRef.current = false;
      if (wasBlurred && !showCheatWarningRef.current) {
        const reason = isIOS
          ? 'Kembali ke Ujian Setelah Membuka Notifikasi / Chat di iPhone'
          : isAndroid
          ? 'Kembali ke Ujian Setelah Membuka Notifikasi / Chat di Android'
          : 'Kembali ke Halaman Ujian Setelah Kehilangan Fokus';
        recordViolation(reason);
      }
    };

    // 3. Document Visibility Change: Fired when switching tabs or backgrounding
    const handleVisibilityChange = () => {
      if (document.hidden || document.visibilityState === 'hidden') {
        wasHiddenRef.current = true;
        const reason = isIOS
          ? 'Meninggalkan Halaman Ujian / Pindah Aplikasi di iPhone'
          : isAndroid
          ? 'Meninggalkan Halaman Ujian / Membuka Aplikasi Lain di Android'
          : 'Berpindah Tab / Membuka Aplikasi Lain';
        recordViolation(reason);
      } else if (document.visibilityState === 'visible') {
        const wasHidden = wasHiddenRef.current;
        wasHiddenRef.current = false;
        if (wasHidden && !showCheatWarningRef.current) {
          const reason = isIOS
            ? 'Kembali ke Ujian Setelah Membuka Aplikasi Lain / Chat di iPhone'
            : 'Kembali ke Halaman Ujian Setelah Berpindah Tab / Aplikasi';
          recordViolation(reason);
        }
      }
    };

    // 4. Page Hide / Page Show: Mobile Safari / Chrome lifecycle events (bfcache)
    const handlePageHide = () => {
      wasHiddenRef.current = true;
      recordViolation('Meninggalkan Halaman Ujian (Page Hide)');
    };

    const handlePageShow = (e: PageTransitionEvent) => {
      if (e.persisted || wasHiddenRef.current || isBlurredRef.current) {
        wasHiddenRef.current = false;
        isBlurredRef.current = false;
        if (!showCheatWarningRef.current) {
          recordViolation('Kembali ke Halaman Ujian (Page Show / Unfreeze)');
        }
      }
    };

    // 5. Fullscreen Change (Android & PC)
    const handleFullscreenChange = () => {
      if (!fsSupported) return;
      const isFs = isCurrentlyFullscreen();
      setIsFullscreen(isFs);
      if (!isFs && !needsInitialFullscreen) {
        recordViolation(
          isAndroid
            ? 'Keluar dari Mode Layar Penuh di Android (Status Bar / Navigasi / Split-Screen)'
            : 'Keluar dari Mode Layar Penuh (Fullscreen)'
        );
      }
    };

    // 6. Split-Screen / Resize detection for Android
    const handleResize = () => {
      if (isAndroid) {
        const isPortrait = window.innerHeight > window.innerWidth;
        const heightRatio = window.innerHeight / screen.height;
        if (isPortrait && heightRatio < 0.65) {
          recordViolation('Terdeteksi Menggunakan Mode Split-Screen / Layar Belah di Android');
        }
      }
    };

    // 7. Screenshot shortcuts & Developer tools & System Keyboard Shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key.toUpperCase()))) {
        e.preventDefault();
        recordViolation('Mencoba Membuka Developer Tools Browser');
        return;
      }

      // Screenshot shortcuts: PrintScreen, Ctrl+P, Win+Shift+S, Cmd+Shift+3/4/5
      const isPrintScreen = e.key === 'PrintScreen';
      const isPrintKey = e.ctrlKey && e.key.toLowerCase() === 'p';
      const isMacScreenshot = e.metaKey && e.shiftKey && ['3', '4', '5'].includes(e.key);
      const isWindowsSnip = (e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 's';

      if (isPrintScreen || isPrintKey || isMacScreenshot || isWindowsSnip) {
        e.preventDefault();
        e.stopPropagation();
        setIsScreenshotShieldActive(true);
        setTimeout(() => setIsScreenshotShieldActive(false), 2500);
        recordViolation('Mencoba Mengambil Tangkapan Layar (Screenshot) / Cetak');
        return;
      }

      if (e.altKey || e.metaKey) {
        recordViolation('Mencoba Menekan Tombol Sistem (Alt / Cmd / Windows)');
        return;
      }
      if (e.ctrlKey && ['t', 'n', 'w', 'r'].includes(e.key.toLowerCase())) {
        e.preventDefault();
        recordViolation('Mencoba Pintasan Browser (Tab / Refresh)');
        return;
      }
    };

    // 8. Prevent context menu, copy, cut, paste, text drag
    const preventDefault = (e: Event) => e.preventDefault();

    if (fsSupported) {
      document.addEventListener('fullscreenchange', handleFullscreenChange);
      document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    }
    // Standard window blur & focus without capture phase (avoids child button blur false positives)
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', handlePageHide);
    window.addEventListener('pageshow', handlePageShow);
    window.addEventListener('resize', handleResize);
    window.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('contextmenu', preventDefault);
    document.addEventListener('copy', preventDefault);
    document.addEventListener('cut', preventDefault);
    document.addEventListener('paste', preventDefault);
    document.addEventListener('selectstart', preventDefault);

    return () => {
      if (fsSupported) {
        document.removeEventListener('fullscreenchange', handleFullscreenChange);
        document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      }
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', handlePageHide);
      window.removeEventListener('pageshow', handlePageShow);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('contextmenu', preventDefault);
      document.removeEventListener('copy', preventDefault);
      document.removeEventListener('cut', preventDefault);
      document.removeEventListener('paste', preventDefault);
      document.removeEventListener('selectstart', preventDefault);
    };
  }, [fsSupported, isIOS, isAndroid, needsInitialFullscreen]);


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
  const isEarlyExitBlocked = (exam.blockEarlyExit ?? false) && timeLeftSeconds > 0;

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
    const masterQuestions =
      exam && Array.isArray(exam.questions)
        ? exam.questions
        : [];

    const isWeighted = exam.useWeightedScoring !== false;

    masterQuestions.forEach((origQ) => {
      const selectedOriginalKey = answersByQuestionId[origQ.id] || null;
      if (selectedOriginalKey) {
        finalAnswersMap[origQ.number] = selectedOriginalKey;
      }

      let scoreEarned = 0;
      let maxInQuestion = 10;
      let isHighest = false;

      if (isWeighted) {
        const qScores = origQ.optionScores || {};
        maxInQuestion = Math.max(...(Object.values(qScores) as number[]), 0) || 10;
        if (selectedOriginalKey && qScores[selectedOriginalKey] !== undefined) {
          scoreEarned = qScores[selectedOriginalKey];
          isHighest = scoreEarned === maxInQuestion;
        }
      } else {
        // Mode Standar 1 Jawaban Benar (Bobot Nonaktif)
        const correctKey = origQ.correctOption || 'A';
        maxInQuestion = 10;
        if (selectedOriginalKey && selectedOriginalKey === correctKey) {
          scoreEarned = maxInQuestion;
          isHighest = true;
        } else {
          scoreEarned = 0;
          isHighest = false;
        }
      }

      maxPossibleScore += maxInQuestion;
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
    if (isEarlyExitBlocked) {
      alert(`Waktu pengerjaan belum selesai! Anda baru dapat mengumpulkan ujian setelah waktu habis (${formatTimer(timeLeftSeconds)}).`);
      return;
    }
    syncLiveToFirebase('submitted');
    clearStoredExamProgress(exam.id, studentData.nisn);
    saveStoredActiveStudentSession(null);
    const submission = calculateResults();
    onSubmitExam(submission);
  };

  const handleAutoSubmit = () => {
    syncLiveToFirebase('submitted');
    clearStoredExamProgress(exam.id, studentData.nisn);
    saveStoredActiveStudentSession(null);
    const submission = calculateResults();
    onSubmitExam(submission);
  };
  handleAutoSubmitRef.current = handleAutoSubmit;

  const getFontSizeClass = () => {
    if (fontSize === 'sm') return 'text-base sm:text-lg leading-relaxed';
    if (fontSize === 'lg') return 'text-xl sm:text-2xl leading-loose';
    return 'text-lg sm:text-xl leading-relaxed';
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-200 relative select-none">
      {/* Blackout Screenshot Shield (Instant Pitch-Black Blanking upon Screenshot Attempt) */}
      {isScreenshotShieldActive && (
        <div className="fixed inset-0 bg-black z-[9999] flex flex-col items-center justify-center text-white p-6 text-center select-none pointer-events-none animate-in fade-in duration-75">
          <ShieldAlert className="w-16 h-16 text-rose-500 mb-4 animate-bounce" />
          <h2 className="text-xl font-black text-rose-400 mb-2 uppercase tracking-wider">
            Tangkapan Layar Diblokir Sistem CBT
          </h2>
          <p className="text-xs text-slate-300 max-w-sm leading-relaxed">
            Dilarang mengambil tangkapan layar (screenshot) selama ujian berlangsung. Aktivitas ini tercatat otomatis dan dilaporkan secara realtime ke Proktor.
          </p>
        </div>
      )}

      {/* Quizizz Pro Safe Exam Fullscreen Entry Gate for Android, iPhone & PC */}
      {needsInitialFullscreen && (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-blue-500/30 text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-4 border border-blue-200 dark:border-blue-800 shadow-inner">
              <Lock className="w-8 h-8" />
            </div>
            <span className="px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300">
              {isIOS ? 'iPhone / iOS Safe Mode' : isAndroid ? 'Android Safe Exam Mode' : 'Quizizz Pro Safe Mode'}
            </span>
            <h3 className="text-xl font-black text-slate-900 dark:text-white mt-3 mb-2">
              {isIOS ? 'Kunci Mode Ujian Aman iPhone' : 'Kunci Layar Penuh (Fullscreen)'}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
              {isIOS
                ? 'Sistem CBT mewajibkan mode Ujian Aman Terkunci pada iPhone / iPad. Segala bentuk perpindahan aplikasi, membuka notifikasi, atau membalas chat otomatis tercatat sebagai pelanggaran dan dilaporkan langsung secara realtime ke pengawas.'
                : 'Sistem CBT mewajibkan mode Layar Penuh Terkunci. Berpindah tab, membuka notifikasi/chat, split-screen, atau keluar dari layar penuh akan otomatis tercatat sebagai pelanggaran dan dilaporkan langsung secara realtime ke pengawas.'}
            </p>
            <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-xl p-3 text-left text-[11px] text-rose-800 dark:text-rose-300 mb-6 space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-rose-900 dark:text-rose-200">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>Peringatan Ketat Anti-Kecurangan:</span>
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-slate-700 dark:text-slate-300 text-[10.5px]">
                <li>Dilarang menarik Notifikasi / Control Center.</li>
                <li>Dilarang membalas chat (WA, Telegram, dll).</li>
                <li>Dilarang beralih aplikasi atau menggunakan split-screen.</li>
              </ul>
            </div>
            <button
              onClick={async () => {
                if (isIOS) {
                  document.documentElement.classList.add('cbt-ios-fullscreen');
                  window.scrollTo(0, 0);
                } else {
                  await requestAppFullscreen();
                  setIsFullscreen(true);
                }
                // Pre-warm AudioContext on user interaction
                try {
                  const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
                  if (AudioCtx) {
                    const ctx = new AudioCtx();
                    if (ctx.state === 'suspended') {
                      ctx.resume().catch(() => {});
                    }
                  }
                } catch {}
                setNeedsInitialFullscreen(false);
                lastHeartbeatTimeRef.current = Date.now();
                lastViolationTimeRef.current = Date.now();
                syncLiveToFirebase('active', tabSwitchCount);
              }}
              className="w-full py-3.5 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <Maximize2 className="w-5 h-5" />
              <span>{isIOS ? 'Aktifkan Mode Ujian & Mulai' : 'Aktifkan Layar Penuh & Mulai'}</span>
            </button>
          </div>
        </div>
      )}

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
          <div className="bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-bold px-2.5 py-1 rounded-xl text-xs flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
            <span>CBT ROOM</span>
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
      <div className="max-w-7xl mx-auto w-full p-4 sm:p-6 pb-28 sm:pb-8 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Question Panel (Left - 8/12) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-200/90 dark:border-slate-800 min-h-[500px] flex flex-col justify-between transition-colors duration-200 relative overflow-hidden">
            {/* Dynamic Student Security Watermark (Anti-Leak / Anti-Record Identity Stamping) */}
            <div className="absolute inset-0 pointer-events-none select-none overflow-hidden opacity-[0.03] dark:opacity-[0.05] flex flex-col justify-around rotate-[-12deg] z-0">
              <div className="whitespace-nowrap text-[11px] font-mono font-bold tracking-widest text-slate-900 dark:text-white">
                {studentData.nisn} &bull; {studentData.name} &bull; CBT SMAN 1 BATU &bull; {studentData.nisn} &bull; {studentData.name}
              </div>
              <div className="whitespace-nowrap text-[11px] font-mono font-bold tracking-widest text-slate-900 dark:text-white">
                CBT SMAN 1 BATU &bull; {studentData.nisn} &bull; {studentData.name} &bull; {studentData.studentClass}
              </div>
              <div className="whitespace-nowrap text-[11px] font-mono font-bold tracking-widest text-slate-900 dark:text-white">
                {studentData.name} &bull; {studentData.nisn} &bull; CBT SMAN 1 BATU &bull; {studentData.studentClass}
              </div>
            </div>

            <div className="relative z-10">
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
                      className={`w-full text-left p-4 rounded-2xl border transition-all flex items-start gap-4 cursor-pointer group touch-manipulation ${isSelected
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
                  className={`font-semibold text-xs sm:text-sm px-6 py-2.5 rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors ${
                    isEarlyExitBlocked
                      ? 'bg-amber-600 hover:bg-amber-700 text-white'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}
                >
                  {isEarlyExitBlocked ? <Lock className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                  <span>
                    {isEarlyExitBlocked
                      ? `Terkunci (${formatTimer(timeLeftSeconds)})`
                      : 'Selesai & Kumpulkan'}
                  </span>
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
              {isEarlyExitBlocked ? (
                <Lock className="w-4 h-4 text-amber-400" />
              ) : (
                <Send className="w-4 h-4 text-emerald-400" />
              )}
              <span>
                {isEarlyExitBlocked
                  ? `Pengumpulan Terkunci (${formatTimer(timeLeftSeconds)})`
                  : 'Konfirmasi Pengumpulan'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Submit Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
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

            {isEarlyExitBlocked && (
              <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/80 rounded-2xl text-amber-900 dark:text-amber-200 text-xs mb-5 flex items-start gap-2.5">
                <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Ujian Terkunci Sampai Waktu Selesai</p>
                  <p className="text-[11px] mt-0.5 text-amber-800 dark:text-amber-300">
                    Sesuai aturan pengawas, Anda tidak dapat mengumpulkan ujian sebelum waktu habis. Sisa waktu pengerjaan: <strong className="font-mono font-bold">{formatTimer(timeLeftSeconds)}</strong>. Jawaban Anda otomatis dikumpulkan saat waktu habis.
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="w-full py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cek Kembali
              </button>
              {isEarlyExitBlocked ? (
                <button
                  disabled
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 font-semibold text-xs cursor-not-allowed flex items-center justify-center gap-1.5"
                  title="Pengumpulan ujian terkunci sampai waktu habis"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Terkunci ({formatTimer(timeLeftSeconds)})</span>
                </button>
              ) : (
                <button
                  id="confirm-final-submit-btn"
                  onClick={handleManualSubmit}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
                >
                  Ya, Kumpulkan
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Anti-Cheat Alert Modal */}
      {showCheatWarning && (
        <div className="fixed inset-0 bg-slate-900/80 dark:bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-rose-500/40 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-4 border border-rose-200 dark:border-rose-900/80 shadow-inner">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <h3 className="text-xl font-black text-center text-slate-900 dark:text-white mb-2">
              UJIAN TERKUNCI - PELANGGARAN TERDETEKSI
            </h3>

            <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/80 rounded-2xl p-4 text-xs text-rose-900 dark:text-rose-200 mb-5 space-y-2.5">
              <div className="flex items-center justify-between pb-2 border-b border-rose-200 dark:border-rose-900">
                <span className="font-semibold text-rose-800 dark:text-rose-300">Total Pelanggaran:</span>
                <span className="bg-rose-600 text-white px-2.5 py-0.5 rounded-lg font-black text-xs shadow-xs">
                  {tabSwitchCount} Kali
                </span>
              </div>
              <div>
                <span className="font-semibold text-rose-800 dark:text-rose-300 block mb-1">Penyebab Pelanggaran:</span>
                <p className="font-bold text-rose-700 dark:text-rose-300 text-xs bg-white dark:bg-slate-800/80 p-2.5 rounded-xl border border-rose-200 dark:border-rose-900/60 leading-relaxed">
                  {lastViolationReason || 'Meninggalkan jendela ujian atau berpindah aplikasi'}
                </p>
              </div>
              <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed pt-1">
                🔴 <strong>Terkirim Realtime:</strong> Laporan pelanggaran ini telah langsung dilaporkan ke Proktor/Guru Pengawas. Seluruh soal dikunci sampai Anda membuka kunci di bawah.
              </p>
            </div>

            <button
              onClick={async () => {
                setShowCheatWarning(false);
                showCheatWarningRef.current = false;
                isBlurredRef.current = false;
                wasHiddenRef.current = false;
                lastHeartbeatTimeRef.current = Date.now();
                lastViolationTimeRef.current = Date.now();
                if (isIOS) {
                  document.documentElement.classList.add('cbt-ios-fullscreen');
                  window.scrollTo(0, 0);
                } else {
                  await requestAppFullscreen();
                  setIsFullscreen(true);
                }
                syncLiveToFirebase('active', tabSwitchCountRef.current);
              }}
              className="w-full py-3.5 px-4 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-lg shadow-rose-600/30 cursor-pointer transition-colors flex items-center justify-center gap-2 active:scale-98"
            >
              <Maximize2 className="w-4 h-4" />
              <span>Buka Kunci Ujian & Lanjutkan Mengerjakan</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
