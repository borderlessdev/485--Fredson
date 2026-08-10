import { initializeApp } from 'firebase/app';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { doc, serverTimestamp, setDoc, getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY ?? 'AIzaSyCIP3Bo8aY6XESo8-t-d-vwf8QpHJ0_Rfk',
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN ?? 'fredson-bf42c.firebaseapp.com',
  projectId: process.env.VITE_FIREBASE_PROJECT_ID ?? 'fredson-bf42c',
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET ?? 'fredson-bf42c.firebasestorage.app',
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? '1063290426668',
  appId: process.env.VITE_FIREBASE_APP_ID ?? '1:1063290426668:web:0bef19be7ebd4ce5500889',
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID ?? 'G-G68ZHLEMD8',
};

const SEED_USERS = [
  { name: 'Admin 485', email: 'admin@485.com', password: 'Admin@485', role: 'admin' },
  { name: 'Operador 485', email: 'operador@485.com', password: 'Operador@485', role: 'operator' },
  { name: 'Colaborador 485', email: 'colaborador@485.com', password: 'Colaborador@485', role: 'collaborator' },
];

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function upsertUserProfile(uid, name, email, role) {
  await setDoc(
    doc(db, 'users', uid),
    {
      uid,
      name,
      email,
      role,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

async function ensureUser(user) {
  let credential;

  try {
    credential = await createUserWithEmailAndPassword(auth, user.email, user.password);
    console.log(`created user: ${user.email}`);
  } catch (error) {
    if (error?.code === 'auth/email-already-in-use') {
      credential = await signInWithEmailAndPassword(auth, user.email, user.password);
      console.log(`user already exists: ${user.email}`);
    } else {
      throw error;
    }
  }

  // Garante token fresco para o Firestore respeitar as regras
  await credential.user.getIdToken(true);
  await upsertUserProfile(credential.user.uid, user.name, user.email, user.role);
  console.log(`profile upserted: ${user.email} (${user.role})`);
  await signOut(auth);
}

async function seed() {
  try {
    for (const user of SEED_USERS) {
      await ensureUser(user);
    }

    try {
      const admin = SEED_USERS[0];
      const cred = await signInWithEmailAndPassword(auth, admin.email, admin.password);
      await cred.user.getIdToken(true);
      await setDoc(
        doc(db, 'app_meta', 'seed'),
        {
          projectId: firebaseConfig.projectId,
          seededAt: serverTimestamp(),
          seededBy: 'firebase-seed-script',
        },
        { merge: true },
      );
      await signOut(auth);
    } catch (metaErr) {
      console.warn('app_meta seed skipped (rules):', metaErr?.code ?? metaErr);
    }

    console.log('\nseed complete');
    console.log('users:');
    for (const user of SEED_USERS) {
      console.log(`- ${user.email} / ${user.password} (${user.role})`);
    }
    process.exit(0);
  } catch (error) {
    console.error('seed failed:', error);
    process.exit(1);
  }
}

seed();
