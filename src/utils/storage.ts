import { AdminAccount, Exam, OptionScoreMap, RegisteredStudent, StudentExamSubmission } from '../types';
import { MPK_OSIS_50_EXAM, REAL_STUDENTS_MPK_OSIS, REAL_SUBMISSIONS_MPK_OSIS } from '../data/mpkOsisExamData';
import { CT_INFORMATIKA_30_EXAM, STUDENTS_KELAS_X } from '../data/ctInformatikaExamData';

const STORAGE_KEYS = {
  EXAMS: 'cbt_sman1batu_exams',
  EXAMS_BACKUP: 'cbt_sman1batu_exams_backup',
  SUBMISSIONS: 'cbt_sman1batu_submissions',
  STUDENTS: 'cbt_sman1batu_students',
  ADMIN_ACCOUNTS: 'cbt_sman1batu_admin_accounts',
  CURRENT_ADMIN_SESSION: 'cbt_sman1batu_current_admin_session',
  ENFORCE_WHITELIST: 'cbt_sman1batu_enforce_whitelist',
  FIREBASE_CONFIG: 'cbt_sman1batu_firebase_config',
  ACTIVE_EXAM_ID: 'cbt_sman1batu_active_exam_id',
  DELETED_SUBMISSION_IDS: 'cbt_sman1batu_deleted_sub_ids',
  RESET_STUDENT_ATTEMPTS: 'cbt_sman1batu_reset_student_attempts',
  ADMIN_ACTIVE_TAB: 'cbt_sman1batu_admin_active_tab',
  ACTIVE_ROLE: 'cbt_sman1batu_active_role',
};

export const DEFAULT_OPTION_SCORES: OptionScoreMap = {
  A: 10,
  B: 8,
  C: 6,
  D: 4,
  E: 2,
};

// Paket Ujian Utama: CT Informatika Kelas X (30 Soal HOTS) & Asesmen MPK OSIS (50 Soal)
export const INITIAL_EXAMS: Exam[] = [CT_INFORMATIKA_30_EXAM, MPK_OSIS_50_EXAM];

// 5 Riwayat Nilai Siswa Real
export const INITIAL_SUBMISSIONS: StudentExamSubmission[] = REAL_SUBMISSIONS_MPK_OSIS;

// Data Siswa: Perwakilan Kelas X-1 s/d X-5 & Calon Pengurus MPK OSIS
export const INITIAL_STUDENTS: RegisteredStudent[] = [
  ...STUDENTS_KELAS_X,
  ...REAL_STUDENTS_MPK_OSIS,
];

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
    if (raw === null) {
      localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(INITIAL_EXAMS));
      localStorage.setItem(STORAGE_KEYS.EXAMS_BACKUP, JSON.stringify(INITIAL_EXAMS));
      return INITIAL_EXAMS;
    }
    const parsed: Exam[] = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Hapus duplikat paket lama (CTBATU / exam-ct-informatika-30) jika ada
    return parsed.filter((e) => e.id !== 'exam-ct-informatika-30' && e.token !== 'CTBATU');
  } catch {
    return [];
  }
};

export const saveStoredExams = (exams: Exam[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(exams));
    if (Array.isArray(exams) && exams.length > 0) {
      localStorage.setItem(STORAGE_KEYS.EXAMS_BACKUP, JSON.stringify(exams));
    }
  } catch (e) {
    console.error('Failed to save exams to localStorage', e);
  }
};

export const restoreExamsFromLocalStorage = (): Exam[] => {
  try {
    const backupRaw = localStorage.getItem(STORAGE_KEYS.EXAMS_BACKUP);
    if (backupRaw) {
      const parsed: Exam[] = JSON.parse(backupRaw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        localStorage.setItem(STORAGE_KEYS.EXAMS, backupRaw);
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to restore exams from localStorage backup', e);
  }
  localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(INITIAL_EXAMS));
  return INITIAL_EXAMS;
};

if (typeof window !== 'undefined') {
  (window as any).restoreExamsFromLocalStorage = restoreExamsFromLocalStorage;
}

export const getStoredDeletedSubmissionIds = (): string[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DELETED_SUBMISSION_IDS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const saveStoredDeletedSubmissionIds = (ids: string[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.DELETED_SUBMISSION_IDS, JSON.stringify(Array.from(new Set(ids))));
  } catch (e) {
    console.error('Failed to save deleted submission ids to localStorage', e);
  }
};

export const addStoredDeletedSubmissionId = (id: string): void => {
  if (!id) return;
  const current = getStoredDeletedSubmissionIds();
  if (!current.includes(id)) {
    saveStoredDeletedSubmissionIds([...current, id]);
  }
};

export const getStoredResetStudentAttempts = (): Record<string, string> => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RESET_STUDENT_ATTEMPTS);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
};

export const saveStoredResetStudentAttempts = (attempts: Record<string, string>): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.RESET_STUDENT_ATTEMPTS, JSON.stringify(attempts));
  } catch (e) {
    console.error('Failed to save reset student attempts to localStorage', e);
  }
};

export const getStoredSubmissions = (): StudentExamSubmission[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SUBMISSIONS);
    const deletedIdSet = new Set(getStoredDeletedSubmissionIds());
    const resetAttempts = getStoredResetStudentAttempts();

    if (raw === null) {
      const filteredInitials = INITIAL_SUBMISSIONS.filter((s) => !deletedIdSet.has(s.id));
      localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(filteredInitials));
      return filteredInitials;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    // Filter out submissions that have been deleted or reset by admin
    const cleaned = parsed.filter((s) => {
      if (!s || !s.id) return false;
      if (deletedIdSet.has(s.id)) return false;
      const normExamId = s.examId ? s.examId.replace('exam-ct-informatika-30', 'exam-ct-inf-x-30') : '';
      const key = `${(s.studentNisn || '').trim().toLowerCase()}_${normExamId}`;
      const resetTime = resetAttempts[key];
      if (resetTime && s.submittedAt && new Date(s.submittedAt) <= new Date(resetTime)) {
        return false;
      }
      return true;
    });

    if (cleaned.length !== parsed.length) {
      localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(cleaned));
    }
    return cleaned;
  } catch {
    return [];
  }
};

export const saveStoredSubmissions = (submissions: StudentExamSubmission[]): void => {
  try {
    const deletedIdSet = new Set(getStoredDeletedSubmissionIds());
    const resetAttempts = getStoredResetStudentAttempts();

    const filtered = (submissions || []).filter((s) => {
      if (!s || !s.id) return false;
      if (deletedIdSet.has(s.id)) return false;
      const normExamId = s.examId ? s.examId.replace('exam-ct-informatika-30', 'exam-ct-inf-x-30') : '';
      const key = `${(s.studentNisn || '').trim().toLowerCase()}_${normExamId}`;
      const resetTime = resetAttempts[key];
      if (resetTime && s.submittedAt && new Date(s.submittedAt) <= new Date(resetTime)) {
        return false;
      }
      return true;
    });

    localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(filtered));
  } catch (e) {
    console.error('Failed to save submissions to localStorage', e);
  }
};

export const addStudentSubmission = (submission: StudentExamSubmission): void => {
  const current = getStoredSubmissions();
  const updated = [submission, ...current];
  saveStoredSubmissions(updated);
};

export const deleteStoredSubmission = (submissionId: string): void => {
  addStoredDeletedSubmissionId(submissionId);
  const current = getStoredSubmissions();
  const updated = current.filter((s) => s.id !== submissionId);
  localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(updated));
};

export const recordLocalStudentExamReset = (
  nisn: string,
  examId: string,
  submissionId?: string
): void => {
  const cleanNisn = (nisn || '').trim().toLowerCase();
  const cleanExamId = (examId || '').trim();
  const normExamId = cleanExamId.replace('exam-ct-informatika-30', 'exam-ct-inf-x-30');
  const now = new Date().toISOString();

  // 1. Record reset attempt
  const attempts = getStoredResetStudentAttempts();
  attempts[`${cleanNisn}_${cleanExamId}`] = now;
  attempts[`${cleanNisn}_${normExamId}`] = now;
  saveStoredResetStudentAttempts(attempts);

  // 2. Mark submission ID as deleted
  if (submissionId) {
    addStoredDeletedSubmissionId(submissionId);
  }

  // 3. Purge matching submission from local submissions
  const currentSubs = getStoredSubmissions();
  const filteredSubs = currentSubs.filter(
    (s) =>
      s.id !== submissionId &&
      !(
        (s.studentNisn || '').trim().toLowerCase() === cleanNisn &&
        (s.examId === cleanExamId || s.examId === normExamId)
      )
  );
  localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(filteredSubs));

  // 4. Clear active session and progress for this student & exam
  clearStoredExamProgress(cleanExamId, cleanNisn);
  clearStoredExamProgress(cleanExamId, nisn);
  clearStoredExamProgress(normExamId, cleanNisn);
  clearStoredExamProgress(normExamId, nisn);

  const activeSession = getStoredActiveStudentSession();
  if (
    activeSession &&
    (activeSession.studentData?.nisn?.trim()?.toLowerCase() === cleanNisn ||
      activeSession.exam?.id === cleanExamId ||
      activeSession.exam?.id === normExamId)
  ) {
    saveStoredActiveStudentSession(null);
  }
};

export const getStoredStudents = (): RegisteredStudent[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STUDENTS);
    if (raw === null) {
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(INITIAL_STUDENTS));
      return INITIAL_STUDENTS;
    }
    const parsed: RegisteredStudent[] = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    // Bersihkan dummy lama std-ct-x1-*, std-ct-x2-*, dst jika ada
    const cleaned = parsed.filter(
      (s) => !s.id.startsWith('std-ct-x1-') && 
             !s.id.startsWith('std-ct-x2-') && 
             !s.id.startsWith('std-ct-x3-') && 
             !s.id.startsWith('std-ct-x4-')
    );

    // Sinkronkan data siswa dari INITIAL_STUDENTS (termasuk X-5) yang belum ada di localStorage
    const existingNisns = new Set(cleaned.map((s) => s.nisn));
    let hasNewStudents = false;
    for (const initStd of INITIAL_STUDENTS) {
      if (!existingNisns.has(initStd.nisn)) {
        cleaned.push(initStd);
        existingNisns.add(initStd.nisn);
        hasNewStudents = true;
      }
    }

    if (hasNewStudents || cleaned.length !== parsed.length) {
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(cleaned));
    }
    return cleaned;
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

export const getStoredAdminActiveTab = (): string | null => {
  try {
    return localStorage.getItem(STORAGE_KEYS.ADMIN_ACTIVE_TAB);
  } catch {
    return null;
  }
};

export const saveStoredAdminActiveTab = (tab: string | null): void => {
  try {
    if (tab) {
      localStorage.setItem(STORAGE_KEYS.ADMIN_ACTIVE_TAB, tab);
    } else {
      localStorage.removeItem(STORAGE_KEYS.ADMIN_ACTIVE_TAB);
    }
  } catch (e) {
    console.error('Failed to save admin active tab to localStorage', e);
  }
};

export const getStoredActiveRole = (): string | null => {
  try {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_ROLE);
  } catch {
    return null;
  }
};

export const saveStoredActiveRole = (role: string | null): void => {
  try {
    if (role) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_ROLE, role);
    } else {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_ROLE);
    }
  } catch (e) {
    console.error('Failed to save active role to localStorage', e);
  }
};

export const getStoredSelectedExamId = (): string | null => {
  try {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_EXAM_ID);
  } catch {
    return null;
  }
};

export const saveStoredSelectedExamId = (examId: string | null): void => {
  try {
    if (examId) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_EXAM_ID, examId);
    } else {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_EXAM_ID);
    }
  } catch (e) {
    console.error('Failed to save selected exam ID to localStorage', e);
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

export interface ActiveStudentSession {
  exam: Exam;
  studentData: { name: string; nisn: string; studentClass: string };
  startedAt: string;
}

export const getStoredActiveStudentSession = (): ActiveStudentSession | null => {
  try {
    const raw = localStorage.getItem('cbt_sman1batu_active_student_session');
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const saveStoredActiveStudentSession = (session: ActiveStudentSession | null): void => {
  try {
    if (session) {
      localStorage.setItem('cbt_sman1batu_active_student_session', JSON.stringify(session));
    } else {
      localStorage.removeItem('cbt_sman1batu_active_student_session');
    }
  } catch (e) {
    console.error('Failed to save active student session in localStorage', e);
  }
};

export const getStoredExamProgress = (examId: string, nisn: string): any | null => {
  try {
    const key = `cbt_sman1batu_progress_${examId}_${nisn}`;
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const saveStoredExamProgress = (examId: string, nisn: string, progressData: any): void => {
  try {
    const key = `cbt_sman1batu_progress_${examId}_${nisn}`;
    localStorage.setItem(key, JSON.stringify(progressData));
  } catch (e) {
    console.error('Failed to auto-save exam progress to localStorage', e);
  }
};

export const clearStoredExamProgress = (examId: string, nisn: string): void => {
  try {
    const key = `cbt_sman1batu_progress_${examId}_${nisn}`;
    localStorage.removeItem(key);
  } catch (e) {
    console.error('Failed to clear exam progress in localStorage', e);
  }
};

