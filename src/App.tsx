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
  seedInitialFirestoreDataIfEmpty,
  subscribeToExams,
  subscribeToSubmissions,
  subscribeToStudents,
  subscribeToAdminAccounts,
  subscribeToSettings,
  syncAllExamsToFirestore,
  syncAllSubmissionsToFirestore,
  syncAllStudentsToFirestore,
  syncAllAdminAccountsToFirestore,
  saveSubmissionToFirestore,
  saveSettingsToFirestore,
} from './utils/firebaseService';
import {
  addStudentSubmission,
  getCurrentAdminSession,
  getStoredActiveStudentSession,
  getStoredAdminAccounts,
  getStoredEnforceWhitelist,
  getStoredExams,
  getStoredStudents,
  getStoredSubmissions,
  resetToInitialDemoData,
  saveCurrentAdminSession,
  saveStoredActiveStudentSession,
  saveStoredAdminAccounts,
  saveStoredEnforceWhitelist,
  saveStoredExams,
  saveStoredStudents,
  saveStoredSubmissions,
} from './utils/storage';

export default function App() {
  const [role, setRole] = useState<UserRole>('student');
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
    setCurrentAdmin(getCurrentAdminSession());
    setEnforceWhitelist(getStoredEnforceWhitelist());

    // Restore student exam session if interrupted
    const activeSession = getStoredActiveStudentSession();
    if (activeSession && activeSession.exam && activeSession.studentData) {
      setStudentFlow({
        phase: 'exam',
        activeExam: activeSession.exam,
        studentData: activeSession.studentData,
        latestSubmission: null,
      });
    }
  }, []);

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

    const unsubSubmissions = subscribeToSubmissions(
      (remoteSubmissions) => {
        if (remoteSubmissions) {
          setSubmissions(remoteSubmissions);
          saveStoredSubmissions(remoteSubmissions);
          setIsCloudConnected(true);
        }
      },
      () => setIsCloudConnected(false)
    );

    const unsubStudents = subscribeToStudents(
      (remoteStudents) => {
        if (remoteStudents) {
          setStudents(remoteStudents);
          saveStoredStudents(remoteStudents);
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
    setRole('admin');
  };

  const handleLogoutAdmin = () => {
    setCurrentAdmin(null);
    saveCurrentAdminSession(null);
    setRole('student');
    handleBackToStudentHome();
  };

  const handleResetDemoData = async () => {
    if (confirm('Reset ulang data ujian, siswa, akun & nilai ke pengaturan awal contoh SMAN 1 Batu? (Data di Cloud Firestore juga akan disinkronkan)')) {
      const reset = resetToInitialDemoData();
      setExams(reset.exams);
      setSubmissions(reset.submissions);
      setStudents(reset.students);
      setAdminAccounts(reset.adminAccounts);
      setEnforceWhitelist(true);
      setCurrentAdmin(null);
      saveCurrentAdminSession(null);
      setRole('student');
      setStudentFlow({
        phase: 'login',
        activeExam: null,
        studentData: null,
        latestSubmission: null,
      });

      // Sync reset to Firestore
      await syncAllExamsToFirestore(reset.exams);
      await syncAllSubmissionsToFirestore(reset.submissions);
      await syncAllStudentsToFirestore(reset.students);
      await syncAllAdminAccountsToFirestore(reset.adminAccounts);
      await saveSettingsToFirestore({ enforceWhitelist: true });
    }
  };

  // Student Starts Exam
  const handleStartExam = (
    exam: Exam,
    studentData: { name: string; nisn: string; studentClass: string }
  ) => {
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
              if (newRole === 'student') {
                handleBackToStudentHome();
              }
            }
          }}
          currentAdmin={currentAdmin}
          onOpenAdminLogin={() => setIsAdminLoginModalOpen(true)}
          onLogoutAdmin={handleLogoutAdmin}
          activeExam={activePublicExam}
          onResetDemo={handleResetDemoData}
          isCloudConnected={isCloudConnected}
        />
      )}

      <main className="flex-1">
        {role === 'student' ? (
          <>
            {studentFlow.phase === 'login' && (
              <StudentLogin
                exams={exams}
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

      {/* Simplified Concise Footer (hidden during active exam and print) */}
      {studentFlow.phase !== 'exam' && (
        <footer className="print:hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm text-slate-500 dark:text-slate-400 text-xs py-4 border-t border-slate-200/80 dark:border-slate-800 transition-colors duration-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
            <p className="font-semibold text-slate-700 dark:text-slate-300">
              &copy; {new Date().getFullYear()} CBT SMAN 1 Batu &bull; Created by TIM IT SMAN 1 Batu
            </p>
            <div className="flex items-center gap-3 text-[11px] text-slate-400 dark:text-slate-500">
              <span>Aplikasi Ujian Berstandar</span>
              <span>&bull;</span>
              <span className="text-blue-600 dark:text-blue-400 font-medium">v2.5 Modern</span>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
