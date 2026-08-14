import {
  createUserWithEmailAndPassword,
  type AuthError,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
} from 'firebase/auth';
import { collection, doc, getDoc, getDocs, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db, getSecondaryAuth } from '@/lib/firebase';
import { isAdmin, normalizeRole, roleFromEmail, type UserRole } from '@/data/roles';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface AdminCreateUserPayload {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'operator';
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface AuthResponse {
  user: AuthUser;
}

const AUTH_ERRORS: Record<string, string> = {
  'auth/email-already-in-use': 'E-mail já cadastrado.',
  'auth/invalid-email': 'E-mail inválido.',
  'auth/invalid-credential': 'Credenciais inválidas.',
  'auth/user-not-found': 'Credenciais inválidas.',
  'auth/wrong-password': 'Credenciais inválidas.',
  'auth/weak-password': 'A senha deve ter pelo menos 6 caracteres.',
  'auth/too-many-requests': 'Muitas tentativas. Tente novamente mais tarde.',
};

export function getAuthErrorMessage(error: unknown): string {
  if (typeof error !== 'object' || error === null) {
    return 'Erro inesperado. Tente novamente.';
  }

  const code = (error as AuthError).code;
  if (code && AUTH_ERRORS[code]) {
    return AUTH_ERRORS[code];
  }

  return 'Erro inesperado. Tente novamente.';
}

async function upsertUserProfile(user: AuthUser, options?: { role?: UserRole; setRole?: boolean }): Promise<void> {
  const payload: Record<string, unknown> = {
    name: user.name,
    email: user.email,
    updatedAt: serverTimestamp(),
    createdAt: serverTimestamp(),
  };
  if (options?.setRole && options.role) {
    payload.role = options.role;
  }
  await setDoc(doc(db, 'users', user.id), payload, { merge: true });
}

async function resolveCurrentUser(): Promise<AuthUser> {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('Usuário não autenticado.');
  }

  const profileDoc = await getDoc(doc(db, 'users', currentUser.uid));
  const profile = profileDoc.data();
  const email = currentUser.email ?? '';
  const fromProfile = profile?.role != null ? normalizeRole(profile.role) : null;
  const fromEmail = roleFromEmail(email);
  // Perfil antigo sem role: mantém admin se veio do map de e-mail; caso contrário colaborador
  const role = fromProfile ?? fromEmail ?? 'collaborator';

  return {
    id: currentUser.uid,
    name: (profile?.name as string | undefined) ?? currentUser.displayName ?? 'Usuário',
    email,
    role,
  };
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  await signInWithEmailAndPassword(auth, payload.email, payload.password);
  const user = await resolveCurrentUser();
  const profileDoc = await getDoc(doc(db, 'users', user.id));
  const needsRole = !profileDoc.exists() || profileDoc.data()?.role == null;
  await upsertUserProfile(user, needsRole ? { setRole: true, role: user.role } : undefined);
  return { user };
}

export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  const credential = await createUserWithEmailAndPassword(auth, payload.email, payload.password);
  await updateProfile(credential.user, { displayName: payload.name });
  const user: AuthUser = {
    id: credential.user.uid,
    name: payload.name,
    email: payload.email,
    role: 'collaborator',
  };
  await upsertUserProfile(user, { setRole: true, role: 'collaborator' });
  return { user };
}

export async function listUsers(): Promise<AuthUser[]> {
  const me = await getMe();
  if (!isAdmin(me.role)) {
    throw new Error('Apenas administradores podem listar usuários.');
  }
  const snap = await getDocs(collection(db, 'users'));
  return snap.docs
    .map((d) => {
      const data = d.data();
      return {
        id: d.id,
        name: String(data.name ?? 'Usuário'),
        email: String(data.email ?? ''),
        role: normalizeRole(data.role),
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
}

export async function adminCreateUser(payload: AdminCreateUserPayload): Promise<AuthUser> {
  const me = await getMe();
  if (!isAdmin(me.role)) {
    throw new Error('Apenas administradores podem cadastrar usuários.');
  }

  const secondaryAuth = getSecondaryAuth();
  let uid = '';
  try {
    const credential = await createUserWithEmailAndPassword(secondaryAuth, payload.email, payload.password);
    uid = credential.user.uid;
    await updateProfile(credential.user, { displayName: payload.name });
  } finally {
    await firebaseSignOut(secondaryAuth);
  }

  const user: AuthUser = {
    id: uid,
    name: payload.name,
    email: payload.email,
    role: payload.role,
  };

  await setDoc(doc(db, 'users', uid), {
    name: payload.name,
    email: payload.email,
    role: payload.role,
    createdBy: me.id,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return user;
}

export async function getMe(): Promise<AuthUser> {
  return resolveCurrentUser();
}

export async function forgotPassword(payload: ForgotPasswordPayload): Promise<{ message: string }> {
  await sendPasswordResetEmail(auth, payload.email);
  return { message: 'Se o e-mail existir em nossa base, enviaremos as instruções de recuperação.' };
}

export async function logout(): Promise<void> {
  await firebaseSignOut(auth);
}
