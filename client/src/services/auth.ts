import {
  createUserWithEmailAndPassword,
  type AuthError,
  EmailAuthProvider,
  reauthenticateWithCredential,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updatePassword,
  updateProfile,
} from 'firebase/auth';
import { collection, doc, getDoc, getDocs, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db, getSecondaryAuth } from '@/lib/firebase';
import { isAdmin, normalizeRole, roleFromEmail, type UserRole } from '@/data/roles';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  mustChangePassword: boolean;
  active: boolean;
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

export interface AdminUpdateUserPayload {
  id: string;
  name: string;
  role: 'admin' | 'operator' | 'collaborator';
  mustChangePassword: boolean;
  active: boolean;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface AuthResponse {
  user: AuthUser;
}

export class InactiveUserError extends Error {
  constructor(message = 'Esta conta está inativa. Solicite a reativação ao administrador.') {
    super(message);
    this.name = 'InactiveUserError';
  }
}

const AUTH_ERRORS: Record<string, string> = {
  'auth/email-already-in-use': 'E-mail já cadastrado.',
  'auth/invalid-email': 'E-mail inválido.',
  'auth/invalid-credential': 'Credenciais inválidas.',
  'auth/user-not-found': 'Credenciais inválidas.',
  'auth/wrong-password': 'Credenciais inválidas.',
  'auth/weak-password': 'A senha deve ter pelo menos 6 caracteres.',
  'auth/too-many-requests': 'Muitas tentativas. Tente novamente mais tarde.',
  'auth/requires-recent-login': 'Sessão expirada. Entre novamente para trocar a senha.',
  'auth/missing-password': 'Informe a senha atual.',
};

export function getAuthErrorMessage(error: unknown): string {
  if (error instanceof InactiveUserError) {
    return error.message;
  }

  if (typeof error !== 'object' || error === null) {
    return 'Erro inesperado. Tente novamente.';
  }

  const code = (error as AuthError).code;
  if (code && AUTH_ERRORS[code]) {
    return AUTH_ERRORS[code];
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Erro inesperado. Tente novamente.';
}

function isActiveProfile(profile: Record<string, unknown> | undefined): boolean {
  // Contas antigas sem o campo continuam ativas
  return profile?.active !== false;
}

function mapUserDoc(id: string, data: Record<string, unknown>, fallbackEmail = ''): AuthUser {
  return {
    id,
    name: String(data.name ?? 'Usuário'),
    email: String(data.email ?? fallbackEmail),
    role: normalizeRole(data.role),
    mustChangePassword: data.mustChangePassword === true,
    active: isActiveProfile(data),
  };
}

async function upsertUserProfile(user: AuthUser, options?: { role?: UserRole; setRole?: boolean }): Promise<void> {
  const payload: Record<string, unknown> = {
    name: user.name,
    email: user.email,
    active: user.active,
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
  const profile = profileDoc.data() as Record<string, unknown> | undefined;
  const email = currentUser.email ?? '';
  const fromProfile = profile?.role != null ? normalizeRole(profile.role) : null;
  const fromEmail = roleFromEmail(email);
  const role = fromProfile ?? fromEmail ?? 'collaborator';

  const user: AuthUser = {
    id: currentUser.uid,
    name: (profile?.name as string | undefined) ?? currentUser.displayName ?? 'Usuário',
    email,
    role,
    mustChangePassword: profile?.mustChangePassword === true,
    active: isActiveProfile(profile),
  };

  if (!user.active) {
    await firebaseSignOut(auth);
    throw new InactiveUserError();
  }

  return user;
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  await signInWithEmailAndPassword(auth, payload.email, payload.password);
  try {
    const user = await resolveCurrentUser();
    const profileDoc = await getDoc(doc(db, 'users', user.id));
    const needsRole = !profileDoc.exists() || profileDoc.data()?.role == null;
    if (needsRole) {
      await upsertUserProfile(user, { setRole: true, role: user.role });
    }
    // Garante campo active em perfis antigos
    if (profileDoc.exists() && profileDoc.data()?.active === undefined) {
      await setDoc(doc(db, 'users', user.id), { active: true, updatedAt: serverTimestamp() }, { merge: true });
    }
    return { user };
  } catch (error) {
    if (auth.currentUser) {
      await firebaseSignOut(auth).catch(() => undefined);
    }
    throw error;
  }
}

export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  const credential = await createUserWithEmailAndPassword(auth, payload.email, payload.password);
  await updateProfile(credential.user, { displayName: payload.name });
  const user: AuthUser = {
    id: credential.user.uid,
    name: payload.name,
    email: payload.email,
    role: 'collaborator',
    mustChangePassword: false,
    active: true,
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
    .map((d) => mapUserDoc(d.id, d.data() as Record<string, unknown>))
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
    mustChangePassword: true,
    active: true,
  };

  await setDoc(doc(db, 'users', uid), {
    name: payload.name,
    email: payload.email,
    role: payload.role,
    mustChangePassword: true,
    active: true,
    createdBy: me.id,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return user;
}

export async function adminUpdateUser(payload: AdminUpdateUserPayload): Promise<AuthUser> {
  const me = await getMe();
  if (!isAdmin(me.role)) {
    throw new Error('Apenas administradores podem editar usuários.');
  }

  if (payload.id === me.id && !payload.active) {
    throw new Error('Você não pode inativar a própria conta.');
  }

  const ref = doc(db, 'users', payload.id);
  const current = await getDoc(ref);
  if (!current.exists()) throw new Error('Usuário não encontrado.');

  await updateDoc(ref, {
    name: payload.name.trim(),
    role: payload.role,
    mustChangePassword: payload.mustChangePassword,
    active: payload.active,
    updatedAt: serverTimestamp(),
  });

  return {
    id: payload.id,
    name: payload.name.trim(),
    email: String(current.data().email ?? ''),
    role: payload.role,
    mustChangePassword: payload.mustChangePassword,
    active: payload.active,
  };
}

export async function changeCurrentUserPassword(
  currentPassword: string,
  newPassword: string,
): Promise<AuthUser> {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error('Usuário não autenticado.');
  if (!currentUser.email) throw new Error('Conta sem e-mail vinculado.');

  const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
  await reauthenticateWithCredential(currentUser, credential);
  await updatePassword(currentUser, newPassword);
  await setDoc(
    doc(db, 'users', currentUser.uid),
    {
      mustChangePassword: false,
      passwordChangedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );

  return getMe();
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
