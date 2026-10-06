const fs = require('fs');

const raw = `X-1	AILIN CHAYA AGATHA	P	0107558631
X-1	ANGELIKA TUWATANASSY	P	0106808232
X-1	ARETA VIVIA PRASISTA	P	0101139832
X-1	ARVA PRAWIRA PUTRA	L	0102572268
X-1	ATHAYA ZAHRA HUMAIRO	P	3104063825
X-1	AZZARA NAVA SABRINA	P	0112760971
X-1	CALLYSTA NATHANIA	P	0102051679
X-1	CHIARA AYESHA PRADNYA PARAMITA	P	0102471511
X-1	CITRA AMELIA PUTRI	P	0117657602
X-1	Dhetan Fredrik Erwanto	L	0101393281
X-1	DZAKIYYAH RAYYA KHALISHAH	P	0108583734
X-1	FAHIRA KATRIAN RAMADHANI	P	0109433514
X-1	FATHIR NASHRUR ROMADHON	L	0105325189
X-1	Fidella Leandra Yoan	P	0106529715
X-1	GANES AYODYA PRAMESTI	P	0117643257
X-1	HANA SALSABILA NURMAYANTO	P	0112248935
X-1	HAVILAH SAHIRA TAHLITA MAHARANI	P	0118398590
X-1	HILDA KURNIA RAHAYU	P	0101816622
X-1	IRFAN ASHANDY	L	3108079858
X-1	Jidan Ardis Prawira Wahyudi	L	0104246662
X-1	Keiko Melvena Levianka Putri	P	0103567036
X-1	Khansa Naura Pramono	P	0117202207
X-1	Kornelius Valen Adhi Traya	L	0112417724
X-1	LIONEL ASTA PUTRA PANDULU	L	0112248049
X-1	MARIO MARSELINO TANREAGO ASUAT	L	0114267628
X-1	Maurisia Carolinya Dwi Putri Efendi	P	0106613090
X-1	Mohd Musliadi	L	3106831769
X-1	MUHAMMAD ILHAM AINUR ROKHMAN	L	0113825961
X-1	NAAFISAH PUTRI SALSABILA	P	0119275505
X-1	NAJAH NAJIBAH FADIYAH FAHRY	P	0116596086
X-1	NIZAM HAFIDZ AKMAL GHIBRAN	L	3118291209
X-1	PUTRI ALLURA TERTIA FAZA	P	0107549588
X-1	RAHMA ARDIYANTI PUTRI PURWONO	P	0118658386
X-1	RIF'AN NAJA HAWALIQ	L	0117869475
X-1	STEFANIE FANUELA BUDIMAN	P	0118238184
X-1	Wahyu Dwi Daffa Danendra	L	0118964942`;

const lines = raw.trim().split('\n').filter(l => l.trim().length > 0);
const students = lines.map(line => {
  const parts = line.split('\t').map(p => p.trim());
  const cls = parts[0];
  let name = parts[1].replace(/\s+/g, ' ');
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

console.log('Total siswa X-1:', students.length);
students.forEach((s, idx) => {
  const pad = String(idx + 1).padStart(2, '0');
  console.log(`${pad}. ${s.name} | ${s.gender} | NISN: ${s.nisn} | Kelas: ${s.studentClass}`);
});

const formattedX1 = students.map((s, idx) => {
  const pad = String(idx + 1).padStart(2, '0');
  return {
    id: `std-x1-${pad}`,
    nisn: s.nisn,
    name: s.name,
    studentClass: s.studentClass,
    gender: s.gender,
    password: s.nisn,
    isActive: true,
    notes: `Siswa Kelas ${s.studentClass} - NISN: ${s.nisn}`
  };
});

fs.writeFileSync('scripts/formatted_students_x1.json', JSON.stringify(formattedX1, null, 2), 'utf8');
console.log('Saved to scripts/formatted_students_x1.json');
