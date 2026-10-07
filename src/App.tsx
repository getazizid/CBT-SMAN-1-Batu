import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { StudentLogin } from './components/student/StudentLogin';
import { ExamRoom } from './components/student/ExamRoom';
import { ExamResultReport } from './components/student/ExamResultReport';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminLoginModal } from './components/admin/AdminLoginModal';
import { AdminAccount, Exam, RegisteredStudent, StudentExamSubmission, UserRole } from './types';
import { isFirebaseConfigured } from './firebase';
import {
  LIVE_CHANNEL_NAME,
  clearAllSubmissionsFromFirestore,
  deleteMultipleSubmissionsFromFirestore,
  resetStudentExamInFirestore,
  saveSettingsToFirestore,
  saveSubmissionToFirestore,
  seedInitialFirestoreDataIfEmpty,
  subscribeToAdminAccounts,
  subscribeToExamResets,
  subscribeToExams,
  subscribeToSettings,
  subscribeToStudents,
  subscribeToSubmissions,
  syncAllAdminAccountsToFirestore,
  syncAllExamsToFirestore,
  syncAllStudentsToFirestore,
  syncAllSubmissionsToFirestore,
} from './utils/firebaseService';
import {
  INITIAL_STUDENTS,
  addStudentSubmission,
  clearStoredExamProgress,
  getCurrentAdminSession,
  getStoredActiveStudentSession,
  getStoredAdminAccounts,
  getStoredDeletedSubmissionIds,
  getStoredEnforceWhitelist,
  getStoredExams,
  getStoredResetStudentAttempts,
  getStoredStudents,
  getStoredSubmissions,
  recordLocalStudentExamReset,
  restoreExamsFromLocalStorage,
  saveCurrentAdminSession,
  saveStoredActiveStudentSession,
  saveStoredAdminAccounts,
  saveStoredDeletedSubmissionIds,
  saveStoredEnforceWhitelist,
  saveStoredExams,
  saveStoredResetStudentAttempts,
  saveStoredStudents,
  saveStoredSubmissions,
  getStoredActiveRole,
  saveStoredActiveRole,
  saveStoredAdminActiveTab,
} from './utils/storage';

export default function App() {
  const [role, setRole] = useState<UserRole>(() => {
    const activeStudentSession = getStoredActiveStudentSession();
    if (activeStudentSession) return 'student';

    const adminSession = getCurrentAdminSession();
    const storedRole = getStoredActiveRole();
    if (adminSession) {
      if (storedRole === 'student') return 'student';
      return 'admin';
    }
    return 'student';
  });
  const [exams, setExams] = useState<Exam[]>([]);
  const [submissions, setSubmissions] = useState<StudentExamSubmission[]>([]);
  const [students, setStudents] = useState<RegisteredStudent[]>([]);
  const [adminAccounts, setAdminAccounts] = useState<AdminAccount[]>([]);
  const [currentAdmin, setCurrentAdmin] = useState<AdminAccount | null>(null);
  const [enforceWhitelist, setEnforceWhitelist] = useState<boolean>(true);
  const [isAdminLoginModalOpen, setIsAdminLoginModalOpen] = useState<boolean>(false);
  const [isCloudConnected, setIsCloudConnected] = useState<boolean>(isFirebaseConfigured());

  // Student flow state
  const [studentFlow, setStudentFlow] = useState<{
    phase: 'login' | 'exam' | 'result';
    activeExam: Exam | null;
    studentData: { name: string; nisn: string; studentClass: string } | null;
    latestSubmission: StudentExamSubmission | null;
  }>({
    phase: 'login',
    activeExam: null,
    studentData: null,
    latestSubmission: null,
  });

  // Load initial local data first for instant UI response
  useEffect(() => {
    setExams(getStoredExams());
    setSubmissions(getStoredSubmissions());
    setStudents(getStoredStudents());
    setAdminAccounts(getStoredAdminAccounts());
    const adminSession = getCurrentAdminSession();
    setCurrentAdmin(adminSession);
    const activeStudentSession = getStoredActiveStudentSession();
    const storedRole = getStoredActiveRole();
    if (adminSession && !activeStudentSession && storedRole !== 'student') {
      setRole('admin');
    }
    setEnforceWhitelist(getStoredEnforceWhitelist());

    // Restore student exam session if interrupted
    const activeSession = getStoredActiveStudentSession();
    if (activeSession && activeSession.studentData) {
      const storedExamsList = getStoredExams();
      const matchedExam =
        storedExamsList.find((e) => e.id === activeSession.exam?.id) ||
        activeSession.exam ||
        (storedExamsList.length > 0 ? storedExamsList[0] : null);

      if (matchedExam && Array.isArray(matchedExam.questions) && matchedExam.questions.length > 0) {
        // Jangan restore jika siswa sudah dinilai / sudah ada lembar jawaban / sudah direset
        const cleanNisn = (activeSession.studentData.nisn || '').trim().toLowerCase();
        const storedSubs = getStoredSubmissions();
        const alreadySubmitted = storedSubs.some(
          (s) =>
            s.examId === matchedExam.id &&
            (s.studentNisn || '').trim().toLowerCase() === cleanNisn
        );
        if (alreadySubmitted) {
          saveStoredActiveStudentSession(null);
        } else {
          setStudentFlow({
            phase: 'exam',
            activeExam: matchedExam,
            studentData: activeSession.studentData,
            latestSubmission: null,
          });
        }
      }
    }
  }, []);

  // BroadcastChannel listener for instant cross-tab / cross-window sync
  useEffect(() => {
    let bc: BroadcastChannel | null = null;
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        bc = new BroadcastChannel(LIVE_CHANNEL_NAME);
        bc.onmessage = (event) => {
          const data = event.data;
          if (
            data &&
            (data.type === 'STUDENT_EXAM_RESET' ||
              data.type === 'MULTIPLE_EXAMS_RESET')
          ) {
            console.log('📢 BroadcastChannel: Menerima sinyal reset ujian siswa:', data);
            const currentSubs = getStoredSubmissions();
            setSubmissions(currentSubs);

            // Jika tab ini sedang menampilkan siswa yang direset, kembalikan ke login
            if (studentFlow.studentData) {
              const currentNisn = studentFlow.studentData.nisn.trim().toLowerCase();
              if (
                data.studentNisn?.trim()?.toLowerCase() === currentNisn ||
                data.type === 'MULTIPLE_EXAMS_RESET'
              ) {
                saveStoredActiveStudentSession(null);
                setStudentFlow({
                  phase: 'login',
                  activeExam: null,
                  studentData: null,
                  latestSubmission: null,
                });
              }
            }
          }
        };
      }
    } catch {}

    return () => {
      bc?.close();
    };
  }, [studentFlow.studentData]);

  // Ensure cbt-ios-fullscreen class is removed when not in exam phase
  useEffect(() => {
    if (studentFlow.phase !== 'exam') {
      document.documentElement.classList.remove('cbt-ios-fullscreen');
    }
  }, [studentFlow.phase]);

  // Connect Firebase & Real-time Firestore synchronization
  useEffect(() => {
    if (!isFirebaseConfigured()) {
      setIsCloudConnected(false);
      return;
    }

    // Seed dummy data once ONLY if freshly created database
    seedInitialFirestoreDataIfEmpty().then((seeded) => {
      if (seeded) setIsCloudConnected(true);
    });

    // Realtime Subscriptions directly from Firestore
    const unsubExams = subscribeToExams(
      (remoteExams) => {
        if (remoteExams) {
          setExams(remoteExams);
          saveStoredExams(remoteExams);
          setIsCloudConnected(true);
        }
      },
      () => setIsCloudConnected(false)
    );

    // 1. Subscribe to Exam Resets from Firestore
    const unsubResets = subscribeToExamResets((resetsData) => {
      if (resetsData) {
        if (Array.isArray(resetsData.deletedSubmissionIds)) {
          saveStoredDeletedSubmissionIds(resetsData.deletedSubmissionIds);
        }
        if (resetsData.resetStudentAttempts) {
          saveStoredResetStudentAttempts(resetsData.resetStudentAttempts);
        }

        // Segera bersihkan submissions lokal
        const localStored = getStoredSubmissions();
        setSubmissions(localStored);

        // Jika siswa di browser ini adalah yang direset, bersihkan active session & progress
        const activeSess = getStoredActiveStudentSession();
        if (activeSess?.studentData) {
          const sNisn = activeSess.studentData.nisn.trim().toLowerCase();
          const sExamId = (activeSess.exam?.id || '').trim();
          const sNormExamId = sExamId.replace('exam-ct-informatika-30', 'exam-ct-inf-x-30');
          if (
            resetsData.resetStudentAttempts?.[`${sNisn}_${sExamId}`] ||
            resetsData.resetStudentAttempts?.[`${sNisn}_${sNormExamId}`]
          ) {
            saveStoredActiveStudentSession(null);
            clearStoredExamProgress(sExamId, sNisn);
            clearStoredExamProgress(sNormExamId, sNisn);
            setStudentFlow({
              phase: 'login',
              activeExam: null,
              studentData: null,
              latestSubmission: null,
            });
          }
        }
      }
    });

    const unsubSubmissions = subscribeToSubmissions(
      (remoteSubmissions) => {
        if (remoteSubmissions) {
          const deletedIdSet = new Set(getStoredDeletedSubmissionIds());
          const resetAttempts = getStoredResetStudentAttempts();

          // Saring remoteSubmissions agar TIDAK menyertakan dokumen yang telah dihapus atau siswa yang direset
          const validRemotes = remoteSubmissions.filter((sub) => {
            if (!sub || !sub.id) return false;
            if (deletedIdSet.has(sub.id)) return false;
            const normExamId = (sub.examId || '').replace('exam-ct-informatika-30', 'exam-ct-inf-x-30');
            const key = `${(sub.studentNisn || '').trim().toLowerCase()}_${normExamId}`;
            const resetTime = resetAttempts[key];
            if (resetTime && sub.submittedAt && new Date(sub.submittedAt) <= new Date(resetTime)) {
              return false;
            }
            return true;
          });

          // Auto-Recovery: Hanya pulihkan data submission lokal offline yang SAH
          // (TIDAK BOLEH memulihkan submission yang sengaja dihapus atau direset oleh Admin!)
          const localStored = getStoredSubmissions();
          const remoteIdSet = new Set(validRemotes.map((s) => s.id));
          const missingLocals = localStored.filter((localSub) => {
            if (!localSub || !localSub.id) return false;
            if (remoteIdSet.has(localSub.id)) return false;
            if (localSub.id.startsWith('sub-mpk-')) return false; // dummy bawaan
            if (deletedIdSet.has(localSub.id)) return false; // dihapus admin
            const normExamId = (localSub.examId || '').replace('exam-ct-informatika-30', 'exam-ct-inf-x-30');
            const key = `${(localSub.studentNisn || '').trim().toLowerCase()}_${normExamId}`;
            const resetTime = resetAttempts[key];
            if (resetTime && localSub.submittedAt && new Date(localSub.submittedAt) <= new Date(resetTime)) {
              return false; // direset admin
            }
            return true;
          });

          // Jika ada lembar jawaban siswa di HP/perangkat yang belum ada di Cloud, otomatis re-upload ke Cloud Firestore!
          if (missingLocals.length > 0) {
            console.log(`🔄 Auto-Recovery: Mengunggah ulang ${missingLocals.length} riwayat siswa offline dari perangkat ke Cloud Firestore...`);
            missingLocals.forEach((sub) => {
              saveSubmissionToFirestore(sub).catch(console.warn);
            });
          }

          const merged = [...validRemotes];
          missingLocals.forEach((sub) => {
            if (!merged.some((m) => m.id === sub.id)) {
              merged.push(sub);
            }
          });
          merged.sort((a, b) => new Date(b.submittedAt || '').getTime() - new Date(a.submittedAt || '').getTime());

          // Deduplikasi: Jika seorang siswa memiliki riwayat ganda untuk paket ujian yang sama, pertahankan yang terbaik / terbaru
          const deduplicated: StudentExamSubmission[] = [];
          const seenKeys = new Set<string>();
          for (const sub of merged) {
            const normExamId = (sub.examId || '').replace('exam-ct-informatika-30', 'exam-ct-inf-x-30');
            const key = `${(sub.studentNisn || '').trim().toLowerCase()}_${normExamId}`;
            if (!seenKeys.has(key)) {
              seenKeys.add(key);
              deduplicated.push(sub);
            }
          }

          setSubmissions(deduplicated);
          saveStoredSubmissions(deduplicated);
          setIsCloudConnected(true);
        }
      },
      () => setIsCloudConnected(false)
    );

    const unsubStudents = subscribeToStudents(
      (remoteStudents) => {
        if (remoteStudents) {
          // Pertahankan siswa terdaftar lokal/initial jika belum tercatat di Firestore
          const remoteNisnSet = new Set(remoteStudents.map((s) => s.nisn));
          const missingLocals = INITIAL_STUDENTS.filter((s) => !remoteNisnSet.has(s.nisn));
          const mergedStudents = missingLocals.length > 0 ? [...remoteStudents, ...missingLocals] : remoteStudents;

          setStudents(mergedStudents);
          saveStoredStudents(mergedStudents);
          setIsCloudConnected(true);
        }
      },
      () => setIsCloudConnected(false)
    );

    const unsubAdminAccounts = subscribeToAdminAccounts(
      (remoteAccounts) => {
        if (remoteAccounts) {
          setAdminAccounts(remoteAccounts);
          saveStoredAdminAccounts(remoteAccounts);
          setIsCloudConnected(true);
        }
      },
      () => setIsCloudConnected(false)
    );

    const unsubSettings = subscribeToSettings(({ enforceWhitelist: remoteEnforce }) => {
      setEnforceWhitelist(remoteEnforce);
      saveStoredEnforceWhitelist(remoteEnforce);
      setIsCloudConnected(true);
    });

    return () => {
      unsubExams?.();
      unsubResets?.();
      unsubSubmissions?.();
      unsubStudents?.();
      unsubAdminAccounts?.();
      unsubSettings?.();
    };
  }, []);

  const handleUpdateExams = async (updated: Exam[]) => {
    setExams(updated);
    saveStoredExams(updated);
    await syncAllExamsToFirestore(updated);
  };

  const handleUpdateSubmissions = async (updated: StudentExamSubmission[]) => {
    setSubmissions(updated);
    saveStoredSubmissions(updated);
    await syncAllSubmissionsToFirestore(updated);
  };

  // Reset pengerjaan siswa & hapus riwayat secara permanen (menjamin siswa bisa login & mulai ujian lagi)
  const handleResetStudentSubmission = async (targetSubmission: StudentExamSubmission) => {
    // 1. Simpan reset di local storage & bersihkan progress
    recordLocalStudentExamReset(
      targetSubmission.studentNisn,
      targetSubmission.examId,
      targetSubmission.id
    );

    // 2. Perbarui state submissions secara instan
    const updated = submissions.filter((s) => s.id !== targetSubmission.id);
    setSubmissions(updated);
    saveStoredSubmissions(updated);

    // 3. Hapus dan sinkronkan ke Cloud Firestore
    await resetStudentExamInFirestore(
      targetSubmission.id,
      targetSubmission.studentNisn,
      targetSubmission.examId
    );
  };

  // Hapus massal beberapa riwayat siswa terpilih
  const handleDeleteMultipleSubmissions = async (toDelete: StudentExamSubmission[]) => {
    if (!toDelete || toDelete.length === 0) return;
    const deleteIdSet = new Set(toDelete.map((s) => s.id));

    toDelete.forEach((s) => {
      recordLocalStudentExamReset(s.studentNisn, s.examId, s.id);
    });

    const updated = submissions.filter((s) => !deleteIdSet.has(s.id));
    setSubmissions(updated);
    saveStoredSubmissions(updated);

    await deleteMultipleSubmissionsFromFirestore(toDelete);
  };

  // Hapus seluruh data riwayat siswa
  const handleClearAllSubmissions = async () => {
    submissions.forEach((s) => {
      recordLocalStudentExamReset(s.studentNisn, s.examId, s.id);
    });
    setSubmissions([]);
    saveStoredSubmissions([]);
    await clearAllSubmissionsFromFirestore(submissions);
  };

  const handleUpdateStudents = async (updated: RegisteredStudent[]) => {
    setStudents(updated);
    saveStoredStudents(updated);
    await syncAllStudentsToFirestore(updated);
  };

  const handleUpdateAdminAccounts = async (updated: AdminAccount[]) => {
    setAdminAccounts(updated);
    saveStoredAdminAccounts(updated);
    await syncAllAdminAccountsToFirestore(updated);

    // If current logged-in user was updated
    if (currentAdmin) {
      const updatedSelf = updated.find((a) => a.id === currentAdmin.id);
      if (updatedSelf) {
        setCurrentAdmin(updatedSelf);
        saveCurrentAdminSession(updatedSelf);
      }
    }
  };

  const handleToggleEnforceWhitelist = async (enforce: boolean) => {
    setEnforceWhitelist(enforce);
    saveStoredEnforceWhitelist(enforce);
    await saveSettingsToFirestore({ enforceWhitelist: enforce });
  };

  const handleAdminLoginSuccess = (account: AdminAccount) => {
    setCurrentAdmin(account);
    saveCurrentAdminSession(account);
    saveStoredActiveRole('admin');
    setRole('admin');
  };

  const handleLogoutAdmin = () => {
    setCurrentAdmin(null);
    saveCurrentAdminSession(null);
    saveStoredActiveRole('student');
    saveStoredAdminActiveTab(null);
    try {
      if (typeof window !== 'undefined' && window.location.hash) {
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      }
    } catch {
      // ignore
    }
    setRole('student');
    handleBackToStudentHome();
  };

  // Global hook if user asks to restore exams from local storage
  useEffect(() => {
    (window as any).restoreExamsFromLocalStorage = async () => {
      const restored = restoreExamsFromLocalStorage();
      setExams(restored);
      saveStoredExams(restored);
      await syncAllExamsToFirestore(restored);
      console.log('✅ Paket ujian berhasil dipulihkan dari penyimpanan lokal!');
      return restored;
    };
  }, []);

  // Student Starts Exam
  const handleStartExam = (
    exam: Exam,
    studentData: { name: string; nisn: string; studentClass: string }
  ) => {
    // Validasi 1x pengerjaan jika paket ujian membatasi tidak bisa mengerjakan 2x
    if (exam.disallowMultipleAttempts !== false) {
      const cleanStudentNisn = studentData.nisn.trim().toLowerCase();
      const alreadySubmitted = submissions.some(
        (s) =>
          s.examId === exam.id &&
          s.studentNisn.trim().toLowerCase() === cleanStudentNisn
      );
      if (alreadySubmitted) {
        alert(
          `Pemberitahuan CBT: Siswa dengan NISN ${studentData.nisn} (${studentData.name}) sudah pernah mengerjakan paket ujian ini. Paket ujian diatur hanya untuk 1 kali pengerjaan.`
        );
        return;
      }
    }

    // Bersihkan progress ujian lama agar siswa mulai dari awal dengan timer penuh & soal bersih
    clearStoredExamProgress(exam.id, studentData.nisn);
    const normExamId = exam.id.replace('exam-ct-informatika-30', 'exam-ct-inf-x-30');
    clearStoredExamProgress(normExamId, studentData.nisn);

    saveStoredActiveStudentSession({
      exam,
      studentData,
      startedAt: new Date().toISOString(),
    });

    setStudentFlow({
      phase: 'exam',
      activeExam: exam,
      studentData,
      latestSubmission: null,
    });
  };

  // Student Submits Exam
  const handleExamSubmit = async (submission: StudentExamSubmission) => {
    saveStoredActiveStudentSession(null);

    // 1. Save to localStorage
    addStudentSubmission(submission);
    
    // 2. Save directly to Cloud Firestore in real-time
    await saveSubmissionToFirestore(submission);

    const updatedSubmissions = [submission, ...submissions];
    setSubmissions(updatedSubmissions);

    setStudentFlow((prev) => ({
      ...prev,
      phase: 'result',
      latestSubmission: submission,
    }));
  };

  // Student Returns to Login / Home
  const handleBackToStudentHome = () => {
    saveStoredActiveStudentSession(null);
    setStudentFlow({
      phase: 'login',
      activeExam: null,
      studentData: null,
      latestSubmission: null,
    });
  };

  const activePublicExam = exams.find((e) => e.isActive) || exams[0] || null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans text-slate-900 dark:text-slate-100 selection:bg-blue-600 selection:text-white transition-colors duration-200">
      {/* If taking exam, hide top header to maximize screen focus */}
      {studentFlow.phase !== 'exam' && (
        <Header
          currentRole={role}
          onRoleChange={(newRole) => {
            if (newRole === 'admin' && !currentAdmin) {
              setIsAdminLoginModalOpen(true);
            } else {
              setRole(newRole);
              saveStoredActiveRole(newRole);
              if (newRole === 'student') {
                handleBackToStudentHome();
              }
            }
          }}
          currentAdmin={currentAdmin}
          onOpenAdminLogin={() => setIsAdminLoginModalOpen(true)}
          onLogoutAdmin={handleLogoutAdmin}
          activeExam={activePublicExam}
          isCloudConnected={isCloudConnected}
        />
      )}

      <main className="flex-1">
        {role === 'student' ? (
          <>
            {studentFlow.phase === 'login' && (
              <StudentLogin
                exams={exams}
                submissions={submissions}
                registeredStudents={students}
                enforceWhitelist={enforceWhitelist}
                onStartExam={handleStartExam}
              />
            )}

            {studentFlow.phase === 'exam' &&
              studentFlow.activeExam &&
              studentFlow.studentData && (
                <ExamRoom
                  exam={studentFlow.activeExam}
                  studentData={studentFlow.studentData}
                  onSubmitExam={handleExamSubmit}
                  onExitExam={handleBackToStudentHome}
                />
              )}

            {studentFlow.phase === 'result' &&
              studentFlow.latestSubmission &&
              studentFlow.activeExam && (
                <ExamResultReport
                  submission={studentFlow.latestSubmission}
                  exam={studentFlow.activeExam}
                  onBackToHome={handleBackToStudentHome}
                />
              )}
          </>
        ) : (
          <AdminDashboard
            exams={exams}
            submissions={submissions}
            students={students}
            adminAccounts={adminAccounts}
            currentAdmin={currentAdmin}
            enforceWhitelist={enforceWhitelist}
            onUpdateExams={handleUpdateExams}
            onUpdateSubmissions={handleUpdateSubmissions}
            onResetStudentSubmission={handleResetStudentSubmission}
            onDeleteMultipleSubmissions={handleDeleteMultipleSubmissions}
            onClearAllSubmissions={handleClearAllSubmissions}
            onUpdateStudents={handleUpdateStudents}
            onUpdateAdminAccounts={handleUpdateAdminAccounts}
            onToggleEnforceWhitelist={handleToggleEnforceWhitelist}
            onLogoutAdmin={handleLogoutAdmin}
          />
        )}
      </main>

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={isAdminLoginModalOpen}
        onClose={() => setIsAdminLoginModalOpen(false)}
        adminAccounts={adminAccounts}
        onLoginSuccess={handleAdminLoginSuccess}
      />

      {/* Minimal Footer */}
      {studentFlow.phase !== 'exam' && (
        <footer className="print:hidden text-center text-slate-400 dark:text-slate-500 text-xs py-3 border-t border-slate-200/60 dark:border-slate-800/80">
          <p>&copy; {new Date().getFullYear()} SMAN 1 Batu &bull; CBT Portal</p>
        </footer>
      )}
    </div>
  );
}
