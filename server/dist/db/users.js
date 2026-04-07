"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.users = void 0;
exports.nextUserId = nextUserId;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
exports.users = [];
let nextId = 1;
function nextUserId() {
    return String(nextId++);
}
// ─── Seed user criado na inicialização ───────────────────────────────────────
async function seed() {
    const passwordHash = await bcryptjs_1.default.hash('Admin@485', 12);
    exports.users.push({
        id: nextUserId(),
        name: 'Admin 485',
        email: 'admin@485.com',
        passwordHash,
        createdAt: new Date(),
    });
    console.log('✅ Usuário seed criado → admin@485.com / Admin@485');
}
seed();
