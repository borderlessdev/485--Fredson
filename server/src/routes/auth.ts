import bcrypt from 'bcryptjs';
import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { signToken } from '../utils/jwt';
import { authenticate, AuthRequest } from '../middleware/auth';
import { users, nextUserId } from '../db/users';

const router = Router();

// ─── Validation schemas ───────────────────────────────────────────────────────
const registerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('E-mail inválido'),
  password: z
    .string()
    .min(8, 'A senha deve ter pelo menos 8 caracteres')
    .regex(/[A-Z]/, 'A senha deve conter pelo menos uma letra maiúscula')
    .regex(/[0-9]/, 'A senha deve conter pelo menos um número'),
});

const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

const forgotPasswordSchema = z.object({
  email: z.string().email('E-mail inválido'),
});

// ─── POST /auth/register ──────────────────────────────────────────────────────
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  const result = registerSchema.safeParse(req.body);

  if (!result.success) {
    res.status(400).json({ error: result.error.errors[0].message });
    return;
  }

  const { name, email, password } = result.data;

  if (users.find((u) => u.email === email)) {
    res.status(409).json({ error: 'E-mail já cadastrado.' });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = {
    id: nextUserId(),
    name,
    email,
    passwordHash,
    createdAt: new Date(),
  };

  users.push(user);

  const token = signToken({ userId: user.id, email: user.email });

  res.status(201).json({
    token,
    user: { id: user.id, name: user.name, email: user.email },
  });
});

// ─── POST /auth/login ─────────────────────────────────────────────────────────
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  const result = loginSchema.safeParse(req.body);

  if (!result.success) {
    res.status(400).json({ error: result.error.errors[0].message });
    return;
  }

  const { email, password } = result.data;

  const user = users.find((u) => u.email === email);

  // Constant-time comparison to prevent timing attacks
  if (!user) {
    await bcrypt.compare(password, '$2a$12$placeholder.hash.to.prevent.timing');
    res.status(401).json({ error: 'Credenciais inválidas.' });
    return;
  }

  const passwordMatch = await bcrypt.compare(password, user.passwordHash);

  if (!passwordMatch) {
    res.status(401).json({ error: 'Credenciais inválidas.' });
    return;
  }

  const token = signToken({ userId: user.id, email: user.email });

  res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email },
  });
});

// ─── POST /auth/forgot-password ──────────────────────────────────────────────
router.post('/forgot-password', async (req: Request, res: Response): Promise<void> => {
  const result = forgotPasswordSchema.safeParse(req.body);

  if (!result.success) {
    res.status(400).json({ error: result.error.errors[0].message });
    return;
  }

  const { email } = result.data;
  const user = users.find((u) => u.email === email);

  // Resposta genérica para não expor se o e-mail existe no sistema
  if (user) {
    const recoveryToken = `recovery_${Math.random().toString(36).slice(2, 12)}`;
    console.log(`📩 Recuperação solicitada para ${email} | token: ${recoveryToken}`);
  }

  res.json({
    message: 'Se o e-mail existir em nossa base, enviaremos as instruções de recuperação.',
  });
});

// ─── GET /auth/me ─────────────────────────────────────────────────────────────
router.get('/me', authenticate, (req: AuthRequest, res: Response): void => {
  const user = users.find((u) => u.id === req.user!.userId);

  if (!user) {
    res.status(404).json({ error: 'Usuário não encontrado.' });
    return;
  }

  res.json({ id: user.id, name: user.name, email: user.email });
});

export default router;
