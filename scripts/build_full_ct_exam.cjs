const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { execSync } = require('child_process');
const docx = require('docx');
const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  Table,
  TableRow,
  TableCell,
  WidthType,
  ShadingType
} = docx;

// 1. Load authoritative master correct answers from commit 360c508
const mdMaster = execSync('git show 360c508:Bank_Soal_30_CT_Informatika_SMAN_1_Batu.md', { encoding: 'utf8' });
const masterRaw = mdMaster.split(/### Soal No\.\s*(\d+)[^\n]*/g);
const masterData = {};
for (let i = 1; i < masterRaw.length; i += 2) {
  const num = parseInt(masterRaw[i], 10);
  const rawBody = masterRaw[i + 1].trim();
  const keyMatch = rawBody.match(/\*Kunci Jawaban:\*\s*\*\*([A-E])\*\*/i);
  const key = keyMatch ? keyMatch[1] : null;
  const reg = new RegExp('\\*\\*' + key + '\\.\\*\\*\\s*([\\s\\S]*?)(?=\\n\\s*\\*\\*[A-E]\\.\\*\\*|\\n\\s*\\*Kunci|$)');
  const m = rawBody.match(reg);
  masterData[num] = {
    key,
    correctText: m ? m[1].trim() : '',
    pembahasan: (rawBody.match(/\*Pembahasan:\*\s*([\s\S]*?)(?=\n---|###|$)/i) || ['', ''])[1].trim()
  };
}

// 2. Read existing exam data from src/data/ctInformatikaExamData.ts
const content = fs.readFileSync('src/data/ctInformatikaExamData.ts', 'utf8');

const sandbox = { module: {} };
const tsWithoutImports = content
  .replace(/import\s+[^;]+;/g, '')
  .replace(/export\s+const\s+STUDENTS_KELAS_X[^;]+;/, '')
  .replace(/export\s+const\s+CT_INFORMATIKA_30_EXAM\s*:\s*Exam\s*=/, 'module.exports =')
  .replace(/:\s*RegisteredStudent\[\]\s*=/, '=')
  .replace(/:\s*Exam\s*=/, '=');

vm.runInNewContext(tsWithoutImports, sandbox);
const rawExam = sandbox.module.exports;

// 3. Reconstruct questions with Key A as authoritative correct answer
const updatedQuestions = rawExam.questions.map((q) => {
  const num = q.number;
  const master = masterData[num];
  if (!master) {
    throw new Error('Master data not found for question ' + num);
  }

  // Find the correct option in current q.options matching master.correctText prefix
  const correctOpt = q.options.find(o =>
    o.text.trim().toLowerCase().startsWith(master.correctText.trim().toLowerCase().substring(0, 30))
  );

  if (!correctOpt) {
    throw new Error('Could not find correct option for Q' + num);
  }

  const distractors = q.options.filter(o => o !== correctOpt);
  if (distractors.length !== 4) {
    throw new Error('Expected 4 distractors, found ' + distractors.length + ' for Q' + num);
  }

  // Strip any bracketed title (e.g. [STIMULUS LITERASI TEORI KOMPUTASI])
  const cleanText = q.text.replace(/^\s*\[[^\]]+\]\s*\r?\n*/, '').trim();

  // Master options with Option A as the correct answer
  const newOptions = [
    { key: 'A', text: correctOpt.text.trim() },
    { key: 'B', text: distractors[0].text.trim() },
    { key: 'C', text: distractors[1].text.trim() },
    { key: 'D', text: distractors[2].text.trim() },
    { key: 'E', text: distractors[3].text.trim() },
  ];

  return {
    id: q.id,
    number: q.number,
    text: cleanText,
    options: newOptions,
    correctOption: 'A',
    optionScores: { A: 10, B: 0, C: 0, D: 0, E: 0 },
    explanation: q.explanation.trim(),
  };
});

// Update the exam object
const updatedExam = {
  ...rawExam,
  title: 'Informatika - Computational Thinking',
  subject: 'Informatika - Computational Thinking',
  gradeClass: 'Semua Kelas X (X-1 s/d X-12)',
  defaultOptionScores: { A: 10, B: 0, C: 0, D: 0, E: 0 },
  useWeightedScoring: false, // Mode 1 jawaban benar (kunci di opsi A)
  shuffleQuestions: true,   // Di siswa diacak nomor soal
  shuffleOptions: true,     // Di siswa diacak urutan opsi A-E
  createdAt: '2026-10-05T13:00:00.000Z', // Timestamp baru untuk memicu auto-update cache siswa & Firestore
  questions: updatedQuestions,
};

// 4. Write updated src/data/ctInformatikaExamData.ts
let tsOutput = `import { Exam, RegisteredStudent } from '../types';

/**
 * Siswa Representatif untuk Uji Coba Kelas X-1 sampai X-5
 * Mata Pelajaran Informatika - Berpikir Komputasional SMAN 1 Batu
 */
export const STUDENTS_KELAS_X: RegisteredStudent[] = [
  {
    id: 'std-ct-x1-01',
    nisn: '0091010001',
    name: 'Ahmad Faiz Al-Ghifari',
    studentClass: 'X-1',
    gender: 'L',
    password: '1001',
    isActive: true,
    notes: 'Siswa Kelas X-1 - Peminatan Informatika',
  },
  {
    id: 'std-ct-x2-01',
    nisn: '0091020002',
    name: 'Bagas Dwi Wicaksono',
    studentClass: 'X-2',
    gender: 'L',
    password: '1002',
    isActive: true,
    notes: 'Siswa Kelas X-2 - SMAN 1 Batu',
  },
  {
    id: 'std-ct-x3-01',
    nisn: '0091030003',
    name: 'Citra Kirana Dewi',
    studentClass: 'X-3',
    gender: 'P',
    password: '1003',
    isActive: true,
    notes: 'Siswa Kelas X-3 - SMAN 1 Batu',
  },
  {
    id: 'std-ct-x4-01',
    nisn: '0091040004',
    name: 'Danendra Bintang Pratama',
    studentClass: 'X-4',
    gender: 'L',
    password: '1004',
    isActive: true,
    notes: 'Siswa Kelas X-4 - SMAN 1 Batu',
  },
  {
    id: 'std-ct-x5-01',
    nisn: '0091050005',
    name: 'Keisya Amanda Putri',
    studentClass: 'X-5',
    gender: 'P',
    password: '1005',
    isActive: true,
    notes: 'Siswa Kelas X-5 - SMAN 1 Batu',
  },
];

/**
 * Paket Ujian 30 Soal HOTS Literasi Panjang & Mendalam
 * Berdasarkan Materi Resmi "Materi_CT_Informatika_SMAN_1_Batu.pdf"
 * Penyusun: Abdul Aziz., S.Kom., Gr
 * Konfigurasi Guru/Admin: Kunci Jawaban selalu di Opsi A
 * Konfigurasi Siswa: Otomatis diacak (shuffleQuestions: true, shuffleOptions: true)
 * Metode Penilaian: Standar 1 Jawaban Benar (Bobot Nonaktif, hanya kunci A bernilai 10)
 */
export const CT_INFORMATIKA_30_EXAM: Exam = {
  id: '${updatedExam.id}',
  title: '${updatedExam.title}',
  subject: '${updatedExam.subject}',
  gradeClass: '${updatedExam.gradeClass}',
  academicYear: '${updatedExam.academicYear}',
  durationMinutes: ${updatedExam.durationMinutes},
  token: '${updatedExam.token}',
  passingGrade: ${updatedExam.passingGrade},
  teacherName: '${updatedExam.teacherName}',
  defaultOptionScores: ${JSON.stringify(updatedExam.defaultOptionScores)},
  useWeightedScoring: false,
  shuffleQuestions: ${updatedExam.shuffleQuestions},
  shuffleOptions: ${updatedExam.shuffleOptions},
  showInstantScore: ${updatedExam.showInstantScore},
  showExplanationAfter: ${updatedExam.showExplanationAfter},
  allowReview: ${updatedExam.allowReview},
  maxCheatViolations: ${updatedExam.maxCheatViolations},
  isActive: ${updatedExam.isActive},
  blockEarlyExit: ${updatedExam.blockEarlyExit},
  createdAt: '${updatedExam.createdAt}',
  questions: [\n`;

updatedQuestions.forEach((q) => {
  tsOutput += `    {\n`;
  tsOutput += `      id: '${q.id}',\n`;
  tsOutput += `      number: ${q.number},\n`;
  const escapedText = q.text.replace(/`/g, '\\`').replace(/\$/g, '\\$');
  tsOutput += `      text: \`${escapedText}\`,\n`;
  tsOutput += `      options: [\n`;
  q.options.forEach((opt) => {
    const escapedOptText = opt.text.replace(/'/g, "\\'");
    tsOutput += `        {\n`;
    tsOutput += `          key: '${opt.key}',\n`;
    tsOutput += `          text: '${escapedOptText}',\n`;
    tsOutput += `        },\n`;
  });
  tsOutput += `      ],\n`;
  tsOutput += `      correctOption: '${q.correctOption}',\n`;
  tsOutput += `      optionScores: ${JSON.stringify(q.optionScores)},\n`;
  const escapedExp = (q.explanation || '').replace(/'/g, "\\'");
  tsOutput += `      explanation: '${escapedExp}',\n`;
  tsOutput += `    },\n`;
});

tsOutput += `  ],\n};\n`;

fs.writeFileSync('src/data/ctInformatikaExamData.ts', tsOutput, 'utf8');
console.log('src/data/ctInformatikaExamData.ts written successfully!');

// 5. Generate Bank_Soal_30_CT_Informatika_SMAN_1_Batu.md
let mdContent = `# BANK SOAL ASESMEN BERPIKIR KOMPUTASIONAL (COMPUTATIONAL THINKING)
## INFORMATIKA KELAS X - SMA NEGERI 1 BATU
**Penyusun:** Abdul Aziz., S.Kom., Gr  
**Bahan Bacaan Siswa:** \`Materi_CT_Informatika_SMAN_1_Batu.pdf\`  
**Jumlah Soal:** 30 Soal Pilihan Ganda (Opsi A - E) dengan Literasi Panjang HOTS  
**Alokasi Waktu:** 90 Menit | **KKM:** 75  
**Konfigurasi Master Bank Soal:** Kunci Jawaban di Opsi A (Otomatis Diacak untuk Siswa di CBT)

---

### PETUNJUK PENGERJAAN
1. Bacalah setiap stimulus teks literasi dengan cermat sebelum menjawab pertanyaan.
2. Setiap butir soal menguji pemahaman mendalam tentang konsep dan 4 pilar Berpikir Komputasional (*Dekomposisi*, *Pengenalan Pola*, *Abstraksi*, dan *Algoritma*), studi kasus lingkungan Kota Delta, operasi logistik darurat Garuda Rescue, serta penerapannya di lingkungan lokal Kota Batu.
3. Pilihlah satu jawaban yang paling tepat dari opsi A, B, C, D, atau E.
4. Kunci jawaban dan pembahasan analitis terlampir di bagian akhir dokumen ini.

---

## DAFTAR BUTIR SOAL

`;

updatedQuestions.forEach((q) => {
  mdContent += `### Soal No. ${q.number}\n\n`;
  mdContent += `${q.text}\n\n`;
  q.options.forEach((opt) => {
    mdContent += `**${opt.key}.** ${opt.text}\n\n`;
  });
  mdContent += `*Kunci Jawaban:* **${q.correctOption}**  \n`;
  mdContent += `*Pembahasan:* ${q.explanation}\n\n`;
  mdContent += `---\n\n`;
});

mdContent += `## TABEL KUNCI JAWABAN LENGKAP (1 - 30)\n\n`;
mdContent += `| No | Kunci | Topik Materi | Keterangan Pilar |\n`;
mdContent += `|:---:|:---:|:---|:---|\n`;
updatedQuestions.forEach((q) => {
  mdContent += `| ${q.number} | **${q.correctOption}** | Berpikir Komputasional | ${q.explanation.slice(0, 70)}... |\n`;
});

mdContent += `\n\n*Catatan: Pada sistem CBT siswa, urutan opsi A-E diacak secara dinamis via Fisher-Yates shuffle sehingga kunci jawaban tidak selalu A di layar siswa.*\n`;
mdContent += `\n*Dokumen Asli CBT SMAN 1 Batu - Disusun untuk Ujian Berpikir Komputasional Kelas X*\n`;

fs.writeFileSync('Bank_Soal_30_CT_Informatika_SMAN_1_Batu.md', mdContent, 'utf8');
console.log('Bank_Soal_30_CT_Informatika_SMAN_1_Batu.md written successfully!');

// 6. Generate soal_ct_siap_import_word.txt (Word Import format)
let txtImportContent = ``;
updatedQuestions.forEach((q) => {
  txtImportContent += `${q.number}. ${q.text.replace(/\n+/g, ' ')}\n`;
  q.options.forEach((opt) => {
    txtImportContent += `${opt.key}. ${opt.text}\n`;
  });
  txtImportContent += `BOBOT: A=${q.optionScores.A}, B=${q.optionScores.B}, C=${q.optionScores.C}, D=${q.optionScores.D}, E=${q.optionScores.E}\n`;
  txtImportContent += `KUNCI: ${q.correctOption}\n`;
  txtImportContent += `PEMBAHASAN: ${q.explanation}\n\n`;
});

fs.writeFileSync('soal_ct_siap_import_word.txt', txtImportContent, 'utf8');
console.log('soal_ct_siap_import_word.txt written successfully!');

// 7. Generate Bank_Soal_30_CT_Informatika_SMAN_1_Batu.docx
async function buildDocx() {
  const docChildren = [];

  // Kop Header
  docChildren.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({ text: 'PEMERINTAH PROVINSI JAWA TIMUR', bold: true, size: 24, font: 'Arial' }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({ text: 'DINAS PENDIDIKAN', bold: true, size: 24, font: 'Arial' }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({ text: 'SEKOLAH MENENGAH ATAS NEGERI 1 BATU', bold: true, size: 28, font: 'Arial' }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({ text: 'Jl. Ngaglik No. 1, Kota Batu, Jawa Timur 65311', size: 18, italics: true, font: 'Arial' }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({ text: '_________________________________________________________________________________', size: 18, font: 'Arial' }),
      ],
    }),
    new Paragraph({ text: '', spacing: { after: 200 } }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({ text: 'ASESMEN SUMATIF / UJIAN CBT BERPIKIR KOMPUTASIONAL', bold: true, size: 26, font: 'Arial' }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({ text: 'Mata Pelajaran: Informatika | Kelas: X (Sepuluh) | Waktu: 90 Menit', bold: true, size: 20, font: 'Arial' }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({ text: 'Guru Pengampu: Abdul Aziz., S.Kom., Gr | Materi Rujukan: Materi_CT_Informatika_SMAN_1_Batu.pdf', size: 18, italics: true, font: 'Arial' }),
      ],
    }),
    new Paragraph({ text: '', spacing: { after: 300 } })
  );

  // Instructions
  docChildren.push(
    new Paragraph({
      children: [
        new TextRun({ text: 'PETUNJUK PENGERJAAN:', bold: true, size: 20, font: 'Arial' }),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({ text: '1. Pilihlah salah satu jawaban yang paling tepat dengan memberikan tanda silang (X) atau memilih opsi A, B, C, D, atau E.', size: 18, font: 'Arial' }),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({ text: '2. Cermati teks literasi dan konteks studi kasus pada setiap butir soal dengan seksama.', size: 18, font: 'Arial' }),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({ text: '3. Soal berbasis Higher Order Thinking Skills (HOTS) yang menguji integrasi 4 pilar Computational Thinking.', size: 18, font: 'Arial' }),
      ],
    }),
    new Paragraph({ text: '', spacing: { after: 400 } })
  );

  // 30 Questions
  updatedQuestions.forEach((q) => {
    docChildren.push(
      new Paragraph({
        children: [
          new TextRun({ text: `SOAL NO. ${q.number}`, bold: true, size: 22, color: '1A365D', font: 'Arial' }),
        ],
        spacing: { before: 200, after: 100 },
      })
    );

    // Text lines
    const textLines = q.text.split('\n');
    textLines.forEach((tLine) => {
      if (tLine.trim()) {
        docChildren.push(
          new Paragraph({
            children: [
              new TextRun({ text: tLine, size: 20, font: 'Arial' }),
            ],
            spacing: { after: 100 },
          })
        );
      }
    });

    // Options
    q.options.forEach((opt) => {
      docChildren.push(
        new Paragraph({
          children: [
            new TextRun({ text: `${opt.key}. `, bold: true, size: 20, font: 'Arial' }),
            new TextRun({ text: opt.text, size: 20, font: 'Arial' }),
          ],
          indent: { left: 400 },
          spacing: { after: 80 },
        })
      );
    });

    docChildren.push(
      new Paragraph({
        children: [
          new TextRun({ text: `Kunci Jawaban: `, bold: true, size: 18, color: '276749', font: 'Arial' }),
          new TextRun({ text: `${q.correctOption} | `, bold: true, size: 18, font: 'Arial' }),
          new TextRun({ text: `Pembahasan: `, bold: true, size: 18, font: 'Arial' }),
          new TextRun({ text: q.explanation, italics: true, size: 18, color: '4A5568', font: 'Arial' }),
        ],
        spacing: { before: 100, after: 300 },
      })
    );
  });

  // Table of Answer Keys
  docChildren.push(
    new Paragraph({
      children: [
        new TextRun({ text: 'REKAPITULASI KUNCI JAWABAN (1 - 30)', bold: true, size: 24, font: 'Arial' }),
      ],
      spacing: { before: 400, after: 200 },
    })
  );

  const tableRows = [
    new TableRow({
      children: [
        new TableCell({ width: { size: 1000, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: 'No', bold: true, size: 18 })] })] }),
        new TableCell({ width: { size: 1200, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: 'Kunci', bold: true, size: 18 })] })] }),
        new TableCell({ width: { size: 3500, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: 'Topik', bold: true, size: 18 })] })] }),
        new TableCell({ width: { size: 1000, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: 'No', bold: true, size: 18 })] })] }),
        new TableCell({ width: { size: 1200, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: 'Kunci', bold: true, size: 18 })] })] }),
        new TableCell({ width: { size: 3500, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: 'Topik', bold: true, size: 18 })] })] }),
      ],
    }),
  ];

  for (let i = 0; i < 15; i++) {
    const q1 = updatedQuestions[i];
    const q2 = updatedQuestions[i + 15];
    tableRows.push(
      new TableRow({
        children: [
          new TableCell({ width: { size: 1000, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: String(q1.number), size: 18 })] })] }),
          new TableCell({ width: { size: 1200, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: q1.correctOption, bold: true, size: 18 })] })] }),
          new TableCell({ width: { size: 3500, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: 'Berpikir Komputasional', size: 16 })] })] }),
          new TableCell({ width: { size: 1000, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: String(q2.number), size: 18 })] })] }),
          new TableCell({ width: { size: 1200, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: q2.correctOption, bold: true, size: 18 })] })] }),
          new TableCell({ width: { size: 3500, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: 'Berpikir Komputasional', size: 16 })] })] }),
        ],
      })
    );
  }

  docChildren.push(
    new Table({
      rows: tableRows,
      width: { size: 100, type: WidthType.PERCENTAGE },
    })
  );

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1000,
              bottom: 1000,
              left: 1200,
              right: 1200,
            },
          },
        },
        children: docChildren,
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync('Bank_Soal_30_CT_Informatika_SMAN_1_Batu.docx', buffer);
  console.log('Bank_Soal_30_CT_Informatika_SMAN_1_Batu.docx created successfully!');
}

buildDocx().catch(console.error);
