import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  getDoc,
  onSnapshot,
  writeBatch,
  Unsubscribe,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase';
import { AdminAccount, Exam, RegisteredStudent, StudentExamSubmission } from '../types';
import {
  INITIAL_ADMIN_ACCOUNTS,
  INITIAL_EXAMS,
  INITIAL_STUDENTS,
  INITIAL_SUBMISSIONS,
} from './storage';

export const COLLECTIONS = {
  EXAMS: 'cbt_exams',
  SUBMISSIONS: 'cbt_submissions',
  STUDENTS: 'cbt_students',
  ADMIN_ACCOUNTS: 'cbt_admin_accounts',
  SETTINGS: 'cbt_settings',
};

/**
 * Seed initial demo data ONCE if the system settings flag does not exist yet.
 * Once initialized, it will never overwrite user edits or deleted data.
 */
export const seedInitialFirestoreDataIfEmpty = async (): Promise<boolean> => {
  if (!db || !isFirebaseConfigured()) return false;

  try {
    const settingsRef = doc(db, COLLECTIONS.SETTINGS, 'general');
    const settingsSnap = await getDoc(settingsRef);

    // If settings document already exists, the database was already initialized -> DO NOT SEED!
    if (settingsSnap.exists()) {
      return true;
    }

    // Check if exams collection has any docs
    const examsSnap = await getDocs(collection(db, COLLECTIONS.EXAMS));
    if (examsSnap.empty) {
      console.log('🌱 Menyiapkan data awal SMAN 1 Batu ke Cloud Firestore...');
      const batch = writeBatch(db);

      INITIAL_EXAMS.forEach((exam) => {
        const docRef = doc(db, COLLECTIONS.EXAMS, exam.id);
        batch.set(docRef, exam);
      });

      INITIAL_STUDENTS.forEach((student) => {
        const docRef = doc(db, COLLECTIONS.STUDENTS, student.id);
        batch.set(docRef, student);
      });

      INITIAL_ADMIN_ACCOUNTS.forEach((account) => {
        const docRef = doc(db, COLLECTIONS.ADMIN_ACCOUNTS, account.id);
        batch.set(docRef, account);
      });

      INITIAL_SUBMISSIONS.forEach((sub) => {
        const docRef = doc(db, COLLECTIONS.SUBMISSIONS, sub.id);
        batch.set(docRef, sub);
      });

      batch.set(settingsRef, {
        enforceWhitelist: true,
        isInitialized: true,
        seededAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      await batch.commit();
      console.log('✅ Data awal berhasil disimpan di Cloud Firestore!');
    } else {
      // Mark as initialized so it never tries to seed again
      await setDoc(settingsRef, {
        enforceWhitelist: true,
        isInitialized: true,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
    }
    return true;
  } catch (error) {
    console.warn('⚠️ Gagal seeding Firestore:', error);
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
        list.sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime());
        onUpdate(list);
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

export const saveExamToFirestore = async (exam: Exam): Promise<void> => {
  if (!db || !isFirebaseConfigured()) return;
  try {
    await setDoc(doc(db, COLLECTIONS.EXAMS, exam.id), exam);
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
      batch.set(doc(db, COLLECTIONS.EXAMS, exam.id), exam);
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

export const saveSubmissionToFirestore = async (submission: StudentExamSubmission): Promise<void> => {
  if (!db || !isFirebaseConfigured()) return;
  try {
    await setDoc(doc(db, COLLECTIONS.SUBMISSIONS, submission.id), submission);
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
      batch.set(doc(db, COLLECTIONS.SUBMISSIONS, sub.id), sub);
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
    await setDoc(doc(db, COLLECTIONS.STUDENTS, student.id), student);
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
      batch.set(doc(db, COLLECTIONS.STUDENTS, s.id), s);
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
    await setDoc(doc(db, COLLECTIONS.ADMIN_ACCOUNTS, account.id), account);
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
      batch.set(doc(db, COLLECTIONS.ADMIN_ACCOUNTS, acc.id), acc);
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
    await setDoc(doc(db, COLLECTIONS.SETTINGS, 'general'), {
      ...settings,
      isInitialized: true,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (err) {
    console.error('Error saving settings to Firestore:', err);
  }
};
