const fs = require('fs');

const x1Json = fs.readFileSync('scripts/formatted_students_x1.json', 'utf8');
let file = fs.readFileSync('src/data/ctInformatikaExamData.ts', 'utf8');

const x1Block = `/**
 * Siswa Kelas X-1 (36 Siswa)
 * Berpikir Komputasional SMAN 1 Batu
 */
export const STUDENTS_KELAS_X_1: RegisteredStudent[] = ${x1Json};

`;

// Insert STUDENTS_KELAS_X_1 right before STUDENTS_KELAS_X_2
file = file.replace(
  'export const STUDENTS_KELAS_X_2: RegisteredStudent[] = [',
  x1Block + 'export const STUDENTS_KELAS_X_2: RegisteredStudent[] = ['
);

// Update STUDENTS_KELAS_X comment and array
file = file.replace(
  `/**
 * Siswa Representatif Kelas X (Kelas X-2 & X-5: Total 72 Siswa)
 * Mata Pelajaran Informatika - Berpikir Komputasional SMAN 1 Batu
 */
export const STUDENTS_KELAS_X: RegisteredStudent[] = [
  ...STUDENTS_KELAS_X_2,
  ...STUDENTS_KELAS_X_5,
];`,
  `/**
 * Siswa Representatif Kelas X (Kelas X-1, X-2 & X-5: Total 108 Siswa)
 * Mata Pelajaran Informatika - Berpikir Komputasional SMAN 1 Batu
 */
export const STUDENTS_KELAS_X: RegisteredStudent[] = [
  ...STUDENTS_KELAS_X_1,
  ...STUDENTS_KELAS_X_2,
  ...STUDENTS_KELAS_X_5,
];`
);

fs.writeFileSync('src/data/ctInformatikaExamData.ts', file, 'utf8');
console.log('Successfully added STUDENTS_KELAS_X_1 to src/data/ctInformatikaExamData.ts');
