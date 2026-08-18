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
  Send,
  ShieldAlert,
  Type,
  User,
  X
} from 'lucide-react';
import { Exam, OptionKey, StudentAnswerDetail, StudentExamSubmission } from '../../types';

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
  // Generate randomized question & option list on mount if enabled in exam settings
  const [displayQuestions] = useState<DisplayQuestion[]>(() => {
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

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  // Map of originalQuestion.id -> selected original OptionKey (for accurate grading)
  const [answersByQuestionId, setAnswersByQuestionId] = useState<Record<string, OptionKey>>({});
  // Map of displayNumber -> displayKey ('A'..'E') (for visual display in current room)
  const [displayAnswers, setDisplayAnswers] = useState<Record<number, OptionKey>>({});
  // Array of displayNumber flagged as doubtful
  const [flaggedDisplayNumbers, setFlaggedDisplayNumbers] = useState<number[]>([]);

  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(exam.durationMinutes * 60);
  const [fontSize, setFontSize] = useState<'sm' | 'md' | 'lg'>('md');
  const [showSubmitModal, setShowSubmitModal] = useState<boolean>(false);
  const [tabSwitchCount, setTabSwitchCount] = useState<number>(0);
  const [showCheatWarning, setShowCheatWarning] = useState<boolean>(false);
  const [showQuestionGridMobile, setShowQuestionGridMobile] = useState<boolean>(false);

  const startTimeRef = useRef<string>(new Date().toISOString());
  const lastViolationTimeRef = useRef<number>(0);
  const currentQuestion = displayQuestions[currentIndex] || displayQuestions[0];

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

  // Anti-cheat detector: Accurately records exactly 1 violation per tab switch incident
  useEffect(() => {
    const recordViolation = () => {
      const now = Date.now();
      // Debounce: prevent duplicate trigger within 1.5 seconds from simultaneous browser events
      if (now - lastViolationTimeRef.current < 1500) {
        return;
      }
      lastViolationTimeRef.current = now;
      setTabSwitchCount((prev) => prev + 1);
      setShowCheatWarning(true);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        recordViolation();
      }
    };

    const handleWindowBlur = () => {
      if (document.hidden) {
        recordViolation();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, []);

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
    const submission = calculateResults();
    onSubmitExam(submission);
  };

  const handleAutoSubmit = () => {
    const submission = calculateResults();
    onSubmitExam(submission);
  };

  const getFontSizeClass = () => {
    if (fontSize === 'sm') return 'text-base sm:text-lg leading-relaxed';
    if (fontSize === 'lg') return 'text-xl sm:text-2xl leading-loose';
    return 'text-lg sm:text-xl leading-relaxed';
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top sticky exam bar */}
      <div className="bg-white text-slate-900 px-4 sm:px-6 py-3 border-b border-slate-200 shadow-xs sticky top-0 z-30 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="bg-blue-50 border border-blue-200 text-blue-700 font-bold px-2.5 py-1 rounded-lg text-xs">
            CBT ROOM
          </div>
          <div>
            <h2 className="font-bold text-sm sm:text-base text-slate-900 truncate max-w-[200px] sm:max-w-md">
              {exam.subject}
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="font-medium text-slate-700">{studentData.name}</span>
              <span>&bull;</span>
              <span>{studentData.studentClass}</span>
            </div>
          </div>
        </div>

        {/* Center: Timer */}
        <div
          className={`flex items-center gap-2 px-4 py-1.5 rounded-xl font-mono text-sm sm:text-base font-bold transition-colors ${
            isLowTime
              ? 'bg-rose-600 text-white animate-pulse shadow-xs'
              : 'bg-slate-100 text-slate-800 border border-slate-200'
          }`}
        >
          <Clock className={`w-4 h-4 ${isLowTime ? 'text-white' : 'text-slate-500'}`} />
          <span>Sisa Waktu: {formatTimer(timeLeftSeconds)}</span>
        </div>

        {/* Right tools */}
        <div className="flex items-center gap-2">
          {/* Font size toggle */}
          <div className="bg-slate-100 p-1 rounded-lg border border-slate-200 flex items-center gap-1 text-xs">
            <button
              onClick={() => setFontSize('sm')}
              className={`px-2 py-0.5 rounded cursor-pointer ${fontSize === 'sm' ? 'bg-white text-blue-700 font-bold shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
              title="Ukuran Font Kecil"
            >
              A-
            </button>
            <button
              onClick={() => setFontSize('md')}
              className={`px-2 py-0.5 rounded cursor-pointer ${fontSize === 'md' ? 'bg-white text-blue-700 font-bold shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
              title="Ukuran Font Normal"
            >
              A
            </button>
            <button
              onClick={() => setFontSize('lg')}
              className={`px-2 py-0.5 rounded cursor-pointer ${fontSize === 'lg' ? 'bg-white text-blue-700 font-bold shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
              title="Ukuran Font Besar"
            >
              A+
            </button>
          </div>

          {/* Mobile Question Grid Toggle Button */}
          <button
            onClick={() => setShowQuestionGridMobile(!showQuestionGridMobile)}
            className="lg:hidden bg-white hover:bg-slate-50 text-slate-800 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 flex items-center gap-1.5 shadow-xs"
          >
            <span>Daftar Soal</span>
            <span className="bg-blue-600 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
              {answeredCount}/{totalCount}
            </span>
          </button>
        </div>
      </div>

      {/* Main Exam Area */}
      <div className="max-w-7xl mx-auto w-full p-4 sm:p-6 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Question Panel (Left - 8/12) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-xs border border-slate-200 min-h-[500px] flex flex-col justify-between">
            <div>
              {/* Question Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
                <div className="flex items-center gap-2.5">
                  <span className="bg-blue-600 text-white font-bold text-xs sm:text-sm px-3 py-1 rounded-xl shadow-xs">
                    Soal No. {currentQuestion.displayNumber}
                  </span>
                  <span className="text-xs text-slate-400">
                    dari {totalCount} soal
                  </span>
                </div>

                {/* Anti-cheat status or multiple choice badge */}
                <div className="text-[11px] font-medium text-slate-500 bg-slate-50 px-3 py-1 rounded-full border border-slate-200 flex items-center gap-1.5">
                  <span>Pilihan Ganda (A - E)</span>
                  {(exam.shuffleQuestions || exam.shuffleOptions) && (
                    <span className="bg-purple-100 text-purple-700 font-bold px-1.5 py-0.2 rounded text-[10px]">
                      Acak
                    </span>
                  )}
                </div>
              </div>

              {/* Question Text */}
              <div className={`text-slate-900 font-medium ${getFontSizeClass()} mb-8 whitespace-pre-line select-none`}>
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
                      className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-4 cursor-pointer group ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/50 shadow-xs text-slate-900 ring-1 ring-blue-500/20'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'
                      }`}
                    >
                      {/* Option Key Badge */}
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                          isSelected
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
                        }`}
                      >
                        {opt.displayKey}
                      </div>

                      {/* Option text */}
                      <div className="flex-1 text-slate-800 text-base sm:text-lg font-normal pt-0.5 select-none leading-relaxed">
                        {opt.text}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom Action Controls */}
            <div className="pt-6 mt-8 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
              {/* Prev Button */}
              <button
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
                className={`px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm flex items-center gap-1.5 transition-all cursor-pointer ${
                  currentIndex === 0
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-xs'
                }`}
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Sebelumnya</span>
              </button>

              {/* Ragu-ragu Button */}
              <button
                id="doubt-flag-btn"
                onClick={toggleFlagCurrent}
                className={`px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm flex items-center gap-1.5 transition-all cursor-pointer ${
                  flaggedDisplayNumbers.includes(currentQuestion.displayNumber)
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
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
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm px-6 py-2.5 rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
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
          className={`lg:col-span-4 bg-white rounded-2xl p-5 shadow-xs border border-slate-200 ${
            showQuestionGridMobile ? 'fixed inset-4 z-40 overflow-y-auto block' : 'hidden lg:block'
          }`}
        >
          {showQuestionGridMobile && (
            <div className="flex justify-between items-center pb-3 mb-3 border-b border-slate-100 lg:hidden">
              <h3 className="font-bold text-slate-800 text-sm">Nomor Soal</h3>
              <button
                onClick={() => setShowQuestionGridMobile(false)}
                className="p-1 rounded-lg text-slate-500 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}

          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 text-sm">Navigasi Soal</h3>
            <span className="text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200/80 px-2 py-0.5 rounded-full">
              {answeredCount}/{totalCount} Terisi
            </span>
          </div>

          {/* Status legend */}
          <div className="grid grid-cols-3 gap-2 text-[11px] mb-4 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span className="text-slate-600">Terjawab</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span className="text-slate-600">Ragu-ragu</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span>
              <span className="text-slate-600">Kosong</span>
            </div>
          </div>

          {/* Number Grid 1 to N */}
          <div className="grid grid-cols-5 gap-2 max-h-[380px] overflow-y-auto p-1">
            {displayQuestions.map((q, idx) => {
              const isAnswered = displayAnswers[q.displayNumber] !== undefined;
              const isFlagged = flaggedDisplayNumbers.includes(q.displayNumber);
              const isCurrent = idx === currentIndex;

              let btnBg = 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200';
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
                  className={`h-10 rounded-xl text-xs font-bold transition-all border flex flex-col items-center justify-center relative cursor-pointer ${btnBg} ${
                    isCurrent ? 'ring-2 ring-blue-500 ring-offset-2 scale-105 shadow-xs' : ''
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
          <div className="pt-5 mt-4 border-t border-slate-100">
            <button
              onClick={() => setShowSubmitModal(true)}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 px-4 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
            >
              <Send className="w-4 h-4 text-emerald-400" />
              <span>Konfirmasi Pengumpulan</span>
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Submit Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4 border border-blue-100">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-center text-slate-900 mb-1">
              Konfirmasi Selesai Ujian
            </h3>
            <p className="text-xs text-center text-slate-500 mb-6">
              Apakah Anda yakin ingin mengakhiri dan mengumpulkan lembar jawaban ujian ini?
            </p>

            {/* Summary card */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 mb-6 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Total Soal:</span>
                <span className="font-bold text-slate-800">{totalCount} Soal</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Sudah Dijawab:</span>
                <span className="font-bold text-emerald-700">{answeredCount} Soal</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Belum Dijawab:</span>
                <span className={`font-bold ${unansweredCount > 0 ? 'text-rose-600' : 'text-slate-800'}`}>
                  {unansweredCount} Soal
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status Ragu-Ragu:</span>
                <span className={`font-bold ${flaggedCount > 0 ? 'text-amber-600' : 'text-slate-800'}`}>
                  {flaggedCount} Soal
                </span>
              </div>
            </div>

            {unansweredCount > 0 && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs mb-6 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  Masih ada <strong>{unansweredCount} soal</strong> yang belum Anda jawab. Jawaban kosong bernilai 0 poin.
                </span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="w-full py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cek Kembali
              </button>
              <button
                id="confirm-final-submit-btn"
                onClick={handleManualSubmit}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm transition-all cursor-pointer"
              >
                Ya, Kumpulkan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Anti-Cheat Alert Modal */}
      {showCheatWarning && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-rose-200">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-100">
              <ShieldAlert className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-center text-slate-900 mb-1">
              Peringatan Sistem Pengawas
            </h3>
            <p className="text-xs text-center text-slate-500 mb-4">
              Sistem mendeteksi Anda meninggalkan jendela atau berpindah tab ujian.
            </p>

            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3.5 text-xs text-rose-900 mb-5 space-y-1">
              <p className="font-semibold">
                Jumlah Pelanggaran Tercatat: <strong>{tabSwitchCount} kali</strong>
              </p>
              <p className="text-slate-600 text-[11px]">
                Aktivitas ini tercatat otomatis dan dilampirkan pada laporan hasil ujian yang dikirim ke guru pengampu.
              </p>
            </div>

            <button
              onClick={() => setShowCheatWarning(false)}
              className="w-full py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-xl shadow-sm cursor-pointer"
            >
              Saya Mengerti & Kembali ke Ujian
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
