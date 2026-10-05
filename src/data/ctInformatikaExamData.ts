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
 * Paket Ujian 30 Soal HOTS Berpikir Komputasional Kelas X SMA
 * Mengacu pada Dokumen Resmi "Materi_CT_Informatika_SMAN_1_Batu.pdf"
 * Penyusun: Abdul Aziz., S.Kom., Gr
 * Karakteristik:
 * 1. Bahasa Indonesia baku dan lugas tanpa istilah asing yang rumit
 * 2. Literasi kontekstual panjang & mendalam (studi kasus Delta, Garuda Rescue, serta kehidupan sehari-hari siswa di rumah, sekolah, dan Kota Batu)
 * 3. Tidak sekadar definisi teori, tetapi penalaran analitis aplikatif (HOTS)
 * 4. Master Admin: Seluruh Kunci Jawaban berada di Opsi A (Nilai 10)
 * 5. Tampilan Siswa: Opsi dan nomor soal diacak otomatis secara dinamis (shuffleQuestions: true, shuffleOptions: true)
 */
export const CT_INFORMATIKA_30_EXAM: Exam = {
  id: 'exam-ct-inf-x-30',
  title: 'Informatika - Computational Thinking',
  subject: 'Informatika - Computational Thinking',
  gradeClass: 'Semua Kelas X (X-1 s/d X-12)',
  academicYear: '2026/2027',
  durationMinutes: 90,
  token: 'CT2026',
  passingGrade: 75,
  teacherName: 'Abdul Aziz., S.Kom., Gr',
  defaultOptionScores: { A: 10, B: 0, C: 0, D: 0, E: 0 },
  useWeightedScoring: false,
  shuffleQuestions: true,
  shuffleOptions: true,
  showInstantScore: true,
  showExplanationAfter: true,
  allowReview: true,
  maxCheatViolations: 3,
  isActive: true,
  blockEarlyExit: false,
  createdAt: '2026-10-05T13:15:00.000Z',
  questions: [
    {
      id: 'q-ct-01',
      number: 1,
      text: `Kota Delta yang padat penduduk dilanda banjir lumpur beracun setiap puncak musim hujan di bulan Januari. Alih-alih langsung mengambil tindakan tergesa-gesa seperti sekadar membagikan bantuan sembako, Dr. Aris sebagai ketua tim penyelidik membagi persoalan besar tersebut ke dalam tiga kelompok kerja terpisah: tim pengamat curah hujan dan aliran sungai, tim penilai alih fungsi hutan di kawasan hulu, serta tim uji laboratorium untuk memeriksa kandungan zat beracun pada lumpur endapan.

Berdasarkan prinsip kerja berpikir komputasional, apakah tujuan utama Dr. Aris memecah krisis besar tersebut menjadi tiga bidang penyelidikan yang terpisah?`,
      options: [
        {
          key: 'A',
          text: 'Membuat masalah besar yang rumit menjadi bagian-bagian kecil yang terkelola sehingga setiap tim ahli dapat fokus bekerja secara mendalam dan terarah.',
        },
        {
          key: 'B',
          text: 'Memperpanjang durasi penyelidikan agar pemerintah daerah memiliki alasan untuk menambah alokasi anggaran proyek penanganan bencana.',
        },
        {
          key: 'C',
          text: 'Menghindari tanggung jawab langsung atas kegagalan penanganan banjir dengan menyerahkan keputusan sepenuhnya kepada kelompok kerja.',
        },
        {
          key: 'D',
          text: 'Mengalihkan perhatian warga dari bahaya limbah beracun dengan menyibukkan relawan pada pencatatan ketinggian air sungai.',
        },
        {
          key: 'E',
          text: 'Memastikan seluruh warga di sepanjang bantaran sungai terlibat langsung sebagai peneliti lapangan tanpa memandang keahlian mereka.',
        },
      ],
      correctOption: 'A',
      optionScores: { A: 10, B: 0, C: 0, D: 0, E: 0 },
      explanation: 'Tindakan Dr. Aris mencerminkan pilar Dekomposisi. Tujuan utama dekomposisi adalah memecah masalah yang rumit dan besar menjadi bagian-bagian yang lebih kecil dan terkelola agar dapat diselesaikan secara mendalam, efektif, dan terstruktur oleh pihak yang berkompeten.',
    },
    {
      id: 'q-ct-02',
      number: 2,
      text: `Tim pengamat cuaca Kota Delta mengumpulkan dan membandingkan catatan data cuaca selama 20 tahun ke belakang. Dari pengolahan data tersebut, tim menemukan sebuah keteraturan nyata: bencana banjir lumpur besar selalu dan hanya terjadi apabila curah hujan harian melampaui 150 milimeter per hari selama tiga hari berturut-turut yang terjadi bersamaan dengan peristiwa pasang naik air laut maksimum.

Penerapan pilar berpikir komputasional apakah yang ditunjukkan oleh tim dalam menarik kesimpulan tersebut, dan apa manfaat praktisnya bagi warga?`,
      options: [
        {
          key: 'A',
          text: 'Pengenalan pola; membantu tim menemukan keteraturan hubungan sebab-akibat masa lalu untuk memprediksi saat bahaya akan datang di masa depan.',
        },
        {
          key: 'B',
          text: 'Dekomposisi; memilah data cuaca menjadi dokumen digital yang tersimpan rapi di dalam arsip kantor dinas kebersihan.',
        },
        {
          key: 'C',
          text: 'Abstraksi; menghapus seluruh catatan curah hujan masa lalu agar komputer tidak mengalami kelambatan memori saat bekerja.',
        },
        {
          key: 'D',
          text: 'Pemrograman mekanis; memaksa sensor cuaca untuk otomatis menurunkan curah hujan ketika angka 150 milimeter tercapai.',
        },
        {
          key: 'E',
          text: 'Penyusunan aturan hukum; melarang awan mendung berkumpul di atas kawasan hulu selama musim hujan berlangsung.',
        },
      ],
      correctOption: 'A',
      optionScores: { A: 10, B: 0, C: 0, D: 0, E: 0 },
      explanation: 'Menganalisis data selama 20 tahun untuk menemukan kecenderungan berulang adalah penerapan pilar Pengenalan Pola. Manfaatnya adalah mengubah rekaman data masa lalu menjadi model prediksi yang akurat untuk sistem peringatan dini bencana.',
    },
    {
      id: 'q-ct-03',
      number: 3,
      text: `Hasil uji air menunjukkan adanya kandungan logam berbahaya berupa kromium dan timbal pada lumpur banjir. Di bantaran sungai terdapat ratusan bangunan yang terdiri dari pabrik makanan ringan, perajin mebel kayu, toko kelontong, pabrik tekstil pencelupan kain, dan pabrik aki kendaraan. Dr. Aris memutuskan untuk hanya menyelidiki pabrik tekstil dan pabrik aki, serta mengabaikan ratusan toko kecil, warna seragam pekerja, maupun tahun berdirinya pabrik.

Mengapa keputusan Dr. Aris mengabaikan sebagian besar bangunan dan informasi tersebut dipandang sebagai penerapan abstraksi yang sangat tepat?`,
      options: [
        {
          key: 'A',
          text: 'Karena menyaring dan membuang informasi yang tidak berkaitan dengan sumber zat beracun, sehingga tenaga dan waktu penyelidikan terpusat pada sasaran yang tepat.',
        },
        {
          key: 'B',
          text: 'Karena pabrik makanan dan toko kelontong telah membayar pajak perlindungan kepada pemerintah kota sehingga tidak boleh diperiksa.',
        },
        {
          key: 'C',
          text: 'Karena tim tidak memiliki peralatan yang memadai untuk menguji sampel dari pabrik kayu dan bangunan ruko warga.',
        },
        {
          key: 'D',
          text: 'Karena Dr. Aris ingin mempercepat penutupan kasus tanpa perlu membuktikan keterkaitan kimiawi dari limbah yang dibuang.',
        },
        {
          key: 'E',
          text: 'Karena pilar abstraksi menuntut agar hanya pabrik berukuran paling besar yang berhak mendapatkan pemeriksaan lingkungan.',
        },
      ],
      correctOption: 'A',
      optionScores: { A: 10, B: 0, C: 0, D: 0, E: 0 },
      explanation: 'Abstraksi adalah kemampuan memisahkan hal penting dari detail yang tidak penting. Mengabaikan pabrik non-logam (makanan/kayu) dan detail fisik (warna seragam/tahun berdiri) membantu tim memusatkan seluruh daya pada pabrik yang secara kimiawi membuang kromium dan timbal.',
    },
    {
      id: 'q-ct-04',
      number: 4,
      text: `Untuk mencegah terulangnya bencana, Dr. Aris menerbitkan pedoman kerja darurat: (1) Apabila ramalan cuaca menunjukkan hujan lebat di atas 150 milimeter per hari dan air laut pasang, maka sirine tanda bahaya dibunyikan; (2) Seluruh pabrik tekstil dan aki wajib menghentikan pembuangan limbah ke sungai dalam batas waktu paling lambat dua hari; (3) Petugas membuka pintu air pengatur arus sebesar 50 persen dan mengevakuasi penduduk zona bahaya.

Kriteria apa yang membuat rangkaian petunjuk kerja di atas memenuhi syarat sebagai sebuah algoritma yang baik?`,
      options: [
        {
          key: 'A',
          text: 'Langkah-langkahnya tersusun runtut, memiliki batasan syarat yang pasti dan tegas, serta dapat dijalankan secara konsisten oleh seluruh petugas.',
        },
        {
          key: 'B',
          text: 'Petunjuk tersebut ditulis menggunakan bahasa pemrograman komputer tingkat tinggi yang hanya dimengerti oleh mesin pemindai.',
        },
        {
          key: 'C',
          text: 'Instruksi di dalamnya bersifat lentur dan bebas ditafsirkan berbeda-beda oleh masing-masing penjaga pintu air di lapangan.',
        },
        {
          key: 'D',
          text: 'Rangkaian tindakan tersebut disusun tanpa mempertimbangkan kondisi keselamatan warga dan ketersediaan petugas tanggap darurat.',
        },
        {
          key: 'E',
          text: 'Aturan tersebut hanya berlaku satu kali saja dan tidak dapat digunakan kembali jika bencana banjir datang pada tahun berikutnya.',
        },
      ],
      correctOption: 'A',
      optionScores: { A: 10, B: 0, C: 0, D: 0, E: 0 },
      explanation: 'Algoritma yang baik harus memiliki karakteristik langkah yang logis, berurutan, jelas tanpa makna ganda, memiliki kondisi bersyarat yang pasti, dan memberikan hasil yang seragam ketika dijalankan oleh siapa pun.',
    },
    {
      id: 'q-ct-05',
      number: 5,
      text: `Bayangkan jika Dr. Aris tidak menerapkan pilar abstraksi dalam penyelidikan limbah di Kota Delta, melainkan mewajibkan timnya mendata secara lengkap setiap pohon di pinggir sungai, mewawancarai seluruh pemilik warung kopi, mencatat tanggal lahir setiap buruh pabrik, dan mengukur luas jendela setiap ruko.

Risiko sistemik apakah yang paling mungkin terjadi terhadap operasi penanggulangan bencana akibat kelalaian tersebut?`,
      options: [
        {
          key: 'A',
          text: 'Tim penyelidik akan kehabisan waktu dan tenaga karena tenggelam dalam lautan data yang tidak penting, sehingga sumber racun utama gagal dihentikan tepat waktu.',
        },
        {
          key: 'B',
          text: 'Sungai Kota Delta akan secara otomatis kembali jernih karena seluruh warga merasa diawasi oleh petugas pemeriksa.',
        },
        {
          key: 'C',
          text: 'Pabrik tekstil dan aki pembuang limbah berbahaya akan secara sukarela menyerahkan diri tanpa perlu diuji sampel limbahnya.',
        },
        {
          key: 'D',
          text: 'Waktu eksekusi penanganan menjadi jauh lebih singkat karena semakin banyak informasi yang dikumpulkan maka komputer semakin cepat mengolahnya.',
        },
        {
          key: 'E',
          text: 'Curah hujan ekstrem akan berhenti secara mendadak karena proses pendataan administratif berlangsung sangat terperinci.',
        },
      ],
      correctOption: 'A',
      optionScores: { A: 10, B: 0, C: 0, D: 0, E: 0 },
      explanation: 'Tanpa abstraksi untuk memilah data yang relevan, penyelesaian masalah akan tertimbun oleh detail yang tidak berguna (informasi pengganggu). Akibatnya, sumber daya habis dan akar penyebab masalah gagal dituntaskan sebelum bencana berikutnya melanda.',
    },
    {
      id: 'q-ct-06',
      number: 6,
      text: `Pedoman penanganan banjir yang dirancang di Kota Delta diadaptasi oleh pemerintah daerah lain yang memiliki kondisi perbukitan terjal dan sungai berarus deras tanpa fenomena pasang laut. Tim perancang di daerah baru tersebut mempertahankan kerangka kerja logika Dr. Aris, namun mengganti variabel kondisi laut pasang dengan variabel kemiringan lereng tanah yang rawan longsor.

Prinsip berpikir komputasional apa yang ditunjukkan oleh tim perancang di daerah baru tersebut?`,
      options: [
        {
          key: 'A',
          text: 'Pemanfaatan kembali solusi umum dengan menyesuaikan parameter yang sesuai dengan kondisi lingkungan setempat.',
        },
        {
          key: 'B',
          text: 'Penyalinan tanpa modifikasi yang membuktikan bahwa seluruh bencana alam di dunia memiliki karakter yang persis sama.',
        },
        {
          key: 'C',
          text: 'Penolakan terhadap pilar algoritma karena pedoman dari daerah lain tidak boleh diterapkan di wilayah berbeda.',
        },
        {
          key: 'D',
          text: 'Penerapan coba-coba tanpa dasar perhitungan nalar yang jelas untuk melihat apakah bencana tanah longsor bisa dicegah.',
        },
        {
          key: 'E',
          text: 'Penghapusan seluruh data lingkungan karena penanganan tanah longsor sama sekali tidak memerlukan data masa lalu.',
        },
      ],
      correctOption: 'A',
      optionScores: { A: 10, B: 0, C: 0, D: 0, E: 0 },
      explanation: 'Salah satu keunggulan berpikir komputasional adalah kemampuan menghasilkan model solusi yang dapat digunakan kembali (reusable model). Kerangka dasar algoritma tetap dipakai, sementara variabel input disesuaikan dengan kondisi setempat.',
    },
    {
      id: 'q-ct-07',
      number: 7,
      text: `Gempa bumi besar melanda kawasan pegunungan dan memutus seluruh jalan raya darat menuju 15 desa. Kapten Rina dari tim penyelamat udara ditugaskan mengantarkan bantuan dengan 5 unit helikopter. Melihat situasi yang kacau, Kapten Rina tidak langsung menerbangkan armada tanpa rencana. Ia mengelompokkan 15 desa tersebut ke dalam tiga wilayah: Wilayah Utara (kerusakan paling berat dan medan sangat terjal), Wilayah Tengah (kerusakan sedang), dan Wilayah Selatan (kerusakan ringan dengan akses relatif aman).

Tindakan Kapten Rina dalam mengelompokkan desa-desa terdampak tersebut merupakan cerminan dari pilar:`,
      options: [
        {
          key: 'A',
          text: 'Dekomposisi; mengurai wilayah operasi yang luas dan rumit menjadi satuan-satuan area yang lebih teratur berdasarkan skala prioritas.',
        },
        {
          key: 'B',
          text: 'Abstraksi semu; meniadakan desa-desa di Wilayah Selatan agar tim tidak perlu mengirimkan bantuan ke sana.',
        },
        {
          key: 'C',
          text: 'Algoritma acak; memilih rute penerbangan secara mendadak tergantung pada arah hembusan angin di pagi hari.',
        },
        {
          key: 'D',
          text: 'Otomatisasi mesin; memprogram komputer helikopter agar terbang sendiri tanpa memerlukan pilot manusia.',
        },
        {
          key: 'E',
          text: 'Pengenalan pola cuaca; membuktikan bahwa gempa bumi selalu terjadi bersamaan dengan kabut tebal di pegunungan.',
        },
      ],
      correctOption: 'A',
      optionScores: { A: 10, B: 0, C: 0, D: 0, E: 0 },
      explanation: 'Memetakan 15 desa menjadi 3 sektor berdasarkan tingkat keparahan adalah bentuk Dekomposisi. Masalah logistik yang luar biasa rumit diurai menjadi unit-unit kerja yang terkelola sehingga alokasi armada helikopter dapat diprioritaskan secara adil dan tepat.',
    },
    {
      id: 'q-ct-08',
      number: 8,
      text: `Dari laporan operasi darurat tahun-tahun sebelumnya di daerah pegunungan yang sama, Kapten Rina menyadari adanya keteraturan alam: wilayah lembah curam di Wilayah Utara selalu tertutup kabut tebal yang sangat pekat setelah pukul 14.00 siang, sehingga penerbangan helikopter menjadi mustahil dan berbahaya.

Bagaimana Kapten Rina memanfaatkan pengenalan pola tersebut dalam menyusun strategi misi penyelamatan?`,
      options: [
        {
          key: 'A',
          text: 'Mengerahkan seluruh kekuatan armada helikopter ke Wilayah Utara sejak pagi hari sebelum jendela waktu penerbangan tertutup oleh kabut tebal.',
        },
        {
          key: 'B',
          text: 'Membatalkan seluruh misi penerbangan ke Wilayah Utara dan membiarkan warga di sana menunggu hingga musim kemarau tiba.',
        },
        {
          key: 'C',
          text: 'Memerintahkan para pilot untuk tetap nekat menerobos kabut tebal pada sore hari demi menunjukkan keberanian tim penyelamat.',
        },
        {
          key: 'D',
          text: 'Mengalihkan seluruh helikopter ke Wilayah Selatan di pagi hari karena wilayah tersebut tidak pernah berkabut.',
        },
        {
          key: 'E',
          text: 'Menghapus catatan kabut masa lalu dari papan rencana operasi karena dianggap hanya perkiraan cuaca yang belum tentu terulang.',
        },
      ],
      correctOption: 'A',
      optionScores: { A: 10, B: 0, C: 0, D: 0, E: 0 },
      explanation: 'Pengenalan pola membantu memprediksi batasan kritis lingkungan. Mengetahui bahwa kabut tebal menutup lembah utara setelah jam 14.00 siang mendasari keputusan logis untuk memfokuskan seluruh helikopter ke sektor paling berbahaya tersebut pada pagi hari (06.00-10.00).',
    },
    {
      id: 'q-ct-09',
      number: 9,
      text: `Saat proses pemuatan barang ke helikopter, para sukarelawan menerima berbagai macam sumbangan berupa pakaian pesta bekas, boneka, buku cerita, mi instan, obat-obatan darurat, air minum dalam kemasan, dan perangkat radio komunikasi. Karena daya angkut beban helikopter sangat terbatas, Kapten Rina menegaskan bahwa selama tiga hari pertama armada hanya mengangkut air bersih, obat pertolongan pertama, makanan berkalori tinggi, dan radio komunikasi.

Argumentasi rasional apa yang mendasari penerapan abstraksi oleh Kapten Rina dalam situasi darurat tersebut?`,
      options: [
        {
          key: 'A',
          text: 'Mengabaikan barang-barang yang bukan kebutuhan penyelamat jiwa demi memaksimalkan muatan kebutuhan pokok yang menentukan kelangsungan hidup korban.',
        },
        {
          key: 'B',
          text: 'Menolak barang sumbangan warga karena helikopter hanya diperbolehkan membawa barang yang dibeli oleh dinas pemerintah.',
        },
        {
          key: 'C',
          text: 'Mengurangi beban kerja petugas gudang agar mereka memiliki waktu istirahat yang lebih lama di pangkalan posko.',
        },
        {
          key: 'D',
          text: 'Menyenangkan hati para penyumbang makanan dengan mendahulukan produk makanan pabrik tertentu.',
        },
        {
          key: 'E',
          text: 'Menunjukkan wewenang mutlak seorang pimpinan operasi logistik tanpa perlu menjelaskan alasannya kepada sukarelawan.',
        },
      ],
      correctOption: 'A',
      optionScores: { A: 10, B: 0, C: 0, D: 0, E: 0 },
      explanation: 'Abstraksi diterapkan dengan menyortir muatan: menyingkirkan barang non-kritis (pakaian bekas, mainan) dan memusatkan kapasitas terbatas helikopter pada kebutuhan paling esensial (air, obat, makanan bergizi, alat komunikasi) yang menyelamatkan nyawa pada 72 jam pertama.',
    },
    {
      id: 'q-ct-10',
      number: 10,
      text: `Jadwal penerbangan yang disusun Kapten Rina memuat rincian: Pukul 06.00–10.00 pengerahan seluruh helikopter ke Wilayah Utara; Pukul 10.00–11.00 seluruh armada kembali ke pangkalan untuk pengisian ulang bahan bakar dan pengecekan mesin; Pukul 11.00–14.00 pembagian armada ke Wilayah Tengah dan Selatan; Pukul 14.00 operasi udara dihentikan untuk perawatan rutin dan menghindari kabut sore.

Mengapa jadwal kerja terstruktur tersebut dipandang sebagai implementasi pilar algoritma yang sangat efektif?`,
      options: [
        {
          key: 'A',
          text: 'Menyediakan panduan langkah kerja yang runtut waktu, terukur alokasi sumber dayanya, dan mencegah kebingungan para pilot di lapangan.',
        },
        {
          key: 'B',
          text: 'Membuat helikopter dapat terbang lebih cepat melampaui batas kecepatan maksimal yang ditentukan pabrik pembuatnya.',
        },
        {
          key: 'C',
          text: 'Menjamin bahwa seluruh warga di 15 desa akan mendapatkan jumlah pasokan beras yang sama persis tanpa selisih satu butir pun.',
        },
        {
          key: 'D',
          text: 'Menghilangkan kebutuhan pilot manusia karena helikopter dapat terbang secara mandiri mengikuti tulisan di papan tulis posko.',
        },
        {
          key: 'E',
          text: 'Memastikan seluruh anggaran operasional bahan bakar avtur habis digunakan dalam satu hari pelaksanaan misi.',
        },
      ],
      correctOption: 'A',
      optionScores: { A: 10, B: 0, C: 0, D: 0, E: 0 },
      explanation: 'Algoritma memberikan petunjuk langkah demi langkah yang pasti, kronologis, dan dapat dieksekusi secara seragam oleh seluruh pilot. Ini meminimalkan kesalahan manusia dan memaksimalkan keselamatan armada.',
    },
    {
      id: 'q-ct-11',
      number: 11,
      text: `Pada jadwal penerbangan Kapten Rina, terdapat jeda waktu antara pukul 10.00 hingga 11.00 yang khusus dialokasikan untuk pengisian ulang bahan bakar dan pemeriksaan rotor mesin di pangkalan. Jika seorang petugas mengusulkan untuk menghapus jeda waktu tersebut agar bantuan dapat dikirim tanpa henti ke desa berikutnya, risiko fatal apakah yang akan dihadapi sistem operasi logistik tersebut?`,
      options: [
        {
          key: 'A',
          text: 'Helikopter berisiko kehabisan bahan bakar atau mengalami gangguan mesin di tengah penerbangan yang dapat menyebabkan kecelakaan mematikan.',
        },
        {
          key: 'B',
          text: 'Warga desa penerima bantuan akan merasa bosan karena paket bantuan datang terlalu cepat dari perkiraan semula.',
        },
        {
          key: 'C',
          text: 'Harga bahan bakar helikopter di pasaran akan melonjak tinggi karena dibeli pada waktu siang hari.',
        },
        {
          key: 'D',
          text: 'Pangkalan posko akan kelebihan persediaan logistik makanan karena gudang tidak sempat menampung kiriman baru.',
        },
        {
          key: 'E',
          text: 'Pilot helikopter akan kehilangan sinyal panduan arah karena satelit cuaca hanya bekerja pada pagi dan sore hari.',
        },
      ],
      correctOption: 'A',
      optionScores: { A: 10, B: 0, C: 0, D: 0, E: 0 },
      explanation: 'Dalam berpikir algoritma untuk sistem berdaya dukung terbatas, batasan sumber daya (bahan bakar dan ketahanan mesin) adalah syarat mutlak. Menghilangkan langkah pemeliharaan/pengisian bahan bakar demi kecepatan akan menyebabkan kegagalan sistem total yang fatal.',
    },
    {
      id: 'q-ct-12',
      number: 12,
      text: `Pada hari kedua operasi, salah satu dari lima helikopter mengalami kebocoran oli pompa hidrolik sehingga hanya tersisa empat helikopter yang siap terbang. Dengan tetap berpegang pada prioritas keselamatan warga di Wilayah Utara sebelum kabut turun jam 14.00, bagaimanakah penyesuaian algoritma penerbangan yang paling logis dilakukan oleh Kapten Rina?`,
      options: [
        {
          key: 'A',
          text: 'Mengerahkan seluruh 4 helikopter yang siap ke Wilayah Utara pada pagi hari, lalu membagi masing-masing 2 helikopter untuk Wilayah Tengah dan Selatan pada sesi siang.',
        },
        {
          key: 'B',
          text: 'Memaksakan helikopter yang bocor oli untuk tetap terbang melintasi jurang terjal demi menjaga kuota lima armada.',
        },
        {
          key: 'C',
          text: 'Membatalkan seluruh penerbangan hari itu ke semua wilayah sampai helikopter pengganti datang dari ibu kota pekan depan.',
        },
        {
          key: 'D',
          text: 'Mengalihkan seluruh penerbangan hanya ke Wilayah Selatan karena jaraknya paling dekat dari pangkalan pendaratan.',
        },
        {
          key: 'E',
          text: 'Meminta para pilot helikopter mengangkut kargo dengan berjalan kaki mendaki gunung menuju Wilayah Utara.',
        },
      ],
      correctOption: 'A',
      optionScores: { A: 10, B: 0, C: 0, D: 0, E: 0 },
      explanation: 'Algoritma yang adaptif mampu merespons perubahan kondisi parameter (jumlah unit berkurang dari 5 menjadi 4) tanpa mengorbankan sasaran prioritas utama: Wilayah Utara tetap menjadi fokus utama di pagi hari, disusul pembagian rata armada untuk wilayah lainnya di siang hari.',
    },
    {
      id: 'q-ct-13',
      number: 13,
      text: `Menjelang hari raya, sebuah keluarga berencana membersihkan seluruh rumah bertingkat mereka yang luas dalam waktu satu hari. Sang ibu membagi tugas kepada anggota keluarga: kakak bertugas membersihkan area luar (halaman dan selokan), adik membersihkan debu dan menyapu lantai dua, ayah mengecat dinding pagar depan, dan ibu mengelola dapur serta mencuci gorden.

Penerapan pilar berpikir komputasional apakah yang dilakukan oleh keluarga tersebut dalam mengelola pekerjaan rumah yang berat?`,
      options: [
        {
          key: 'A',
          text: 'Dekomposisi; memecah beban pekerjaan rumah yang besar menjadi beberapa bagian tugas wilayah yang lebih kecil dan terkelola sesuai kemampuan masing-masing.',
        },
        {
          key: 'B',
          text: 'Abstraksi keliru; membiarkan ruang tamu dalam keadaan kotor karena dianggap tidak terlihat oleh tamu yang datang.',
        },
        {
          key: 'C',
          text: 'Pengenalan pola acak; menyapu lantai rumah secara berulang-ulang tanpa memedulikan apakah lantai sudah bersih atau belum.',
        },
        {
          key: 'D',
          text: 'Penyusunan aturan paksa; mewajibkan setiap anggota keluarga menggunakan pakaian dengan warna yang seragam saat menyapu.',
        },
        {
          key: 'E',
          text: 'Otomatisasi murni; menyerahkan seluruh pembersihan rumah kepada mesin penyedot debu tanpa bantuan tenaga manusia sama sekali.',
        },
      ],
      correctOption: 'A',
      optionScores: { A: 10, B: 0, C: 0, D: 0, E: 0 },
      explanation: 'Membagi pekerjaan membersihkan rumah besar menjadi beberapa sub-tugas spesifik berdasarkan ruangan/wilayah kepada anggota keluarga adalah penerapan nyata pilar Dekomposisi dalam kehidupan sehari-hari di rumah.',
    },
    {
      id: 'q-ct-14',
      number: 14,
      text: `Saat akan mencuci pakaian keluarga yang menumpuk di akhir pekan, Budi memisahkan pakaian ke dalam tiga keranjang berbeda: keranjang pakaian putih polos, keranjang pakaian berwarna cerah yang mudah luntur, dan keranjang pakaian berbahan tebal seperti celana jin kotor berlumpur. Budi melakukan hal ini karena belajar dari pengalamannya minggu lalu saat seragam putih sekolahnya berubah warna menjadi kemerahan akibat tercampur baju merah adiknya.

Pilar berpikir komputasional apa yang diterapkan oleh Budi saat memilah cucian tersebut?`,
      options: [
        {
          key: 'A',
          text: 'Pengenalan pola; mengenali kesamaan sifat bahan dan warna pakaian dari pengalaman masa lalu untuk mencegah kerusakan pakaian putih.',
        },
        {
          key: 'B',
          text: 'Algoritma acak; memasukkan pakaian ke mesin cuci secara sembarangan tanpa memeriksa label petunjuk perawatan pakaian.',
        },
        {
          key: 'C',
          text: 'Abstraksi berlebihan; membuang seluruh pakaian berwarna ke tempat sampah agar mesin cuci hanya mencuci pakaian putih.',
        },
        {
          key: 'D',
          text: 'Dekomposisi biner; menghitung jumlah kancing pada setiap kemeja sebelum merendamnya ke dalam ember air sabun.',
        },
        {
          key: 'E',
          text: 'Perancangan perangkat keras; membongkar mesin cuci keluarga untuk mengganti tabung pemutar dengan ember kayu tradisional.',
        },
      ],
      correctOption: 'A',
      optionScores: { A: 10, B: 0, C: 0, D: 0, E: 0 },
      explanation: 'Budi menggunakan Pengenalan Pola. Pengalaman masa lalu (baju luntur merusak seragam putih) dijadikan pola acuan untuk mengelompokkan pakaian berdasarkan sifat warna dan risiko kelunturan.',
    },
    {
      id: 'q-ct-15',
      number: 15,
      text: `Rian ingin menyiapkan sarapan pagi sebelum berangkat ke sekolah. Menu sarapan terdiri dari nasi goreng, telur mata sapi, dan segelas teh manis hangat. Kompor yang dimiliki di dapur hanya memiliki dua tungku pembakaran. Rian merancang langkah kerja: menyalakan tungku 1 untuk merebus air teh, menyalakan tungku 2 untuk menggoreng telur, lalu setelah telur matang, wajan yang sama di tungku 2 digunakan menumis bumbu nasi goreng sembari menuangkan air panas ke cangkir teh.

Mengapa perencanaan langkah yang disusun Rian merupakan contoh penerapan algoritma yang efisien dalam kehidupan sehari-hari?`,
      options: [
        {
          key: 'A',
          text: 'Menyusun urutan tindakan secara terperinci dan memperhitungkan pemanfaatan sumber daya kompor secara bersamaan sehingga seluruh makanan matang tepat waktu.',
        },
        {
          key: 'B',
          text: 'Memasak seluruh bahan makanan dalam satu panci besar tanpa memedulikan rasa dan perbedaan tingkat kematangan.',
        },
        {
          key: 'C',
          text: 'Memastikan sarapan disiapkan hanya jika ada tamu penting yang berkunjung ke rumah di pagi hari.',
        },
        {
          key: 'D',
          text: 'Mengabaikan kebersihan dapur dengan membiarkan kompor menyala tanpa ditunggui sama sekali.',
        },
        {
          key: 'E',
          text: 'Menghabiskan seluruh persediaan bumbu dapur keluarga hanya untuk membuat satu porsi sarapan pagi.',
        },
      ],
      correctOption: 'A',
      optionScores: { A: 10, B: 0, C: 0, D: 0, E: 0 },
      explanation: 'Algoritma yang baik mengatur urutan langkah logis serta efisiensi penggunaan sumber daya (dalam hal ini dua tungku kompor) sehingga tugas memasak selesai secara simultan dengan hasil optimal sebelum waktu berangkat sekolah.',
    },
    {
      id: 'q-ct-16',
      number: 16,
      text: `Keluarga Pak Santoso terkejut melihat tagihan listrik rumah tangga yang melonjak drastis selama dua bulan terakhir. Doni, anak sulung Pak Santoso yang belajar Informatika, memutuskan mencatat jam operasional setiap alat elektronik selama satu pekan. Doni menemukan bahwa pendingin ruangan (AC) di kamar tidur sering dibiarkan menyala pada suhu 16 derajat Celsius sejak pukul 13.00 siang meskipun kamar dalam keadaan kosong.

Langkah Doni menemukan sumber pemborosan listrik tersebut merupakan penerapan berpikir komputasional pada pilar:`,
      options: [
        {
          key: 'A',
          text: 'Pengenalan pola; mengamati keteraturan waktu pemakaian alat listrik dan mengaitkannya dengan lonjakan biaya pada data tagihan.',
        },
        {
          key: 'B',
          text: 'Abstraksi parsial; mematikan meteran listrik utama rumah secara permanen sehingga keluarga tidak menggunakan listrik sama sekali.',
        },
        {
          key: 'C',
          text: 'Dekomposisi manual; membongkar mesin pendingin ruangan menjadi ratusan komponen kabel kecil di ruang tamu.',
        },
        {
          key: 'D',
          text: 'Algoritma semu; membayar tagihan listrik dua kali lipat setiap bulan agar petugas listrik tidak datang memeriksa ke rumah.',
        },
        {
          key: 'E',
          text: 'Pemodelan grafis; menggambar sketsa bentuk fisik pendingin ruangan pada selembar kertas karton berwarna.',
        },
      ],
      correctOption: 'A',
      optionScores: { A: 10, B: 0, C: 0, D: 0, E: 0 },
      explanation: 'Mencatat jam operasional alat elektronik dan menemukan kebiasaan menyalakan AC pada saat kamar kosong merupakan penerapan Pengenalan Pola untuk mencari akar penyebab masalah dalam kehidupan nyata.',
    },
    {
      id: 'q-ct-17',
      number: 17,
      text: `Di rumahnya, Siti mendirikan tiga tempat sampah terpisah bertuliskan: "Sampah Makanan/Dedaunan (Organik)", "Kemasan Plastik/Kaca/Kaleng (Anorganik Daur Ulang)", dan "Baterai Bekas/Lampu Rusak (Limbah B3 Rumah Tangga)". Ketika membuang sebuah botol sampo kosong, Siti langsung memasukkannya ke wadah plastik daur ulang tanpa memedulikan gambar label stiker botol, aroma sisa sampo, maupun toko tempat ia membelinya.

Pilar berpikir komputasional apa yang ditunjukkan Siti ketika mengabaikan merek dan aroma botol sampo saat memilah sampah?`,
      options: [
        {
          key: 'A',
          text: 'Abstraksi; membuang detail yang tidak relevan (aroma dan merek) serta hanya berfokus pada informasi penting yaitu jenis bahan botol (plastik daur ulang).',
        },
        {
          key: 'B',
          text: 'Algoritma; mengharuskan Siti membersihkan botol sampo dengan sabun mandi sebanyak sepuluh kali sebelum dibuang.',
        },
        {
          key: 'C',
          text: 'Dekomposisi; memotong botol plastik menjadi serpihan berukuran satu milimeter menggunakan gunting kuku.',
        },
        {
          key: 'D',
          text: 'Pengenalan pola keliru; menganggap seluruh benda cair di kamar mandi adalah racun berbahaya yang tidak boleh disentuh.',
        },
        {
          key: 'E',
          text: 'Otomatisasi; membiarkan sampah menumpuk di lantai kamar mandi sampai larut sendiri ditelan air pembuangan.',
        },
      ],
      correctOption: 'A',
      optionScores: { A: 10, B: 0, C: 0, D: 0, E: 0 },
      explanation: 'Keputusan Siti memilah sampah berdasarkan karakteristik bahan pokoknya (plastik) sembari mengabaikan detail yang tidak berhubungan dengan pengelolaan daur ulang (merek, aroma, asal toko) adalah contoh konkret dari Abstraksi.',
    },
    {
      id: 'q-ct-18',
      number: 18,
      text: `Ibu memiliki puluhan pot tanaman di teras rumah yang terdiri dari anggrek, kaktus, dan tanaman cabai. Ibu membuat catatan perawatan: Kaktus hanya disiram seminggu sekali dengan sedikit air; anggrek disemprot kabut air setiap dua hari sekali di pagi hari; sedangkan tanaman cabai disiram penuh setiap sore hari dan diberi pupuk cair setiap dua minggu sekali.

Kombinasi dua pilar berpikir komputasional apakah yang paling menonjol pada cara Ibu merawat tanaman-tanaman tersebut?`,
      options: [
        {
          key: 'A',
          text: 'Pengenalan pola kebutuhan hidup tanaman dan penyusunan algoritma jadwal penyiraman yang teratur.',
        },
        {
          key: 'B',
          text: 'Penghapusan data tanaman dan pembagian pot bunga secara acak tanpa memperhatikan jenis tanamannya.',
        },
        {
          key: 'C',
          text: 'Pengabaian seluruh kebutuhan air dan penyerahan pertumbuhan tanaman sepenuhnya pada air hujan alami.',
        },
        {
          key: 'D',
          text: 'Pembongkaran seluruh akar tanaman setiap pagi hari untuk memastikan ada cacing tanah di dalam pot.',
        },
        {
          key: 'E',
          text: 'Pemberian pupuk kimia berdosis tinggi setiap jam agar tanaman tumbuh sepuluh kali lebih cepat dari biasanya.',
        },
      ],
      correctOption: 'A',
      optionScores: { A: 10, B: 0, C: 0, D: 0, E: 0 },
      explanation: 'Ibu mengenali pola kebutuhan biologis masing-masing tanaman (kaktus sedikit air, anggrek lembap, cabai butuh air teratur), lalu merumuskan algoritma berupa instruksi langkah dan jadwal perawatan rutin yang deterministik.',
    },
    {
      id: 'q-ct-19',
      number: 19,
      text: `Kelompok belajar kelas X mendapat tugas membuat video dokumenter sejarah perjuangan lokal berdurasi 10 menit dengan batas waktu penyerahan empat pekan. Ketua kelompok membagi waktu pengerjaan menjadi tiga tahapan: Pekan 1 untuk riset naskah dan wawancara narasumber (Pra-produksi); Pekan 2 dan 3 untuk pengambilan gambar video di museum dan lokasi bersejarah (Produksi); serta Pekan 4 untuk penyuntingan video, penambahan teks, dan penyerahan tugas (Pasca-produksi).

Strategi ketua kelompok dalam mengelola tugas besar tersebut menerapkan pilar:`,
      options: [
        {
          key: 'A',
          text: 'Dekomposisi; memecah proyek besar berdurasi satu bulan ke dalam tahapan-tahapan waktu dan target kerja yang terfokus.',
        },
        {
          key: 'B',
          text: 'Abstraksi sepihak; menolak mencantumkan nama anggota kelompok pada berkas laporan akhir tugas sekolah.',
        },
        {
          key: 'C',
          text: 'Algoritma jalan pintas; mengunduh video dokumenter milik orang lain di internet dan mengubah judulnya menjadi tugas sendiri.',
        },
        {
          key: 'D',
          text: 'Pengenalan pola acak; merekam gambar tanpa naskah dan berharap video akan tersusun sendiri saat diedit.',
        },
        {
          key: 'E',
          text: 'Otomatisasi tanpa batas; membiarkan kamera merekam ruang kelas kosong selama 24 jam tanpa ada kegiatan terarah.',
        },
      ],
      correctOption: 'A',
      optionScores: { A: 10, B: 0, C: 0, D: 0, E: 0 },
      explanation: 'Memecah proyek besar (video dokumenter sejarah) menjadi sub-tahap yang memiliki target dan tenggat waktu terukur (pra-produksi, produksi, pasca-produksi) adalah penerapan nyata pilar Dekomposisi pada pembelajaran siswa di sekolah.',
    },
    {
      id: 'q-ct-20',
      number: 20,
      text: `Setiap jam istirahat sekolah yang hanya berlangsung 30 menit, kantin sekolah selalu mengalami kekacauan antrean karena ratusan siswa berebut memesan makanan sekaligus di depan etalase penjual, sehingga banyak siswa terlambat masuk ke kelas. Pengurus OSIS mengusulkan alur baru: Siswa pertama-tama memilih paket menu di papan informasi luar, membayar di loket kasir khusus untuk mendapatkan nomor antrean, lalu mengambil makanan yang sudah dikemas di meja pengambilan terpisah.

Usulan pengurus OSIS tersebut merupakan perbaikan sistem sekolah menggunakan prinsip pilar:`,
      options: [
        {
          key: 'A',
          text: 'Algoritma; merancang alur urutan proses layanan yang teratur dan searah untuk mengurai penumpukan antrean siswa.',
        },
        {
          key: 'B',
          text: 'Dekomposisi parsial; menutup kantin sekolah secara sepihak agar siswa membawa bekal dari rumah masing-masing.',
        },
        {
          key: 'C',
          text: 'Abstraksi berlebih; menghapus daftar harga makanan sehingga siswa tidak tahu berapa uang yang harus dibayarkan.',
        },
        {
          key: 'D',
          text: 'Pengenalan pola negatif; menyimpulkan bahwa antrean panjang merupakan tradisi sekolah yang tidak perlu diubah.',
        },
        {
          key: 'E',
          text: 'Pemrograman manual; mewajibkan siswa menghafal kode batang setiap bungkus makanan sebelum membelinya.',
        },
      ],
      correctOption: 'A',
      optionScores: { A: 10, B: 0, C: 0, D: 0, E: 0 },
      explanation: 'Merancang alur langkah yang terstruktur (pilih menu -> bayar di kasir terpusat -> ambil makanan dengan nomor antrean di meja terpisah) adalah bentuk penerapan Algoritma guna menciptakan proses transaksi yang tertib, cepat, dan bebas hambatan.',
    },
    {
      id: 'q-ct-21',
      number: 21,
      text: `Nina mengamati hasil nilai ulangan hariannya selama satu semester. Ia menyadari sebuah pola menarik: setiap kali ia belajar pada malam hari di atas pukul 22.00 sambil mendengarkan musik keras dan sesekali membuka media sosial, nilai ulangannya cenderung di bawah 70. Sebaliknya, ketika ia tidur lebih awal pukul 21.00 dan mengulang ringkasan materi pelajaran setelah bangun subuh pada pukul 05.00 pagi, nilai ulangannya selalu di atas 85.

Bagaimana Nina sebaiknya menerapkan pemikiran komputasional berdasarkan pola yang ia temukan tersebut?`,
      options: [
        {
          key: 'A',
          text: 'Mengubah jadwal belajarnya menjadi rutinitas pagi hari setelah subuh dan menjauhkan gangguan ponsel pintar untuk menjaga konsentrasi optimal.',
        },
        {
          key: 'B',
          text: 'Tetap begadang hingga tengah malam karena menganggap nilai ulangan semata-mata bergantung pada keberuntungan lembar soal.',
        },
        {
          key: 'C',
          text: 'Berhenti belajar sama sekali dan hanya mengandalkan ingatan sekilas saat guru menjelaskan materi di depan kelas.',
        },
        {
          key: 'D',
          text: 'Menghapus catatan nilai ulangannya agar tidak merasa terbebani oleh riwayat prestasi akademiknya.',
        },
        {
          key: 'E',
          text: 'Meminta guru mengubah seluruh materi ujian menjadi lagu musik pop agar sesuai dengan kebiasaan belajarnya di malam hari.',
        },
      ],
      correctOption: 'A',
      optionScores: { A: 10, B: 0, C: 0, D: 0, E: 0 },
      explanation: 'Setelah mengenali pola korelasi antara waktu belajar, fokus mental, dan hasil nilai ujian, langkah komputasional yang logis adalah mengadaptasi algoritma jadwal belajar pribadi ke waktu yang terbukti menghasilkan performa terbaik (subuh hari tanpa distraksi).',
    },
    {
      id: 'q-ct-22',
      number: 22,
      text: `Saat membaca buku teks Biologi setebal 40 halaman tentang "Keanekaragaman Hayati", Farhan tidak menyalin seluruh kata-kata di dalam buku ke buku tulisnya. Ia hanya mencatat istilah utama (Tingkat Gen, Jenis, dan Ekosistem), menuliskan ciri pembeda masing-masing tingkat, dan memberikan dua contoh konkret dari flora fauna khas Indonesia pada selembar diagram peta konsep.

Proses yang dilakukan Farhan dalam meringkas materi pelajaran tersebut menunjukkan penerapan pilar:`,
      options: [
        {
          key: 'A',
          text: 'Abstraksi; menyaring konsep-konsep inti yang paling esensial dan mengesampingkan kalimat penjelas yang terlalu panjang lebar.',
        },
        {
          key: 'B',
          text: 'Algoritma sekuensial; menghafal nomor halaman buku teks tanpa memahami makna dari materi yang dibaca.',
        },
        {
          key: 'C',
          text: 'Dekomposisi destruktif; merobek halaman buku teks yang dianggap tidak akan keluar dalam lembar soal ujian.',
        },
        {
          key: 'D',
          text: 'Pengenalan pola acak; mencoret-coret lembar buku catatan dengan gambar animasi tanpa ada teks penjelasan.',
        },
        {
          key: 'E',
          text: 'Otomatisasi fotokopi; memfotokopi seluruh buku tanpa membaca dan mempelajarinya secara mendalam.',
        },
      ],
      correctOption: 'A',
      optionScores: { A: 10, B: 0, C: 0, D: 0, E: 0 },
      explanation: 'Membuat ringkasan peta konsep dengan hanya mengambil ide pokok dan mengabaikan narasi tambahan yang berbelit-belit adalah contoh penerapan Abstraksi dalam kegiatan akademik belajar siswa.',
    },
    {
      id: 'q-ct-23',
      number: 23,
      text: `Sebagai ketua panitia kemah bakti OSIS, Andi membagi kepanitiaan menjadi divisi acara, divisi konsumsi, divisi perlengkapan, dan divisi keamanan medis. Selanjutnya, Andi menyusun susunan jadwal (rundown) acara secara detail menit demi menit, mulai dari upacara pembukaan pukul 08.00 hingga api unggun pukul 20.00, lengkap dengan penanggung jawab masing-masing sesi.

Kombinasi pilar berpikir komputasional apakah yang berhasil diintegrasikan oleh Andi dalam mempersiapkan acara sekolah tersebut?`,
      options: [
        {
          key: 'A',
          text: 'Dekomposisi (pembagian divisi kepanitiaan) dan Algoritma (penyusunan urutan waktu pelaksanaan kegiatan per menit).',
        },
        {
          key: 'B',
          text: 'Abstraksi semata tanpa mempertimbangkan siapa yang akan menjalankan tugas di lapangan.',
        },
        {
          key: 'C',
          text: 'Pengenalan pola cuaca tanpa menyusun rencana tindakan konkret untuk para peserta kemah.',
        },
        {
          key: 'D',
          text: 'Percabangan acak yang membiarkan setiap peserta kemah menentukan sendiri jadwal kegiatannya tanpa koordinasi.',
        },
        {
          key: 'E',
          text: 'Pengulangan tanpa henti yang mengharuskan upacara pembukaan dilakukan berulang-ulang sepanjang hari.',
        },
      ],
      correctOption: 'A',
      optionScores: { A: 10, B: 0, C: 0, D: 0, E: 0 },
      explanation: 'Membagi kepanitiaan besar menjadi beberapa divisi kerja adalah Dekomposisi, sedangkan menyusun jadwal kegiatan dari jam ke jam dengan instruksi dan penanggung jawab yang terukur adalah Algoritma.',
    },
    {
      id: 'q-ct-24',
      number: 24,
      text: `Bendahara kelas X mencatat arus kas mingguan kelas. Di dalam buku kas, bendahara hanya menuliskan: Tanggal Transaksi, Keterangan Penerimaan/Pengeluaran, Jumlah Uang (Rupiah), dan Saldo Akhir. Bendahara tidak mencatat warna pecahan uang kertas yang dibayarkan siswa, nomor seri uang kertas, maupun merk pulpen yang digunakan untuk menulis kuitansi.

Mengapa tindakan bendahara kelas mengabaikan detail uang tersebut merupakan wujud abstraksi yang benar?`,
      options: [
        {
          key: 'A',
          text: 'Karena nomor seri uang dan warna kertas sama sekali tidak mempengaruhi nilai saldo kas kelas maupun keabsahan laporan keuangan.',
        },
        {
          key: 'B',
          text: 'Karena bendahara kelas malas menuliskan rincian lengkap dari seluruh uang yang disetorkan oleh teman sekelasnya.',
        },
        {
          key: 'C',
          text: 'Karena uang kas kelas tidak boleh diperiksa oleh wali kelas maupun ketua murid selama masa jabatan berlangsung.',
        },
        {
          key: 'D',
          text: 'Karena nomor seri uang kertas akan hilang dengan sendirinya ketika disimpan di dalam kotak kas kelas.',
        },
        {
          key: 'E',
          text: 'Karena pencatatan nomor seri uang hanya diwajibkan untuk uang koin logam kuno keluaran abad pertengahan.',
        },
      ],
      correctOption: 'A',
      optionScores: { A: 10, B: 0, C: 0, D: 0, E: 0 },
      explanation: 'Dalam akuntansi kas sederhana, informasi yang esensial hanyalah nominal uang, tanggal, tujuan transaksi, dan saldo akhir. Detail fisik uang (nomor seri, kelipatan lembar, warna kertas) adalah noise yang harus diabstraksi/dihilangkan agar laporan tetap ringkas dan transparan.',
    },
    {
      id: 'q-ct-25',
      number: 25,
      text: `Dalam materi buku ajar Informatika, dijelaskan bahwa peta jaringan transportasi umum (seperti peta kereta MRT atau rute angkutan kota) adalah bentuk abstraksi nyata. Peta tersebut hanya menyajikan garis jalur warna-warni, titik nama stasiun, dan stasiun tempat berpindah jalur (transit), sembari membuang gambar pepohonan di tepi jalan, belokan tajam rel yang sesungguhnya, maupun ruko di sekitar halte.

Mengapa penumpang angkutan kota justru jauh lebih terbantu oleh peta yang telah diabstraksi tersebut dibandingkan jika diberikan foto satelit permukaan bumi yang sangat mendetail?`,
      options: [
        {
          key: 'A',
          text: 'Karena penumpang hanya membutuhkan informasi rute dan titik transit utama; terlalu banyak detail pemandangan fisik justru akan membuat bingung dan memperlambat pengambilan keputusan.',
        },
        {
          key: 'B',
          text: 'Karena foto satelit beresolusi tinggi dilarang oleh undang-undang transportasi untuk dilihat oleh masyarakat umum.',
        },
        {
          key: 'C',
          text: 'Karena garis jalur warna-warni secara otomatis memandu langkah kaki penumpang tanpa perlu membaca peta kembali.',
        },
        {
          key: 'D',
          text: 'Karena peta yang sederhana lebih murah biaya pencetakannya sehingga pengelola kereta bisa menghemat anggaran stasiun.',
        },
        {
          key: 'E',
          text: 'Karena kereta komuter tidak bergerak di atas rel nyata melainkan hanya meluncur di dalam ruang simulasi maya.',
        },
      ],
      correctOption: 'A',
      optionScores: { A: 10, B: 0, C: 0, D: 0, E: 0 },
      explanation: 'Abstraksi pada peta transportasi menyaring informasi sehingga hanya menyisakan data yang dibutuhkan oleh pengguna (stasiun, jalur, titik transfer). Gambar pohon, bangunan, atau belokan riil adalah detail pengganggu (noise visual) yang justru membingungkan penumpang saat membaca rute.',
    },
    {
      id: 'q-ct-26',
      number: 26,
      text: `Pak Joko, seorang petani apel di kawasan Bumiaji Kota Batu, mencatat bahwa setiap kali kelembapan udara mencapai lebih dari 85 persen selama empat hari berturut-turut pada awal musim hujan, kebun apelnya selalu diserang oleh hama kutu sisik dan bercak daun. Berdasarkan pemahaman ini, sebelum serangan hama meluas, Pak Joko segera menyemprotkan cairan pelindung alami pada hari ketiga saat tanda kelembapan tinggi terdeteksi.

Pilar berpikir komputasional apakah yang berhasil dimanfaatkan Pak Joko untuk menyelamatkan hasil panen apelnya?`,
      options: [
        {
          key: 'A',
          text: 'Pengenalan pola; mengaitkan hubungan berulang antara faktor kelembapan cuaca dengan siklus kemunculan hama untuk melakukan pencegahan dini.',
        },
        {
          key: 'B',
          text: 'Dekomposisi acak; memotong seluruh batang pohon apel yang sehat agar hama tidak memiliki tempat untuk hinggap.',
        },
        {
          key: 'C',
          text: 'Abstraksi ekstrem; mengabaikan kondisi cuaca dan membiarkan kebun apel terendam air hujan tanpa pengawasan.',
        },
        {
          key: 'D',
          text: 'Algoritma tertutup; menyemprotkan pestisida kimia setiap jam sepanjang tahun tanpa memperhatikan musim.',
        },
        {
          key: 'E',
          text: 'Penyusunan kode sandi; memberi nomor kode rahasia pada setiap buah apel yang bergelantungan di pohon.',
        },
      ],
      correctOption: 'A',
      optionScores: { A: 10, B: 0, C: 0, D: 0, E: 0 },
      explanation: 'Petani memanfaatkan Pengenalan Pola. Mengamati korelasi berulang antara tingkat kelembapan mikro dan waktu penetasan hama memungkinkan tindakan preventif yang presisi dan menghemat biaya operasional kebun.',
    },
    {
      id: 'q-ct-27',
      number: 27,
      text: `Setiap akhir pekan panjang, jalan utama di pusat oleh-oleh Kota Batu kerap mengalami kemacetan parah akibat banyaknya bus wisata yang parkir sembarangan. Dinas Perhubungan bersama kepolisian merancang rekayasa lalu lintas: Jika panjang antrean kendaraan dari arah barat melebihi 500 meter, maka kendaraan kecil dialihkan melintasi jalan lingkar alternatif, sementara bus besar hanya diizinkan menurunkan penumpang di kantong parkir terpadu stadion.

Karakteristik penting apa dari sebuah algoritma rekayasa transportasi yang tercermin dari kebijakan tersebut?`,
      options: [
        {
          key: 'A',
          text: 'Memiliki aturan percabangan kondisi (kondisional) yang terukur dan memiliki tindakan aksi yang pasti ketika ambang batas kemacetan terlampaui.',
        },
        {
          key: 'B',
          text: 'Mewajibkan seluruh kendaraan bermotor mematikan mesin dan menunggu di jalan raya sampai polisi mengizinkan jalan.',
        },
        {
          key: 'C',
          text: 'Mengharuskan pengendara mobil pribadi membayar denda uang tunai di tempat kepada petugas pengatur lalu lintas.',
        },
        {
          key: 'D',
          text: 'Menutup seluruh akses jalan menuju Kota Batu secara permanen agar jalanan kota selalu lengang dari wisatawan.',
        },
        {
          key: 'E',
          text: 'Mengundi rute jalan yang boleh dilewati pengemudi menggunakan roda keberuntungan di setiap persimpangan jalan.',
        },
      ],
      correctOption: 'A',
      optionScores: { A: 10, B: 0, C: 0, D: 0, E: 0 },
      explanation: 'Kebijakan rekayasa jalan tersebut menerapkan algoritma percabangan (IF-THEN): JIKA antrean kendaraan > 500 meter, MAKA alihkan mobil ke jalur alternatif dan batasi bus ke kantong parkir. Instruksinya jelas, deterministik, dan dapat dieksekusi petugas di lapangan.',
    },
    {
      id: 'q-ct-28',
      number: 28,
      text: `Pengelola sebuah museum wahana edukasi di Kota Batu mencatat riwayat kunjungan selama lima tahun. Data menunjukkan bahwa kunjungan rombongan bus sekolah selalu melonjak lima kali lipat pada bulan Oktober dan November (musim karya wisata sekolah), sedangkan kunjungan keluarga memuncak pada libur akhir tahun di bulan Desember. Mengetahui pola ini, pengelola membuka sistem reservasi tiket daring sejak bulan Agustus dan menambah loket pintu masuk pada bulan Oktober.

Manfaat berpikir komputasional apa yang diperoleh pengelola tempat wisata tersebut?`,
      options: [
        {
          key: 'A',
          text: 'Mampu melakukan perencanaan alokasi sumber daya dan layanan secara matang jauh-jauh hari berlandaskan pola tren historis.',
        },
        {
          key: 'B',
          text: 'Dapat menaikkan harga tiket masuk secara mendadak hingga sepuluh kali lipat untuk meraup keuntungan pribadi.',
        },
        {
          key: 'C',
          text: 'Menolak kedatangan rombongan pelajar sekolah karena dianggap membuat museum menjadi terlalu berisik.',
        },
        {
          key: 'D',
          text: 'Menghapus catatan buku tamu agar kantor pajak tidak mengetahui jumlah wisatawan yang datang berkunjung.',
        },
        {
          key: 'E',
          text: 'Mengganti seluruh staf loket manusia dengan robot mekanik tanpa memperhatikan kepuasan pengunjung wisata.',
        },
      ],
      correctOption: 'A',
      optionScores: { A: 10, B: 0, C: 0, D: 0, E: 0 },
      explanation: 'Pengenalan Pola dari data kunjungan masa lalu memberikan kemampuan prediktif (perencanaan proaktif). Pengelola dapat mempersiapkan tiket online, loket tambahan, dan staf pendukung sebelum lonjakan pengunjung terjadi.',
    },
    {
      id: 'q-ct-29',
      number: 29,
      text: `Di dalam materi pengantar berpikir komputasional, dicontohkan rancangan pembuatan sistem perpustakaan sekolah. Sistem perpustakaan yang besar didekomposisi menjadi empat subsistem: (1) Sistem Pendataan Buku Baru, (2) Sistem Keanggotaan Siswa, (3) Sistem Peminjaman dan Pengembalian Buku, serta (4) Sistem Pengelolaan Denda Keterlambatan.

Apa keuntungan yang dirasakan oleh pengembang sistem atau petugas perpustakaan dari penerapan dekomposisi tersebut saat terjadi kesalahan (bug) pada penghitungan denda siswa?`,
      options: [
        {
          key: 'A',
          text: 'Petugas atau pemrogram cukup memeriksa dan memperbaiki subsistem denda tanpa perlu membongkar atau mengganggu subsistem pendataan buku dan keanggotaan siswa.',
        },
        {
          key: 'B',
          text: 'Petugas harus menghapus seluruh data siswa dan menginput ulang ribuan buku dari awal di perpustakaan.',
        },
        {
          key: 'C',
          text: 'Perpustakaan sekolah terpaksa ditutup selama satu tahun ajaran karena sistem komputer rusak total.',
        },
        {
          key: 'D',
          text: 'Siswa yang meminjam buku tidak perlu mengembalikan buku yang dipinjam karena sistem denda sedang mengalami perbaikan.',
        },
        {
          key: 'E',
          text: 'Dekomposisi mengharuskan pemrogram merakit ulang perangkat keras komputer dari komponen motherboard dasar.',
        },
      ],
      correctOption: 'A',
      optionScores: { A: 10, B: 0, C: 0, D: 0, E: 0 },
      explanation: 'Keunggulan utama Dekomposisi adalah pemisahan modular (modularitas). Jika terjadi kesalahan pada satu modul (misal penghitungan denda), pemecahan masalah hanya terisolasi pada modul tersebut tanpa merusak modul lainnya yang sudah berjalan normal.',
    },
    {
      id: 'q-ct-30',
      number: 30,
      text: `Pada materi buku ajar, prosedur keselamatan saat terjadi kebakaran di gedung bertingkat dijadikan contoh algoritma kehidupan sehari-hari: (1) Tetap tenang dan jangan panik; (2) Tinggalkan barang bawaan yang berat; (3) Berjalan cepat mengikuti petunjuk arah jalur evakuasi menuju tangga darurat terdekat; (4) Jangan pernah menggunakan lift; (5) Berkumpul di titik kumpul luar gedung yang aman.

Mengapa aturan nomor (4) yang melarang penggunaan lift sangat krusial dimasukkan ke dalam algoritma penyelamatan diri tersebut?`,
      options: [
        {
          key: 'A',
          text: 'Karena saat terjadi kebakaran listrik gedung dapat terputus seketika dan cerobong lift dapat terisi asap beracun yang menjebak penumpang di dalamnya.',
        },
        {
          key: 'B',
          text: 'Karena pintu lift hanya boleh dibuka oleh kepala sekolah dan pejabat dinas kebakaran yang berwenang.',
        },
        {
          key: 'C',
          text: 'Karena tangga darurat sengaja dibuat agar siswa dapat berolahraga membakar kalori saat terjadi situasi bencana.',
        },
        {
          key: 'D',
          text: 'Karena lift gedung sekolah membutuhkan koin khusus untuk dapat beroperasi turun ke lantai dasar.',
        },
        {
          key: 'E',
          text: 'Karena kecepatan lift dianggap terlalu lambat dibandingkan jika siswa melompat langsung dari jendela lantai atas.',
        },
      ],
      correctOption: 'A',
      optionScores: { A: 10, B: 0, C: 0, D: 0, E: 0 },
      explanation: 'Dalam penyusunan algoritma evakuasi, setiap batasan (aturan keselamatan) dirancang berdasarkan analisis risiko sistemik. Menggunakan lift saat kebakaran sangat berbahaya karena pasokan listrik bisa terputus mendadak dan poros lift berfungsi layaknya cerobong asap beracun yang mematikan.',
    },
  ],
};
