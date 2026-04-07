"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const auth_1 = __importDefault(require("./routes/auth"));
const app = (0, express_1.default)();
const PORT = process.env.PORT ?? 3001;
// ─── Security headers ─────────────────────────────────────────────────────────
app.use((0, helmet_1.default)());
// ─── CORS ─────────────────────────────────────────────────────────────────────
app.use((0, cors_1.default)({
    origin: process.env.NODE_ENV === 'production' ? 'https://your-domain.com' : 'http://localhost:5173',
    credentials: true,
}));
// ─── Rate limiting ────────────────────────────────────────────────────────────
const authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20,
    message: { error: 'Muitas tentativas. Tente novamente em 15 minutos.' },
    standardHeaders: true,
    legacyHeaders: false,
});
// ─── Body parser ──────────────────────────────────────────────────────────────
app.use(express_1.default.json({ limit: '10kb' }));
// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/auth', authLimiter, auth_1.default);
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// ─── 404 handler ──────────────────────────────────────────────────────────────
app.use((_req, res) => {
    res.status(404).json({ error: 'Rota não encontrada.' });
});
// ─── Global error handler ─────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Erro interno do servidor.' });
});
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});
exports.default = app;
