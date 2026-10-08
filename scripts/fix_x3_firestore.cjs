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

async function fix() {
  console.log('Fetching cbt_students from Firestore...');
  const x3List = JSON.parse(fs.readFileSync('scripts/formatted_students_x3.json', 'utf8'));
  const x3NisnMap = new Map();
  x3List.forEach(s => x3NisnMap.set(s.nisn, s));

  const snap = await getDocs(collection(db, 'cbt_students'));
  console.log('Total documents currently:', snap.size);

  const batch = writeBatch(db);

  // 1. Delete old/corrupted docs with Class: 'L' or other wrong IDs for these NISNs
  let deletedCount = 0;
  snap.forEach(d => {
    const data = d.data();
    if (x3NisnMap.has(data.nisn) && d.id.startsWith('std-batch-')) {
      console.log('Deleting corrupted doc:', d.id, 'for', data.name, 'Class:', data.studentClass);
      batch.delete(doc(db, 'cbt_students', d.id));
      deletedCount++;
    }
  });

  // 2. Set all 36 students in X-3 with correct format std-x3-XX
  x3List.forEach(student => {
    batch.set(doc(db, 'cbt_students', student.id), student);
  });

  await batch.commit();
  console.log(`Committed! Deleted ${deletedCount} corrupted docs, saved all ${x3List.length} students with Class: X-3.`);

  // Verify
  const verifySnap = await getDocs(collection(db, 'cbt_students'));
  let countX3 = 0;
  verifySnap.forEach(d => {
    if (d.data().studentClass === 'X-3') countX3++;
  });
  console.log(`VERIFICATION: Total students in Firestore with studentClass === 'X-3': ${countX3}`);

  process.exit(0);
}

fix().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
