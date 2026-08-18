export type OptionKey = 'A' | 'B' | 'C' | 'D' | 'E';

export interface OptionScoreMap {
  A: number;
  B: number;
  C: number;
  D: number;
  E: number;
}

export interface QuestionOption {
  key: OptionKey;
  text: string;
}

export interface Question {
  id: string;
  number: number;
  text: string;
  imageUrl?: string;
  options: QuestionOption[];
  optionScores: OptionScoreMap; // Weight per option e.g. { A: 10, B: 5, C: 4, D: 3, E: 2 }
  correctOption?: OptionKey; // Primary / highest weighted option
  explanation?: string;
  category?: string;
}

export interface Exam {
  id: string;
  title: string;
  subject: string;
  gradeClass: string;
  academicYear: string;
  durationMinutes: number;
  token: string;
  passingGrade: number; // KKM (e.g. 75)
  defaultOptionScores: OptionScoreMap; // Default weight applied when adding questions
  questions: Question[];
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  showInstantScore: boolean;
  showExplanationAfter: boolean;
  allowReview: boolean;
  maxCheatViolations: number;
  isActive: boolean;
  createdAt: string;
  teacherName: string;
}

export interface StudentAnswerDetail {
  questionNumber: number;
  questionId: string;
  selectedOption: OptionKey | null;
  scoreEarned: number;
  maxScore: number;
  isHighestScore: boolean;
}

export interface StudentExamSubmission {
  id: string;
  examId: string;
  examTitle: string;
  subject: string;
  studentName: string;
  studentNisn: string;
  studentClass: string;
  startTime: string;
  endTime: string;
  durationSecondsUsed: number;
  answers: Record<number, OptionKey>; // questionNumber -> selectedOption
  flaggedQuestions: number[]; // numbers marked as ragu-ragu
  answersDetail: StudentAnswerDetail[];
  totalScoreEarned: number;
  maxPossibleScore: number;
  finalScoreScale100: number;
  isPassed: boolean;
  passingGrade: number;
  tabSwitchCount: number;
  submittedAt: string;
  deviceInfo?: string;
}

export interface ExamStatistics {
  examId: string;
  totalSubmissions: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  passCount: number;
  failCount: number;
  passPercentage: number;
  gradeDistribution: {
    A: number; // >= 85
    B: number; // 75 - 84
    C: number; // 60 - 74
    D: number; // 50 - 59
    E: number; // < 50
  };
  itemAnalysis: {
    questionNumber: number;
    questionText: string;
    averageScore: number;
    maxPossible: number;
    difficultyRate: 'Mudah' | 'Sedang' | 'Sukar';
    optionDistribution: Record<OptionKey, number>;
  }[];
}

export type UserRole = 'student' | 'admin';

export interface AdminAccount {
  id: string;
  username: string;
  password: string;
  name: string;
  role: 'Administrator' | 'Guru Pengampu' | 'Proktor';
  email?: string;
  lastLogin?: string;
  createdAt?: string;
}

export interface RegisteredStudent {
  id: string;
  nisn: string;
  name: string;
  studentClass: string;
  password?: string; // Optional student login password / PIN (e.g. "123456" or custom)
  gender?: 'L' | 'P';
  isActive: boolean;
  notes?: string;
  createdAt?: string;
}

export interface FirebaseConfigState {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  isConfigured: boolean;
  useLocalStorageFallback: boolean;
}
