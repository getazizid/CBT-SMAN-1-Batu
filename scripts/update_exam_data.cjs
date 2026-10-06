const fs = require('fs');

const x5Json = fs.readFileSync('scripts/formatted_students_x5.json', 'utf8');
const file = fs.readFileSync('src/data/ctInformatikaExamData.ts', 'utf8');

// Replace 'export const STUDENTS_KELAS_X: RegisteredStudent[] = ['
// with 'export const STUDENTS_KELAS_X_2: RegisteredStudent[] = ['
let updated = file.replace(
  'export const STUDENTS_KELAS_X: RegisteredStudent[] = [',
  'export const STUDENTS_KELAS_X_2: RegisteredStudent[] = ['
);

const x5Block = `
/**
 * Siswa Kelas X-5 (36 Siswa)
 * Berpikir Komputasional SMAN 1 Batu
 */
export const STUDENTS_KELAS_X_5: RegisteredStudent[] = ${x5Json};

/**
 * Siswa Representatif Kelas X (Kelas X-2 & X-5: Total 72 Siswa)
 * Mata Pelajaran Informatika - Berpikir Komputasional SMAN 1 Batu
 */
export const STUDENTS_KELAS_X: RegisteredStudent[] = [
  ...STUDENTS_KELAS_X_2,
  ...STUDENTS_KELAS_X_5,
];
`;

// Insert after the end of STUDENTS_KELAS_X_2 (before CT_INFORMATIKA_30_EXAM)
// Handle both CRLF and LF line endings
if (updated.includes('  }\r\n];\r\n\r\n/**\r\n * Paket Ujian 30 Soal HOTS')) {
  updated = updated.replace(
    '  }\r\n];\r\n\r\n/**\r\n * Paket Ujian 30 Soal HOTS',
    '  }\r\n];\r\n' + x5Block + '\r\n/**\r\n * Paket Ujian 30 Soal HOTS'
  );
} else {
  updated = updated.replace(
    '  }\n];\n\n/**\n * Paket Ujian 30 Soal HOTS',
    '  }\n];\n' + x5Block + '\n/**\n * Paket Ujian 30 Soal HOTS'
  );
}

fs.writeFileSync('src/data/ctInformatikaExamData.ts', updated, 'utf8');
console.log('Successfully updated src/data/ctInformatikaExamData.ts');
