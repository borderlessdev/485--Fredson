export const USER_ROLES = ['admin', 'operator', 'collaborator'] as const;
export type UserRole = (typeof USER_ROLES)[number];

/** Rotas liberadas para o colaborador (print da sidebar) */
export const COLLABORATOR_ROUTES = [
  '/dashboard',
  '/cedentes',
  '/esteira',
] as const;

export type CollaboratorRoute = (typeof COLLABORATOR_ROUTES)[number];

export function normalizeRole(role: unknown): UserRole {
  if (role === 'collaborator' || role === 'colaborador') return 'collaborator';
  if (role === 'operator' || role === 'operador') return 'operator';
  if (role === 'admin') return 'admin';
  // Sem role explícito: mais restrito por segurança
  return 'collaborator';
}

/** Fallback por e-mail do seed (útil se o doc Firestore ainda não tiver role) */
export const SEED_EMAIL_ROLES: Record<string, UserRole> = {
  'admin@485.com': 'admin',
  'operador@485.com': 'operator',
  'colaborador@485.com': 'collaborator',
};

export function roleFromEmail(email: string | null | undefined): UserRole | null {
  if (!email) return null;
  return SEED_EMAIL_ROLES[email.trim().toLowerCase()] ?? null;
}

/** Rotas exclusivas do administrador */
export const ADMIN_ROUTES = ['/usuarios'] as const;

export function isAdmin(role: UserRole | undefined | null): boolean {
  return normalizeRole(role) === 'admin';
}

export function isCollaborator(role: UserRole | undefined | null): boolean {
  return normalizeRole(role) === 'collaborator';
}

export function canAccessRoute(role: UserRole | undefined | null, path: string): boolean {
  const r = normalizeRole(role);
  if ((ADMIN_ROUTES as readonly string[]).some((allowed) => path === allowed || path.startsWith(`${allowed}/`))) {
    return r === 'admin';
  }
  if (r !== 'collaborator') return true;
  return (COLLABORATOR_ROUTES as readonly string[]).some(
    (allowed) => path === allowed || path.startsWith(`${allowed}/`),
  );
}

export function roleLabel(role: UserRole): string {
  switch (role) {
    case 'collaborator':
      return 'Colaborador';
    case 'operator':
      return 'Operador';
    default:
      return 'Admin';
  }
}
