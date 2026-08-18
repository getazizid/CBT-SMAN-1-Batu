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
  getStoredAdminAccounts,
  getStoredEnforceWhitelist,
  getStoredExams,
  getStoredStudents,
  getStoredSubmissions,
  resetToInitialDemoData,
  saveCurrentAdminSession,
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
  }, []);

  // Connect Firebase & Real-time Firestore synchronization
  useEffect(() => {
    if (!isFirebaseConfigured()) {
      setIsCloudConnected(false);
      return;
    }

    // Seed dummy data if Firestore is freshly created and empty
    seedInitialFirestoreDataIfEmpty().then((seeded) => {
      if (seeded) setIsCloudConnected(true);
    });

    // Realtime Subscriptions
    const unsubExams = subscribeToExams(
      (remoteExams) => {
        if (remoteExams && remoteExams.length > 0) {
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
        if (remoteStudents && remoteStudents.length > 0) {
          setStudents(remoteStudents);
          saveStoredStudents(remoteStudents);
          setIsCloudConnected(true);
        }
      },
      () => setIsCloudConnected(false)
    );

    const unsubAdminAccounts = subscribeToAdminAccounts(
      (remoteAccounts) => {
        if (remoteAccounts && remoteAccounts.length > 0) {
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

  const handleUpdateExams = (updated: Exam[]) => {
    setExams(updated);
    saveStoredExams(updated);
    syncAllExamsToFirestore(updated);
  };

  const handleUpdateSubmissions = (updated: StudentExamSubmission[]) => {
    setSubmissions(updated);
    saveStoredSubmissions(updated);
    syncAllSubmissionsToFirestore(updated);
  };

  const handleUpdateStudents = (updated: RegisteredStudent[]) => {
    setStudents(updated);
    saveStoredStudents(updated);
    syncAllStudentsToFirestore(updated);
  };

  const handleUpdateAdminAccounts = (updated: AdminAccount[]) => {
    setAdminAccounts(updated);
    saveStoredAdminAccounts(updated);
    syncAllAdminAccountsToFirestore(updated);

    // If current logged-in user was updated
    if (currentAdmin) {
      const updatedSelf = updated.find((a) => a.id === currentAdmin.id);
      if (updatedSelf) {
        setCurrentAdmin(updatedSelf);
        saveCurrentAdminSession(updatedSelf);
      }
    }
  };

  const handleToggleEnforceWhitelist = (enforce: boolean) => {
    setEnforceWhitelist(enforce);
    saveStoredEnforceWhitelist(enforce);
    saveSettingsToFirestore({ enforceWhitelist: enforce });
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

  const handleResetDemoData = () => {
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
      syncAllExamsToFirestore(reset.exams);
      syncAllSubmissionsToFirestore(reset.submissions);
      syncAllStudentsToFirestore(reset.students);
      syncAllAdminAccountsToFirestore(reset.adminAccounts);
      saveSettingsToFirestore({ enforceWhitelist: true });
    }
  };

  // Student Starts Exam
  const handleStartExam = (
    exam: Exam,
    studentData: { name: string; nisn: string; studentClass: string }
  ) => {
    setStudentFlow({
      phase: 'exam',
      activeExam: exam,
      studentData,
      latestSubmission: null,
    });
  };

  // Student Submits Exam
  const handleExamSubmit = (submission: StudentExamSubmission) => {
    // 1. Save to localStorage
    addStudentSubmission(submission);
    
    // 2. Save directly to Cloud Firestore in real-time
    saveSubmissionToFirestore(submission);

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
    setStudentFlow({
      phase: 'login',
      activeExam: null,
      studentData: null,
      latestSubmission: null,
    });
  };

  const activePublicExam = exams.find((e) => e.isActive) || exams[0] || null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-blue-600 selection:text-white">
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
        <footer className="print:hidden bg-white text-slate-500 text-xs py-4 border-t border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-3 text-center sm:text-left">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-slate-700">
                &copy; {new Date().getFullYear()} CBT SMAN 1 Batu &bull; Created by TIM IT SMAN 1 Batu
              </p>
            </div>
            <div className="flex items-center gap-2 text-[11px]">
              {isCloudConnected ? (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Firebase Cloud Terhubung
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  Penyimpanan Lokal (Offline)
                </span>
              )}
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
