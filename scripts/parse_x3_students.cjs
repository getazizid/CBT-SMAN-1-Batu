const fs = require('fs');

const raw = `0113817473	Aaliya Salsabil Zweita Islami	X-3	0113817473
0103651019	Aditya Raisya Irendra Putra Syahvega	X-3	0103651019
0115548617	AINAYA SALWA FAIRUZA	X-3	0115548617
0109345271	ALMIRA NAYUNDA LUVINA	X-3	0109345271
0108140398	ANANDA SEPTA IBRAHIM FADHILLANSYAH	X-3	0108140398
0106080327	Angel Putri Agustina	X-3	0106080327
0101147622	Arima Altha Funisa	X-3	0101147622
0105139775	ARYA MAULANA DIMASQI	X-3	0105139775
3119061346	ATIQA MAISYA SYAMILA	X-3	3119061346
0101209953	BELVARA ZAKIYA ADZRA SAWITRI	X-3	0101209953
0109480976	DIMAS PRASETYO	X-3	0109480976
3115807947	ELMIRA ZAHRA	X-3	3115807947
0105643210	FANIA ZULIETA DWI WARDANI	X-3	0105643210
0113826143	FEROZ EDWARD YAQIN	X-3	0113826143
0104655501	GITA GRESILIA QUIN	X-3	0104655501
0119147562	JIHAN NAILAH MIRZANI	X-3	0119147562
0101685082	KAUTSAR ALBANI IZZACKY	X-3	0101685082
0113555784	KINARA NAJHA ATHARIZHA	X-3	0113555784
0104042620	Lukman Abdillah Kinasih	X-3	0104042620
0117929744	MAZARINA NITIYA SAFIA	X-3	0117929744
0118045637	MOZALYA FIORENZA PUTRI	X-3	0118045637
0102009565	MUHAMMAD FARHAN AL MUHLISIN	X-3	0102009565
3101531136	NADYA MULYA NATASYA	X-3	3101531136
0112117496	NATHANAEL NICO CHRISTIAN	X-3	0112117496
0107742915	NOAHJUNIO ABIANTARA PUTRA	X-3	0107742915
0118765042	PAMUNGKAS AKBAR ABHIRAMA	X-3	0118765042
3107873517	QUEENSHA SABRINA RIZKY ARBY	X-3	3107873517
0102023926	RAJWA SABRINA ROHMA	X-3	0102023926
0117186920	RIFQI ZAFRIZAL AUNUR RAHMAN	X-3	0117186920
3103351056	SALMA PARAMITA	X-3	3103351056
0117735847	SEFIA FIRANKA AZAHRA	X-3	0117735847
0101588014	SHELLY ANGGELIA PUTRI	X-3	0101588014
0103720833	Tarangga Sava Suyekso	X-3	0103720833
0106381331	ULLATUS MARDIANA AMBARWATI	X-3	0106381331
0101752205	VANESSA ANASTASYA	X-3	0101752205
3093099386	ZIRAH SATIRAH ARIFAH	X-3	3093099386`;

let eraporStudents = [];
if (fs.existsSync('C:/eraporsmaba/src/data/importedData.ts')) {
  const content = fs.readFileSync('C:/eraporsmaba/src/data/importedData.ts', 'utf8');
  // extract objects
  const studentRegex = /{\s*"id":\s*"([^"]+)",[\s\S]*?"namaLengkap":\s*"([^"]+)",\s*"jenisKelamin":\s*"([^"]+)",/g;
  let match;
  while ((match = studentRegex.exec(content)) !== null) {
    eraporStudents.push({
      id: match[1],
      name: match[2].trim().toLowerCase(),
      gender: match[3]
    });
  }
}

console.log('Loaded erapor students:', eraporStudents.length);

const lines = raw.trim().split('\n').filter(l => l.trim().length > 0);
const parsed = lines.map(line => {
  const parts = line.split('\t').map(p => p.trim());
  const nisn = parts[0];
  const name = parts[1].replace(/\s+/g, ' ');
  const cls = parts[2];

  let gender = 'L';
  const found = eraporStudents.find(s => s.name === name.toLowerCase());
  if (found) {
    gender = found.gender;
  } else {
    console.log('WARNING: Gender not found for', name);
  }

  return {
    nisn,
    name,
    cls,
    gender
  };
});

parsed.sort((a, b) => a.name.localeCompare(b.name, 'id', { sensitivity: 'base' }));

console.log('\n--- X-3 Students (' + parsed.length + ') ---');
parsed.forEach((s, idx) => {
  const pad = String(idx + 1).padStart(2, '0');
  console.log(`${pad}. ${s.name} | ${s.gender} | NISN: ${s.nisn} | Kelas: ${s.cls}`);
});

const formattedX3 = parsed.map((s, idx) => {
  const pad = String(idx + 1).padStart(2, '0');
  return {
    id: `std-x3-${pad}`,
    nisn: s.nisn,
    name: s.name,
    studentClass: s.cls,
    gender: s.gender,
    password: s.nisn,
    isActive: true,
    notes: `Siswa Kelas ${s.cls} - NISN: ${s.nisn}`
  };
});

fs.writeFileSync('scripts/formatted_students_x3.json', JSON.stringify(formattedX3, null, 2), 'utf8');
console.log('Successfully written to scripts/formatted_students_x3.json');
