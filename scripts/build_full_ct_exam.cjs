const fs = require('fs');
const path = require('path');
const vm = require('vm');
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

// 1. Read existing exam data
const content = fs.readFileSync('src/data/ctInformatikaExamData.ts', 'utf8');

const targetKeys = [
  'C', // 1
  'A', // 2
  'D', // 3
  'B', // 4
  'E', // 5
  'A', // 6
  'C', // 7
  'B', // 8
  'D', // 9
  'E', // 10
  'B', // 11
  'A', // 12
  'D', // 13
  'C', // 14
  'E', // 15
  'A', // 16
  'C', // 17
  'D', // 18
  'B', // 19
  'E', // 20
  'A', // 21
  'D', // 22
  'B', // 23
  'C', // 24
  'E', // 25
  'B', // 26
  'A', // 27
  'D', // 28
  'C', // 29
  'E', // 30
];

const sandbox = { module: {} };
const tsWithoutImports = content
  .replace(/import\s+[^;]+;/g, '')
  .replace(/export\s+const\s+STUDENTS_KELAS_X[^;]+;/, '')
  .replace(/export\s+const\s+CT_INFORMATIKA_30_EXAM\s*:\s*Exam\s*=/, 'module.exports =')
  .replace(/:\s*RegisteredStudent\[\]\s*=/, '=')
  .replace(/:\s*Exam\s*=/, '=');

vm.runInNewContext(tsWithoutImports, sandbox);
const rawExam = sandbox.module.exports;
const letters = ['A', 'B', 'C', 'D', 'E'];

// Rebalance questions
const updatedQuestions = rawExam.questions.map((q, idx) => {
  const targetKey = targetKeys[idx];
  
  // In the original, the correct answer is the option currently having key 'A'
  const currentCorrectOpt = q.options.find(o => o.key === 'A') || q.options[0];
  const distractors = q.options.filter(o => o !== currentCorrectOpt);
  
  const originalDistractorScores = [4, 3, 2, 1]; // or whatever was assigned to B, C, D, E
  
  const newOptions = [];
  const newOptionScores = {};
  
  let distractorIdx = 0;
  for (const letter of letters) {
    if (letter === targetKey) {
      newOptions.push({
        key: letter,
        text: currentCorrectOpt.text,
      });
      newOptionScores[letter] = 10;
    } else {
      const dOpt = distractors[distractorIdx];
      newOptions.push({
        key: letter,
        text: dOpt.text,
      });
      newOptionScores[letter] = originalDistractorScores[distractorIdx] || 2;
      distractorIdx++;
    }
  }
  
  return {
    id: q.id,
    number: q.number,
    category: q.category,
    text: q.text,
    options: newOptions,
    correctOption: targetKey,
    optionScores: newOptionScores,
    explanation: q.explanation,
  };
});

// Update the exam object
const updatedExam = {
  ...rawExam,
  createdAt: '2026-10-05T12:15:00.000Z',
  questions: updatedQuestions,
};

// 2. Write updated src/data/ctInformatikaExamData.ts
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
 * Distribusi Kunci Jawaban Seimbang A-E (masing-masing 6 butir)
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
  tsOutput += `      category: '${q.category}',\n`;
  // Format text with backticks
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

// 3. Generate Bank_Soal_30_CT_Informatika_SMAN_1_Batu.md
let mdContent = `# BANK SOAL ASESMEN BERPIKIR KOMPUTASIONAL (COMPUTATIONAL THINKING)
## INFORMATIKA KELAS X - SMA NEGERI 1 BATU
**Penyusun:** Abdul Aziz., S.Kom., Gr  
**Bahan Bacaan Siswa:** \`Materi_CT_Informatika_SMAN_1_Batu.pdf\`  
**Jumlah Soal:** 30 Soal Pilihan Ganda (Opsi A - E) dengan Literasi Panjang HOTS  
**Alokasi Waktu:** 90 Menit | **KKM:** 75  

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
  mdContent += `### Soal No. ${q.number} [${q.category}]\n\n`;
  mdContent += `${q.text}\n\n`;
  q.options.forEach((opt) => {
    mdContent += `**${opt.key}.** ${opt.text}\n\n`;
  });
  mdContent += `*Kunci Jawaban:* **${q.correctOption}**  \n`;
  mdContent += `*Pembahasan:* ${q.explanation}\n\n`;
  mdContent += `---\n\n`;
});

mdContent += `## TABEL KUNCI JAWABAN LENGKAP (1 - 30)\n\n`;
mdContent += `| No | Kunci | Kategori Materi | Keterangan Pilar |\n`;
mdContent += `|:---:|:---:|:---|:---|\n`;
updatedQuestions.forEach((q) => {
  mdContent += `| ${q.number} | **${q.correctOption}** | ${q.category} | ${q.explanation.slice(0, 70)}... |\n`;
});

mdContent += `\n\n*Dokumen Asli CBT SMAN 1 Batu - Disusun untuk Ujian Berpikir Komputasional Kelas X*\n`;

fs.writeFileSync('Bank_Soal_30_CT_Informatika_SMAN_1_Batu.md', mdContent, 'utf8');
console.log('Bank_Soal_30_CT_Informatika_SMAN_1_Batu.md written successfully!');

// 4. Generate soal_ct_siap_import_word.txt (Word Import format)
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

// 5. Generate Bank_Soal_30_CT_Informatika_SMAN_1_Batu.docx
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
          new TextRun({ text: `SOAL NO. ${q.number} [${q.category}]`, bold: true, size: 22, color: '1A365D', font: 'Arial' }),
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
        new TableCell({ width: { size: 3500, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: 'Kategori', bold: true, size: 18 })] })] }),
        new TableCell({ width: { size: 1000, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: 'No', bold: true, size: 18 })] })] }),
        new TableCell({ width: { size: 1200, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: 'Kunci', bold: true, size: 18 })] })] }),
        new TableCell({ width: { size: 3500, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: 'Kategori', bold: true, size: 18 })] })] }),
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
          new TableCell({ width: { size: 3500, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: q1.category, size: 16 })] })] }),
          new TableCell({ width: { size: 1000, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: String(q2.number), size: 18 })] })] }),
          new TableCell({ width: { size: 1200, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: q2.correctOption, bold: true, size: 18 })] })] }),
          new TableCell({ width: { size: 3500, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: q2.category, size: 16 })] })] }),
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
