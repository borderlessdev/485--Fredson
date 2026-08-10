/**
 * Zera dados do colaborador no Firestore (precatorios + limpa campos extras do perfil).
 * Uso: node scripts/clear-collaborator-data.mjs
 */
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  getFirestore,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY ?? 'AIzaSyCIP3Bo8aY6XESo8-t-d-vwf8QpHJ0_Rfk',
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN ?? 'fredson-bf42c.firebaseapp.com',
  projectId: process.env.VITE_FIREBASE_PROJECT_ID ?? 'fredson-bf42c',
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET ?? 'fredson-bf42c.firebasestorage.app',
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? '1063290426668',
  appId: process.env.VITE_FIREBASE_APP_ID ?? '1:1063290426668:web:0bef19be7ebd4ce5500889',
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID ?? 'G-G68ZHLEMD8',
};

const COLLAB = {
  email: 'colaborador@485.com',
  password: 'Colaborador@485',
  name: 'Colaborador 485',
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function main() {
  const cred = await signInWithEmailAndPassword(auth, COLLAB.email, COLLAB.password);
  await cred.user.getIdToken(true);
  const uid = cred.user.uid;
  console.log(`signed in as ${COLLAB.email} (${uid})`);

  const snap = await getDocs(query(collection(db, 'precatorios'), where('userId', '==', uid)));
  console.log(`precatorios encontrados: ${snap.size}`);

  for (const d of snap.docs) {
    await deleteDoc(d.ref);
    console.log(`deleted precatorio ${d.id}`);
  }

  // Perfil limpo (mantém role collaborator)
  await setDoc(
    doc(db, 'users', uid),
    {
      uid,
      name: COLLAB.name,
      email: COLLAB.email,
      role: 'collaborator',
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    },
    { merge: true },
  );
  console.log('perfil colaborador resetado');

  await signOut(auth);
  console.log('done — dados do colaborador zerados');
  process.exit(0);
}

main().catch((err) => {
  console.error('clear failed:', err);
  process.exit(1);
});
