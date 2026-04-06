# 485 — Projeto Fullstack

## Stack
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS + React Hook Form + React Query
- **Backend**: Node.js + Express + TypeScript + JWT + bcrypt + Zod + Helmet

## Estrutura

```
485--Fredson/
├── client/          # Frontend React
├── server/          # Backend Express
└── package.json     # Scripts raiz
```

## Como rodar

### 1. Instalar dependências

```bash
# Na raiz do projeto
npm run install:all
```

Ou separadamente:
```bash
npm install --prefix server
npm install --prefix client
```

### 2. Configurar variáveis de ambiente

Edite `server/.env` e altere o `JWT_SECRET` para uma string segura.

### 3. Rodar em desenvolvimento

```bash
# Na raiz — inicia frontend e backend juntos
npm run dev
```

Ou separadamente:
```bash
# Terminal 1 — Backend (porta 3001)
npm run dev:server

# Terminal 2 — Frontend (porta 5173)
npm run dev:client
```

### 4. Acessar

- Frontend: http://localhost:5173
- Backend: http://localhost:3001

## Funcionalidades

- ✅ Login com e-mail e senha
- ✅ Cadastro com validação de senha forte
- ✅ Indicador de força da senha
- ✅ JWT armazenado no localStorage
- ✅ Rota protegida `/dashboard`
- ✅ Logout
- ✅ Rate limiting (20 req/15min por IP)
- ✅ Proteção contra timing attacks
- ✅ Headers de segurança com Helmet
- ✅ Validação com Zod (front + back)
