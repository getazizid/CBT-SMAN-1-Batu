const fs = require('fs');

const rawInput = `16556	Aaliya Salsabil Zweita Islami
16569	Aditya Raisya Irendra Putra Syahvega
16577	Ainaya Salwa Fairuza
16590	Almira Nayunda Luvina
16603	Ananda Septa Ibrahim Fadhillansyah
16609	Angel Putri Agustina
16625	Arima Altha Funisa
16635	Arya Maulana Dimasqi
16646	Atiqa Maisya Syamila
16660	Belvara Zakiya Adzra Sawitri
16690	Dimas Prasetyo
16698	Elmira Zahra
16714	Fania Zulieta Dwi Wardani
16724	Feroz Edward Yaqin
16734	Gita Gresilia Quin
16759	Jihan Nailah Mirzani
16768	Kautsar Albani Izzacky
16782	Kinara Najha Atharizha
16797	Lukman Abdillah Kinasih
16811	Mazarina Nitiya Safia
16822	Mozalya Fiorenza Putri
16832	Muhammad Farhan Al Muhlisin
16853	Nadya Mulya Natasya
16861	Nathanael Nico Christian
16869	Noahjunio Abiantara Putra
16875	Pamungkas Akbar Abhirama
16881	Queensha Sabrina Rizky Arby
16893	Rajwa Sabrina Rohma
16906	Rifqi Zafrizal Aunur Rahman
16917	Salma Paramita
16927	Sefia Firanka Azahra
16931	Shelly Anggelia Putri
16947	Tarangga Sava Suyekso
16952	Ullatus Mardiana Ambarwati
16954	Vanessa Anastasya
16977	Zirah Satirah Arifah`;

const eraporContent = fs.existsSync('C:/eraporsmaba/src/data/importedData.ts') 
  ? fs.readFileSync('C:/eraporsmaba/src/data/importedData.ts', 'utf8') 
  : '';

const lines = rawInput.trim().split('\n').map(l => l.trim()).filter(Boolean);

lines.forEach(line => {
  const parts = line.split('\t');
  const code = parts[0].trim();
  const name = parts[1].trim();

  let jk = 'L';
  let nisn = code;
  let nis = code;
  let kelas = 'X-3';

  if (eraporContent) {
    const idx = eraporContent.indexOf(name);
    if (idx !== -1) {
      const chunk = eraporContent.slice(Math.max(0, idx - 400), Math.min(eraporContent.length, idx + 400));
      const nisnMatch = chunk.match(/"nisn":\s*"([^"]+)"/);
      const nisMatch = chunk.match(/"nis":\s*"([^"]+)"/);
      const jkMatch = chunk.match(/"jenisKelamin":\s*"([^"]+)"/);
      const kelasMatch = chunk.match(/"kelasId":\s*"([^"]+)"/);
      if (jkMatch) jk = jkMatch[1];
      if (nisnMatch) nisn = nisnMatch[1];
      if (nisMatch) nis = nisMatch[1];
      if (kelasMatch) kelas = kelasMatch[1];
    }
  }

  console.log(`${code} | ${name} | JK: ${jk} | NISN: ${nisn} | NIS: ${nis} | Kelas: ${kelas}`);
});
