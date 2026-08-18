import * as XLSX from 'xlsx';
import { Exam, ExamStatistics, OptionKey, StudentExamSubmission } from '../types';

/**
 * Calculates detailed statistics for an exam based on submissions
 */
export const calculateExamStatistics = (
  exam: Exam,
  submissions: StudentExamSubmission[]
): ExamStatistics => {
  const relevantSubmissions = submissions.filter((s) => s.examId === exam.id);

  if (relevantSubmissions.length === 0) {
    return {
      examId: exam.id,
      totalSubmissions: 0,
      averageScore: 0,
      highestScore: 0,
      lowestScore: 0,
      passCount: 0,
      failCount: 0,
      passPercentage: 0,
      gradeDistribution: { A: 0, B: 0, C: 0, D: 0, E: 0 },
      itemAnalysis: exam.questions.map((q) => ({
        questionNumber: q.number,
        questionText: q.text,
        averageScore: 0,
        maxPossible: Math.max(...(Object.values(q.optionScores) as number[])),
        difficultyRate: 'Sedang',
        optionDistribution: { A: 0, B: 0, C: 0, D: 0, E: 0 },
      })),
    };
  }

  const scores = relevantSubmissions.map((s) => s.finalScoreScale100);
  const total = scores.reduce((a, b) => a + b, 0);
  const avg = Math.round((total / scores.length) * 10) / 10;
  const max = Math.max(...scores);
  const min = Math.min(...scores);

  let passCount = 0;
  const gradeDistribution = { A: 0, B: 0, C: 0, D: 0, E: 0 };

  relevantSubmissions.forEach((s) => {
    if (s.isPassed || s.finalScoreScale100 >= exam.passingGrade) {
      passCount++;
    }
    const sc = s.finalScoreScale100;
    if (sc >= 85) gradeDistribution.A++;
    else if (sc >= 75) gradeDistribution.B++;
    else if (sc >= 60) gradeDistribution.C++;
    else if (sc >= 50) gradeDistribution.D++;
    else gradeDistribution.E++;
  });

  // Calculate Item Analysis (Analisis Butir Soal & Daya Beda)
  const itemAnalysis = exam.questions.map((q) => {
    let qTotalScore = 0;
    const optionCount: Record<OptionKey, number> = { A: 0, B: 0, C: 0, D: 0, E: 0 };

    relevantSubmissions.forEach((sub) => {
      const selected = sub.answers[q.number];
      if (selected && ['A', 'B', 'C', 'D', 'E'].includes(selected)) {
        optionCount[selected]++;
        const score = q.optionScores[selected] ?? 0;
        qTotalScore += score;
      }
    });

    const maxPoss = Math.max(...(Object.values(q.optionScores) as number[])) || 10;
    const qAvg = relevantSubmissions.length > 0 ? qTotalScore / relevantSubmissions.length : 0;
    const percentageOfMax = maxPoss > 0 ? (qAvg / maxPoss) * 100 : 0;

    let difficultyRate: 'Mudah' | 'Sedang' | 'Sukar' = 'Sedang';
    if (percentageOfMax >= 80) difficultyRate = 'Mudah';
    else if (percentageOfMax < 50) difficultyRate = 'Sukar';

    return {
      questionNumber: q.number,
      questionText: q.text,
      averageScore: Math.round(qAvg * 10) / 10,
      maxPossible: maxPoss,
      difficultyRate,
      optionDistribution: optionCount,
    };
  });

  return {
    examId: exam.id,
    totalSubmissions: relevantSubmissions.length,
    averageScore: avg,
    highestScore: max,
    lowestScore: min,
    passCount,
    failCount: relevantSubmissions.length - passCount,
    passPercentage: Math.round((passCount / relevantSubmissions.length) * 100),
    gradeDistribution,
    itemAnalysis,
  };
};

/**
 * Export exam results to an Excel Spreadsheet (.xlsx)
 */
export const exportExamResultsToExcel = (
  exam: Exam,
  submissions: StudentExamSubmission[]
) => {
  const relevant = submissions.filter((s) => s.examId === exam.id);

  // Sheet 1: Rekap Nilai Siswa
  const studentRows = relevant.map((s, index) => {
    const row: Record<string, any> = {
      'No': index + 1,
      'Nama Siswa': s.studentName,
      'NISN': s.studentNisn,
      'Kelas': s.studentClass,
      'Nilai Akhir (0-100)': s.finalScoreScale100,
      'Total Poin': s.totalScoreEarned,
      'Maks Poin': s.maxPossibleScore,
      'Status KKM': s.isPassed ? 'TUNTAS (LULUS)' : 'REMEDIAL',
      'Pelanggaran Tab': s.tabSwitchCount,
      'Waktu Pengerjaan (Menit)': Math.round(s.durationSecondsUsed / 60),
      'Waktu Submit': new Date(s.submittedAt).toLocaleString('id-ID'),
    };

    // Add per-question score columns
    exam.questions.forEach((q) => {
      const selected = s.answers[q.number] || '-';
      const earned = selected !== '-' ? (q.optionScores[selected as OptionKey] ?? 0) : 0;
      row[`Soal ${q.number} (Opsi/Poin)`] = `${selected} (${earned}p)`;
    });

    return row;
  });

  // Sheet 2: Analisis Butir Soal
  const stats = calculateExamStatistics(exam, submissions);
  const itemAnalysisRows = stats.itemAnalysis.map((item) => ({
    'No Soal': item.questionNumber,
    'Tingkat Kesukaran': item.difficultyRate,
    'Rata-rata Skor': item.averageScore,
    'Skor Maksimal': item.maxPossible,
    'Peminat Opsi A': item.optionDistribution.A,
    'Peminat Opsi B': item.optionDistribution.B,
    'Peminat Opsi C': item.optionDistribution.C,
    'Peminat Opsi D': item.optionDistribution.D,
    'Peminat Opsi E': item.optionDistribution.E,
    'Potongan Soal': item.questionText.substring(0, 120) + (item.questionText.length > 120 ? '...' : ''),
  }));

  const wb = XLSX.utils.book_new();
  const wsStudents = XLSX.utils.json_to_sheet(studentRows);
  const wsAnalysis = XLSX.utils.json_to_sheet(itemAnalysisRows);

  XLSX.utils.book_append_sheet(wb, wsStudents, 'Rekapitulasi Siswa');
  XLSX.utils.book_append_sheet(wb, wsAnalysis, 'Analisis Butir Soal');

  const fileName = `HASIL_CBT_SMAN1BATU_${exam.subject.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.xlsx`;
  XLSX.writeFile(wb, fileName);
};

/**
 * Printable student report card generator trigger
 */
export const triggerPrintStudentReport = () => {
  window.print();
};
