import { Exam, RegisteredStudent } from '../types';

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
  id: 'exam-ct-informatika-30',
  title: 'Asesmen Berpikir Komputasional (CT) & Literasi Kompleks Informatika',
  subject: 'Informatika - Computational Thinking',
  gradeClass: 'X-1, X-2, X-3, X-4, X-5',
  academicYear: '2025/2026',
  durationMinutes: 90,
  token: 'CTBATU',
  passingGrade: 75,
  teacherName: 'Abdul Aziz., S.Kom., Gr',
  defaultOptionScores: {"A":10,"B":7,"C":5,"D":3,"E":1},
  shuffleQuestions: true,
  shuffleOptions: true,
  showInstantScore: true,
  showExplanationAfter: true,
  allowReview: true,
  maxCheatViolations: 3,
  isActive: true,
  blockEarlyExit: false,
  createdAt: '2026-10-05T12:15:00.000Z',
  questions: [
    {
      id: 'q-ct-01',
      number: 1,
      category: 'Konsep & Filosofi CT',
      text: `[STIMULUS LITERASI TEORI KOMPUTASI]
Pada tahun 2006, Jeannette M. Wing mempublikasikan karya ilmiah seminal berjudul "Computational Thinking" yang merevolusi cara pandang dunia pendidikan terhadap ilmu komputer. Wing menegaskan bahwa Berpikir Komputasional (Computational Thinking/CT) bukanlah keahlian untuk membuat manusia berpikir layaknya sebuah komputer yang mekanis, kaku, dan serba biner. Sebaliknya, CT adalah proses pemikiran kognitif tingkat tinggi (cognitive process) yang melibatkan perumusan masalah beserta solusinya secara presisi, sedemikian rupa sehingga solusi tersebut dapat direpresentasikan dalam format yang dapat dieksekusi secara efektif oleh agen pemroses informasi—baik agen tersebut berupa manusia, mesin komputer, maupun kombinasi keduanya.

Berdasarkan pemaparan mendalam di atas, manakah kesimpulan yang paling tepat mengenai hakikat sejati dari Berpikir Komputasional (CT) dalam konteks pembelajaran abad ke-21?`,
      options: [
        {
          key: 'A',
          text: 'Keahlian teknis tingkat lanjut untuk menghafal sintaks bahasa pemrograman dan merakit perangkat keras komputer secara mekanis.',
        },
        {
          key: 'B',
          text: 'Keterampilan mengoperasikan berbagai aplikasi komersial perkantoran dan multimedia untuk meningkatkan kecepatan mengetik.',
        },
        {
          key: 'C',
          text: 'Sebuah kerangka kerja berpikir pemecahan masalah (problem solving) yang menyusun representasi solusi secara logis agar dapat dieksekusi oleh agen pemroses informasi, baik manusia maupun komputer.',
        },
        {
          key: 'D',
          text: 'Metode berpikir yang mewajibkan manusia bertindak seperti robot biner guna mengeliminasi seluruh emosi dalam pengambilan keputusan.',
        },
        {
          key: 'E',
          text: 'Proses otomatisasi penuh yang bertujuan menggantikan peran akal budi manusia seutuhnya dengan algoritma kecerdasan buatan.',
        },
      ],
      correctOption: 'C',
      optionScores: {"A":4,"B":3,"C":10,"D":2,"E":1},
      explanation: 'Sesuai naskah Jeannette M. Wing (2006), CT adalah proses kognitif pemecahan masalah di mana solusinya diformulasikan agar dapat dieksekusi oleh agen pemroses informasi (manusia maupun komputer), bukan sekadar mengetik kode atau berpikir mekanis seperti robot.',
    },
    {
      id: 'q-ct-02',
      number: 2,
      category: 'Sinergi Pilar CT',
      text: `[STIMULUS LITERASI METODOLOGI KOMPUTASIONAL]
Di era disrupsi digital saat ini, masyarakat dihadapkan pada fenomena luapan data (data deluge) dan persoalan multidimensi yang belum pernah terjadi sebelumnya. Untuk memecahkan tantangan besar tersebut, Berpikir Komputasional menyediakan empat pilar fondasi utama: Dekomposisi, Pengenalan Pola, Abstraksi, dan Berpikir Algoritma. Keempat fondasi ini bukanlah tahapan yang terpisah secara kaku, melainkan sebuah siklus sinergis.

Jika seorang peneliti lingkungan langsung menyusun serangkaian instruksi operasional lapangan (Algoritma) tanpa terlebih dahulu melakukan Dekomposisi masalah dan Abstraksi data, risiko sistemik apakah yang paling mungkin terjadi?`,
      options: [
        {
          key: 'A',
          text: 'Instruksi operasional akan dibanjiri oleh variabel tidak relevan (noise), tidak fokus pada akar kausalitas, dan rentan mengalami kegagalan fatal saat diimplementasikan.',
        },
        {
          key: 'B',
          text: 'Waktu eksekusi algoritma akan menjadi terlalu cepat sehingga sensor digital lapangan tidak sanggup merekam data sekunder.',
        },
        {
          key: 'C',
          text: 'Algoritma secara otomatis membersihkan seluruh noise data tanpa memerlukan penalaran awal dari manusia perancangnya.',
        },
        {
          key: 'D',
          text: 'Langkah penyelesaian masalah menjadi lebih hemat biaya karena melewati tahapan analisis konseptual yang memakan waktu.',
        },
        {
          key: 'E',
          text: 'Komputer yang digunakan untuk menyimulasikan model akan menolak mengeksekusi instruksi karena format dokumen tidak kompatibel.',
        },
      ],
      correctOption: 'A',
      optionScores: {"A":10,"B":4,"C":3,"D":2,"E":1},
      explanation: 'Tanpa dekomposisi untuk memilah akar masalah dan abstraksi untuk menyaring informasi esensial dari gangguan (noise), algoritma yang dirancang akan menjadi rumit, salah sasaran, dan gagal mengatasi titik kritis masalah.',
    },
    {
      id: 'q-ct-03',
      number: 3,
      category: 'Dekomposisi',
      text: `[STIMULUS ANALISIS PILAR DEKOMPOSISI]
Otak manusia memiliki kapasitas memori kerja (working memory) yang terbatas. Ketika dihadapkan pada krisis multidimensi yang masif, kecenderungan alamiah manusia yang tidak terlatih dalam CT adalah merasa kewalahan (overwhelmed) atau mengambil tindakan reaktif sesaat. Dekomposisi hadir sebagai teknik dekonstruksi masalah besar menjadi sub-komponen yang lebih kecil, independen, dan terkelola (manageable).

Manakah di antara skenario berikut yang mencerminkan penerapan Dekomposisi yang paling tepat dan profesional menurut prinsip Berpikir Komputasional?`,
      options: [
        {
          key: 'A',
          text: 'Membagi bantuan sembako kepada seluruh warga secara merata tanpa memeriksa apakah mereka terdampak langsung oleh banjir atau tidak.',
        },
        {
          key: 'B',
          text: 'Mengelompokkan data industri di bantaran sungai semata-mata berdasarkan warna cat pagar dan tahun berdirinya bangunan pabrik.',
        },
        {
          key: 'C',
          text: 'Menginstruksikan satu orang ahli untuk menyelesaikan seluruh penyelidikan krisis hulu-hilir sendirian secara bersamaan.',
        },
        {
          key: 'D',
          text: 'Memecah penanganan krisis banjir lumpur beracun kota ke dalam tiga fokus investigasi spesifik: hidrologi/cuaca, evaluasi tata guna lahan hulu, dan uji kimia limbah sedimen.',
        },
        {
          key: 'E',
          text: 'Menghentikan seluruh operasional transportasi perkotaan secara mendadak tanpa menganalisis titik simpul kemacetan yang kritis.',
        },
      ],
      correctOption: 'D',
      optionScores: {"A":4,"B":3,"C":2,"D":10,"E":1},
      explanation: 'Dekomposisi yang tepat memecah masalah besar menjadi sub-masalah logis dan terkelola berdasarkan domain determinan (cuaca, tata lahan, uji kimiawi) seperti yang dilakukan Dr. Aris pada materi CT.',
    },
    {
      id: 'q-ct-04',
      number: 4,
      category: 'Pengenalan Pola',
      text: `[STIMULUS LITERASI PENGENALAN POLA]
Dalam materi pembelajaran CT Informatika Kelas X SMAN 1 Batu, dicontohkan seorang dokter yang memeriksa pasien dengan keluhan demam tinggi, nyeri sendi persendian, dan munculnya ruam merah di kulit. Dokter tersebut tidak memperlakukan pasien itu sebagai teka-teki baru yang terisolasi, melainkan segera mengaitkannya dengan pola pasien demam berdarah dengue (DBD) yang ia tangani pada masa sebelumnya.

Prinsip komputasional apakah yang mendasari proses kognitif dokter tersebut, dan mengapa hal itu sangat krusial dalam pemecahan masalah?`,
      options: [
        {
          key: 'A',
          text: 'Dekomposisi; dokter membagi tubuh pasien ke dalam organ-organ terpisah sebelum mendengarkan keluhan demam pasien.',
        },
        {
          key: 'B',
          text: 'Pengenalan Pola (Pattern Recognition); memungkinkan penggunaan model solusi masa lalu untuk mempercepat diagnosis akurat dan penentuan uji laboratorium kritis.',
        },
        {
          key: 'C',
          text: 'Abstraksi Buta; dokter menolak mendengarkan keluhan pasien dan langsung menyalin resep obat dari buku pedoman umum.',
        },
        {
          key: 'D',
          text: 'Algoritma Acak; dokter mencoba berbagai macam obat secara bergantian hingga salah satunya menunjukkan efek penyembuhan.',
        },
        {
          key: 'E',
          text: 'Automasi Robotik; dokter menyerahkan seluruh pemeriksaan fisik kepada mesin rontgen tanpa melakukan wawancara anamnesis.',
        },
      ],
      correctOption: 'B',
      optionScores: {"A":4,"B":10,"C":3,"D":2,"E":1},
      explanation: 'Pengenalan Pola (Pattern Recognition) mengenali keteraturan dan kesamaan gejala saat ini dengan pengalaman historis, sehingga dokter dapat segera merekomendasikan tes trombosit darah secara efisien dan tepat sasaran.',
    },
    {
      id: 'q-ct-05',
      number: 5,
      category: 'Abstraksi',
      text: `[STIMULUS LITERASI ABSTRAKSI SISTEM]
Perhatikan diagram peta jaringan kereta bawah tanah (MRT) atau komuter perkotaan. Peta tersebut sengaja tidak menampilkan bentuk riil kelokan rel, pepohonan, luas bangunan gedung di atas permukaan tanah, maupun variasi kontur perbukitan. Peta hanya memvisualisasikan garis lurus berwarna, urutan nama stasiun, dan titik persimpangan transit antarlini.

Mengapa penyederhanaan pada peta MRT tersebut dikategorikan sebagai bentuk Abstraksi tingkat tinggi yang berhasil?`,
      options: [
        {
          key: 'A',
          text: 'Perancang peta kekurangan waktu dan anggaran untuk menggambar gedung dan pohon di sekitar stasiun secara realistis.',
        },
        {
          key: 'B',
          text: 'Jalur kereta bawah tanah tidak terikat dengan hukum gravitasi dan tata ruang permukaan bumi sehingga gedung diabaikan.',
        },
        {
          key: 'C',
          text: 'Peta sengaja dibuat membingungkan agar masyarakat lebih memilih menggunakan kendaraan pribadi di jalan raya.',
        },
        {
          key: 'D',
          text: 'Agar ukuran file gambar digital pada aplikasi ponsel pintar menjadi sekecil mungkin tanpa memedulikan kenyamanan pengguna.',
        },
        {
          key: 'E',
          text: 'Menyaring dan mempertahankan informasi esensial yang diperlukan penumpang (rute, stasiun, transit) sembari mengeliminasi detail fisik yang tidak relevan (noise visual).',
        },
      ],
      correctOption: 'E',
      optionScores: {"A":4,"B":3,"C":2,"D":1,"E":10},
      explanation: 'Abstraksi adalah seni memilah informasi esensial (stasiun & jalur) yang dibutuhkan agen pemroses (penumpang) dan mengabaikan detail tidak relevan (gedung, pohon, belokan riil) yang hanya mengotori persepsi.',
    },
    {
      id: 'q-ct-06',
      number: 6,
      category: 'Berpikir Algoritma',
      text: `[STIMULUS HAKIKAT ALGORITMA]
Dalam pilar Berpikir Algoritma (Algorithmic Thinking), suatu rancangan instruksi penyelesaian masalah dituntut memenuhi serangkaian syarat formal agar dapat dijalankan secara konsisten oleh manusia maupun komputer. Instruksi tersebut tidak boleh mengandalkan asumsi implisit atau interpretasi emosional pelaksananya.

Manakah kriteria yang PALING MENENTUKAN bahwa suatu prosedur telah memenuhi kaidah algoritma komputasional yang berkualitas?`,
      options: [
        {
          key: 'A',
          text: 'Memiliki urutan langkah logis yang terperinci, berhingga (finite), tidak ambigu (unambiguous), dan menghasilkan luaran deterministik yang sama saat diuji ulang.',
        },
        {
          key: 'B',
          text: 'Ditulis dalam bahasa Inggris tingkat tinggi dan hanya dapat dipahami oleh programmer bersertifikasi internasional.',
        },
        {
          key: 'C',
          text: 'Memiliki minimal seratus tahapan kerja agar prosedur terlihat sangat rumit dan canggih di mata publik.',
        },
        {
          key: 'D',
          text: 'Setiap instruksi bersifat lentur dan sengaja multitafsir agar pelaksana lapangan bebas mengubah urutan sesuka hati.',
        },
        {
          key: 'E',
          text: 'Hanya dapat dijalankan jika perangkat komputer terhubung dengan jaringan internet satelit berkecepatan gigabit.',
        },
      ],
      correctOption: 'A',
      optionScores: {"A":10,"B":4,"C":3,"D":2,"E":1},
      explanation: 'Algoritma yang baik wajib bersifat presisi, deterministik (tidak ambigu), memiliki batas langkah jelas (finiteness), dan menghasilkan output konsisten jika diberi input yang sama.',
    },
    {
      id: 'q-ct-07',
      number: 7,
      category: 'Kasus Kota Delta (Dekomposisi)',
      text: `[BACAAN STUDI KASUS 1 - KOTA DELTA]
Kota Delta adalah kawasan industri padat yang dilintasi oleh Sungai Ciliwung. Selama tiga tahun terakhir pada setiap puncak musim hujan bulan Januari, wilayah hilir Kota Delta selalu dilanda banjir bandang bercampur lumpur beracun yang melumpuhkan aktivitas ekonomi dan menyebabkan ribuan warga mengungsi. Pemerintah daerah membentuk Tim Satgas Penanggulangan Krisis yang dipimpin oleh Dr. Aris.

Menghadapi krisis masif ini, Dr. Aris secara tegas menolak solusi reaktif semacam sekadar membagikan sembako atau menambal tanggul sementara. Mengapa penolakan Dr. Aris tersebut mencerminkan penerapan pola pikir Berpikir Komputasional tingkat tinggi?`,
      options: [
        {
          key: 'A',
          text: 'Karena Dr. Aris menilai anggaran belanja sembako daerah terlalu murah sehingga tidak mengangkat gengsi penelitian tim satgas.',
        },
        {
          key: 'B',
          text: 'Karena warga pengungsi di hilir sungai menolak menerima bantuan logistik sebelum pabrik-pabrik ditutup secara paksa.',
        },
        {
          key: 'C',
          text: 'Karena solusi reaktif hanya meredakan gejala permukaan (symptomatic) tanpa menyentuh analisis kausalitas sistemik yang menjadi akar utama bencana.',
        },
        {
          key: 'D',
          text: 'Karena Dr. Aris ingin menunggu hingga banjir surut dengan sendirinya tanpa intervensi manusia sama sekali.',
        },
        {
          key: 'E',
          text: 'Karena pembagian sembako secara hukum dilarang dalam undang-undang manajemen penanggulangan bencana alam darurat.',
        },
      ],
      correctOption: 'C',
      optionScores: {"A":4,"B":3,"C":10,"D":2,"E":1},
      explanation: 'CT berorientasi pada pemecahan masalah berbasis akar penyebab (root-cause solving). Membagikan sembako adalah respons reaktif yang tidak menyelesaikan akar masalah hidrologi, alih fungsi lahan hulu, maupun pencemaran B3.',
    },
    {
      id: 'q-ct-08',
      number: 8,
      category: 'Kasus Kota Delta (Dekomposisi)',
      text: `[ANALISIS METODOLOGI KOTA DELTA]
Untuk mengungkap akar bencana banjir lumpur beracun di Kota Delta, Dr. Aris membagi investigasi ke dalam tiga area fokus yang independen namun saling melengkapi: (1) Tim Analisis Curah Hujan dan Tata Air, (2) Tim Evaluasi Tata Guna Lahan dan Deforestasi di hulu sungai, dan (3) Tim Uji Kualitas Air untuk mengidentifikasi kandungan kimiawi lumpur sedimen.

Dari perspektif pemrosesan informasi, keunggulan ilmiah apakah yang diperoleh melalui dekomposisi tiga area fokus investigasi tersebut?`,
      options: [
        {
          key: 'A',
          text: 'Menghilangkan kebutuhan rapat koordinasi karena ketiga tim dilarang saling bertukar data hingga bencana tahun berikutnya tiba.',
        },
        {
          key: 'B',
          text: 'Memungkinkan investigasi mendalam dan pengumpulan bukti saintifik berjalan secara paralel pada tiga determinan kritis: atmosferik, bentang lahan, dan polutan kimia.',
        },
        {
          key: 'C',
          text: 'Memastikan seluruh anggaran belanja investigasi terbagi rata menjadi sepertiga bagian tanpa sisa di rekening kas daerah.',
        },
        {
          key: 'D',
          text: 'Membuktikan bahwa banjir lumpur sebenarnya tidak berkaitan sama sekali dengan kondisi lingkungan di hulu sungai.',
        },
        {
          key: 'E',
          text: 'Membebaskan Dr. Aris dari tanggung jawab pelaporan kepada gubernur karena investigasi telah didelegasikan kepada ketua tim.',
        },
      ],
      correctOption: 'B',
      optionScores: {"A":4,"B":10,"C":3,"D":2,"E":1},
      explanation: 'Dekomposisi memecah kompleksitas krisis lingkungan menjadi 3 subsistem (atmosferik cuaca, hidrologi hulu, polutan industri) yang dapat dianalisis secara saintifik, paralel, dan mendalam.',
    },
    {
      id: 'q-ct-09',
      number: 9,
      category: 'Kasus Kota Delta (Pengenalan Pola)',
      text: `[ANALISIS DATA HISTORIS KOTA DELTA]
Setelah satu bulan mengumpulkan dan merekonsiliasi data, Tim Analisis membandingkan catatan cuaca, hidrologi, dan pasang surut selama 20 tahun terakhir. Mereka menemukan kecenderungan konsisten: banjir bandang besar selalu dan HANYA terjadi jika curah hujan harian melebihi 150 mm/hari berturut-turut selama tiga hari yang bertepatan dengan fenomena pasang air laut maksimum (rob).

Penemuan kecenderungan konsisten tersebut merupakan manifestasi pilar Pengenalan Pola karena...`,
      options: [
        {
          key: 'A',
          text: 'Merupakan kebetulan statistik yang tidak memiliki korelasi fisika atmosfer dengan meluapnya air sungai Ciliwung.',
        },
        {
          key: 'B',
          text: 'Membuktikan bahwa prediksi banjir dapat dilakukan tanpa memerlukan data kuantitatif curah hujan dari BMKG.',
        },
        {
          key: 'C',
          text: 'Mengabaikan faktor pasang air laut rob karena air laut berada di hilir dan tidak memengaruhi aliran air tawar sungai.',
        },
        {
          key: 'D',
          text: 'Menemukan keteraturan hubungan berulang dari rekaman data historis jangka panjang yang berfungsi sebagai kondisi batas pemicu (trigger boundary) bencana.',
        },
        {
          key: 'E',
          text: 'Menunjukkan bahwa data cuaca selama 20 tahun tidak dapat dipercaya untuk menyusun model peringatan dini banjir.',
        },
      ],
      correctOption: 'D',
      optionScores: {"A":4,"B":3,"C":2,"D":10,"E":1},
      explanation: 'Pengenalan Pola menemukan keteraturan (curah hujan >150mm/hari 3 hari berturut-turut + pasang rob maksimum) dari data 20 tahun sebagai pemicu deterministik bencana untuk dijadikan basis sistem deteksi dini.',
    },
    {
      id: 'q-ct-10',
      number: 10,
      category: 'Kasus Kota Delta (Abstraksi)',
      text: `[PENELUSURAN POLUTAN KOTA DELTA]
Tim Uji Kualitas Air mendeteksi konsentrasi tinggi logam berat berbahaya kromium dan timbal di dalam lumpur banjir. Saat mengolah peta industri di sepanjang bantaran sungai, Dr. Aris memutuskan untuk HANYA memeriksa pabrik tekstil dan pabrik aki baterai. Ia secara sadar mengabaikan ratusan pabrik makanan, pabrik kayu, dan ruko-ruko kecil, serta tidak memedulikan warna seragam pekerja maupun tahun berdiri pabrik.

Alasan rasional paling mendasar mengapa pengabaian data tersebut merupakan penerapan Abstraksi yang sangat tepat adalah...`,
      options: [
        {
          key: 'A',
          text: 'Pabrik makanan dan ruko kecil membayar retribusi keamanan lebih tinggi kepada dinas perindustrian kota.',
        },
        {
          key: 'B',
          text: 'Warna seragam pekerja dan tahun berdiri pabrik merupakan rahasia negara yang dilindungi undang-undang intelijen bisnis.',
        },
        {
          key: 'C',
          text: 'Dr. Aris meyakini bahwa pabrik kayu dan makanan tidak menggunakan air sungai untuk membuang limbah domestik.',
        },
        {
          key: 'D',
          text: 'Pabrik aki baterai dan tekstil berada di bawah naungan kementerian yang berbeda dengan pabrik makanan.',
        },
        {
          key: 'E',
          text: 'Menyaring variabel yang tidak relevan (noise) agar fokus tim tercurah pada penghasil potensial kromium dan timbal, sehingga menghemat waktu dan sumber daya krusial.',
        },
      ],
      correctOption: 'E',
      optionScores: {"A":4,"B":3,"C":2,"D":1,"E":10},
      explanation: 'Abstraksi mengeliminasi variabel noise (pabrik non-B3, warna seragam, usia bangunan) dan memusatkan investigasi hanya pada pabrik yang secara kimiawi memproduksi limbah kromium dan timbal.',
    },
    {
      id: 'q-ct-11',
      number: 11,
      category: 'Kasus Kota Delta (Algoritma)',
      text: `[PROTOKOL MITIGASI KOTA DELTA]
Pada akhirnya, Dr. Aris menyusun Protokol Mitigasi Kota Delta yang mengikat secara hukum:
Langkah 1: Jika BMKG merilis peringatan curah hujan >150 mm/hari dan pasang laut maksimum terindikasi, maka sirine Level 1 dibunyikan.
Langkah 2: Seluruh pabrik tekstil dan aki wajib menghentikan pembuangan limbah cair ke sungai dalam waktu 2x24 jam.
Langkah 3: Pintu air Katulampa Utara dibuka 50% untuk memecah debit, sementara warga zona merah dievakuasi ke zona aman.

Struktur kontrol logika pemrograman komputasional apakah yang paling mendasari "Langkah 1" pada Protokol Mitigasi tersebut?`,
      options: [
        {
          key: 'A',
          text: 'Perulangan tanpa henti (Infinite While Loop) yang membunyikan sirine sepanjang tahun tanpa memeriksa kondisi cuaca.',
        },
        {
          key: 'B',
          text: 'Percabangan kondisional logika ganda (IF curah_hujan > 150 AND pasang_rob == TRUE THEN aktifkan_sirine_level_1).',
        },
        {
          key: 'C',
          text: 'Struktur antrean berurutan (Queue - FIFO) untuk mengevakuasi seluruh warga kota tanpa memandang zonasi merah atau hijau.',
        },
        {
          key: 'D',
          text: 'Fungsi rekursif yang secara terus menerus membuka dan menutup pintu air Katulampa setiap detik secara acak.',
        },
        {
          key: 'E',
          text: 'Operasi logika disjungsi tunggal (OR) yang mengabaikan salah satu faktor cuaca maupun pasang air laut.',
        },
      ],
      correctOption: 'B',
      optionScores: {"A":4,"B":10,"C":3,"D":2,"E":1},
      explanation: 'Langkah 1 menerapkan struktur percabangan kondisional dengan konjungsi logika AND (kedua kondisi: hujan >150mm DAN pasang rob wajib terpenuhi bersamaan untuk memicu sirine Level 1).',
    },
    {
      id: 'q-ct-12',
      number: 12,
      category: 'Kasus Kota Delta (Algoritma)',
      text: `[ANALISIS DETERMINISTIK LANGKAH 2]
Pada Langkah 2 Protokol Mitigasi, tertulis: "Seluruh pabrik tekstil dan aki wajib menghentikan pembuangan limbah cair ke sungai dalam waktu 2x24 jam."

Mengapa pencantuman batasan waktu kuantitatif "2x24 jam" sangat penting dalam kaidah algoritma operasional, dibandingkan instruksi yang berbunyi "segera menghentikan pembuangan limbah"?`,
      options: [
        {
          key: 'A',
          text: 'Menghilangkan ambiguitas penafsiran (unambiguous) sehingga memiliki parameter batas waktu yang dapat diaudit, diukur kepatuhannya, dan ditegakkan sanksinya secara objektif.',
        },
        {
          key: 'B',
          text: 'Memberikan ruang bagi pihak industri untuk membuang seluruh sisa limbah beracun sebanyak-banyaknya sebelum tenggat waktu tiba.',
        },
        {
          key: 'C',
          text: 'Menyesuaikan dengan jadwal piket petugas kebersihan dinas lingkungan hidup yang bekerja dengan sistem giliran 48 jam.',
        },
        {
          key: 'D',
          text: 'Memastikan agar sanksi denda finansial dapat dikumpulkan ke kas daerah sebelum akhir bulan penanggalan masehi.',
        },
        {
          key: 'E',
          text: 'Mengikuti tradisi birokrasi pemerintahan daerah yang selalu menetapkan batas waktu kelipatan genap pada setiap surat edaran.',
        },
      ],
      correctOption: 'A',
      optionScores: {"A":10,"B":4,"C":3,"D":2,"E":1},
      explanation: 'Algoritma menuntut instruksi yang tidak ambigu (unambiguous). Batasan "2x24 jam" memberikan parameter terukur (deterministic bound) untuk penegakan kepatuhan, berbeda dengan frasa ambigu "segera".',
    },
    {
      id: 'q-ct-13',
      number: 13,
      category: 'Kasus Kota Delta (HOTS Evaluasi)',
      text: `[SIMULASI KASUS BATAS (EDGE CASE) KOTA DELTA]
Perhatikan skenario kondisi ekstrem berikut: Pada suatu hari di bulan Januari, BMKG mencatat curah hujan mencapai 149 mm/hari selama 3 hari berturut-turut (hanya berselisih 1 mm di bawah batas ambang 150 mm), sementara ketinggian pasang air laut rob mencapai rekor tertinggi dalam 50 tahun terakhir.

Jika sistem mitigasi otomatis Kota Delta diprogram secara kaku (hardcoded) murni menggunakan syarat logika "curah_hujan > 150", kerentanan sistemik apakah yang akan terjadi (False Negative)?`,
      options: [
        {
          key: 'A',
          text: 'Pintu air Katulampa Utara akan otomatis terbuka 100% dan menyedot air laut masuk ke dalam kawasan hulu sungai.',
        },
        {
          key: 'B',
          text: 'Komputer pemantau BMKG akan mengalami crash memori karena tidak sanggup membandingkan angka desimal di bawah 150.',
        },
        {
          key: 'C',
          text: 'Seluruh pabrik tekstil dan aki akan otomatis meledak karena saluran pipa limbah tidak menerima data sinyal peringatan.',
        },
        {
          key: 'D',
          text: 'Sirine Level 1 tidak akan berbunyi karena curah hujan 149 mm tidak memenuhi syarat > 150, padahal kombinasi debit air dan pasang laut ekstrem tetap memicu bencana banjir besar.',
        },
        {
          key: 'E',
          text: 'Warga zona merah akan secara sukarela mengungsi sendiri tanpa perlu menunggu instruksi dan bantuan dari tim satgas krisis.',
        },
      ],
      correctOption: 'D',
      optionScores: {"A":4,"B":3,"C":2,"D":10,"E":1},
      explanation: 'Kelemahan sistem berbasis ambang batas kaku (hardcoded boundary) tanpa margin toleransi atau fuzzy logic adalah terjadinya False Negative (gagal membunyikan alarm padahal bahaya nyata terjadi).',
    },
    {
      id: 'q-ct-14',
      number: 14,
      category: 'Kasus Kota Delta (HOTS Analisis)',
      text: `[EVALUASI MODEL KEBERLANJUTAN KOTA DELTA]
Keberhasilan Protokol Mitigasi Kota Delta menjadikannya sebagai "cetak biru" (blueprint) bagi kota-kota lain di provinsi tersebut. Dalam teori rekayasa perangkat lunak dan komputasi, konsep ini dikenal dengan prinsip Reusability (kemampuan digunakan ulang).

Karakteristik apakah yang menjadikan sebuah solusi komputasional seperti protokol Dr. Aris memiliki daya guna ulang (reusability) yang tinggi di lokasi lain?`,
      options: [
        {
          key: 'A',
          text: 'Protokol tersebut mewajibkan daerah lain memiliki luas wilayah, jumlah penduduk, dan letak geografis yang persis identik dengan Kota Delta.',
        },
        {
          key: 'B',
          text: 'Protokol dibuat sangat rahasia sehingga hanya dapat dibeli oleh pemerintah kota yang memiliki anggaran miliaran rupiah.',
        },
        {
          key: 'C',
          text: 'Protokol dirumuskan sebagai model algoritmik abstrak berbasis logika data empiris yang dapat disesuaikan parameter lokalnya di daerah lain tanpa mengubah esensi kerangka kerjanya.',
        },
        {
          key: 'D',
          text: 'Protokol menolak integrasi dengan perangkat lunak komputer dan murni dijalankan menggunakan instruksi lisan turun-temurun.',
        },
        {
          key: 'E',
          text: 'Protokol tersebut menjamin bahwa seluruh bencana banjir di muka bumi akan hilang seutuhnya tanpa perlu melakukan penanaman pohon kembali.',
        },
      ],
      correctOption: 'C',
      optionScores: {"A":4,"B":3,"C":10,"D":2,"E":1},
      explanation: 'Reusability terjadi karena solusi telah diabstraksi menjadi kerangka kerja algoritmik parametrik yang dapat diadaptasikan ke sistem lingkungan kota lain dengan menyesuaikan variabel ambang batas lokalnya.',
    },
    {
      id: 'q-ct-15',
      number: 15,
      category: 'Kasus Kota Delta (Korelasi vs Kausalitas)',
      text: `[UJI PENALARAN SAINS DATA KOTA DELTA]
Dalam tahapan Pengenalan Pola, seorang peneliti komputasional harus jeli memisahkan antara korelasi nyata yang bersifat sebab-akibat (kausal) dengan korelasi semu (spurious correlation) yang muncul secara kebetulan.

Di antara fenomena berikut di Kota Delta, manakah yang merupakan korelasi semu (spurious correlation) yang WAJIB disaring keluar melalui prinsip Abstraksi?`,
      options: [
        {
          key: 'A',
          text: 'Peningkatan laju erosi tanah di lereng hulu sungai Ciliwung akibat pembukaan hutan lindung menjadi kawasan villa komersial.',
        },
        {
          key: 'B',
          text: 'Tingginya kadar timbal pada sedimen muara sungai yang berdekatan dengan saluran pembuangan akhir pabrik aki kendaraan.',
        },
        {
          key: 'C',
          text: 'Penyempitan penampang melintang sungai akibat sedimentasi lumpur yang menurunkan daya tampung volume aliran air.',
        },
        {
          key: 'D',
          text: 'Kenaikan muka air pasang rob laut Jawa yang menghambat laju pembuangan gravitasi aliran sungai menuju lepas pantai.',
        },
        {
          key: 'E',
          text: 'Kenaikan drastis jumlah penjualan jas hujan dan payung di pasar swalayan Kota Delta pada setiap minggu yang bersamaan dengan terjadinya banjir lumpur.',
        },
      ],
      correctOption: 'E',
      optionScores: {"A":4,"B":3,"C":2,"D":1,"E":10},
      explanation: 'Penjualan payung/jas hujan meningkat di musim hujan bersamaan dengan banjir, tetapi payung bukan penyebab banjir. Ini adalah korelasi semu (spurious correlation) yang wajib dieliminasi dalam abstraksi.',
    },
    {
      id: 'q-ct-16',
      number: 16,
      category: 'Kasus Kota Delta (HOTS Sintesis)',
      text: `[PENGEMBANGAN SISTEM DETEKSI OTOMATIS]
Jika Dinas Lingkungan Hidup ingin membangun sistem Internet of Things (IoT) berbasis mikrokontroler di sepanjang sungai Kota Delta untuk memicu Langkah 1 protokol mitigasi secara otomatis, komponen sensor manakah yang paling esensial dipasang di stasiun pemantau hulu dan muara?`,
      options: [
        {
          key: 'A',
          text: 'Sensor curah hujan (tipping bucket rain gauge), sensor ultrasonik ketinggian muka air pasang/surut, dan probe spektrofotometer ion logam berat B3.',
        },
        {
          key: 'B',
          text: 'Kamera pengawas beresolusi tinggi yang khusus merekam pelat nomor kendaraan bermotor yang melintasi jembatan kota.',
        },
        {
          key: 'C',
          text: 'Sensor pendeteksi kebisingan suara klakson kendaraan untuk mengukur tingkat kemacetan lalu lintas jalan raya.',
        },
        {
          key: 'D',
          text: 'Sensor pemindai sidik jari dan biometrik wajah untuk seluruh nelayan tradisional yang melaut di pesisir teluk Delta.',
        },
        {
          key: 'E',
          text: 'Antena pemancar sinyal radio amatir frekuensi tinggi tanpa dilengkapi mikrokontroler penyimpan log data digital.',
        },
      ],
      correctOption: 'A',
      optionScores: {"A":10,"B":4,"C":3,"D":2,"E":1},
      explanation: 'Sensor IoT harus merefleksikan variabel kritis hasil dekomposisi Dr. Aris: curah hujan, ketinggian muka air/pasang rob, dan sensor kualitas kimiawi logam berat.',
    },
    {
      id: 'q-ct-17',
      number: 17,
      category: 'Kasus Kota Delta (Evaluasi Solusi)',
      text: `[EVALUASI KEBIJAKAN PABRIK KOTA DELTA]
Pada evaluasi akhir tahun, ditemukan bahwa sebuah pabrik tekstil besar tetap membuang limbah cair kromium pada malam hari saat hujan deras karena mengira petugas pengawas sedang tidur dan tidak melakukan inspeksi lapangan.

Strategi algoritma pengawasan komputasional apakah yang paling efektif untuk mendeteksi pelanggaran tersembunyi tersebut secara berkelanjutan?`,
      options: [
        {
          key: 'A',
          text: 'Mengirimkan surat peringatan tertulis setiap tiga bulan sekali melalui kantor pos tanpa melakukan pengambilan sampel air.',
        },
        {
          key: 'B',
          text: 'Meminta satpam pabrik untuk mengisi kuesioner kejujuran tentang volume limbah yang dibuang oleh pihak manajemen.',
        },
        {
          key: 'C',
          text: 'Memasang sensor telemetri kualitas air otomatis di pipa outlet pabrik yang mengirimkan log data kadar kromium secara realtime 24 jam ke server pusat pengawas.',
        },
        {
          key: 'D',
          text: 'Menutup aliran listrik ke seluruh permukiman warga sekitar pabrik pada malam hari saat hujan deras turun.',
        },
        {
          key: 'E',
          text: 'Menghapus kromium dari daftar zat kimia berbahaya agar pabrik tidak dianggap melanggar regulasi lingkungan hidup.',
        },
      ],
      correctOption: 'C',
      optionScores: {"A":4,"B":3,"C":10,"D":2,"E":1},
      explanation: 'Otomatisasi pengawasan telemetri 24 jam menghilangkan celah kelemahan pengawasan manual manusia dan mendeteksi anomali limbah malam hari secara presisi.',
    },
    {
      id: 'q-ct-18',
      number: 18,
      category: 'Kasus Garuda Rescue (Dekomposisi)',
      text: `[BACAAN STUDI KASUS 2 - GARUDA RESCUE]
Gempa bumi berkekuatan 7.2 Magnitudo melanda kawasan pegunungan Seribu Bukit. Akses jalan darat terputus total akibat longsor masif. Ribuan warga di 15 desa terisolasi tanpa makanan dan obat-obatan. Badan Nasional Penanggulangan Bencana (BNPB) harus segera mendistribusikan bantuan menggunakan 5 unit helikopter kargo yang dimiliki. Waktu sangat krusial karena kapasitas bahan bakar helikopter terbatas dan cuaca sering berubah buruk di sore hari.

Komandan Logistik, Kapten Rina, menolak melihat 15 desa tersebut sebagai satu kekacauan acak. Ia mengelompokkan 15 desa ke dalam 3 Sektor Utama: Sektor Utara (kerusakan parah), Sektor Tengah (kerusakan sedang), dan Sektor Selatan (kerusakan ringan).

Proses berpikir komputasional apakah yang diterapkan Kapten Rina melalui pengelompokan 15 desa tersebut?`,
      options: [
        {
          key: 'A',
          text: 'Pengenalan Pola Acak; mencampuradukkan data korban bencana tanpa memperhatikan tingkat kerusakan wilayah.',
        },
        {
          key: 'B',
          text: 'Abstraksi Parsial; mengabaikan seluruh desa di Sektor Utara karena kerusakannya dianggap terlalu sulit untuk dijangkau.',
        },
        {
          key: 'C',
          text: 'Algoritma Buta; memerintahkan pilot menerbangkan helikopter ke arah mana pun sesuai arah tiupan angin pagi hari.',
        },
        {
          key: 'D',
          text: 'Dekomposisi; mereduksi kompleksitas tantangan logistik 15 lokasi terisolasi menjadi 3 kluster terkelola berbasis derajat keparahan kerusakan dan skala prioritas.',
        },
        {
          key: 'E',
          text: 'Simulasi Fiktif; menunda pengiriman bantuan hingga seluruh jalan darat selesai diaspal kembali oleh dinas pekerjaan umum.',
        },
      ],
      correctOption: 'D',
      optionScores: {"A":4,"B":3,"C":2,"D":10,"E":1},
      explanation: 'Mengelompokkan 15 desa menjadi 3 sektor berdasarkan tingkat keparahan adalah penerapan pilar Dekomposisi untuk memecah masalah besar menjadi sub-masalah logis yang terkelola.',
    },
    {
      id: 'q-ct-19',
      number: 19,
      category: 'Kasus Garuda Rescue (Pengenalan Pola)',
      text: `[ANALISIS JENDELA CUACA GARUDA RESCUE]
Berdasarkan evaluasi arsip misi penanggulangan bencana tahun-tahun sebelumnya di kawasan perbukitan, Kapten Rina dan tim mengenali sebuah pola mikroklimat konsisten: desa-desa yang berada di lembah curam (Sektor Utara) selalu diselimuti kabut tebal pekat setelah pukul 14.00 siang, yang membuat penerbangan helikopter menjadi mustahil dan berisiko mematikan.

Bagaimanakah rekognisi pola cuaca tersebut memengaruhi konstruksi strategi penerbangan Kapten Rina?`,
      options: [
        {
          key: 'A',
          text: 'Menyebabkan operasi penerbangan ke Sektor Utara dibatalkan sama sekali demi melindungi keselamatan helikopter dari tetesan air kabut.',
        },
        {
          key: 'B',
          text: 'Mendorong Kapten Rina mengalokasikan seluruh (5) helikopter secara maksimal ke Sektor Utara pada pagi hari (06.00 - 10.00) sebelum batas jendela cuaca berkabut tertutup.',
        },
        {
          key: 'C',
          text: 'Membuat Kapten Rina menginstruksikan pilot untuk menembus kabut tebal pada sore hari tanpa bantuan instrumen penerbangan.',
        },
        {
          key: 'D',
          text: 'Memindahkan lokasi pangkalan utama helikopter ke dasar lembah curam Sektor Utara agar lebih dekat dengan lokasi kabut.',
        },
        {
          key: 'E',
          text: 'Mengubah jadwal misi sehingga penerbangan hanya dilakukan pada malam hari saat matahari telah terbenam.',
        },
      ],
      correctOption: 'B',
      optionScores: {"A":4,"B":10,"C":3,"D":2,"E":1},
      explanation: 'Pengenalan pola kabut tebal setelah jam 14.00 di lembah Sektor Utara menjadi dasar penentuan urutan jadwal (algoritma): fokuskan seluruh armada di pagi hari (06.00-10.00) ke Sektor Utara.',
    },
    {
      id: 'q-ct-20',
      number: 20,
      category: 'Kasus Garuda Rescue (Abstraksi)',
      text: `[SELEKSI MANIFES KARGO GARUDA RESCUE]
Saat mempersiapkan pemuatan barang ke helikopter, banyak warga dan relawan donatur menitipkan barang pribadi, tumpukan pakaian bekas, buku cerita, dan mainan anak-anak. Kapten Rina dengan tegas memfilter manifes kargo. Ia menetapkan bahwa untuk 72 jam pertama, helikopter HANYA akan memuat: air bersih, terpal medis (P3K), makanan instan padat kalori, dan perangkat komunikasi darurat.

Proses berpikir komputasional apakah yang diterapkan Kapten Rina, dan apakah justifikasi ilmiahnya dari sudut pandang keterbatasan sistem (system constraints)?`,
      options: [
        {
          key: 'A',
          text: 'Dekomposisi; membagikan mainan anak-anak terlebih dahulu agar korban bencana tidak mengalami kesedihan berlarut-larut.',
        },
        {
          key: 'B',
          text: 'Algoritma Buta; mengabaikan seluruh permintaan bantuan dan membiarkan helikopter terbang dalam keadaan kosong tanpa muatan.',
        },
        {
          key: 'C',
          text: 'Pengenalan Pola; menyimpulkan bahwa seluruh korban bencana gempa bumi tidak membutuhkan pakaian dan obat-obatan.',
        },
        {
          key: 'D',
          text: 'Otomatisasi Kargo; memprogram helikopter untuk menjatuhkan barang donasi di atas perairan danau tanpa parasut penerjun.',
        },
        {
          key: 'E',
          text: 'Abstraksi; membuang barang non-kritis dan memprioritaskan muatan penyelamat nyawa (life-saving) karena payload dan volume kargo helikopter sangat terbatas pada fase kritis 72 jam pertama.',
        },
      ],
      correctOption: 'E',
      optionScores: {"A":4,"B":3,"C":2,"D":1,"E":10},
      explanation: 'Abstraksi menyingkirkan detail/elemen non-kritis (baju bekas, mainan) dan fokus pada prioritas keselamatan nyawa (air, medis, makanan kalori, radio) karena kapasitas angkut helikopter sangat terbatas.',
    },
    {
      id: 'q-ct-21',
      number: 21,
      category: 'Kasus Garuda Rescue (Algoritma)',
      text: `[ANALISIS JADWAL FLIGHT PLAN]
Perhatikan jadwal penerbangan (Flight Plan) yang dirancang oleh Kapten Rina:
1. Pukul 06.00 - 10.00: Seluruh (5) helikopter dikerahkan hanya untuk Sektor Utara.
2. Pukul 10.00 - 11.00: Helikopter kembali ke pangkalan untuk isi bahan bakar ulang (refueling).
3. Pukul 11.00 - 14.00: 3 helikopter dikerahkan ke Sektor Tengah, 2 helikopter ke Sektor Selatan.
4. Pukul 14.00 - Selesai: Operasi penerbangan dihentikan untuk inspeksi mesin harian dan menghindari cuaca buruk sore hari.

Apakah jadwal penerbangan tersebut sah memenuhi syarat sebagai sebuah "Algoritma"? Berikan evaluasi rasionalnya!`,
      options: [
        {
          key: 'A',
          text: 'Ya, memenuhi syarat penuh; jadwal berupa instruksi logis, dieksekusi secara kronologis teratur, memiliki kuantitas sumber daya spesifik per jam, dan deterministik bagi seluruh pilot.',
        },
        {
          key: 'B',
          text: 'Tidak memenuhi syarat; karena jadwal tersebut disusun oleh seorang perwira manusia dan tidak dieksekusi oleh bahasa pemrograman Python atau C++.',
        },
        {
          key: 'C',
          text: 'Tidak memenuhi syarat; karena jadwal hanya mencakup kurun waktu dari pagi hingga sore hari dan tidak berjalan selama 24 jam nonstop.',
        },
        {
          key: 'D',
          text: 'Sebagian memenuhi syarat; namun dianggap cacat logika karena membiarkan helikopter beristirahat pada pukul 10.00 - 11.00.',
        },
        {
          key: 'E',
          text: 'Tidak memenuhi syarat; karena algoritma sejati harus berbentuk kode biner 0 dan 1 yang tertanam di dalam mesin helikopter.',
        },
      ],
      correctOption: 'A',
      optionScores: {"A":10,"B":4,"C":3,"D":2,"E":1},
      explanation: 'Jadwal tersebut adalah algoritma valid: langkah terstruktur, spesifik dalam alokasi armada per jam dan sektor, logis, terhingga, dan siap dieksekusi oleh agen manusia (pilot).',
    },
    {
      id: 'q-ct-22',
      number: 22,
      category: 'Kasus Garuda Rescue (Keandalan Sistem)',
      text: `[ANALISIS TAHAP REFUELING PUKUL 10.00]
Dalam jadwal penerbangan Kapten Rina, pukul 10.00 - 11.00 ditetapkan secara ketat: "Helikopter kembali ke pangkalan untuk isi bahan bakar ulang (refueling)".

Jika seorang pejabat lapangan menuntut agar tahap refueling tersebut dihilangkan demi gengsi publikasi bahwa helikopter terbang tanpa jeda, konsekuensi kegagalan sistem komputasional (system failure) apakah yang pasti terjadi?`,
      options: [
        {
          key: 'A',
          text: 'Helikopter akan terbang lebih kencang karena muatan bahan bakar di dalam tangki menjadi kosong dan ringan.',
        },
        {
          key: 'B',
          text: 'Penduduk di Sektor Tengah akan menerima makanan instan dalam kondisi terlalu panas akibat panas mesin helikopter.',
        },
        {
          key: 'C',
          text: 'Cuaca buruk di sore hari akan tertunda kemunculannya hingga pengisian bahan bakar dilakukan pada malam hari.',
        },
        {
          key: 'D',
          text: 'Kehabisan daya sumber energi di tengah rute penerbangan sesi kedua (Resource Depletion), yang memicu insiden kecelakaan fatal dan kegagalan total seluruh misi kemanusiaan.',
        },
        {
          key: 'E',
          text: 'Pilot helikopter akan kehilangan sinyal GPS satelit secara permanen akibat ketiadaan avtur di dalam karburator.',
        },
      ],
      correctOption: 'D',
      optionScores: {"A":4,"B":3,"C":2,"D":10,"E":1},
      explanation: 'Dalam manajemen sistem sumber daya terbatas, proses replenishment (pengisian ulang avtur) adalah prasyarat mutlak. Menghilangkannya memicu kegagalan sistemik fatal (kehabisan bahan bakar di udara).',
    },
    {
      id: 'q-ct-23',
      number: 23,
      category: 'Kasus Garuda Rescue (Inspeksi Mesin)',
      text: `[ANALISIS TAHAP 4: SAFETY MARGIN]
Pada tahapan ke-4 jadwal Kapten Rina tertulis: "Pukul 14.00 - Selesai: Operasi dihentikan untuk inspeksi mesin harian dan menghindari cuaca buruk sore hari."

Dari perspektif pemeliharaan sistem komputasional yang tangguh (robust & sustainable system), mengapa penghentian operasi pada pukul 14.00 merupakan keputusan yang sangat cerdas, alih-alih bentuk pemalasan?`,
      options: [
        {
          key: 'A',
          text: 'Memberi kesempatan kepada Kapten Rina untuk meninggalkan lokasi posko bencana dan berlibur ke luar kota pegunungan.',
        },
        {
          key: 'B',
          text: 'Menerapkan batas toleransi keamanan (safety threshold) untuk mencegah risiko kerugian aset total akibat cuaca buruk dan menjamin kesiapan armada untuk beroperasi kembali keesokan paginya.',
        },
        {
          key: 'C',
          text: 'Karena setelah pukul 14.00 seluruh korban bencana di perbukitan sudah tidak membutuhkan pertolongan medis.',
        },
        {
          key: 'D',
          text: 'Menghabiskan alokasi anggaran operasional harian agar sisa saldo bahan bakar avtur hangus dan diganti anggaran baru.',
        },
        {
          key: 'E',
          text: 'Agar seluruh pilot helikopter dapat menghadiri konferensi pers di kantor bupati sebelum matahari terbenam.',
        },
      ],
      correctOption: 'B',
      optionScores: {"A":4,"B":10,"C":3,"D":2,"E":1},
      explanation: 'Pilar algoritma memperhitungkan batasan keselamatan lingkungan (safety margin). Menghentikan operasi pada pukul 14.00 mencegah kecelakaan di cuaca ekstrem berkabut dan memastikan kesiapan armada jangka panjang.',
    },
    {
      id: 'q-ct-24',
      number: 24,
      category: 'Sintesis Kasus 1 & 2 (Abstraksi)',
      text: `[SINTESIS KOMPARATIF KASUS 1 & 2]
Bandingkan tindakan Dr. Aris pada Kasus 1 (Kota Delta) dan Kapten Rina pada Kasus 2 (Garuda Rescue). Keduanya sama-sama memimpin tim penyelamat dalam situasi darurat berskala besar dengan keterbatasan sumber daya.

Persamaan mendasar apakah yang dapat disintesis dari cara kedua tokoh tersebut menerapkan pilar ABSTRAKSI dalam menyelesaikan krisis masing-masing?`,
      options: [
        {
          key: 'A',
          text: 'Keduanya menolak menggunakan bantuan teknologi komputer dan hanya mengandalkan firasat batin dalam memimpin operasi penyelamatan.',
        },
        {
          key: 'B',
          text: 'Keduanya membagi daerah krisis menjadi sepuluh zona acak tanpa menggunakan data historis bencana masa lalu.',
        },
        {
          key: 'C',
          text: 'Keduanya secara disiplin menyaring dan membuang elemen non-kritis (pabrik non-B3 oleh Dr. Aris, dan barang non-medis oleh Kapten Rina) demi memusatkan kapasitas terbatas pada faktor penyelamat hidup utama.',
        },
        {
          key: 'D',
          text: 'Keduanya membatalkan operasi evakuasi warga dan membiarkan krisis diselesaikan sendiri oleh alam.',
        },
        {
          key: 'E',
          text: 'Keduanya memfokuskan seluruh bantuan logistik kepada masyarakat yang memiliki jabatan politik tertinggi di wilayah krisis.',
        },
      ],
      correctOption: 'C',
      optionScores: {"A":4,"B":3,"C":10,"D":2,"E":1},
      explanation: 'Kedua tokoh mendemonstrasikan pilar Abstraksi: menyingkirkan elemen noise (pabrik non-B3 dan barang donasi sekunder) untuk memprioritaskan faktor esensial penyelamat hidup (life-saving factors).',
    },
    {
      id: 'q-ct-25',
      number: 25,
      category: 'Sintesis Kasus 1 & 2 (Dekomposisi)',
      text: `[SINTESIS DIMENSI DEKOMPOSISI]
Pada Kasus 1 (Kota Delta), Dr. Aris melakukan dekomposisi berdasarkan *aspek sains investigasi* (hidrologi, tata lahan, uji kimiawi). Sementara pada Kasus 2 (Garuda Rescue), Kapten Rina melakukan dekomposisi berdasarkan *kluster geografis dan tingkat kerusakan* (Sektor Utara, Tengah, Selatan).

Kesimpulan konseptual apakah yang paling valid mengenai fleksibilitas pilar Dekomposisi dalam pemecahan masalah dunia nyata?`,
      options: [
        {
          key: 'A',
          text: 'Dekomposisi hanya sah dan benar jika membagi daerah menjadi tiga sektor geografis yang berbentuk bujur sangkar sempurna.',
        },
        {
          key: 'B',
          text: 'Dekomposisi pada operasi tanggap bencana alam selalu gagal jika tidak menggunakan rumus matematika diferensial integral.',
        },
        {
          key: 'C',
          text: 'Dekomposisi fungsional sains lingkungan tidak boleh digabungkan dengan dekomposisi geografis dalam satu sistem pemerintahan.',
        },
        {
          key: 'D',
          text: 'Dekomposisi harus selalu menghasilkan bagian-bagian yang dikerjakan oleh robot tanpa keterlibatan tenaga manusia.',
        },
        {
          key: 'E',
          text: 'Dekomposisi dapat diterapkan melalui berbagai dimensi pemotongan (fungsional, spasial/geografis, kronologis, atau derajat keparahan), disesuaikan dengan arsitektur masalah dan tujuan operasional.',
        },
      ],
      correctOption: 'E',
      optionScores: {"A":4,"B":3,"C":2,"D":1,"E":10},
      explanation: 'Dekomposisi bersifat fleksibel dan adaptif: dapat dilakukan secara fungsional keilmuan maupun spasial geografis, disesuaikan dengan kebutuhan pemecahan masalah di lapangan.',
    },
    {
      id: 'q-ct-26',
      number: 26,
      category: 'Adaptasi Algoritma Dinamis',
      text: `[SIMULASI KENDALA TAK TERDUGA GARUDA RESCUE]
Pada pukul 08.00 pagi dalam misi Garuda Rescue, sebuah helikopter kargo mengalami kerusakan pompa oli darurat dan harus diistirahatkan di pangkalan, sehingga armada yang siap terbang tersisa 4 unit.

Berdasarkan prinsip berpikir komputasional yang tangguh dan adaptif, modifikasi algoritma jadwal manakah yang paling rasional diambil oleh Kapten Rina?`,
      options: [
        {
          key: 'A',
          text: 'Membatalkan seluruh penerbangan hari itu dan membiarkan warga di 15 desa menunggu hingga helikopter pengganti tiba minggu depan.',
        },
        {
          key: 'B',
          text: 'Menjaga prioritas penyelamatan Sektor Utara dengan mengerahkan ke-4 helikopter tersisa hingga pukul 10.00, lalu mengalokasikan masing-masing 2 helikopter untuk Sektor Tengah dan Selatan di sesi siang.',
        },
        {
          key: 'C',
          text: 'Memaksa helikopter yang rusak pompa oli untuk tetap terbang membawa muatan melintasi perbukitan berkabut tebal.',
        },
        {
          key: 'D',
          text: 'Mengalihkan seluruh muatan kargo ke mobil ambulans darat yang sudah terbukti tidak bisa melintas karena longsor.',
        },
        {
          key: 'E',
          text: 'Memerintahkan pilot menerbangkan helikopter ke Sektor Selatan saja karena paling mudah dijangkau dan bebas resiko.',
        },
      ],
      correctOption: 'B',
      optionScores: {"A":4,"B":10,"C":3,"D":2,"E":1},
      explanation: 'Algoritma yang adaptif melakukan penyesuaian parameter sumber daya (dari 5 unit menjadi 4 unit) tanpa mengorbankan prioritas keselamatan utama (Sektor Utara tetap prioritas pagi hari).',
    },
    {
      id: 'q-ct-27',
      number: 27,
      category: 'Kognitif & Bias Data',
      text: `[ANALISIS BIAS KONFIRMASI DALAM CT]
Dalam pengenalan pola dan analisis data, manusia rentan mengalami *Confirmation Bias* (hanya mencari atau mempercayai data yang membenarkan prasangka pribadi awal, dan mengabaikan data anomali yang bertentangan).

Jika dalam Kasus Kota Delta, Dr. Aris sejak awal berprasangka buruk bahwa "seluruh pencemaran kromium pasti berasal dari pabrik makanan", kesalahan fatal apakah yang akan merusak sistem penanganan krisis?`,
      options: [
        {
          key: 'A',
          text: 'Investigasi akan menyasar target yang keliru dan menutup industri makanan yang tidak bersalah, sementara pabrik tekstil dan aki pencemar sesungguhnya terus membuang limbah B3.',
        },
        {
          key: 'B',
          text: 'Lumpur sungai akan mendadak mengendap secara bersih tanpa menyisakan kandungan logam berat kromium dan timbal.',
        },
        {
          key: 'C',
          text: 'Curah hujan harian Kota Delta akan otomatis turun di bawah 50 mm/hari karena pabrik makanan berhenti memproduksi uap air.',
        },
        {
          key: 'D',
          text: 'Pintu air Katulampa Utara akan secara otomatis mengunci diri dan menolak dibuka hingga musim hujan Januari berakhir.',
        },
        {
          key: 'E',
          text: 'Warga pengungsi di hilir sungai akan beralih mengonsumsi makanan cepat saji kalengan dari luar negeri.',
        },
      ],
      correctOption: 'A',
      optionScores: {"A":10,"B":4,"C":3,"D":2,"E":1},
      explanation: 'Bias konfirmasi mendistorsi pengenalan pola ilmiah: sumber daya terbuang untuk menindak entitas yang salah (pabrik makanan), sedangkan sumber racun sesungguhnya (tekstil & aki) tetap bebas mencemari sungai.',
    },
    {
      id: 'q-ct-28',
      number: 28,
      category: 'Transfer Kontekstual SMAN 1 Batu',
      text: `[STUDI KASUS KONTEKSTUAL LOKAL - PERTANIAN APEL KOTA BATU]
Kawasan pertanian apel di lereng Bumiaji dan Panderman Kota Batu menghadapi tantangan serius berupa anomali cuaca mikro, serangan hama kutu sisik, dan fluktuasi kelembapan tanah yang menurunkan produksi buah apel Manalagi.

Siswa Kelas X SMAN 1 Batu ditugaskan merancang solusi sistem Pertanian Presisi (Smart Precision Farming) berbasis Berpikir Komputasional. Tindakan manakah yang merepresentasikan pilar PENGENALAN POLA secara tepat dalam proyek ini?`,
      options: [
        {
          key: 'A',
          text: 'Mengecat batang pohon apel dengan warna putih agar terlihat rapi saat difoto oleh wisatawan yang berkunjung ke kebun.',
        },
        {
          key: 'B',
          text: 'Membeli pompa air berkapasitas terbesar di pasaran tanpa memeriksa debit sumber mata air alami di lereng bukit.',
        },
        {
          key: 'C',
          text: 'Mengganti seluruh pohon apel dengan tanaman padi sawah tanpa menguji kesesuaian jenis tanah dan ketinggian lereng.',
        },
        {
          key: 'D',
          text: 'Menganalisis korelasi data histori sensor kelembapan tanah, suhu udara, dan kecepatan angin selama 5 musim panen dengan siklus kemunculan ledakan populasi hama kutu sisik.',
        },
        {
          key: 'E',
          text: 'Menyemprotkan cairan pestisida kimia secara serentak setiap jam sepanjang hari tanpa memantau keberadaan hama.',
        },
      ],
      correctOption: 'D',
      optionScores: {"A":4,"B":3,"C":2,"D":10,"E":1},
      explanation: 'Pengenalan Pola pada pertanian presisi mengkorelasikan variabel iklim mikro (suhu, kelembapan) dengan waktu munculnya hama selama beberapa musim panen untuk memprediksi serangan lebih dini.',
    },
    {
      id: 'q-ct-29',
      number: 29,
      category: 'Transfer Kontekstual SMAN 1 Batu',
      text: `[STUDI KASUS KONTEKSTUAL LOKAL - MANAJEMEN LALU LINTAS WISATA BATU]
Setiap akhir pekan panjang, kemacetan parah melanda ruas jalan protokol Kota Batu menuju kawasan wisata utama (Jalan Diponegoro, Pattimura, dan Oro-Oro Ombo). Siswa SMAN 1 Batu diminta merancang purwarupa algoritma rute alternatif cerdas (Dynamic Re-routing) untuk mengurai kepadatan kendaraan.

Dalam proses memodelkan jaringan jalan Kota Batu ke dalam bentuk graf (Graph Modeling), tindakan ABSTRAKSI manakah yang paling esensial dilakukan?`,
      options: [
        {
          key: 'A',
          text: 'Menghitung secara rinci setiap helai daun dan jenis tanaman hias di median jalan sebelum menghitung volume kendaraan yang melintas.',
        },
        {
          key: 'B',
          text: 'Mengharuskan setiap pengendara mobil wisata menyebutkan nama lengkap kakek-neneknya sebelum diizinkan melintasi jalan Diponegoro.',
        },
        {
          key: 'C',
          text: 'Merepresentasikan persimpangan sebagai titik (Nodes) dan ruas jalan sebagai garis berbobot (Edges) yang memuat panjang jalan serta kecepatan rata-rata, sembari mengabaikan warna cat ruko atau jenis pohon di tepi jalan.',
        },
        {
          key: 'D',
          text: 'Menggambar kembali seluruh reklame iklan komersial di sepanjang jalan dengan tingkat kedetilan piksel 4K ke dalam peta GPS navigasi.',
        },
        {
          key: 'E',
          text: 'Menghapus nama-nama jalan di Kota Batu dan menggantinya dengan angka acak yang diundi setiap pagi hari.',
        },
      ],
      correctOption: 'C',
      optionScores: {"A":4,"B":3,"C":10,"D":2,"E":1},
      explanation: 'Dalam pemodelan graf rute lalu lintas, Abstraksi mereduksi jalan menjadi simpul (nodes) persimpangan dan ruas (edges) berbobot jarak/waktu, membuang detail visual (warna toko, pohon) yang tidak relevan bagi kalkulasi rute terpendek.',
    },
    {
      id: 'q-ct-30',
      number: 30,
      category: 'Etika & Refleksi Rekayasa Sistem',
      text: `[REFLEKSI AKHIR - ETIKA KOMPUTASIONAL & PEMBELAJARAN MENDALAM]
Sebagai generasi muda yang mempelajari Informatika dan Berpikir Komputasional di SMAN 1 Batu, siswa kelak akan merancang dan mengoperasikan berbagai algoritma otomasi serta kecerdasan buatan yang memengaruhi hajat hidup masyarakat (seperti algoritma evakuasi bencana, kuota air irigasi, atau seleksi penerimaan beasiswa).

Prinsip etis dan humanis manakah yang paling fundamental dijaga oleh seorang perancang sistem komputasi yang bertanggung jawab?`,
      options: [
        {
          key: 'A',
          text: 'Merancang algoritma sebagai kotak hitam (Black Box) yang tertutup rapat agar tidak ada warga masyarakat yang dapat memprotes keputusan sistem.',
        },
        {
          key: 'B',
          text: 'Memprogram sistem agar selalu mendahulukan kepentingan kelompok elit pemilik modal terbesar dibanding keselamatan warga perkampungan kecil.',
        },
        {
          key: 'C',
          text: 'Menghapus rekaman log jejak audit secara otomatis jika terindikasi sistem melakukan kesalahan fatal yang merugikan masyarakat luas.',
        },
        {
          key: 'D',
          text: 'Menyerahkan seluruh keputusan etika dan moral kepada prosesor komputer tanpa menyediakan ruang banding atau pengawasan oleh manusia.',
        },
        {
          key: 'E',
          text: 'Menjaga transparansi logika pengambilan keputusan (Explainability), keadilan algoritma tanpa bias diskriminatif, perlindungan privasi data warga, dan akuntabilitas moral manusia terhadap dampak keputusan sistem.',
        },
      ],
      correctOption: 'E',
      optionScores: {"A":4,"B":3,"C":2,"D":1,"E":10},
      explanation: 'Prinsip etika rekayasa komputasional modern menuntut transparansi (explainable algorithms), keadilan data (fairness), keselamatan warga, dan pertanggungjawaban manusia (human accountability) sebagai pemegang kendali utama.',
    },
  ],
};
