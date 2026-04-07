import bcrypt from 'bcryptjs';

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
}

export const users: User[] = [];
let nextId = 1;

export function nextUserId(): string {
  return String(nextId++);
}

// ─── Seed user criado na inicialização ───────────────────────────────────────
async function seed() {
  const passwordHash = await bcrypt.hash('Admin@485', 12);
  users.push({
    id: nextUserId(),
    name: 'Admin 485',
    email: 'admin@485.com',
    passwordHash,
    createdAt: new Date(),
  });
  console.log('✅ Usuário seed criado → admin@485.com / Admin@485');
}

seed();
