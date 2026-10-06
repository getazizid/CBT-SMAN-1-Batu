const fs = require('fs');

const raw = `X-5	ABIWARA PRAMATYA SAHASIKA	L	3118246696
X-5	ADINDA NELLA MAYASITA	P	0104309801
X-5	Airell Oviera Marta Dita	P	0101117592
X-5	ALVYAN HAIQAL AL-FARIDZI	L	0102888448
X-5	AMELIA SAFIANA	P	0107777512
X-5	ANINDA ZAHRA PRASETYO	P	3114823669
X-5	ARIMBI QINARA DIMAR HARIYANTO	P	0111424880
X-5	ASSABRINA NAJMA NAFISAH	P	0105200853
X-5	AXELL DEAR RAQILLA	L	0118346946
X-5	BINTANG SHANDITYA WIRA TAMA	L	0115622603
X-5	Cahaya Fieta Putri Purnomo	P	0116503894
X-5	DEASYTA AYU SYABRINA 	P	3105312959
X-5	Elsa Zahirah Putri	P	0117212059
X-5	Fajria Fatma Ramadhani	P	0114576125
X-5	FIA LISTIANA	P	0101856825
X-5	GILANG RAMADHAN	L	0109192151
X-5	IFFA NAFISA	P	0116645188
X-5	JOVITA VALERIE DIMEBAG CAVALERA	P	0113383901
X-5	KENZA ADELLA RAFISYA AMIN	L	0116773852
X-5	KUSNINDYA GALUH PRAMESTHI	P	3104765605
X-5	MAHADEWI SHIFAZKA ADHISTIE	P	0106687325
X-5	MAULADANI ARGO PRASETYO	L	0116626769
X-5	Muchamad Nizar Syah	L	0108925210
X-5	MUHAMMAD IZZAM HARTONO	L	0115069414
X-5	Nabila Maharani Arfansyah	P	0101769231
X-5	NASMA ISTAHMALA ALFARAH	P	0109051151
X-5	NURIN ZAUJAROTUN  NAFISA	P	0102551721
X-5	radhitya ridho wahyudi	L	0101827486
X-5	Rangga Yulio Mahendra	L	0108328238
X-5	Rizky Nuraini Muroh	P	0118207044
X-5	Salwa Dwi Fatima Azzahra	P	0102468034
X-5	SHINTA DWI NOVELA	P	0115611382
X-5	SYAHDEWA BARIQ ZAMZANY	L	0031205600
X-5	VENNA LATHIFAH DZAKIRA	P	0119998902
X-5	YVEEZ MAULINA BENING SAMBITI	P	0105557452
X-5	ZIVARA PUTRI SAVINA	P	0113173579`;

const lines = raw.trim().split('\n').filter(l => l.trim().length > 0);
const students = lines.map(line => {
  const parts = line.split('\t').map(p => p.trim());
  const cls = parts[0];
  let name = parts[1].replace(/\s+/g, ' ');
  if (name.toLowerCase() === 'radhitya ridho wahyudi') {
    name = 'Radhitya Ridho Wahyudi';
  }
  const gender = parts[2] || 'L';
  const nisn = parts[3];
  return {
    studentClass: cls,
    name,
    gender,
    nisn
  };
});

// Urutkan A - Z berdasarkan nama
students.sort((a, b) => a.name.localeCompare(b.name, 'id', { sensitivity: 'base' }));

console.log('Total siswa X-5:', students.length);
students.forEach((s, idx) => {
  const pad = String(idx + 1).padStart(2, '0');
  console.log(`${pad}. ${s.name} | ${s.gender} | NISN: ${s.nisn} | Kelas: ${s.studentClass}`);
});

const formattedX5 = students.map((s, idx) => {
  const pad = String(idx + 1).padStart(2, '0');
  return {
    id: `std-x5-${pad}`,
    nisn: s.nisn,
    name: s.name,
    studentClass: s.studentClass,
    gender: s.gender,
    password: s.nisn,
    isActive: true,
    notes: `Siswa Kelas ${s.studentClass} - NISN: ${s.nisn}`
  };
});

fs.writeFileSync('scripts/formatted_students_x5.json', JSON.stringify(formattedX5, null, 2), 'utf8');
console.log('Saved to scripts/formatted_students_x5.json');
