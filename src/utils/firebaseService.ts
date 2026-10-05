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


/**
 * Seed & harmonize initial data for CBT SMAN 1 Batu (CT Informatika & MPK-OSIS).
 * Preserves user-edited admin accounts and prevents reverting.
 */
export const seedInitialFirestoreDataIfEmpty = async (): Promise<boolean> => {
  if (!db || !isFirebaseConfigured()) return false;

  try {
    const settingsRef = doc(db, COLLECTIONS.SETTINGS, 'general');
    const settingsSnap = await getDoc(settingsRef);
    const isV8Updated = settingsSnap.exists() && settingsSnap.data()?.version === 'ct_v8_36_students_x2';

    if (!isV8Updated) {
      console.log('🔄 Memperbarui dataset Ujian CT Informatika (30 Soal HOTS) & 36 Siswa Kelas X SMAN 1 Batu ke Cloud Firestore...');
      const batch = writeBatch(db);

      // Hapus dokumen duplikat paket lama jika ada
      batch.delete(doc(db, COLLECTIONS.EXAMS, 'exam-ct-informatika-30'));

      // 1. Seed CT Informatika 30 Exam and MPK OSIS 50 Exam
      batch.set(doc(db, COLLECTIONS.EXAMS, CT_INFORMATIKA_30_EXAM.id), cleanForFirestore(CT_INFORMATIKA_30_EXAM));
      batch.set(doc(db, COLLECTIONS.EXAMS, MPK_OSIS_50_EXAM.id), cleanForFirestore(MPK_OSIS_50_EXAM));

      // Hapus data siswa dummy lama dari Firestore jika ada
      ['std-ct-x1-01', 'std-ct-x2-01', 'std-ct-x3-01', 'std-ct-x4-01', 'std-ct-x5-01'].forEach((oldId) => {
        batch.delete(doc(db, COLLECTIONS.STUDENTS, oldId));
      });

      // 2. Seed 36 Siswa Kelas X + Siswa MPK OSIS
      const allStudents = [...STUDENTS_KELAS_X, ...REAL_STUDENTS_MPK_OSIS];
      allStudents.forEach((student) => {
        batch.set(doc(db, COLLECTIONS.STUDENTS, student.id), cleanForFirestore(student));
      });

      // 3. Clean up old demo submissions and set real submissions
      const subsSnap = await getDocs(collection(db, COLLECTIONS.SUBMISSIONS));
      const realSubIds = new Set(REAL_SUBMISSIONS_MPK_OSIS.map((s) => s.id));
      subsSnap.forEach((d) => {
        if (!realSubIds.has(d.id)) {
          batch.delete(doc(db, COLLECTIONS.SUBMISSIONS, d.id));
        }
      });
      REAL_SUBMISSIONS_MPK_OSIS.forEach((sub) => {
        batch.set(doc(db, COLLECTIONS.SUBMISSIONS, sub.id), cleanForFirestore(sub));
      });

      // 4. Admin accounts: if only demo accounts existed, harmonize to 1 primary admin account (preserves custom edits)
      const accountsSnap = await getDocs(collection(db, COLLECTIONS.ADMIN_ACCOUNTS));
      if (accountsSnap.empty) {
        INITIAL_ADMIN_ACCOUNTS.forEach((account) => {
          batch.set(doc(db, COLLECTIONS.ADMIN_ACCOUNTS, account.id), cleanForFirestore(account));
        });
      } else {
        // Remove unneeded default demo accounts (adm-002, adm-003) if they were not modified
        accountsSnap.forEach((d) => {
          if (d.id === 'adm-002' || d.id === 'adm-003') {
            batch.delete(doc(db, COLLECTIONS.ADMIN_ACCOUNTS, d.id));
          }
        });
      }

      batch.set(settingsRef, {
        enforceWhitelist: true,
        isInitialized: true,
        version: 'ct_v8_36_students_x2',
        updatedAt: new Date().toISOString(),
      }, { merge: true });

      await batch.commit();
      console.log('✅ Dataset Ujian CT Informatika & 36 Siswa Kelas X SMAN 1 Batu berhasil disinkronkan ke Cloud Firestore!');
    }
    return true;
  } catch (error) {
    console.warn('⚠️ Gagal sinkronisasi Firestore:', error);
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
        let cleanList = list.filter((e) => e.id !== 'exam-ct-informatika-30' && e.token !== 'CTBATU');

        // Ensure CT exam is in the list and matches latest version
        const ctExam = cleanList.find((e) => e.id === CT_INFORMATIKA_30_EXAM.id);
        if (!ctExam || (ctExam.questions?.length ?? 0) !== 30 || ctExam.createdAt !== CT_INFORMATIKA_30_EXAM.createdAt) {
          setDoc(doc(db, COLLECTIONS.EXAMS, CT_INFORMATIKA_30_EXAM.id), cleanForFirestore(CT_INFORMATIKA_30_EXAM)).catch(console.warn);
          if (!ctExam) {
            cleanList.unshift(CT_INFORMATIKA_30_EXAM);
          } else {
            const idx = cleanList.findIndex((e) => e.id === CT_INFORMATIKA_30_EXAM.id);
            cleanList[idx] = CT_INFORMATIKA_30_EXAM;
          }
        }

        // Prioritize CT Informatika exam first
        cleanList.sort((a, b) => {
          if (a.id === CT_INFORMATIKA_30_EXAM.id) return -1;
          if (b.id === CT_INFORMATIKA_30_EXAM.id) return 1;
          return new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime();
        });

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
const LIVE_CHANNEL_NAME = 'cbt_sman1batu_live_channel';

const getBroadcastChannel = (): BroadcastChannel | null => {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    try {
      return new BroadcastChannel(LIVE_CHANNEL_NAME);
    } catch {
      return null;
    }
  }
  return null;
};

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

