const fs = require('fs');

const raw = `Alira Rizky Aprilia	P	0101207532
ANANDA IMELDATASYA	P	0111294958
APTA VEDA CHARISMA	L	0108255356
ARIEZKIA CAHYA RAMADHANI	P	0102548278
Arya Adam Rasheesa	L	0103157479
ATHIFA CALISTA PUTRI FAUZI	P	0101364002
BATSEBA ALFAHRUDINA AL HINDI	P	0104697296
Callysta Melvia Hardian	P	0116181752
CARISSA KIRANA PUTRI ISWOYO	P	0115605917
CIRA ELYSIA EFENDI	P	0108785400
DIGMA AHMAD SILAH	L	0106344316
EGI RATU ALEYCIA ZHAFIRA YUDHA	P	0115055050
FAHRI RAHMAT WIJAYA	L	0107260887
FATIMAH TUZZAHRA	P	0104176213
GHISKA YUANISA DWI SALSABIIL	P	0117935150
HIKMAL SYABITUL AZMI	L	3116686195
ISMI LISYA OKTAVHEA	P	0101867250
KEISHA NALA RIZQI WIDYADHANA SAID	P	0106688236
KHATIJAH AZYUHA RAGANA MELODI	P	0116240683
LEONIDAS ELSAFATORE	L	0103673045
LOVINA MAIA TSALTSADIARI	P	0105448382
MAULA HIBATULLOH AL ISLAM	L	0106712735
MONICA ANGGUN SELVIANA	P	3118259346
MUHAMMAD EVAN PUTRA SETIAWAN	L	3106647960
NADIRA GITA FATYA ASYAFA	P	3118119234
NASHRULLOHI AKBAR MAULANA	L	0102017483
NIZAM RAFIF HARDIANTO	L	0112109594
Queenara Nasywa Arrochim	P	0117466199
RAHMAWATI	P	0107835050
Riffat Arsyad Tamam Biantoro	L	0103258582
SAIFUL CAHYONO	L	0101865781
SESILIA RIZKY YULIANTI	P	0111152658
SUCI FATDILAH PUTRI ANGGRAINI	P	0107727603
Usviana Kurniawati	P	0108060732
YASMIN CARISSA FANIA RAMADHAN	P	0101661034
ZAQI ALFARIZI	L	0102868632`;

const lines = raw.trim().split('\n').filter(l => l.trim().length > 0);
const students = lines.map(line => {
  const parts = line.split('\t').map(p => p.trim());
  return {
    name: parts[0],
    gender: parts[1] || 'L',
    nisn: parts[2]
  };
});

// Urutkan abjad A - Z
students.sort((a, b) => a.name.localeCompare(b.name, 'id', { sensitivity: 'base' }));

console.log('Total siswa:', students.length);
students.forEach((s, idx) => {
  const pad = String(idx + 1).padStart(2, '0');
  console.log(`${pad}. ${s.name} | ${s.gender} | NISN: ${s.nisn} | User/Pass: ${s.nisn}`);
});

// Format RegisteredStudent array
const formattedStudents = students.map((s, idx) => {
  const pad = String(idx + 1).padStart(2, '0');
  return {
    id: `std-ct-x-${pad}`,
    nisn: s.nisn,
    name: s.name,
    studentClass: 'X-2', // atau kelas X
    gender: s.gender,
    password: s.nisn, // username dan password pakai NISN
    isActive: true,
    notes: `Siswa Kelas X - NISN: ${s.nisn}`
  };
});

fs.writeFileSync('scripts/formatted_students.json', JSON.stringify(formattedStudents, null, 2), 'utf8');
console.log('Saved to scripts/formatted_students.json');
