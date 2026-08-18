import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { StudentLogin } from './components/student/StudentLogin';
import { ExamRoom } from './components/student/ExamRoom';
import { ExamResultReport } from './components/student/ExamResultReport';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminLoginModal } from './components/admin/AdminLoginModal';
import { AdminAccount, Exam, RegisteredStudent, StudentExamSubmission, UserRole } from './types';
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

  // Load initial data from localStorage
  useEffect(() => {
    const loadedExams = getStoredExams();
    const loadedSubmissions = getStoredSubmissions();
    const loadedStudents = getStoredStudents();
    const loadedAccounts = getStoredAdminAccounts();
    const loadedSession = getCurrentAdminSession();
    const loadedEnforce = getStoredEnforceWhitelist();

    setExams(loadedExams);
    setSubmissions(loadedSubmissions);
    setStudents(loadedStudents);
    setAdminAccounts(loadedAccounts);
    setCurrentAdmin(loadedSession);
    setEnforceWhitelist(loadedEnforce);
  }, []);

  const handleUpdateExams = (updated: Exam[]) => {
    setExams(updated);
    saveStoredExams(updated);
  };

  const handleUpdateSubmissions = (updated: StudentExamSubmission[]) => {
    setSubmissions(updated);
    saveStoredSubmissions(updated);
  };

  const handleUpdateStudents = (updated: RegisteredStudent[]) => {
    setStudents(updated);
    saveStoredStudents(updated);
  };

  const handleUpdateAdminAccounts = (updated: AdminAccount[]) => {
    setAdminAccounts(updated);
    saveStoredAdminAccounts(updated);
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
    if (confirm('Reset ulang data ujian, siswa, akun & nilai ke pengaturan awal contoh SMAN 1 Batu?')) {
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
    addStudentSubmission(submission);
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
            <p className="font-semibold text-slate-700">
              &copy; {new Date().getFullYear()} CBT SMAN 1 Batu &bull; Sistem Asesmen Nilai Pilihan Ganda
            </p>
            <p className="text-[11px] text-slate-400">
              SMAN 1 Batu &bull; Terverifikasi
            </p>
          </div>
        </footer>
      )}
    </div>
  );
}
