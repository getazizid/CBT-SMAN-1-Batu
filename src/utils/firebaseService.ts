import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  getDoc,
  onSnapshot,
  writeBatch,
  query,
  where,
  Unsubscribe,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase';
import { AdminAccount, Exam, LiveStudentSession, RegisteredStudent, StudentExamSubmission } from '../types';
import {
  INITIAL_ADMIN_ACCOUNTS,
  INITIAL_EXAMS,
  INITIAL_STUDENTS,
  INITIAL_SUBMISSIONS,
} from './storage';
import { MPK_OSIS_50_EXAM, REAL_STUDENTS_MPK_OSIS, REAL_SUBMISSIONS_MPK_OSIS } from '../data/mpkOsisExamData';
import { CT_INFORMATIKA_30_EXAM, STUDENTS_KELAS_X } from '../data/ctInformatikaExamData';

export const COLLECTIONS = {
  EXAMS: 'cbt_exams',
  SUBMISSIONS: 'cbt_submissions',
  STUDENTS: 'cbt_students',
  ADMIN_ACCOUNTS: 'cbt_admin_accounts',
  SETTINGS: 'cbt_settings',
  LIVE_SESSIONS: 'cbt_live_sessions',
};


export const syncMissingInitialStudentsToFirestore = async (): Promise<void> => {
  if (!db || !isFirebaseConfigured()) return;
  try {
    const studentsSnap = await getDocs(collection(db, COLLECTIONS.STUDENTS));
    const existingNisns = new Set<string>();
    studentsSnap.forEach((d) => {
      const data = d.data();
      if (data.nisn) existingNisns.add(data.nisn);
    });

    const missingStudents = INITIAL_STUDENTS.filter((s) => !existingNisns.has(s.nisn));
    if (missingStudents.length > 0) {
      console.log(`🔄 Menyinkronkan ${missingStudents.length} siswa baru ke Cloud Firestore...`);
      const batch = writeBatch(db);
      missingStudents.forEach((student) => {
        batch.set(doc(db, COLLECTIONS.STUDENTS, student.id), cleanForFirestore(student));
      });
      await batch.commit();
      console.log(`✅ Berhasil menyinkronkan ${missingStudents.length} siswa baru ke Cloud Firestore!`);
    }
  } catch (err) {
    console.warn('⚠️ Gagal sinkronisasi siswa baru ke Firestore:', err);
  }
};

/**
 * Seed & harmonize initial data for CBT SMAN 1 Batu (CT Informatika & MPK-OSIS).
 * Preserves user-edited admin accounts and prevents reverting.
 */
export const seedInitialFirestoreDataIfEmpty = async (): Promise<boolean> => {
  if (!db || !isFirebaseConfigured()) return false;

  try {
    const settingsRef = doc(db, COLLECTIONS.SETTINGS, 'general');
    const settingsSnap = await getDoc(settingsRef);

    // Jika database sudah pernah diinisialisasi, jangan pernah menimpa ujian tetapi tetap sinkronkan siswa baru jika ada
    if (settingsSnap.exists() && settingsSnap.data()?.isInitialized) {
      syncMissingInitialStudentsToFirestore().catch(console.warn);
      return true;
    }

    console.log('🔄 Menginisialisasi dataset awal CBT SMAN 1 Batu ke Cloud Firestore...');
    const batch = writeBatch(db);

    // Hapus dokumen duplikat paket lama jika ada
    batch.delete(doc(db, COLLECTIONS.EXAMS, 'exam-ct-informatika-30'));

    // 1. Seed paket ujian awal HANYA jika koleksi ujian masih kosong
    const examsSnap = await getDocs(collection(db, COLLECTIONS.EXAMS));
    if (examsSnap.empty) {
      batch.set(doc(db, COLLECTIONS.EXAMS, CT_INFORMATIKA_30_EXAM.id), cleanForFirestore(CT_INFORMATIKA_30_EXAM));
      batch.set(doc(db, COLLECTIONS.EXAMS, MPK_OSIS_50_EXAM.id), cleanForFirestore(MPK_OSIS_50_EXAM));
    }

    // 2. Seed data siswa jika koleksi masih kosong
    const studentsSnap = await getDocs(collection(db, COLLECTIONS.STUDENTS));
    if (studentsSnap.empty) {
      const allStudents = [...STUDENTS_KELAS_X, ...REAL_STUDENTS_MPK_OSIS];
      allStudents.forEach((student) => {
        batch.set(doc(db, COLLECTIONS.STUDENTS, student.id), cleanForFirestore(student));
      });
    }

    // 3. Submissions
    const subsSnap = await getDocs(collection(db, COLLECTIONS.SUBMISSIONS));
    if (subsSnap.empty) {
      REAL_SUBMISSIONS_MPK_OSIS.forEach((sub) => {
        batch.set(doc(db, COLLECTIONS.SUBMISSIONS, sub.id), cleanForFirestore(sub));
      });
    }

    // 4. Admin accounts
    const accountsSnap = await getDocs(collection(db, COLLECTIONS.ADMIN_ACCOUNTS));
    if (accountsSnap.empty) {
      INITIAL_ADMIN_ACCOUNTS.forEach((account) => {
        batch.set(doc(db, COLLECTIONS.ADMIN_ACCOUNTS, account.id), cleanForFirestore(account));
      });
    }

    batch.set(settingsRef, {
      enforceWhitelist: true,
      isInitialized: true,
      version: 'ct_v8_36_students_x2',
      updatedAt: new Date().toISOString(),
    }, { merge: true });

    await batch.commit();
    console.log('✅ Inisialisasi awal database Firestore berhasil!');
    return true;
  } catch (error) {
    console.warn('⚠️ Gagal inisialisasi Firestore:', error);
    return false;
  }
};

/**
 * Realtime listener for Exams
 */
export const subscribeToExams = (
  onUpdate: (exams: Exam[]) => void,
  onError?: (error: Error) => void
): Unsubscribe | null => {
  if (!db || !isFirebaseConfigured()) return null;

  try {
    const colRef = collection(db, COLLECTIONS.EXAMS);
    return onSnapshot(
      colRef,
      (snapshot) => {
        const list: Exam[] = [];
        snapshot.forEach((d) => {
          const data = d.data() as Exam;
          if (data && data.id) {
            list.push(data);
          }
        });

        // Hapus dan bersihkan dokumen duplikat lama (CTBATU / exam-ct-informatika-30) jika ada di Firestore
        const legacyDoc = list.find((e) => e.id === 'exam-ct-informatika-30' || e.token === 'CTBATU');
        if (legacyDoc) {
          deleteDoc(doc(db, COLLECTIONS.EXAMS, legacyDoc.id)).catch(console.warn);
        }
        const cleanList = list.filter((e) => e.id !== 'exam-ct-informatika-30' && e.token !== 'CTBATU');

        // Urutkan paket ujian berdasarkan tanggal pembuatan terbaru tanpa memaksakan paket lama kembali
        cleanList.sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime());

        onUpdate(cleanList);
      },
      (err) => {
        console.warn('Firestore Exams subscription error:', err);
        onError?.(err);
      }
    );
  } catch (err) {
    console.warn('Failed to subscribe to exams:', err);
    return null;
  }
};

/**
 * Safely strips `undefined` properties to prevent Firestore serialization errors
 */
export const cleanForFirestore = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};

export const saveExamToFirestore = async (exam: Exam): Promise<void> => {
  if (!db || !isFirebaseConfigured()) return;
  try {
    await setDoc(doc(db, COLLECTIONS.EXAMS, exam.id), cleanForFirestore(exam));
  } catch (err) {
    console.error('Error saving exam to Firestore:', err);
  }
};

export const syncAllExamsToFirestore = async (exams: Exam[]): Promise<void> => {
  if (!db || !isFirebaseConfigured()) return;
  try {
    const existingSnap = await getDocs(collection(db, COLLECTIONS.EXAMS));
    const currentIds = new Set(exams.map((e) => e.id));
    const batch = writeBatch(db);

    // Delete exams that were removed
    existingSnap.forEach((d) => {
      if (!currentIds.has(d.id)) {
        batch.delete(doc(db, COLLECTIONS.EXAMS, d.id));
      }
    });

    // Save/update all current exams
    exams.forEach((exam) => {
      batch.set(doc(db, COLLECTIONS.EXAMS, exam.id), cleanForFirestore(exam));
    });

    await batch.commit();
  } catch (err) {
    console.error('Error syncing all exams to Firestore:', err);
  }
};

export const deleteExamFromFirestore = async (examId: string): Promise<void> => {
  if (!db || !isFirebaseConfigured()) return;
  try {
    await deleteDoc(doc(db, COLLECTIONS.EXAMS, examId));
  } catch (err) {
    console.error('Error deleting exam from Firestore:', err);
  }
};

/**
 * Realtime listener for Submissions
 */
export const subscribeToSubmissions = (
  onUpdate: (submissions: StudentExamSubmission[]) => void,
  onError?: (error: Error) => void
): Unsubscribe | null => {
  if (!db || !isFirebaseConfigured()) return null;

  try {
    const colRef = collection(db, COLLECTIONS.SUBMISSIONS);
    return onSnapshot(
      colRef,
      (snapshot) => {
        const list: StudentExamSubmission[] = [];
        snapshot.forEach((d) => {
          const data = d.data() as StudentExamSubmission;
          if (data && data.id) {
            list.push(data);
          }
        });
        list.sort((a, b) => new Date(b.submittedAt || '').getTime() - new Date(a.submittedAt || '').getTime());
        onUpdate(list);
      },
      (err) => {
        console.warn('Firestore Submissions subscription error:', err);
        onError?.(err);
      }
    );
  } catch (err) {
    console.warn('Failed to subscribe to submissions:', err);
    return null;
  }
};

export const LIVE_CHANNEL_NAME = 'cbt_sman1batu_live_channel';

export const getBroadcastChannel = (): BroadcastChannel | null => {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    try {
      return new BroadcastChannel(LIVE_CHANNEL_NAME);
    } catch {
      return null;
    }
  }
  return null;
};

export interface ExamResetSyncData {
  deletedSubmissionIds: string[];
  resetStudentAttempts: Record<string, string>;
  lastUpdatedAt: string;
}

export const subscribeToExamResets = (
  onUpdate: (resets: ExamResetSyncData) => void,
  onError?: (error: Error) => void
): Unsubscribe | null => {
  if (!db || !isFirebaseConfigured()) return null;
  try {
    const docRef = doc(db, COLLECTIONS.SETTINGS, 'resets');
    return onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data() as ExamResetSyncData;
          if (data) {
            onUpdate(data);
          }
        }
      },
      (err) => {
        console.warn('Firestore ExamResets subscription notice:', err);
        onError?.(err);
      }
    );
  } catch (err) {
    console.warn('Failed to subscribe to exam resets:', err);
    return null;
  }
};

export const saveSubmissionToFirestore = async (submission: StudentExamSubmission): Promise<void> => {
  if (!db || !isFirebaseConfigured()) return;
  try {
    await setDoc(doc(db, COLLECTIONS.SUBMISSIONS, submission.id), cleanForFirestore(submission));
  } catch (err) {
    console.error('Error saving submission to Firestore:', err);
  }
};

export const syncAllSubmissionsToFirestore = async (submissions: StudentExamSubmission[]): Promise<void> => {
  if (!db || !isFirebaseConfigured()) return;
  try {
    const existingSnap = await getDocs(collection(db, COLLECTIONS.SUBMISSIONS));
    const currentIds = new Set(submissions.map((s) => s.id));
    const batch = writeBatch(db);

    existingSnap.forEach((d) => {
      if (!currentIds.has(d.id)) {
        batch.delete(doc(db, COLLECTIONS.SUBMISSIONS, d.id));
      }
    });

    submissions.forEach((sub) => {
      batch.set(doc(db, COLLECTIONS.SUBMISSIONS, sub.id), cleanForFirestore(sub));
    });

    await batch.commit();
  } catch (err) {
    console.error('Error syncing submissions to Firestore:', err);
  }
};

export const deleteSubmissionFromFirestore = async (submissionId: string): Promise<void> => {
  if (!db || !isFirebaseConfigured()) return;
  try {
    await deleteDoc(doc(db, COLLECTIONS.SUBMISSIONS, submissionId));
  } catch (err) {
    console.error('Error deleting submission from Firestore:', err);
  }
};

/**
 * Reset student's exam attempt in Cloud Firestore:
 * 1. Deletes the submission record from cbt_submissions collection
 * 2. Records deleted ID and student attempt reset timestamp in cbt_settings/resets
 * 3. Removes live proctoring session from cbt_settings and local storage
 * 4. Broadcasts reset event via BroadcastChannel for instant multi-tab sync
 */
export const resetStudentExamInFirestore = async (
  submissionId: string,
  studentNisn: string,
  examId: string
): Promise<void> => {
  const cleanNisn = (studentNisn || '').trim().toLowerCase();
  const cleanExamId = (examId || '').trim();
  const normExamId = cleanExamId.replace('exam-ct-informatika-30', 'exam-ct-inf-x-30');
  const now = new Date().toISOString();

  // 1. Dual-sync locally via BroadcastChannel for instant cross-tab / cross-window sync
  try {
    const bc = getBroadcastChannel();
    if (bc) {
      bc.postMessage({
        type: 'STUDENT_EXAM_RESET',
        submissionId,
        studentNisn,
        examId,
        timestamp: now,
      });
      bc.close();
    }
  } catch {}

  // 2. Clear local storage live session
  try {
    localStorage.removeItem(`cbt_live_session_${studentNisn}`);
    localStorage.removeItem(`cbt_live_session_${cleanNisn}`);
    localStorage.removeItem(`cbt_live_session_${cleanNisn}_${cleanExamId}`);
    localStorage.removeItem(`cbt_live_session_${cleanNisn}_${normExamId}`);
  } catch {}

  if (!db || !isFirebaseConfigured()) return;

  try {
    const batch = writeBatch(db);

    // 3. Delete submission document from cbt_submissions
    if (submissionId) {
      batch.delete(doc(db, COLLECTIONS.SUBMISSIONS, submissionId));
    }

    // 4. Update resets tracking document in cbt_settings/resets
    const resetsRef = doc(db, COLLECTIONS.SETTINGS, 'resets');
    const resetsSnap = await getDoc(resetsRef);
    const existing = resetsSnap.exists()
      ? (resetsSnap.data() as ExamResetSyncData)
      : { deletedSubmissionIds: [], resetStudentAttempts: {}, lastUpdatedAt: '' };

    const updatedDeletedIds = Array.from(
      new Set([...(existing.deletedSubmissionIds || []), submissionId].filter(Boolean))
    );
    const updatedAttempts = {
      ...(existing.resetStudentAttempts || {}),
      [`${cleanNisn}_${cleanExamId}`]: now,
      [`${cleanNisn}_${normExamId}`]: now,
    };

    batch.set(
      resetsRef,
      cleanForFirestore({
        deletedSubmissionIds: updatedDeletedIds,
        resetStudentAttempts: updatedAttempts,
        lastUpdatedAt: now,
      }),
      { merge: true }
    );

    // 5. Delete student's live proctoring document
    batch.delete(doc(db, COLLECTIONS.SETTINGS, `live_${studentNisn}`));
    batch.delete(doc(db, COLLECTIONS.SETTINGS, `live_${cleanNisn}`));
    batch.delete(doc(db, COLLECTIONS.SETTINGS, `live_${cleanNisn}_${cleanExamId}`));
    batch.delete(doc(db, COLLECTIONS.SETTINGS, `live_${cleanNisn}_${normExamId}`));

    await batch.commit();
    console.log(`✅ Berhasil mereset pengerjaan ujian siswa ${studentNisn} (${examId}) di Cloud Firestore!`);
  } catch (err) {
    console.error('Error resetting student exam in Firestore:', err);
  }
};

/**
 * Batch delete multiple submissions and reset students in Cloud Firestore
 */
export const deleteMultipleSubmissionsFromFirestore = async (
  submissionsToDelete: StudentExamSubmission[]
): Promise<void> => {
  if (!submissionsToDelete || submissionsToDelete.length === 0) return;

  const toDeleteIds = submissionsToDelete.map((s) => s.id);
  const now = new Date().toISOString();

  // Local BroadcastChannel
  try {
    const bc = getBroadcastChannel();
    if (bc) {
      bc.postMessage({
        type: 'MULTIPLE_EXAMS_RESET',
        submissionIds: toDeleteIds,
        timestamp: now,
      });
      bc.close();
    }
  } catch {}

  if (!db || !isFirebaseConfigured()) return;

  try {
    const batch = writeBatch(db);
    submissionsToDelete.forEach((s) => {
      const cleanNisn = (s.studentNisn || '').trim().toLowerCase();
      const cleanExamId = (s.examId || '').trim();
      const normExamId = cleanExamId.replace('exam-ct-informatika-30', 'exam-ct-inf-x-30');

      batch.delete(doc(db, COLLECTIONS.SUBMISSIONS, s.id));
      batch.delete(doc(db, COLLECTIONS.SETTINGS, `live_${s.studentNisn}`));
      batch.delete(doc(db, COLLECTIONS.SETTINGS, `live_${cleanNisn}`));
      batch.delete(doc(db, COLLECTIONS.SETTINGS, `live_${cleanNisn}_${cleanExamId}`));
      batch.delete(doc(db, COLLECTIONS.SETTINGS, `live_${cleanNisn}_${normExamId}`));
    });

    const resetsRef = doc(db, COLLECTIONS.SETTINGS, 'resets');
    const resetsSnap = await getDoc(resetsRef);
    const existing = resetsSnap.exists()
      ? (resetsSnap.data() as ExamResetSyncData)
      : { deletedSubmissionIds: [], resetStudentAttempts: {}, lastUpdatedAt: '' };

    const updatedDeletedIds = Array.from(new Set([...(existing.deletedSubmissionIds || []), ...toDeleteIds]));
    const updatedAttempts = { ...(existing.resetStudentAttempts || {}) };
    submissionsToDelete.forEach((s) => {
      const cleanNisn = (s.studentNisn || '').trim().toLowerCase();
      const cleanExamId = (s.examId || '').trim();
      const normExamId = cleanExamId.replace('exam-ct-informatika-30', 'exam-ct-inf-x-30');
      updatedAttempts[`${cleanNisn}_${cleanExamId}`] = now;
      updatedAttempts[`${cleanNisn}_${normExamId}`] = now;
    });

    batch.set(
      resetsRef,
      cleanForFirestore({
        deletedSubmissionIds: updatedDeletedIds,
        resetStudentAttempts: updatedAttempts,
        lastUpdatedAt: now,
      }),
      { merge: true }
    );

    await batch.commit();
    console.log(`✅ Berhasil menghapus ${submissionsToDelete.length} data riwayat nilai di Cloud Firestore!`);
  } catch (err) {
    console.error('Error batch deleting submissions from Firestore:', err);
  }
};

/**
 * Clear all student exam submissions from Cloud Firestore
 */
export const clearAllSubmissionsFromFirestore = async (
  currentSubmissions: StudentExamSubmission[]
): Promise<void> => {
  if (!db || !isFirebaseConfigured()) return;
  try {
    const subsSnap = await getDocs(collection(db, COLLECTIONS.SUBMISSIONS));
    const batch = writeBatch(db);
    const allIds: string[] = [];

    subsSnap.forEach((d) => {
      batch.delete(d.ref);
      allIds.push(d.id);
    });

    currentSubmissions.forEach((s) => {
      if (!allIds.includes(s.id)) allIds.push(s.id);
    });

    const now = new Date().toISOString();
    const resetsRef = doc(db, COLLECTIONS.SETTINGS, 'resets');
    const resetsSnap = await getDoc(resetsRef);
    const existing = resetsSnap.exists()
      ? (resetsSnap.data() as ExamResetSyncData)
      : { deletedSubmissionIds: [], resetStudentAttempts: {}, lastUpdatedAt: '' };

    const updatedDeletedIds = Array.from(new Set([...(existing.deletedSubmissionIds || []), ...allIds]));
    const updatedAttempts = { ...(existing.resetStudentAttempts || {}) };
    currentSubmissions.forEach((s) => {
      const cleanNisn = (s.studentNisn || '').trim().toLowerCase();
      const cleanExamId = (s.examId || '').trim();
      const normExamId = cleanExamId.replace('exam-ct-informatika-30', 'exam-ct-inf-x-30');
      updatedAttempts[`${cleanNisn}_${cleanExamId}`] = now;
      updatedAttempts[`${cleanNisn}_${normExamId}`] = now;
    });

    batch.set(
      resetsRef,
      cleanForFirestore({
        deletedSubmissionIds: updatedDeletedIds,
        resetStudentAttempts: updatedAttempts,
        lastUpdatedAt: now,
      }),
      { merge: true }
    );

    await batch.commit();
    console.log('✅ Seluruh riwayat nilai berhasil dihapus dari Cloud Firestore!');
  } catch (err) {
    console.error('Error clearing all submissions from Firestore:', err);
  }
};

/**
 * Realtime listener for Students
 */
export const subscribeToStudents = (
  onUpdate: (students: RegisteredStudent[]) => void,
  onError?: (error: Error) => void
): Unsubscribe | null => {
  if (!db || !isFirebaseConfigured()) return null;

  try {
    const colRef = collection(db, COLLECTIONS.STUDENTS);
    return onSnapshot(
      colRef,
      (snapshot) => {
        const list: RegisteredStudent[] = [];
        snapshot.forEach((d) => {
          const data = d.data() as RegisteredStudent;
          if (data && data.id) {
            list.push(data);
          }
        });
        list.sort((a, b) => (a.studentClass || '').localeCompare(b.studentClass || '') || (a.name || '').localeCompare(b.name || ''));
        onUpdate(list);
      },
      (err) => {
        console.warn('Firestore Students subscription error:', err);
        onError?.(err);
      }
    );
  } catch (err) {
    console.warn('Failed to subscribe to students:', err);
    return null;
  }
};

export const saveStudentToFirestore = async (student: RegisteredStudent): Promise<void> => {
  if (!db || !isFirebaseConfigured()) return;
  try {
    await setDoc(doc(db, COLLECTIONS.STUDENTS, student.id), cleanForFirestore(student));
  } catch (err) {
    console.error('Error saving student to Firestore:', err);
  }
};

export const syncAllStudentsToFirestore = async (students: RegisteredStudent[]): Promise<void> => {
  if (!db || !isFirebaseConfigured()) return;
  try {
    const existingSnap = await getDocs(collection(db, COLLECTIONS.STUDENTS));
    const currentIds = new Set(students.map((s) => s.id));
    const batch = writeBatch(db);

    existingSnap.forEach((d) => {
      if (!currentIds.has(d.id)) {
        batch.delete(doc(db, COLLECTIONS.STUDENTS, d.id));
      }
    });

    students.forEach((s) => {
      batch.set(doc(db, COLLECTIONS.STUDENTS, s.id), cleanForFirestore(s));
    });

    await batch.commit();
  } catch (err) {
    console.error('Error syncing all students to Firestore:', err);
  }
};

export const deleteStudentFromFirestore = async (studentId: string): Promise<void> => {
  if (!db || !isFirebaseConfigured()) return;
  try {
    await deleteDoc(doc(db, COLLECTIONS.STUDENTS, studentId));
  } catch (err) {
    console.error('Error deleting student from Firestore:', err);
  }
};

/**
 * Realtime listener for Admin Accounts
 */
export const subscribeToAdminAccounts = (
  onUpdate: (accounts: AdminAccount[]) => void,
  onError?: (error: Error) => void
): Unsubscribe | null => {
  if (!db || !isFirebaseConfigured()) return null;

  try {
    const colRef = collection(db, COLLECTIONS.ADMIN_ACCOUNTS);
    return onSnapshot(
      colRef,
      (snapshot) => {
        const list: AdminAccount[] = [];
        snapshot.forEach((d) => {
          const data = d.data() as AdminAccount;
          if (data && data.id) {
            list.push(data);
          }
        });
        onUpdate(list);
      },
      (err) => {
        console.warn('Firestore Admin Accounts subscription error:', err);
        onError?.(err);
      }
    );
  } catch (err) {
    console.warn('Failed to subscribe to admin accounts:', err);
    return null;
  }
};

export const saveAdminAccountToFirestore = async (account: AdminAccount): Promise<void> => {
  if (!db || !isFirebaseConfigured()) return;
  try {
    await setDoc(doc(db, COLLECTIONS.ADMIN_ACCOUNTS, account.id), cleanForFirestore(account));
  } catch (err) {
    console.error('Error saving admin account to Firestore:', err);
  }
};

export const syncAllAdminAccountsToFirestore = async (accounts: AdminAccount[]): Promise<void> => {
  if (!db || !isFirebaseConfigured()) return;
  try {
    const existingSnap = await getDocs(collection(db, COLLECTIONS.ADMIN_ACCOUNTS));
    const currentIds = new Set(accounts.map((a) => a.id));
    const batch = writeBatch(db);

    existingSnap.forEach((d) => {
      if (!currentIds.has(d.id)) {
        batch.delete(doc(db, COLLECTIONS.ADMIN_ACCOUNTS, d.id));
      }
    });

    accounts.forEach((acc) => {
      batch.set(doc(db, COLLECTIONS.ADMIN_ACCOUNTS, acc.id), cleanForFirestore(acc));
    });

    await batch.commit();
  } catch (err) {
    console.error('Error syncing all admin accounts to Firestore:', err);
  }
};

export const deleteAdminAccountFromFirestore = async (accountId: string): Promise<void> => {
  if (!db || !isFirebaseConfigured()) return;
  try {
    await deleteDoc(doc(db, COLLECTIONS.ADMIN_ACCOUNTS, accountId));
  } catch (err) {
    console.error('Error deleting admin account from Firestore:', err);
  }
};

/**
 * Realtime listener for Settings
 */
export const subscribeToSettings = (
  onUpdate: (settings: { enforceWhitelist: boolean }) => void
): Unsubscribe | null => {
  if (!db || !isFirebaseConfigured()) return null;

  try {
    const docRef = doc(db, COLLECTIONS.SETTINGS, 'general');
    return onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          if (typeof data.enforceWhitelist === 'boolean') {
            onUpdate({ enforceWhitelist: data.enforceWhitelist });
          }
        }
      },
      (err) => {
        console.warn('Firestore Settings subscription error:', err);
      }
    );
  } catch (err) {
    console.warn('Failed to subscribe to settings:', err);
    return null;
  }
};

export const saveSettingsToFirestore = async (settings: { enforceWhitelist: boolean }): Promise<void> => {
  if (!db || !isFirebaseConfigured()) return;
  try {
    await setDoc(doc(db, COLLECTIONS.SETTINGS, 'general'), cleanForFirestore({
      ...settings,
      isInitialized: true,
      updatedAt: new Date().toISOString(),
    }), { merge: true });
  } catch (err) {
    console.error('Error saving settings to Firestore:', err);
  }
};

/**
 * =========================================================================
 * REALTIME LIVE MONITORING ENGINE (QUIZIZZ PRO-STYLE & FREE SPARK OPTIMIZED)
 * Uses cbt_settings with live_ prefix to guarantee 100% Firestore write/read access.
 * =========================================================================
 */

/**
 * Save / Update student live exam status and progress.
 * Dual-syncs to Firestore (cbt_settings collection) and local BroadcastChannel.
 */
export const saveLiveSessionToFirestore = async (session: LiveStudentSession): Promise<void> => {
  // 1. Broadcast locally immediately (instant cross-tab sync)
  try {
    const bc = getBroadcastChannel();
    if (bc) {
      bc.postMessage({ type: 'LIVE_UPDATE', session });
      bc.close();
    }
    localStorage.setItem(`cbt_live_session_${session.id}`, JSON.stringify(session));
  } catch {
    // Ignore local broadcast errors
  }

  // 2. Synchronize to Cloud Firestore if connected
  if (!db || !isFirebaseConfigured()) return;

  try {
    const docId = session.id.startsWith('live_') ? session.id : `live_${session.id}`;
    const docRef = doc(db, COLLECTIONS.SETTINGS, docId);
    await setDoc(docRef, cleanForFirestore({ ...session, id: session.id, _isLiveSession: true }), { merge: true });
  } catch (err: unknown) {
    console.warn('Gagal sinkronisasi live session ke Firestore:', err);
  }
};

/**
 * Realtime listener for Admin Live Proctoring Monitor.
 * Listens to active students across devices via cbt_settings (permitted collection).
 */
export const subscribeToLiveSessions = (
  examId: string,
  onUpdate: (sessions: LiveStudentSession[]) => void,
  onError?: (error: Error) => void
): Unsubscribe => {
  const sessionsMap: Record<string, LiveStudentSession> = {};

  const emitSorted = () => {
    const all = Object.values(sessionsMap);
    const filtered = examId ? all.filter((s) => s.examId === examId) : all;
    filtered.sort((a, b) => {
      // Warning/exit status first
      if (a.status === 'warning_exit' && b.status !== 'warning_exit') return -1;
      if (b.status === 'warning_exit' && a.status !== 'warning_exit') return 1;
      // Then by violation count descending
      if ((b.violationCount || 0) !== (a.violationCount || 0)) {
        return (b.violationCount || 0) - (a.violationCount || 0);
      }
      // Then by class & student name
      return (a.studentClass || '').localeCompare(b.studentClass || '') || (a.studentName || '').localeCompare(b.studentName || '');
    });
    onUpdate(filtered);
  };

  // Check localStorage for any pre-existing local session records
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('cbt_live_session_')) {
        const item = localStorage.getItem(key);
        if (item) {
          const parsed = JSON.parse(item) as LiveStudentSession;
          if (parsed && (!examId || parsed.examId === examId)) {
            sessionsMap[parsed.id] = parsed;
          }
        }
      }
    }
    if (Object.keys(sessionsMap).length > 0) {
      emitSorted();
    }
  } catch {
    // Ignore localStorage scan error
  }

  // Set up local BroadcastChannel listener for instant zero-latency updates
  const bc = getBroadcastChannel();
  if (bc) {
    bc.onmessage = (event) => {
      const data = event.data;
      if (data?.type === 'LIVE_UPDATE' && data.session) {
        const s = data.session as LiveStudentSession;
        if (!examId || s.examId === examId) {
          sessionsMap[s.id] = s;
          emitSorted();
        }
      } else if (data?.type === 'LIVE_DELETE' && data.sessionId) {
        delete sessionsMap[data.sessionId];
        emitSorted();
      }
    };
  }

  // If Firebase Firestore is not configured, rely purely on local channel
  if (!db || !isFirebaseConfigured()) {
    return () => {
      if (bc) bc.close();
    };
  }

  // Subscribe to Cloud Firestore collection query on cbt_settings
  let firestoreUnsub: Unsubscribe = () => {};
  try {
    const colRef = collection(db, COLLECTIONS.SETTINGS);

    firestoreUnsub = onSnapshot(
      colRef,
      (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          const docId = change.doc.id;
          if (!docId.startsWith('live_')) return; // Ignore general settings doc
          const docData = change.doc.data() as LiveStudentSession;
          const sessionId = docData.id || docId.replace(/^live_/, '');

          if (change.type === 'removed') {
            delete sessionsMap[sessionId];
          } else if (docData) {
            sessionsMap[sessionId] = { ...docData, id: sessionId };
          }
        });

        emitSorted();
      },
      (err) => {
        console.warn('Firestore LiveSessions subscription notice:', err);
        onError?.(err);
      }
    );
  } catch (err) {
    console.warn('Failed to start Firestore live sessions listener:', err);
  }

  return () => {
    firestoreUnsub();
    if (bc) bc.close();
  };
};

/**
 * Remove live session after student successfully submits
 */
export const deleteLiveSessionFromFirestore = async (sessionId: string): Promise<void> => {
  try {
    localStorage.removeItem(`cbt_live_session_${sessionId}`);
    const bc = getBroadcastChannel();
    if (bc) {
      bc.postMessage({ type: 'LIVE_DELETE', sessionId });
      bc.close();
    }
  } catch {
    // Ignore error
  }

  if (!db || !isFirebaseConfigured()) return;
  try {
    const docId = sessionId.startsWith('live_') ? sessionId : `live_${sessionId}`;
    await deleteDoc(doc(db, COLLECTIONS.SETTINGS, docId));
  } catch (err) {
    console.error('Error removing live session from Firestore:', err);
  }
};

/**
 * Clear all live sessions for an exam (used by Proktor to reset session)
 */
export const clearAllLiveSessionsForExam = async (examId: string): Promise<void> => {
  if (!db || !isFirebaseConfigured()) return;
  try {
    const colRef = collection(db, COLLECTIONS.SETTINGS);
    const snap = await getDocs(colRef);
    const batch = writeBatch(db);
    snap.forEach((d) => {
      if (d.id.startsWith('live_')) {
        const data = d.data();
        if (!examId || data.examId === examId) {
          batch.delete(d.ref);
        }
      }
    });
    await batch.commit();
  } catch (err) {
    console.error('Error clearing live sessions for exam:', err);
  }
};

