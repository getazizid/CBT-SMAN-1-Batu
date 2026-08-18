/**
 * Canonical Class / Rombel options for SMAN 1 Batu
 * X-1 to X-12 (12 classes)
 * XI-1 to XI-12 (12 classes)
 * XII-1 to XII-12 (12 classes)
 * Total: 36 Classes
 */

export const KELAS_X_OPTIONS = [
  'X-1', 'X-2', 'X-3', 'X-4', 'X-5', 'X-6', 'X-7', 'X-8', 'X-9', 'X-10', 'X-11', 'X-12'
];

export const KELAS_XI_OPTIONS = [
  'XI-1', 'XI-2', 'XI-3', 'XI-4', 'XI-5', 'XI-6', 'XI-7', 'XI-8', 'XI-9', 'XI-10', 'XI-11', 'XI-12'
];

export const KELAS_XII_OPTIONS = [
  'XII-1', 'XII-2', 'XII-3', 'XII-4', 'XII-5', 'XII-6', 'XII-7', 'XII-8', 'XII-9', 'XII-10', 'XII-11', 'XII-12'
];

export const ALL_SCHOOL_CLASSES = [
  ...KELAS_X_OPTIONS,
  ...KELAS_XI_OPTIONS,
  ...KELAS_XII_OPTIONS,
];

/**
 * Natural sorting function for class names (X-1..X-12, XI-1..XI-12, XII-1..XII-12)
 */
export const sortClassList = (classes: string[]): string[] => {
  return [...classes].sort((a, b) => {
    const idxA = ALL_SCHOOL_CLASSES.indexOf(a.trim());
    const idxB = ALL_SCHOOL_CLASSES.indexOf(b.trim());
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
  });
};

/**
 * Parse target classes string into an array of classes
 */
export const parseTargetClasses = (gradeClassStr?: string): string[] => {
  if (!gradeClassStr || !gradeClassStr.trim()) return [...ALL_SCHOOL_CLASSES];
  const str = gradeClassStr.trim();
  if (str.toLowerCase().includes('semua kelas')) {
    return [...ALL_SCHOOL_CLASSES];
  }
  const parts = str.split(',').map((p) => p.trim()).filter(Boolean);
  return parts.length > 0 ? parts : [...ALL_SCHOOL_CLASSES];
};

/**
 * Check if a student's class matches the exam target classes
 */
export const isStudentClassEligible = (studentClass: string, examGradeClass?: string): boolean => {
  if (!examGradeClass || !examGradeClass.trim()) return true;
  const str = examGradeClass.trim();
  if (str.toLowerCase().includes('semua kelas') || str.toLowerCase().includes('calon pengurus')) {
    return true;
  }
  const targets = parseTargetClasses(examGradeClass);
  return targets.some((t) => t.toLowerCase() === studentClass.trim().toLowerCase());
};
