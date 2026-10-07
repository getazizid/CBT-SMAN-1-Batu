const fs = require('fs');

const x4Json = fs.readFileSync('scripts/formatted_students_x4.json', 'utf8');
let file = fs.readFileSync('src/data/ctInformatikaExamData.ts', 'utf8');

const x4Block = `/**
 * Siswa Kelas X-4 (36 Siswa)
 * Berpikir Komputasional SMAN 1 Batu
 */
export const STUDENTS_KELAS_X_4: RegisteredStudent[] = ${x4Json};

`;

// Insert STUDENTS_KELAS_X_4 right before STUDENTS_KELAS_X_5
file = file.replace(
  '/**\r\n * Siswa Kelas X-5 (36 Siswa)\r\n * Berpikir Komputasional SMAN 1 Batu\r\n */\r\nexport const STUDENTS_KELAS_X_5: RegisteredStudent[] = [',
  x4Block + '/**\r\n * Siswa Kelas X-5 (36 Siswa)\r\n * Berpikir Komputasional SMAN 1 Batu\r\n */\r\nexport const STUDENTS_KELAS_X_5: RegisteredStudent[] = ['
);

// If not replaced due to LF line endings:
if (!file.includes('STUDENTS_KELAS_X_4')) {
  file = file.replace(
    '/**\n * Siswa Kelas X-5 (36 Siswa)\n * Berpikir Komputasional SMAN 1 Batu\n */\nexport const STUDENTS_KELAS_X_5: RegisteredStudent[] = [',
    x4Block + '/**\n * Siswa Kelas X-5 (36 Siswa)\n * Berpikir Komputasional SMAN 1 Batu\n */\nexport const STUDENTS_KELAS_X_5: RegisteredStudent[] = ['
  );
}

// Update STUDENTS_KELAS_X comment and array
const oldExportCRLF = `/**\r\n * Siswa Representatif Kelas X (Kelas X-1, X-2 & X-5: Total 108 Siswa)\r\n * Mata Pelajaran Informatika - Berpikir Komputasional SMAN 1 Batu\r\n */\r\nexport const STUDENTS_KELAS_X: RegisteredStudent[] = [\r\n  ...STUDENTS_KELAS_X_1,\r\n  ...STUDENTS_KELAS_X_2,\r\n  ...STUDENTS_KELAS_X_5,\r\n];`;
const newExportCRLF = `/**\r\n * Siswa Representatif Kelas X (Kelas X-1, X-2, X-4 & X-5: Total 144 Siswa)\r\n * Mata Pelajaran Informatika - Berpikir Komputasional SMAN 1 Batu\r\n */\r\nexport const STUDENTS_KELAS_X: RegisteredStudent[] = [\r\n  ...STUDENTS_KELAS_X_1,\r\n  ...STUDENTS_KELAS_X_2,\r\n  ...STUDENTS_KELAS_X_4,\r\n  ...STUDENTS_KELAS_X_5,\r\n];`;

const oldExportLF = `/**\n * Siswa Representatif Kelas X (Kelas X-1, X-2 & X-5: Total 108 Siswa)\n * Mata Pelajaran Informatika - Berpikir Komputasional SMAN 1 Batu\n */\nexport const STUDENTS_KELAS_X: RegisteredStudent[] = [\n  ...STUDENTS_KELAS_X_1,\n  ...STUDENTS_KELAS_X_2,\n  ...STUDENTS_KELAS_X_5,\n];`;
const newExportLF = `/**\n * Siswa Representatif Kelas X (Kelas X-1, X-2, X-4 & X-5: Total 144 Siswa)\n * Mata Pelajaran Informatika - Berpikir Komputasional SMAN 1 Batu\n */\nexport const STUDENTS_KELAS_X: RegisteredStudent[] = [\n  ...STUDENTS_KELAS_X_1,\n  ...STUDENTS_KELAS_X_2,\n  ...STUDENTS_KELAS_X_4,\n  ...STUDENTS_KELAS_X_5,\n];`;

if (file.includes(oldExportCRLF)) {
  file = file.replace(oldExportCRLF, newExportCRLF);
} else if (file.includes(oldExportLF)) {
  file = file.replace(oldExportLF, newExportLF);
}

fs.writeFileSync('src/data/ctInformatikaExamData.ts', file, 'utf8');
console.log('Successfully added STUDENTS_KELAS_X_4 to src/data/ctInformatikaExamData.ts');
