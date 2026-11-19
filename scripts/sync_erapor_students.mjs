import fs from 'fs';

const SUPABASE_URL = 'https://ktxjlrfafijeyfqiimtp.supabase.co';
const ANON_KEY = 'sb_publishable_zAr5sTEu9R8HHichuutNOg_UMvAmsES';

async function generateData() {
  console.log('Fetching classes...');
  const resKelas = await fetch(`${SUPABASE_URL}/rest/v1/kelas?select=*`, {
    headers: { 'apikey': ANON_KEY, 'Authorization': `Bearer ${ANON_KEY}` }
  });
  const classes = await resKelas.json();
  const classMap = new Map();
  classes.forEach(c => classMap.set(c.id, c.namaKelas));

  console.log('Fetching students...');
  let eraporStudents = [];
  let page = 0;
  while (true) {
    const from = page * 1000;
    const to = from + 999;
    const res = await fetch(`${SUPABASE_URL}/rest/v1/siswa?select=*`, {
      headers: { 'apikey': ANON_KEY, 'Authorization': `Bearer ${ANON_KEY}`, 'Range': `${from}-${to}` }
    });
    const data = await res.json();
    eraporStudents.push(...data);
    if (data.length < 1000) break;
    page++;
  }

  console.log(`Fetched ${eraporStudents.length} students from e-Rapor.`);

  // Read existing CBT students to preserve existing IDs for X-1..X-5 if desired
  const ctData = fs.readFileSync('src/data/ctInformatikaExamData.ts', 'utf8');
  const ctStudentRegex = /\{[\s\S]*?"id":\s*"([^"]+)"[\s\S]*?"nisn":\s*"([^"]+)"[\s\S]*?"name":\s*"([^"]+)"[\s\S]*?"studentClass":\s*"([^"]+)"[\s\S]*?\}/g;
  let match;
  const existingCbtStudents = new Map();
  while ((match = ctStudentRegex.exec(ctData)) !== null) {
    existingCbtStudents.set(match[2], match[1]); // nisn -> id
  }

  // Deduplicate and map
  const seenNisns = new Set();
  const formattedStudents = [];

  // Sort erapor students by class and name
  eraporStudents.sort((a, b) => {
    const classA = classMap.get(a.kelasId) || a.kelasId || '';
    const classB = classMap.get(b.kelasId) || b.kelasId || '';
    if (classA !== classB) {
      return classA.localeCompare(classB, undefined, { numeric: true });
    }
    return (a.namaLengkap || '').localeCompare(b.namaLengkap || '', 'id-ID');
  });

  for (const s of eraporStudents) {
    const nisn = (s.nisn || '').trim();
    if (!nisn) continue;
    if (seenNisns.has(nisn)) {
      console.warn(`Duplicate NISN skipped: ${nisn} - ${s.namaLengkap}`);
      continue;
    }
    seenNisns.add(nisn);

    const studentClass = classMap.get(s.kelasId) || s.kelasId || '';
    const name = (s.namaLengkap || '').trim().toUpperCase();
    const gender = (s.jenisKelamin === 'L' || s.jenisKelamin === 'P') ? s.jenisKelamin : undefined;
    
    // Use existing ID if exists, otherwise generate standard id
    const existingId = existingCbtStudents.get(nisn);
    const id = existingId || `std-${nisn}`;

    const studentObj = {
      id,
      nisn,
      name,
      studentClass,
      gender,
      password: nisn,
      isActive: true,
      notes: `Siswa Kelas ${studentClass} - NISN: ${nisn}`
    };

    formattedStudents.push(studentObj);
  }

  console.log(`Total formatted students: ${formattedStudents.length}`);
  console.log(`Unique NISNs: ${seenNisns.size}`);

  // Build TS code
  const tsCode = `import { RegisteredStudent } from '../types';

/**
 * Data Seluruh Siswa SMAN 1 Batu (Hasil Sinkronisasi e-Rapor SMABA)
 * Sumber: https://eraporsmaba.vercel.app/
 * Total Siswa: ${formattedStudents.length} Siswa (36 Rombel Kelas X, XI, XII)
 * Terverifikasi Unik berdasarkan NISN (Bebas Duplikasi)
 */
export const ALL_ERAPOR_STUDENTS: RegisteredStudent[] = ${JSON.stringify(formattedStudents, null, 2)};
`;

  fs.writeFileSync('src/data/eraporStudentsData.ts', tsCode, 'utf8');
  console.log('Successfully wrote src/data/eraporStudentsData.ts');
}

generateData();
