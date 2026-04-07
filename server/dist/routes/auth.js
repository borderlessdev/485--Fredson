"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const express_1 = require("express");
const zod_1 = require("zod");
const jwt_1 = require("../utils/jwt");
const auth_1 = require("../middleware/auth");
const users_1 = require("../db/users");
const router = (0, express_1.Router)();
// ─── Validation schemas ───────────────────────────────────────────────────────
const registerSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
    email: zod_1.z.string().email('E-mail inválido'),
    password: zod_1.z
        .string()
        .min(8, 'A senha deve ter pelo menos 8 caracteres')
        .regex(/[A-Z]/, 'A senha deve conter pelo menos uma letra maiúscula')
        .regex(/[0-9]/, 'A senha deve conter pelo menos um número'),
});
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('E-mail inválido'),
    password: zod_1.z.string().min(1, 'Senha é obrigatória'),
});
const forgotPasswordSchema = zod_1.z.object({
    email: zod_1.z.string().email('E-mail inválido'),
});
// ─── POST /auth/register ──────────────────────────────────────────────────────
router.post('/register', async (req, res) => {
    const result = registerSchema.safeParse(req.body);
    if (!result.success) {
        res.status(400).json({ error: result.error.errors[0].message });
        return;
    }
    const { name, email, password } = result.data;
    if (users_1.users.find((u) => u.email === email)) {
        res.status(409).json({ error: 'E-mail já cadastrado.' });
        return;
    }
    const passwordHash = await bcryptjs_1.default.hash(password, 12);
    const user = {
        id: (0, users_1.nextUserId)(),
        name,
        email,
        passwordHash,
        createdAt: new Date(),
    };
    users_1.users.push(user);
    const token = (0, jwt_1.signToken)({ userId: user.id, email: user.email });
    res.status(201).json({
        token,
        user: { id: user.id, name: user.name, email: user.email },
    });
});
// ─── POST /auth/login ─────────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
    const result = loginSchema.safeParse(req.body);
    if (!result.success) {
        res.status(400).json({ error: result.error.errors[0].message });
        return;
    }
    const { email, password } = result.data;
    const user = users_1.users.find((u) => u.email === email);
    // Constant-time comparison to prevent timing attacks
    if (!user) {
        await bcryptjs_1.default.compare(password, '$2a$12$placeholder.hash.to.prevent.timing');
        res.status(401).json({ error: 'Credenciais inválidas.' });
        return;
    }
    const passwordMatch = await bcryptjs_1.default.compare(password, user.passwordHash);
    if (!passwordMatch) {
        res.status(401).json({ error: 'Credenciais inválidas.' });
        return;
    }
    const token = (0, jwt_1.signToken)({ userId: user.id, email: user.email });
    res.json({
        token,
        user: { id: user.id, name: user.name, email: user.email },
    });
});
// ─── POST /auth/forgot-password ──────────────────────────────────────────────
router.post('/forgot-password', async (req, res) => {
    const result = forgotPasswordSchema.safeParse(req.body);
    if (!result.success) {
        res.status(400).json({ error: result.error.errors[0].message });
        return;
    }
    const { email } = result.data;
    const user = users_1.users.find((u) => u.email === email);
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
router.get('/me', auth_1.authenticate, (req, res) => {
    const user = users_1.users.find((u) => u.id === req.user.userId);
    if (!user) {
        res.status(404).json({ error: 'Usuário não encontrado.' });
        return;
    }
    res.json({ id: user.id, name: user.name, email: user.email });
});
exports.default = router;
