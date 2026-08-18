import mammoth from 'mammoth';
import { OptionKey, OptionScoreMap, Question, QuestionOption } from '../types';

export interface ParseResult {
  questions: Question[];
  errors: string[];
  totalParsed: number;
}

export const DEFAULT_WEIGHT_SAMPLE: OptionScoreMap = {
  A: 10,
  B: 5,
  C: 4,
  D: 3,
  E: 2,
};

/**
 * Parses raw text extracted from Word (.docx) or Text into structured Question[]
 * Handles multiple formats:
 * Format 1 (Standard):
 * 1. Pertanyaan ...
 * A. Opsi A
 * B. Opsi B
 * C. Opsi C
 * D. Opsi D
 * E. Opsi E
 * BOBOT: A=10, B=5, C=4, D=3, E=2
 * KUNCI: A
 * PEMBAHASAN: Penjelasan...
 * 
 * Format 2 (Inline weights):
 * 1. Pertanyaan ...
 * A (10). Opsi A
 * B (5). Opsi B
 * C (4). Opsi C
 * D (3). Opsi D
 * E (2). Opsi E
 */
export const parseQuestionsFromText = (
  rawText: string,
  defaultScores: OptionScoreMap = DEFAULT_WEIGHT_SAMPLE
): ParseResult => {
  const errors: string[] = [];
  const questions: Question[] = [];

  // Normalize line endings
  const cleanText = rawText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // Split text by question numbering pattern (e.g., "1.", "2)", "SOAL 1:", "[1]")
  // Matches line starting with number
  const questionBlocks: string[] = [];
  const lines = cleanText.split('\n');

  let currentBlock: string[] = [];
  const questionNumberRegex = /^(?:SOAL\s+)?(?:\[?(\d{1,3})\]?[\.\:\)\-]\s+|(\d{1,3})\.\s+)/i;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (questionNumberRegex.test(trimmed)) {
      if (currentBlock.length > 0) {
        questionBlocks.push(currentBlock.join('\n'));
        currentBlock = [];
      }
    }
    currentBlock.push(line);
  }

  if (currentBlock.length > 0) {
    questionBlocks.push(currentBlock.join('\n'));
  }

  if (questionBlocks.length === 0) {
    // If no numbered blocks found, try splitting by double newline
    const paragraphs = cleanText.split(/\n\s*\n/).filter((p) => p.trim().length > 10);
    if (paragraphs.length > 0) {
      questionBlocks.push(...paragraphs);
    }
  }

  questionBlocks.forEach((block, idx) => {
    const qNum = idx + 1;
    try {
      const q = parseSingleQuestionBlock(block, qNum, defaultScores);
      if (q) {
        questions.push(q);
      } else {
        errors.push(`Soal #${qNum}: Format tidak dikenali atau opsi jawaban kurang lengkap.`);
      }
    } catch (err: any) {
      errors.push(`Soal #${qNum}: ${err.message || 'Gagal memproses soal'}`);
    }
  });

  return {
    questions,
    errors,
    totalParsed: questions.length,
  };
};

const parseSingleQuestionBlock = (
  blockText: string,
  index: number,
  fallbackScores: OptionScoreMap
): Question | null => {
  const lines = blockText.split('\n').map((l) => l.trim()).filter(Boolean);
  if (lines.length < 3) return null;

  let questionText = '';
  const optionsMap: Record<OptionKey, string> = { A: '', B: '', C: '', D: '', E: '' };
  const optionScores: OptionScoreMap = { ...fallbackScores };
  let explanation = '';
  let correctOption: OptionKey | undefined = undefined;

  let readingQuestion = true;
  const optRegex = /^([A-Ea-e])[\.\)\:\-\s]\s*(.*)$/;
  const inlineScoreRegex = /^([A-Ea-e])\s*\(([0-9\.\,]+)\)[\.\)\:\-\s]\s*(.*)$/;
  const weightLineRegex = /(?:BOBOT|SCORE|NILAI|WEIGHT)\s*[:=]\s*(.*)/i;
  const keyLineRegex = /(?:KUNCI|JAWABAN|ANSWER|KEY)\s*[:=]\s*([A-Ea-e])/i;
  const explLineRegex = /(?:PEMBAHASAN|PENJELASAN|EXPLANATION)\s*[:=]\s*(.*)/i;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check for explicit weight line: "BOBOT: A=10, B=5, C=4, D=3, E=2" or "BOBOT: A:10 B:5 C:4 D:3 E:2"
    const weightMatch = line.match(weightLineRegex);
    if (weightMatch) {
      const weightStr = weightMatch[1];
      const pairRegex = /([A-Ea-e])\s*[:=]\s*(-?[0-9\.]+)/g;
      let pMatch;
      while ((pMatch = pairRegex.exec(weightStr)) !== null) {
        const k = pMatch[1].toUpperCase() as OptionKey;
        const val = parseFloat(pMatch[2]);
        if (!isNaN(val) && ['A', 'B', 'C', 'D', 'E'].includes(k)) {
          optionScores[k] = val;
        }
      }
      readingQuestion = false;
      continue;
    }

    // Check for explicit key line: "KUNCI: A"
    const keyMatch = line.match(keyLineRegex);
    if (keyMatch) {
      correctOption = keyMatch[1].toUpperCase() as OptionKey;
      readingQuestion = false;
      continue;
    }

    // Check for explanation line: "PEMBAHASAN: ..."
    const explMatch = line.match(explLineRegex);
    if (explMatch) {
      explanation = explMatch[1];
      readingQuestion = false;
      continue;
    }

    // Check for inline score option format: "A(10). Teks..."
    const inlineScoreMatch = line.match(inlineScoreRegex);
    if (inlineScoreMatch) {
      readingQuestion = false;
      const k = inlineScoreMatch[1].toUpperCase() as OptionKey;
      const scoreVal = parseFloat(inlineScoreMatch[2].replace(',', '.'));
      if (!isNaN(scoreVal)) {
        optionScores[k] = scoreVal;
      }
      optionsMap[k] = inlineScoreMatch[3];
      continue;
    }

    // Check for standard option format: "A. Teks..."
    const optMatch = line.match(optRegex);
    if (optMatch && ['A', 'B', 'C', 'D', 'E'].includes(optMatch[1].toUpperCase())) {
      readingQuestion = false;
      const k = optMatch[1].toUpperCase() as OptionKey;
      optionsMap[k] = optMatch[2];
      continue;
    }

    if (readingQuestion) {
      // Remove leading number if first line
      if (i === 0) {
        const cleaned = line.replace(/^(?:SOAL\s+)?(?:\[?(\d{1,3})\]?[\.\:\)\-]\s+|(\d{1,3})\.\s+)/i, '');
        questionText += (questionText ? ' ' : '') + cleaned;
      } else {
        questionText += ' ' + line;
      }
    } else if (explanation) {
      explanation += ' ' + line;
    }
  }

  // Format options list
  const validKeys: OptionKey[] = ['A', 'B', 'C', 'D', 'E'];
  const formattedOptions: QuestionOption[] = [];

  for (const k of validKeys) {
    if (optionsMap[k] && optionsMap[k].trim().length > 0) {
      formattedOptions.push({
        key: k,
        text: optionsMap[k].trim(),
      });
    }
  }

  // If at least 2 options found (usually 4 or 5)
  if (formattedOptions.length < 2) {
    return null;
  }

  // Auto-detect highest score option as primary correctOption if not specified
  if (!correctOption) {
    let maxVal = -Infinity;
    let bestKey: OptionKey = 'A';
    for (const opt of formattedOptions) {
      const s = optionScores[opt.key] ?? 0;
      if (s > maxVal) {
        maxVal = s;
        bestKey = opt.key;
      }
    }
    correctOption = bestKey;
  }

  return {
    id: `q-parsed-${Date.now()}-${index}-${Math.random().toString(36).substring(2, 5)}`,
    number: index,
    text: questionText.trim() || `Soal Nomor ${index}`,
    options: formattedOptions,
    optionScores,
    correctOption,
    explanation: explanation.trim() || undefined,
  };
};

/**
 * Extracts raw text from uploaded .docx file using mammoth in browser
 */
export const readDocxFile = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        const result = await mammoth.extractRawText({ arrayBuffer });
        resolve(result.value);
      } catch (err) {
        reject(new Error('Gagal membaca file Word (.docx). Pastikan format file valid.'));
      }
    };
    reader.onerror = () => reject(new Error('Gagal membaca file'));
    reader.readAsArrayBuffer(file);
  });
};

/**
 * Generates sample text template that teachers can copy or save as Word / Text
 */
export const generateSampleWordTemplateText = (examTitle: string = 'Ujian CBT SMAN 1 Batu'): string => {
  return `=== TEMPLATE BANK SOAL CBT SMAN 1 BATU ===
Panduan Pengisian:
1. Tulis nomor soal diikuti titik (contoh: 1. , 2. )
2. Opsi jawaban gunakan huruf kapital A. B. C. D. E.
3. Untuk pengaturan bobot nilai bertingkat pada setiap jawaban, tuliskan:
   BOBOT: A=10, B=5, C=4, D=3, E=2
4. Kunci jawaban utama (nilai tertinggi): KUNCI: A
5. Pembahasan (opsional): PEMBAHASAN: Penjelasan materi...
6. Mendukung hingga 50 nomor soal dalam 1 dokumen.
==================================================

1. Di bawah ini yang merupakan pengamalan sila kedua Pancasila dalam pergaulan di lingkungan SMAN 1 Batu adalah...
A. Mengakui persamaan derajat, hak, dan kewajiban asasi setiap manusia tanpa membeda-bedakan suku dan agama
B. Menghormati pendapat teman lain saat musyawarah kelas berlangsung
C. Mengutamakan produk dalam negeri untuk perlengkapan sekolah
D. Menjaga ketenangan saat teman sedang beribadah
E. Melaksanakan keputusan rapat kelas dengan penuh tanggung jawab
BOBOT: A=10, B=5, C=4, D=3, E=2
KUNCI: A
PEMBAHASAN: Sila ke-2 (Kemanusiaan yang Adil dan Beradab) menekankan perlakuan setara, tenggang rasa, dan persamaan hak asasi (Opsi A nilai sempurna 10).

2. Sebuah kegiatan proyek P5 di sekolah memerlukan kolaborasi antarjurusan. Sikap yang paling tepat saat menghadapi perbedaan argumen adalah...
A. Melakukan musyawarah mufakat dengan kepala dingin untuk menemukan solusi terbaik
B. Mengalah agar tidak terjadi perdebatan yang memperlambat pengerjaan
C. Bersikukuh mempertahankan pendapat pribadi karena merasa paling benar
D. Menyerahkan seluruh keputusan kepada ketua kelompok tanpa memberi masukan
E. Memisahkan diri dan membuat proyek secara individu
BOBOT: A=10, B=6, C=2, D=4, E=0
KUNCI: A
PEMBAHASAN: Musyawarah mufakat mencerminkan kedewasaan berpikir dan nilai kolaborasi esensial.

3. Kriteria fungsi kuadrat f(x) = ax^2 + bx + c yang grafiknya selalu berada di atas sumbu X (definit positif) adalah...
A. Nilai a > 0 dan Diskriminan D < 0
B. Nilai a > 0 dan Diskriminan D > 0
C. Nilai a < 0 dan Diskriminan D < 0
D. Nilai a > 0 dan Diskriminan D = 0
E. Nilai a < 0 dan Diskriminan D > 0
BOBOT: A=10, B=4, C=3, D=5, E=1
KUNCI: A
PEMBAHASAN: Syarat definit positif adalah a > 0 (kurva terbuka ke atas) dan D < 0 (tidak memotong atau menyinggung sumbu X).
`;
};

/**
 * Downloads the text template as a .txt / word-compatible text file
 */
export const downloadTemplateFile = () => {
  const content = generateSampleWordTemplateText();
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'TEMPLATE_SOAL_CBT_SMAN1BATU.txt';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
