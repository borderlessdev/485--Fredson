# Firebase - Credenciais e Acessos

## Projeto

- Project ID: `fredson-bf42c`
- Auth Domain: `fredson-bf42c.firebaseapp.com`
- Console: `https://console.firebase.google.com/project/fredson-bf42c/overview`

## Configuracao Web (Vite)

```env
VITE_FIREBASE_API_KEY=AIzaSyCIP3Bo8aY6XESo8-t-d-vwf8QpHJ0_Rfk
VITE_FIREBASE_AUTH_DOMAIN=fredson-bf42c.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=fredson-bf42c
VITE_FIREBASE_STORAGE_BUCKET=fredson-bf42c.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=1063290426668
VITE_FIREBASE_APP_ID=1:1063290426668:web:0bef19be7ebd4ce5500889
VITE_FIREBASE_MEASUREMENT_ID=G-G68ZHLEMD8
```

## Usuarios seed (Firebase Auth)

- Admin: `admin@485.com` / `Admin@485`
- Operador: `operador@485.com` / `Operador@485`

## Dados seed (Firestore)

- Coleção `users`:
  - documento `<uid-do-admin>` com role `admin`
  - documento `<uid-do-operador>` com role `operator`
- Coleção `app_meta`:
  - documento `seed` com `seededAt` e `seededBy`
- Coleção `precatorios` (por usuário logado):
  - `userId`, `cotacao`, `status`, `form` (wizard completo), `comissaoPct`, `ofertaPct`
  - CRUD pelo app em **Meus Precatórios** (`client/src/services/precatorios.ts`)
  - Na primeira visita com lista vazia, o app grava 3 demos no Firestore

## Regras (Firestore)

Arquivo: `firestore.rules` — cada usuário só lê/escreve os próprios `precatorios` e o próprio `users/{uid}`.

```bash
npx firebase deploy --only firestore:rules --project fredson-bf42c
```

## Comando para rodar seed novamente

```bash
npm run seed:firebase
```

## Observacao de seguranca

As regras atuais do Firestore estao em modo de teste (`allow read, write: if true`) no arquivo `firestore.rules`.
