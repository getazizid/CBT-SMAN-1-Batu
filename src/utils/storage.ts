import { AdminAccount, Exam, OptionScoreMap, RegisteredStudent, StudentExamSubmission } from '../types';
import { MPK_OSIS_50_EXAM, REAL_STUDENTS_MPK_OSIS } from '../data/mpkOsisExamData';

const STORAGE_KEYS = {
  EXAMS: 'cbt_sman1batu_exams',
  SUBMISSIONS: 'cbt_sman1batu_submissions',
  STUDENTS: 'cbt_sman1batu_students',
  ADMIN_ACCOUNTS: 'cbt_sman1batu_admin_accounts',
  CURRENT_ADMIN_SESSION: 'cbt_sman1batu_current_admin_session',
  ENFORCE_WHITELIST: 'cbt_sman1batu_enforce_whitelist',
  FIREBASE_CONFIG: 'cbt_sman1batu_firebase_config',
  ACTIVE_EXAM_ID: 'cbt_sman1batu_active_exam_id',
};

export const DEFAULT_OPTION_SCORES: OptionScoreMap = {
  A: 10,
  B: 5,
  C: 4,
  D: 3,
  E: 2,
};

// Seed initial demo exams for SMAN 1 Batu
export const INITIAL_EXAMS: Exam[] = [
  MPK_OSIS_50_EXAM,
  {
    id: 'exam-sman1-001',
    title: 'Penilaian Sumatif Karakter & Etika Digital SMAN 1 Batu',
    subject: 'Pendidikan Karakter & Literasi Digital',
    gradeClass: 'Kelas XII - Semua Jurusan',
    academicYear: '2025/2026 Ganjil',
    durationMinutes: 60,
    token: 'BATU2025',
    passingGrade: 75,
    teacherName: 'Dra. Sri Wahyuni, M.Pd.',
    defaultOptionScores: { A: 10, B: 5, C: 4, D: 3, E: 2 },
    shuffleQuestions: false,
    shuffleOptions: false,
    showInstantScore: true,
    showExplanationAfter: true,
    allowReview: true,
    maxCheatViolations: 3,
    isActive: true,
    createdAt: new Date().toISOString(),
    questions: [
      {
        id: 'q-1',
        number: 1,
        text: 'Ketika Anda menemukan informasi sensitif atau berita yang belum terverifikasi di grup media sosial sekolah, tindakan apa yang paling bijak dan mencerminkan nilai integritas siswa SMAN 1 Batu?',
        options: [
          { key: 'A', text: 'Melakukan cek fakta melalui situs resmi cekfakta/turnbackhoax dan mengedukasi anggota grup dengan sopan' },
          { key: 'B', text: 'Menahan diri untuk tidak membagikan informasi tersebut dan hanya membacanya sendiri' },
          { key: 'C', text: 'Meneruskan pesan tersebut ke teman terdekat untuk menanyakan kebenarannya' },
          { key: 'D', text: 'Mengabaikan pesan tanpa melakukan tindakan konfirmasi apapun' },
          { key: 'E', text: 'Langsung membagikan ke media sosial lain dengan caption "Semoga bermanfaat jika benar"' },
        ],
        optionScores: { A: 10, B: 5, C: 4, D: 3, E: 2 },
        correctOption: 'A',
        explanation: 'Opsi A mendapatkan nilai tertinggi (10) karena proaktif dalam verifikasi dan edukasi anti-hoaks. Opsi B bernilai 5 karena pasif namun aman, opsi C (4), D (3), dan E (2) menunjukkan tingkat risiko penyebaran hoaks.',
        category: 'Literasi Digital',
      },
      {
        id: 'q-2',
        number: 2,
        text: 'Dalam penyusunan karya tulis ilmiah tim di sekolah, seorang rekan satu kelompok Anda tidak berkontribusi optimal karena sakit ringan. Bagaimana sikap kepemimpinan kolaboratif terbaik Anda?',
        options: [
          { key: 'A', text: 'Mengadakan musyawarah kelompok untuk membagi ulang beban tugas secara adil dan memberi dukungan moral' },
          { key: 'B', text: 'Mengerjakan bagian tugas rekan tersebut bersama anggota lain tanpa perlu membebaninya' },
          { key: 'C', text: 'Melaporkan langsung kepada guru pembimbing agar nilai rekan tersebut dikurangi' },
          { key: 'D', text: 'Menunggu rekan tersebut sembuh meskipun deadline pengumpulan tugas semakin dekat' },
          { key: 'E', text: 'Mencoret nama rekan tersebut dari lembar cover laporan karya tulis ilmiah' },
        ],
        optionScores: { A: 10, B: 5, C: 4, D: 3, E: 2 },
        correctOption: 'A',
        explanation: 'Musyawarah mufakat dan restrukturisasi tugas dengan empati (Opsi A) adalah kepemimpinan transformatif (Nilai 10). Mengerjakan sendiri (Opsi B: 5) kurang memberdayakan tim. Mencoret nama (Opsi E: 2) melanggar etika solidaritas.',
        category: 'Kerjasama & Kepemimpinan',
      },
      {
        id: 'q-3',
        number: 3,
        text: 'Sebagai warga sekolah SMAN 1 Batu yang berwawasan lingkungan (Adiwiyata), apa tindakan harian paling efektif untuk mengurangi timbulan sampah plastik di kantin sekolah?',
        options: [
          { key: 'A', text: 'Selalu membawa tumbler dan wadah makanan sendiri dari rumah serta memilah sampah organik/anorganik' },
          { key: 'B', text: 'Membeli makanan berbungkus plastik tetapi membuangnya dengan rapi di tempat sampah' },
          { key: 'C', text: 'Mengingatkan teman lain untuk membuang sampah pada tempatnya saat melihatnya berserakan' },
          { key: 'D', text: 'Hanya jajan makanan basah yang disajikan dengan piring porselen di dalam kantin' },
          { key: 'E', text: 'Menunggu jadwal piket kebersihan lingkungan sekolah untuk mengumpulkan sampah' },
        ],
        optionScores: { A: 10, B: 5, C: 4, D: 3, E: 2 },
        correctOption: 'A',
        explanation: 'Upaya preventif reduksi dari sumber dengan tumbler/wadah pribadi (Opsi A: 10) memiliki dampak ekologis tertinggi sesuai pilar Adiwiyata SMAN 1 Batu.',
        category: 'Adiwiyata & Lingkungan',
      },
      {
        id: 'q-4',
        number: 4,
        text: 'Saat mengerjakan ujian berbasis CBT mandiri tanpa pengawasan kamera aktif, Anda melihat celah di mana Anda bisa membuka browser lain untuk mencari jawaban. Sikap integritas Anda adalah:',
        options: [
          { key: 'A', text: 'Tetap fokus mengerjakan soal dengan kemampuan sendiri berlandaskan kejujuran akademik' },
          { key: 'B', text: 'Hanya membuka catatan kecil pribadi jika benar-benar ragu pada nomor yang sangat sulit' },
          { key: 'C', text: 'Membuka Google hanya untuk memastikan ejaan atau definisi istilah umum' },
          { key: 'D', text: 'Melihat jawaban teman di grup chat namun hanya mengoreksi jawaban sendiri' },
          { key: 'E', text: 'Memanfaatkan celah sistem secara maksimal untuk mendapatkan nilai sempurna' },
        ],
        optionScores: { A: 10, B: 5, C: 4, D: 3, E: 2 },
        correctOption: 'A',
        explanation: 'Kejujuran akademik adalah prinsip mutlak (Opsi A: 10). Mencari celah atau berkolaborasi curang (Opsi E: 2) melanggar integritas siswa.',
        category: 'Integritas Akademik',
      },
      {
        id: 'q-5',
        number: 5,
        text: 'Jika Anda melihat fasilitas sarana prasarana sekolah seperti proyektor atau AC kelas mengalami kerusakan ringan setelah jam pelajaran, langkah pertama Anda adalah:',
        options: [
          { key: 'A', text: 'Segera melapor ke pengurus kelas dan petugas sarpras sekolah agar lekas ditangani teknisi' },
          { key: 'B', text: 'Mematikan stop kontak listrik perangkat tersebut untuk mencegah korsleting' },
          { key: 'C', text: 'Mencoba memperbaiki sendiri peralatan tersebut bersama teman-teman' },
          { key: 'D', text: 'Membicarakan kerusakan tersebut di grup WhatsApp kelas tanpa laporan resmi' },
          { key: 'E', text: 'Membiarkannya karena menganggap itu tanggung jawab penjaga sekolah' },
        ],
        optionScores: { A: 10, B: 5, C: 4, D: 3, E: 2 },
        correctOption: 'A',
        explanation: 'Pelaporan terstruktur melalui jalur resmi (Opsi A: 10) memastikan keselamatan dan preservasi aset sekolah secara profesional.',
        category: 'Tanggung Jawab Sarpras',
      },
      {
        id: 'q-6',
        number: 6,
        text: 'Bagaimana cara terbaik mengapresiasi perbedaan budaya, agama, dan latar belakang teman di lingkungan multikultural SMAN 1 Batu?',
        options: [
          { key: 'A', text: 'Membangun pertemanan inklusif tanpa diskriminasi serta menghormati perayaan hari besar mereka' },
          { key: 'B', text: 'Bersikap ramah hanya kepada teman yang memiliki pandangan dan hobi yang sejalan' },
          { key: 'C', text: 'Bersikap pasif dan menghindari perbincangan mengenai latar belakang budaya' },
          { key: 'D', text: 'Menghindari bergaul dengan kelompok teman yang berbeda agar tidak terjadi kesalahpahaman' },
          { key: 'E', text: 'Menilai kebiasaan budaya teman lain berdasarkan standar budaya pribadi semata' },
        ],
        optionScores: { A: 10, B: 5, C: 4, D: 3, E: 2 },
        correctOption: 'A',
        explanation: 'Inklusivitas dan penghormatan aktif (Opsi A: 10) mencerminkan Profil Pelajar Pancasila Berkebinekaan Global.',
        category: 'Kebinekaan Global',
      },
      {
        id: 'q-7',
        number: 7,
        text: 'Menghadapi era kecerdasan buatan (Generative AI) dalam pembuatan tugas sekolah, pemanfaatan yang paling etis dan konstruktif adalah:',
        options: [
          { key: 'A', text: 'Menggunakan AI sebagai mitra diskusi brainstorming ide dan alat bantu telaah literatur dengan tetap menuliskan sintesis orisinal' },
          { key: 'B', text: 'Meminta AI menyusun seluruh esai kemudian menyunting sedikit kalimat pengantarnya' },
          { key: 'C', text: 'Menyalin seluruh output AI dan mencantumkan nama AI sebagai kontributor' },
          { key: 'D', text: 'Menolak sama sekali penggunaan teknologi AI karena dianggap menghilangkan kreativitas' },
          { key: 'E', text: 'Menggunakan AI untuk menghasilkan jawaban instan pada seluruh lembar kerja tanpa membaca ulang' },
        ],
        optionScores: { A: 10, B: 5, C: 4, D: 3, E: 2 },
        correctOption: 'A',
        explanation: 'Etika pemanfaatan AI yang bijak (Opsi A: 10) memperkuat daya nalar kritis siswa tanpa plagiarisme.',
        category: 'Literasi Digital',
      },
      {
        id: 'q-8',
        number: 8,
        text: 'Saat menyusun jadwal belajar persiapan Ujian Sekolah dan Seleksi Nasional Berdasarkan Tes (SNBT), strategi manajemen waktu yang paling seimbang adalah:',
        options: [
          { key: 'A', text: 'Menerapkan teknik Pomodoro dengan target harian bertahap, diselingi istirahat cukup dan olahraga' },
          { key: 'B', text: 'Belajar maraton sistem kebut semalam (SKS) hanya ketika menjelang hari ujian' },
          { key: 'C', text: 'Menghabiskan waktu 8 jam berturut-turut tanpa jeda makan dan istirahat' },
          { key: 'D', text: 'Hanya mengandalkan pembahasan latihan soal dari teman tanpa membaca materi dasar' },
          { key: 'E', text: 'Mengikuti bimbingan belajar setiap hari namun tidak pernah mengulang materi secara mandiri' },
        ],
        optionScores: { A: 10, B: 5, C: 4, D: 3, E: 2 },
        correctOption: 'A',
        explanation: 'Manajemen waktu konsisten dan berimbang (Opsi A: 10) menjamin ketahanan kognitif dan kesehatan mental jangka panjang.',
        category: 'Kemandirian Belajar',
      },
      {
        id: 'q-9',
        number: 9,
        text: 'Jika Anda terpilih mewakili SMAN 1 Batu dalam kompetisi olimpiade sains/seni tingkat provinsi, orientasi sikap mental utama Anda adalah:',
        options: [
          { key: 'A', text: 'Berusaha maksimal dengan sportivitas tinggi, menjalin relasi positif antar-peserta, dan membawa nama baik almamater' },
          { key: 'B', text: 'Berfokus hanya pada medali emas dan menganggap peserta dari sekolah lain sebagai rival yang harus dikalahkan' },
          { key: 'C', text: 'Merasa terbebani oleh ekspektasi sekolah sehingga cemas berlebihan saat lomba' },
          { key: 'D', text: 'Mengikuti kompetisi sekadar untuk mendapatkan surat izin dispensasi kelas' },
          { key: 'E', text: 'Menyerahkan hasil sepenuhnya pada keberuntungan tanpa persiapan latihan terarah' },
        ],
        optionScores: { A: 10, B: 5, C: 4, D: 3, E: 2 },
        correctOption: 'A',
        explanation: 'Sportivitas, dedikasi, dan kehormatan almamater (Opsi A: 10) adalah nilai puncak karakter siswa berprestasi.',
        category: 'Prestasi & Sportivitas',
      },
      {
        id: 'q-10',
        number: 10,
        text: 'Visi SMAN 1 Batu menekankan lulusan yang beriman, bertakwa, berprestasi, dan berwawasan lingkungan. Sebagai siswa, wujud nyata komitmen tersebut tercermin dari:',
        options: [
          { key: 'A', text: 'Konsistensi menjalankan ibadah tepat waktu, tekun meraih prestasi akademik/non-akademik, serta aktif menjaga kelestarian alam sekitar' },
          { key: 'B', text: 'Hanya fokus pada nilai rapor tertinggi tanpa mempedulikan kegiatan sosial dan keagamaan' },
          { key: 'C', text: 'Aktif di organisasi ekstrakurikuler hingga sering mengabaikan tugas-tugas kurikuler utama' },
          { key: 'D', text: 'Bersikap baik dan patuh hanya ketika diawasi oleh bapak/ibu guru di sekolah' },
          { key: 'E', text: 'Menghafal visi-misi sekolah saat upacara tanpa mempraktikkannya dalam keseharian' },
        ],
        optionScores: { A: 10, B: 5, C: 4, D: 3, E: 2 },
        correctOption: 'A',
        explanation: 'Harmonisasi dimensi spiritual, intelektual, dan aksi ekologis nyata (Opsi A: 10) mewujudkan visi paripurna SMAN 1 Batu.',
        category: 'Visi Almamater',
      },
    ],
  },
  {
    id: 'exam-sman1-002',
    title: 'Simulasi CBT Ujian Matematika & Penalaran Kuantitatif',
    subject: 'Matematika Peminatan',
    gradeClass: 'Kelas XII MIPA',
    academicYear: '2025/2026 Ganjil',
    durationMinutes: 45,
    token: 'MATEMATIKA',
    passingGrade: 75,
    teacherName: 'Bambang Sudarmanto, S.Pd., M.Si.',
    defaultOptionScores: { A: 10, B: 5, C: 4, D: 3, E: 2 },
    shuffleQuestions: true,
    shuffleOptions: false,
    showInstantScore: true,
    showExplanationAfter: true,
    allowReview: true,
    maxCheatViolations: 3,
    isActive: true,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    questions: [
      {
        id: 'qm-1',
        number: 1,
        text: 'Diketahui f(x) = 3x² - 12x + 7. Nilai minimum dari fungsi kuadrat tersebut beserta langkah pembuktian kalkulus yang paling tepat adalah:',
        options: [
          { key: 'A', text: 'Nilai minimum = -5 pada x = 2 (didapat dari f\'(x) = 6x - 12 = 0 dan f\'\'(2) = 6 > 0)' },
          { key: 'B', text: 'Nilai minimum = -5 pada x = 2 (didapat dari rumus titik puncak y = -D / 4a)' },
          { key: 'C', text: 'Nilai minimum = 7 pada x = 0 (titik potong sumbu Y)' },
          { key: 'D', text: 'Nilai minimum = -12 pada x = 1' },
          { key: 'E', text: 'Nilai minimum = 5 pada x = -2' },
        ],
        optionScores: { A: 10, B: 8, C: 4, D: 2, E: 0 },
        correctOption: 'A',
        explanation: 'Turunan f\'(x) = 6x - 12 = 0 -> x = 2. f(2) = 3(4) - 12(2) + 7 = 12 - 24 + 7 = -5. Opsi A bernilai sempurna (10) karena menyertakan uji turunan kedua.',
      },
      {
        id: 'qm-2',
        number: 2,
        text: 'Sebuah barisan geometri memiliki suku ke-2 = 6 dan suku ke-5 = 48. Jumlah 6 suku pertama (S6) dari barisan tersebut adalah:',
        options: [
          { key: 'A', text: '189 (dengan suku pertama a = 3 dan rasio r = 2)' },
          { key: 'B', text: '186 (dengan perhitungan pembulatan rasio)' },
          { key: 'C', text: '192' },
          { key: 'D', text: '96' },
          { key: 'E', text: '63' },
        ],
        optionScores: { A: 10, B: 5, C: 3, D: 2, E: 1 },
        correctOption: 'A',
        explanation: 'r³ = U5/U2 = 48/6 = 8 -> r = 2. U2 = a*r -> 6 = a(2) -> a = 3. S6 = 3*(2^6 - 1)/(2 - 1) = 3*(63) = 189.',
      },
    ],
  },
];

// Seed realistic student submissions for SMAN 1 Batu analytics
export const INITIAL_SUBMISSIONS: StudentExamSubmission[] = [
  {
    id: 'sub-001',
    examId: 'exam-sman1-001',
    examTitle: 'Penilaian Sumatif Karakter & Etika Digital SMAN 1 Batu',
    subject: 'Pendidikan Karakter & Literasi Digital',
    studentName: 'Ahmad Fauzan Pratama',
    studentNisn: '0061829101',
    studentClass: 'XII MIPA 1',
    startTime: new Date(Date.now() - 1000 * 60 * 55).toISOString(),
    endTime: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    durationSecondsUsed: 2700,
    answers: { 1: 'A', 2: 'A', 3: 'A', 4: 'A', 5: 'A', 6: 'A', 7: 'A', 8: 'A', 9: 'A', 10: 'A' },
    flaggedQuestions: [],
    answersDetail: [
      { questionNumber: 1, questionId: 'q-1', selectedOption: 'A', scoreEarned: 10, maxScore: 10, isHighestScore: true },
      { questionNumber: 2, questionId: 'q-2', selectedOption: 'A', scoreEarned: 10, maxScore: 10, isHighestScore: true },
      { questionNumber: 3, questionId: 'q-3', selectedOption: 'A', scoreEarned: 10, maxScore: 10, isHighestScore: true },
      { questionNumber: 4, questionId: 'q-4', selectedOption: 'A', scoreEarned: 10, maxScore: 10, isHighestScore: true },
      { questionNumber: 5, questionId: 'q-5', selectedOption: 'A', scoreEarned: 10, maxScore: 10, isHighestScore: true },
      { questionNumber: 6, questionId: 'q-6', selectedOption: 'A', scoreEarned: 10, maxScore: 10, isHighestScore: true },
      { questionNumber: 7, questionId: 'q-7', selectedOption: 'A', scoreEarned: 10, maxScore: 10, isHighestScore: true },
      { questionNumber: 8, questionId: 'q-8', selectedOption: 'A', scoreEarned: 10, maxScore: 10, isHighestScore: true },
      { questionNumber: 9, questionId: 'q-9', selectedOption: 'A', scoreEarned: 10, maxScore: 10, isHighestScore: true },
      { questionNumber: 10, questionId: 'q-10', selectedOption: 'A', scoreEarned: 10, maxScore: 10, isHighestScore: true },
    ],
    totalScoreEarned: 100,
    maxPossibleScore: 100,
    finalScoreScale100: 100,
    isPassed: true,
    passingGrade: 75,
    tabSwitchCount: 0,
    submittedAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    deviceInfo: 'Chrome / Windows',
  },
  {
    id: 'sub-002',
    examId: 'exam-sman1-001',
    examTitle: 'Penilaian Sumatif Karakter & Etika Digital SMAN 1 Batu',
    subject: 'Pendidikan Karakter & Literasi Digital',
    studentName: 'Nadhira Putri Azzahra',
    studentNisn: '0061829102',
    studentClass: 'XII MIPA 2',
    startTime: new Date(Date.now() - 1000 * 60 * 50).toISOString(),
    endTime: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    durationSecondsUsed: 2100,
    answers: { 1: 'A', 2: 'B', 3: 'A', 4: 'A', 5: 'A', 6: 'A', 7: 'B', 8: 'A', 9: 'A', 10: 'A' },
    flaggedQuestions: [2],
    answersDetail: [
      { questionNumber: 1, questionId: 'q-1', selectedOption: 'A', scoreEarned: 10, maxScore: 10, isHighestScore: true },
      { questionNumber: 2, questionId: 'q-2', selectedOption: 'B', scoreEarned: 5, maxScore: 10, isHighestScore: false },
      { questionNumber: 3, questionId: 'q-3', selectedOption: 'A', scoreEarned: 10, maxScore: 10, isHighestScore: true },
      { questionNumber: 4, questionId: 'q-4', selectedOption: 'A', scoreEarned: 10, maxScore: 10, isHighestScore: true },
      { questionNumber: 5, questionId: 'q-5', selectedOption: 'A', scoreEarned: 10, maxScore: 10, isHighestScore: true },
      { questionNumber: 6, questionId: 'q-6', selectedOption: 'A', scoreEarned: 10, maxScore: 10, isHighestScore: true },
      { questionNumber: 7, questionId: 'q-7', selectedOption: 'B', scoreEarned: 5, maxScore: 10, isHighestScore: false },
      { questionNumber: 8, questionId: 'q-8', selectedOption: 'A', scoreEarned: 10, maxScore: 10, isHighestScore: true },
      { questionNumber: 9, questionId: 'q-9', selectedOption: 'A', scoreEarned: 10, maxScore: 10, isHighestScore: true },
      { questionNumber: 10, questionId: 'q-10', selectedOption: 'A', scoreEarned: 10, maxScore: 10, isHighestScore: true },
    ],
    totalScoreEarned: 90,
    maxPossibleScore: 100,
    finalScoreScale100: 90,
    isPassed: true,
    passingGrade: 75,
    tabSwitchCount: 0,
    submittedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    deviceInfo: 'Safari / iPadOS',
  },
  {
    id: 'sub-003',
    examId: 'exam-sman1-001',
    examTitle: 'Penilaian Sumatif Karakter & Etika Digital SMAN 1 Batu',
    subject: 'Pendidikan Karakter & Literasi Digital',
    studentName: 'Dimas Satria Wibowo',
    studentNisn: '0061829103',
    studentClass: 'XII IPS 1',
    startTime: new Date(Date.now() - 1000 * 60 * 65).toISOString(),
    endTime: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
    durationSecondsUsed: 2700,
    answers: { 1: 'B', 2: 'B', 3: 'C', 4: 'A', 5: 'B', 6: 'A', 7: 'C', 8: 'A', 9: 'B', 10: 'A' },
    flaggedQuestions: [1, 7],
    answersDetail: [
      { questionNumber: 1, questionId: 'q-1', selectedOption: 'B', scoreEarned: 5, maxScore: 10, isHighestScore: false },
      { questionNumber: 2, questionId: 'q-2', selectedOption: 'B', scoreEarned: 5, maxScore: 10, isHighestScore: false },
      { questionNumber: 3, questionId: 'q-3', selectedOption: 'C', scoreEarned: 4, maxScore: 10, isHighestScore: false },
      { questionNumber: 4, questionId: 'q-4', selectedOption: 'A', scoreEarned: 10, maxScore: 10, isHighestScore: true },
      { questionNumber: 5, questionId: 'q-5', selectedOption: 'B', scoreEarned: 5, maxScore: 10, isHighestScore: false },
      { questionNumber: 6, questionId: 'q-6', selectedOption: 'A', scoreEarned: 10, maxScore: 10, isHighestScore: true },
      { questionNumber: 7, questionId: 'q-7', selectedOption: 'C', scoreEarned: 4, maxScore: 10, isHighestScore: false },
      { questionNumber: 8, questionId: 'q-8', selectedOption: 'A', scoreEarned: 10, maxScore: 10, isHighestScore: true },
      { questionNumber: 9, questionId: 'q-9', selectedOption: 'B', scoreEarned: 5, maxScore: 10, isHighestScore: false },
      { questionNumber: 10, questionId: 'q-10', selectedOption: 'A', scoreEarned: 10, maxScore: 10, isHighestScore: true },
    ],
    totalScoreEarned: 68,
    maxPossibleScore: 100,
    finalScoreScale100: 68,
    isPassed: false,
    passingGrade: 75,
    tabSwitchCount: 1,
    submittedAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
    deviceInfo: 'Edge / Windows',
  },
  {
    id: 'sub-004',
    examId: 'exam-sman1-001',
    examTitle: 'Penilaian Sumatif Karakter & Etika Digital SMAN 1 Batu',
    subject: 'Pendidikan Karakter & Literasi Digital',
    studentName: 'Siti Nurhaliza Rahmah',
    studentNisn: '0061829104',
    studentClass: 'XII MIPA 3',
    startTime: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
    endTime: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    durationSecondsUsed: 2100,
    answers: { 1: 'A', 2: 'A', 3: 'B', 4: 'A', 5: 'A', 6: 'B', 7: 'A', 8: 'A', 9: 'A', 10: 'A' },
    flaggedQuestions: [],
    answersDetail: [
      { questionNumber: 1, questionId: 'q-1', selectedOption: 'A', scoreEarned: 10, maxScore: 10, isHighestScore: true },
      { questionNumber: 2, questionId: 'q-2', selectedOption: 'A', scoreEarned: 10, maxScore: 10, isHighestScore: true },
      { questionNumber: 3, questionId: 'q-3', selectedOption: 'B', scoreEarned: 5, maxScore: 10, isHighestScore: false },
      { questionNumber: 4, questionId: 'q-4', selectedOption: 'A', scoreEarned: 10, maxScore: 10, isHighestScore: true },
      { questionNumber: 5, questionId: 'q-5', selectedOption: 'A', scoreEarned: 10, maxScore: 10, isHighestScore: true },
      { questionNumber: 6, questionId: 'q-6', selectedOption: 'B', scoreEarned: 5, maxScore: 10, isHighestScore: false },
      { questionNumber: 7, questionId: 'q-7', selectedOption: 'A', scoreEarned: 10, maxScore: 10, isHighestScore: true },
      { questionNumber: 8, questionId: 'q-8', selectedOption: 'A', scoreEarned: 10, maxScore: 10, isHighestScore: true },
      { questionNumber: 9, questionId: 'q-9', selectedOption: 'A', scoreEarned: 10, maxScore: 10, isHighestScore: true },
      { questionNumber: 10, questionId: 'q-10', selectedOption: 'A', scoreEarned: 10, maxScore: 10, isHighestScore: true },
    ],
    totalScoreEarned: 90,
    maxPossibleScore: 100,
    finalScoreScale100: 90,
    isPassed: true,
    passingGrade: 75,
    tabSwitchCount: 0,
    submittedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    deviceInfo: 'Chrome / Android',
  },
  {
    id: 'sub-005',
    examId: 'exam-sman1-001',
    examTitle: 'Penilaian Sumatif Karakter & Etika Digital SMAN 1 Batu',
    subject: 'Pendidikan Karakter & Literasi Digital',
    studentName: 'Reza Aditya Wardhana',
    studentNisn: '0061829105',
    studentClass: 'XII IPS 2',
    startTime: new Date(Date.now() - 1000 * 60 * 70).toISOString(),
    endTime: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    durationSecondsUsed: 2400,
    answers: { 1: 'A', 2: 'A', 3: 'A', 4: 'A', 5: 'B', 6: 'A', 7: 'A', 8: 'B', 9: 'A', 10: 'A' },
    flaggedQuestions: [],
    answersDetail: [
      { questionNumber: 1, questionId: 'q-1', selectedOption: 'A', scoreEarned: 10, maxScore: 10, isHighestScore: true },
      { questionNumber: 2, questionId: 'q-2', selectedOption: 'A', scoreEarned: 10, maxScore: 10, isHighestScore: true },
      { questionNumber: 3, questionId: 'q-3', selectedOption: 'A', scoreEarned: 10, maxScore: 10, isHighestScore: true },
      { questionNumber: 4, questionId: 'q-4', selectedOption: 'A', scoreEarned: 10, maxScore: 10, isHighestScore: true },
      { questionNumber: 5, questionId: 'q-5', selectedOption: 'B', scoreEarned: 5, maxScore: 10, isHighestScore: false },
      { questionNumber: 6, questionId: 'q-6', selectedOption: 'A', scoreEarned: 10, maxScore: 10, isHighestScore: true },
      { questionNumber: 7, questionId: 'q-7', selectedOption: 'A', scoreEarned: 10, maxScore: 10, isHighestScore: true },
      { questionNumber: 8, questionId: 'q-8', selectedOption: 'B', scoreEarned: 5, maxScore: 10, isHighestScore: false },
      { questionNumber: 9, questionId: 'q-9', selectedOption: 'A', scoreEarned: 10, maxScore: 10, isHighestScore: true },
      { questionNumber: 10, questionId: 'q-10', selectedOption: 'A', scoreEarned: 10, maxScore: 10, isHighestScore: true },
    ],
    totalScoreEarned: 90,
    maxPossibleScore: 100,
    finalScoreScale100: 90,
    isPassed: true,
    passingGrade: 75,
    tabSwitchCount: 0,
    submittedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    deviceInfo: 'Firefox / Linux',
  }
];

export const getStoredExams = (): Exam[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.EXAMS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(INITIAL_EXAMS));
      return INITIAL_EXAMS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_EXAMS;
  }
};

export const saveStoredExams = (exams: Exam[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(exams));
  } catch (e) {
    console.error('Failed to save exams to localStorage', e);
  }
};

export const getStoredSubmissions = (): StudentExamSubmission[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SUBMISSIONS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(INITIAL_SUBMISSIONS));
      return INITIAL_SUBMISSIONS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_SUBMISSIONS;
  }
};

export const saveStoredSubmissions = (submissions: StudentExamSubmission[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(submissions));
  } catch (e) {
    console.error('Failed to save submissions to localStorage', e);
  }
};

export const addStudentSubmission = (submission: StudentExamSubmission): void => {
  const current = getStoredSubmissions();
  const updated = [submission, ...current];
  saveStoredSubmissions(updated);
};

export const INITIAL_STUDENTS: RegisteredStudent[] = [
  ...REAL_STUDENTS_MPK_OSIS,
  {
    id: 'std-001',
    nisn: '0061829101',
    name: 'Ahmad Fauzan Pratama',
    studentClass: 'XII MIPA 1',
    gender: 'L',
    password: '101',
    isActive: true,
    notes: 'Siswa Reguler',
  },
  {
    id: 'std-002',
    nisn: '0061829102',
    name: 'Nadhira Putri Azzahra',
    studentClass: 'XII MIPA 2',
    gender: 'P',
    password: '102',
    isActive: true,
    notes: 'Siswa Reguler',
  },
  {
    id: 'std-003',
    nisn: '0061829103',
    name: 'Dimas Satria Wibowo',
    studentClass: 'XII IPS 1',
    gender: 'L',
    password: '103',
    isActive: true,
    notes: 'Siswa Reguler',
  },
  {
    id: 'std-004',
    nisn: '0061829104',
    name: 'Siti Nurhaliza Rahmah',
    studentClass: 'XII MIPA 3',
    gender: 'P',
    password: '104',
    isActive: true,
    notes: 'Siswa Reguler',
  },
  {
    id: 'std-005',
    nisn: '0061829105',
    name: 'Reza Aditya Wardhana',
    studentClass: 'XII IPS 2',
    gender: 'L',
    password: '105',
    isActive: true,
    notes: 'Siswa Reguler',
  },
  {
    id: 'std-006',
    nisn: '0061829106',
    name: 'Bintang Ramadhan Putra',
    studentClass: 'XII MIPA 1',
    gender: 'L',
    password: '106',
    isActive: true,
    notes: 'Siswa Reguler',
  },
  {
    id: 'std-007',
    nisn: '0061829107',
    name: 'Cantika Dewi Maharani',
    studentClass: 'XI MIPA 2',
    gender: 'P',
    password: '107',
    isActive: true,
    notes: 'Siswa Reguler',
  },
  {
    id: 'std-008',
    nisn: '0061829108',
    name: 'Fikri Haikal Rahman',
    studentClass: 'X-1',
    gender: 'L',
    password: '108',
    isActive: true,
    notes: 'Siswa Reguler',
  }
];

export const getStoredStudents = (): RegisteredStudent[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STUDENTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(INITIAL_STUDENTS));
      return INITIAL_STUDENTS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_STUDENTS;
  }
};

export const saveStoredStudents = (students: RegisteredStudent[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
  } catch (e) {
    console.error('Failed to save students to localStorage', e);
  }
};

export const getStoredEnforceWhitelist = (): boolean => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ENFORCE_WHITELIST);
    if (raw === null) {
      // Default to true so only registered students can login as requested
      localStorage.setItem(STORAGE_KEYS.ENFORCE_WHITELIST, 'true');
      return true;
    }
    return raw === 'true';
  } catch {
    return true;
  }
};

export const saveStoredEnforceWhitelist = (enforce: boolean): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.ENFORCE_WHITELIST, String(enforce));
  } catch (e) {
    console.error('Failed to save whitelist enforcement to localStorage', e);
  }
};

export const INITIAL_ADMIN_ACCOUNTS: AdminAccount[] = [
  {
    id: 'adm-001',
    username: 'admin',
    password: 'admin123',
    name: 'Administrator SMAN 1 Batu',
    role: 'Administrator',
    email: 'admin@sman1batu.sch.id',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'adm-002',
    username: 'guru',
    password: 'batu2025',
    name: 'Dra. Sri Wahyuni, M.Pd.',
    role: 'Guru Pengampu',
    email: 'sriwahyuni@sman1batu.sch.id',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'adm-003',
    username: 'bambang',
    password: 'guru123',
    name: 'Bambang Sudarmanto, S.Pd., M.Si.',
    role: 'Guru Pengampu',
    email: 'bambang@sman1batu.sch.id',
    createdAt: new Date().toISOString(),
  },
];

export const getStoredAdminAccounts = (): AdminAccount[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ADMIN_ACCOUNTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.ADMIN_ACCOUNTS, JSON.stringify(INITIAL_ADMIN_ACCOUNTS));
      return INITIAL_ADMIN_ACCOUNTS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_ADMIN_ACCOUNTS;
  }
};

export const saveStoredAdminAccounts = (accounts: AdminAccount[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.ADMIN_ACCOUNTS, JSON.stringify(accounts));
  } catch (e) {
    console.error('Failed to save admin accounts to localStorage', e);
  }
};

export const getCurrentAdminSession = (): AdminAccount | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_ADMIN_SESSION);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const saveCurrentAdminSession = (account: AdminAccount | null): void => {
  try {
    if (account) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_ADMIN_SESSION, JSON.stringify(account));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_ADMIN_SESSION);
    }
  } catch (e) {
    console.error('Failed to update admin session in localStorage', e);
  }
};

export const resetToInitialDemoData = (): {
  exams: Exam[];
  submissions: StudentExamSubmission[];
  students: RegisteredStudent[];
  adminAccounts: AdminAccount[];
} => {
  saveStoredExams(INITIAL_EXAMS);
  saveStoredSubmissions(INITIAL_SUBMISSIONS);
  saveStoredStudents(INITIAL_STUDENTS);
  saveStoredAdminAccounts(INITIAL_ADMIN_ACCOUNTS);
  saveStoredEnforceWhitelist(true);
  return {
    exams: INITIAL_EXAMS,
    submissions: INITIAL_SUBMISSIONS,
    students: INITIAL_STUDENTS,
    adminAccounts: INITIAL_ADMIN_ACCOUNTS,
  };
};
