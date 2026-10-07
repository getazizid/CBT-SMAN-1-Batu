const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, writeBatch, doc } = require('firebase/firestore');
const fs = require('fs');

const firebaseConfig = {
  apiKey: 'AIzaSyAdObMeqW5InTnBRUDTMkUxDYdMrxVqPcg',
  authDomain: 'cbt-sman-1-batu.firebaseapp.com',
  projectId: 'cbt-sman-1-batu',
  storageBucket: 'cbt-sman-1-batu.firebasestorage.app',
  messagingSenderId: '120403078781',
  appId: '1:120403078781:web:8a4e9e89c45024521ecb14',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  console.log('Connecting to Firestore...');
  const studentsSnap = await getDocs(collection(db, 'cbt_students'));
  console.log('Existing students count in Firestore:', studentsSnap.size);

  const existingNisns = new Set();
  studentsSnap.forEach(d => {
    const s = d.data();
    if (s.nisn) existingNisns.add(s.nisn);
  });

  const allToSync = [];
  if (fs.existsSync('scripts/formatted_students_x1.json')) {
    const x1 = JSON.parse(fs.readFileSync('scripts/formatted_students_x1.json', 'utf8'));
    allToSync.push(...x1);
  }
  if (fs.existsSync('scripts/formatted_students_x4.json')) {
    const x4 = JSON.parse(fs.readFileSync('scripts/formatted_students_x4.json', 'utf8'));
    allToSync.push(...x4);
  }
  if (fs.existsSync('scripts/formatted_students_x5.json')) {
    const x5 = JSON.parse(fs.readFileSync('scripts/formatted_students_x5.json', 'utf8'));
    allToSync.push(...x5);
  }

  const toAdd = allToSync.filter(s => !existingNisns.has(s.nisn));
  console.log('Total students to check:', allToSync.length);
  console.log('Missing students to insert into Firestore:', toAdd.length);

  if (toAdd.length > 0) {
    const batch = writeBatch(db);
    toAdd.forEach(student => {
      batch.set(doc(db, 'cbt_students', student.id), student);
    });
    await batch.commit();
    console.log(`Successfully inserted ${toAdd.length} students into Firestore!`);
  } else {
    console.log('All students already exist in Firestore.');
  }

  process.exit(0);
}

run().catch(err => {
  console.error('Error during Firestore sync:', err);
  process.exit(1);
});
