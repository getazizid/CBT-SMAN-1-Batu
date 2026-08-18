import { AdminAccount, Exam, OptionScoreMap, RegisteredStudent, StudentExamSubmission } from '../types';
import { MPK_OSIS_50_EXAM, REAL_STUDENTS_MPK_OSIS, REAL_SUBMISSIONS_MPK_OSIS } from '../data/mpkOsisExamData';

const STORAGE_KEYS = {
  EXAMS: 'cbt_sman1batu_exams',
  SUBMISSIONS: 'cbt_sman1batu_submissions',
  STUDENTS: 'cbt_sman1batu_students',
  ADMIN_ACCOUNTS: 'cbt_sman1batu_admin_accounts',
  CURRENT_ADMIN_SESSION: 'cbt_sman1batu_current_admin_session',
  ENFORCE_WHITELIST: 'cbt_sman1batu_enforce_whitelist',
  FIREBASE_CONFIG: 'cbt_sman1batu_firebase_config',
  ACTIVE_EXAM_ID: 'cbt_sman1batu_active_exam_id',
};

export const DEFAULT_OPTION_SCORES: OptionScoreMap = {
  A: 10,
  B: 8,
  C: 6,
  D: 4,
  E: 2,
};

// 1 Paket Ujian Utama: 50 Soal Asesmen MPK OSIS SMAN 1 Batu
export const INITIAL_EXAMS: Exam[] = [MPK_OSIS_50_EXAM];

// 5 Riwayat Nilai Siswa Real
export const INITIAL_SUBMISSIONS: StudentExamSubmission[] = REAL_SUBMISSIONS_MPK_OSIS;

// 5 Data Siswa Realistis Calon Pengurus MPK OSIS
export const INITIAL_STUDENTS: RegisteredStudent[] = REAL_STUDENTS_MPK_OSIS;

// 1 Akun Admin Utama Sistem
export const INITIAL_ADMIN_ACCOUNTS: AdminAccount[] = [
  {
    id: 'adm-001',
    username: 'admin',
    password: 'admin123',
    name: 'Administrator SMAN 1 Batu',
    role: 'Administrator',
    email: 'admin@sman1batu.sch.id',
    createdAt: new Date().toISOString(),
  },
];

export const getStoredExams = (): Exam[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.EXAMS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(INITIAL_EXAMS));
      return INITIAL_EXAMS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_EXAMS;
  }
};

export const saveStoredExams = (exams: Exam[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(exams));
  } catch (e) {
    console.error('Failed to save exams to localStorage', e);
  }
};

export const getStoredSubmissions = (): StudentExamSubmission[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SUBMISSIONS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(INITIAL_SUBMISSIONS));
      return INITIAL_SUBMISSIONS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_SUBMISSIONS;
  }
};

export const saveStoredSubmissions = (submissions: StudentExamSubmission[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(submissions));
  } catch (e) {
    console.error('Failed to save submissions to localStorage', e);
  }
};

export const addStudentSubmission = (submission: StudentExamSubmission): void => {
  const current = getStoredSubmissions();
  const updated = [submission, ...current];
  saveStoredSubmissions(updated);
};

export const getStoredStudents = (): RegisteredStudent[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STUDENTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(INITIAL_STUDENTS));
      return INITIAL_STUDENTS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_STUDENTS;
  }
};

export const saveStoredStudents = (students: RegisteredStudent[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
  } catch (e) {
    console.error('Failed to save students to localStorage', e);
  }
};

export const getStoredEnforceWhitelist = (): boolean => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ENFORCE_WHITELIST);
    if (raw === null) {
      localStorage.setItem(STORAGE_KEYS.ENFORCE_WHITELIST, 'true');
      return true;
    }
    return raw === 'true';
  } catch {
    return true;
  }
};

export const saveStoredEnforceWhitelist = (enforce: boolean): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.ENFORCE_WHITELIST, String(enforce));
  } catch (e) {
    console.error('Failed to save whitelist enforcement to localStorage', e);
  }
};

export const getStoredAdminAccounts = (): AdminAccount[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ADMIN_ACCOUNTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.ADMIN_ACCOUNTS, JSON.stringify(INITIAL_ADMIN_ACCOUNTS));
      return INITIAL_ADMIN_ACCOUNTS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_ADMIN_ACCOUNTS;
  }
};

export const saveStoredAdminAccounts = (accounts: AdminAccount[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.ADMIN_ACCOUNTS, JSON.stringify(accounts));
  } catch (e) {
    console.error('Failed to save admin accounts to localStorage', e);
  }
};

export const getCurrentAdminSession = (): AdminAccount | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_ADMIN_SESSION);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const saveCurrentAdminSession = (account: AdminAccount | null): void => {
  try {
    if (account) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_ADMIN_SESSION, JSON.stringify(account));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_ADMIN_SESSION);
    }
  } catch (e) {
    console.error('Failed to update admin session in localStorage', e);
  }
};

export const resetToInitialDemoData = (): {
  exams: Exam[];
  submissions: StudentExamSubmission[];
  students: RegisteredStudent[];
  adminAccounts: AdminAccount[];
} => {
  saveStoredExams(INITIAL_EXAMS);
  saveStoredSubmissions(INITIAL_SUBMISSIONS);
  saveStoredStudents(INITIAL_STUDENTS);
  saveStoredAdminAccounts(INITIAL_ADMIN_ACCOUNTS);
  saveStoredEnforceWhitelist(true);
  return {
    exams: INITIAL_EXAMS,
    submissions: INITIAL_SUBMISSIONS,
    students: INITIAL_STUDENTS,
    adminAccounts: INITIAL_ADMIN_ACCOUNTS,
  };
};
