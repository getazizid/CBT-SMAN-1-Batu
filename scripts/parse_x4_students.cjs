const fs = require('fs');

const raw = `X-4	ABDURRAHMAN	0109370187
X-4	Adinda Ayu Cahyaningtyas	0111575172
X-4	AIRA DIZA AYU FILDZAH	0091928548
X-4	ALUNA SAGITA WIBOWO	0104477708
X-4	ANANTA FEBY YANITA	0111593768
X-4	Aqila Rana Misyka	0106032282
X-4	ARDI PUTRA AL FIRDAUS	0116884302
X-4	ARYA PRAWIRA PUTRA	0104713150
X-4	AULIA ANGGI PRATIWI	0103517535
X-4	BILQIS AZURA	0096190878
X-4	CITRA WULANDARI CAHYONO PUTRI	0106640836
X-4	DISCA SALINA OKTAVIA SANTI	0108887211
X-4	EDGAR ABYAKTA	0109078928
X-4	FAIZAL MAULANA SATRIYA	0102016396
X-4	FEBRIYANI NUR ARIYATI	0112096546
X-4	GITA SHALVIKA MAHARANI	0115279958
X-4	ICHA DWI LAVENIA PUTRI	0101676333
X-4	Jovian Engga Saputra Gitangkasa	0109765617
X-4	KEISYA PUTRI NABILA	0118233255
X-4	Koirunnisa Putri Lutfiana Ramadhani	0106860618
X-4	M. ADZKIYA FADLAN FUADI	0106793747
X-4	Meriza Dwi Lestari	0105813010
X-4	MUCHAMAD ERDHIO	0107843259
X-4	MUHAMMAD IRFAN WAHYUDI	0119171111
X-4	NABILA	0116527746
X-4	NAMEERA RHAPSODY DAWAI RAMADHAN	3109437154
X-4	NOURA SALWA SABRIA	3117080398
X-4	RADEN BAGUS SATRIO ARUM	0105812771
X-4	RAKA NADHIF ANDRIANSYAH	0111312297
X-4	Reziyan Cheriel Raskadinata	0109618750
X-4	SALSABILA AZURA ZAVIER	0104254140
X-4	SHERLIYA YURI FADILLAH RAMADANTI	0103177852
X-4	SULTHAAN ASMADEKHAL ATHAA-ILLAH	0105188277
X-4	VELINA ISMA ZENIA	3107949257
X-4	YUMNA SAFINATUN NAJA	0113435475
X-4	ZIVANA LETISHAFIRA	0107962161`;

// Gender mapping berdasarkan identifikasi nama siswa
const genderMap = {
  '0109370187': 'L', // ABDURRAHMAN
  '0111575172': 'P', // Adinda Ayu Cahyaningtyas
  '0091928548': 'P', // AIRA DIZA AYU FILDZAH
  '0104477708': 'P', // ALUNA SAGITA WIBOWO
  '0111593768': 'P', // ANANTA FEBY YANITA
  '0106032282': 'P', // Aqila Rana Misyka
  '0116884302': 'L', // ARDI PUTRA AL FIRDAUS
  '0104713150': 'L', // ARYA PRAWIRA PUTRA
  '0103517535': 'P', // AULIA ANGGI PRATIWI
  '0096190878': 'P', // BILQIS AZURA
  '0106640836': 'P', // CITRA WULANDARI CAHYONO PUTRI
  '0108887211': 'P', // DISCA SALINA OKTAVIA SANTI
  '0109078928': 'L', // EDGAR ABYAKTA
  '0102016396': 'L', // FAIZAL MAULANA SATRIYA
  '0112096546': 'P', // FEBRIYANI NUR ARIYATI
  '0115279958': 'P', // GITA SHALVIKA MAHARANI
  '0101676333': 'P', // ICHA DWI LAVENIA PUTRI
  '0109765617': 'L', // Jovian Engga Saputra Gitangkasa
  '0118233255': 'P', // KEISYA PUTRI NABILA
  '0106860618': 'P', // Koirunnisa Putri Lutfiana Ramadhani
  '0106793747': 'L', // M. ADZKIYA FADLAN FUADI
  '0105813010': 'P', // Meriza Dwi Lestari
  '0107843259': 'L', // MUCHAMAD ERDHIO
  '0119171111': 'L', // MUHAMMAD IRFAN WAHYUDI
  '0116527746': 'P', // NABILA
  '3109437154': 'P', // NAMEERA RHAPSODY DAWAI RAMADHAN
  '3117080398': 'P', // NOURA SALWA SABRIA
  '0105812771': 'L', // RADEN BAGUS SATRIO ARUM
  '0111312297': 'L', // RAKA NADHIF ANDRIANSYAH
  '0109618750': 'L', // Reziyan Cheriel Raskadinata
  '0104254140': 'P', // SALSABILA AZURA ZAVIER
  '0103177852': 'P', // SHERLIYA YURI FADILLAH RAMADANTI
  '0105188277': 'L', // SULTHAAN ASMADEKHAL ATHAA-ILLAH
  '3107949257': 'P', // VELINA ISMA ZENIA
  '0113435475': 'P', // YUMNA SAFINATUN NAJA
  '0107962161': 'P', // ZIVANA LETISHAFIRA
};

const lines = raw.trim().split('\n').filter(l => l.trim().length > 0);
const students = lines.map(line => {
  const parts = line.split('\t').map(p => p.trim());
  const cls = parts[0];
  let name = parts[1].replace(/\s+/g, ' ');
  const nisn = parts[2];
  const gender = genderMap[nisn] || 'L';
  return {
    studentClass: cls,
    name,
    gender,
    nisn
  };
});

// Urutkan A - Z berdasarkan nama
students.sort((a, b) => a.name.localeCompare(b.name, 'id', { sensitivity: 'base' }));

console.log('Total siswa X-4:', students.length);
students.forEach((s, idx) => {
  const pad = String(idx + 1).padStart(2, '0');
  console.log(`${pad}. ${s.name} | ${s.gender} | NISN: ${s.nisn} | Kelas: ${s.studentClass}`);
});

const formattedX4 = students.map((s, idx) => {
  const pad = String(idx + 1).padStart(2, '0');
  return {
    id: `std-x4-${pad}`,
    nisn: s.nisn,
    name: s.name,
    studentClass: s.studentClass,
    gender: s.gender,
    password: s.nisn,
    isActive: true,
    notes: `Siswa Kelas ${s.studentClass} - NISN: ${s.nisn}`
  };
});

fs.writeFileSync('scripts/formatted_students_x4.json', JSON.stringify(formattedX4, null, 2), 'utf8');
console.log('Saved to scripts/formatted_students_x4.json');
