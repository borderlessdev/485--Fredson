import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  type DocumentData,
} from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { parseMoney } from '@/data/precatorioForm';
import type { PrecatorioStatus } from '@/data/status';
import { PRECATORIO_STATUS } from '@/data/status';
import { sanitizePartyName } from '@/services/oficioPdf';

export type EstadoCivil = 'Solteiro(a)' | 'Casado(a)' | 'Divorciado(a)' | 'Viúvo(a)' | 'União Estável';

export interface DadosBancarios {
  banco: string;
  agencia: string;
  conta: string;
  tipoConta: 'Corrente' | 'Poupança';
  pix: string;
}

export interface ArquivoCedente {
  id: string;
  nome: string;
  tipo: string;
  tamanho: number;
  dataUpload: string;
}

export interface CedenteRecord {
  id: string;
  nome: string;
  cpf: string;
  estadoCivil: EstadoCivil | '';
  email: string;
  telefone: string;
  origemLead: string;
  statusEsteira: PrecatorioStatus;
  dadosBancarios: DadosBancarios;
  processo: string;
  valorFace: number;
  arquivos: ArquivoCedente[];
  cadastradoEm: string;
  userId: string;
}

export type CedenteInput = Omit<CedenteRecord, 'id' | 'userId' | 'cadastradoEm'>;

function requireUid(): string {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Usuário não autenticado.');
  return uid;
}

function isStatus(v: unknown): v is PrecatorioStatus {
  return typeof v === 'string' && (PRECATORIO_STATUS as readonly string[]).includes(v);
}

function formatCadastradoEm(value: unknown): string {
  if (value instanceof Timestamp) {
    const d = value.toDate();
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }
  if (typeof value === 'string' && value.trim()) return value;
  return '';
}

function normalizeDadosBancarios(raw: unknown): DadosBancarios {
  if (!raw || typeof raw !== 'object') {
    return { banco: '', agencia: '', conta: '', tipoConta: 'Corrente', pix: '' };
  }
  const o = raw as Record<string, unknown>;
  return {
    banco: String(o.banco ?? ''),
    agencia: String(o.agencia ?? ''),
    conta: String(o.conta ?? ''),
    tipoConta: o.tipoConta === 'Poupança' ? 'Poupança' : 'Corrente',
    pix: String(o.pix ?? ''),
  };
}

function normalizeArquivos(raw: unknown): ArquivoCedente[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item, i) => {
      if (!item || typeof item !== 'object') return null;
      const o = item as Record<string, unknown>;
      return {
        id: String(o.id ?? `file-${i}`),
        nome: String(o.nome ?? ''),
        tipo: String(o.tipo ?? ''),
        tamanho: Number(o.tamanho ?? 0),
        dataUpload: String(o.dataUpload ?? ''),
      };
    })
    .filter(Boolean) as ArquivoCedente[];
}

function fromDoc(id: string, data: DocumentData): CedenteRecord {
  const estadoRaw = String(data.estadoCivil ?? '');
  const estadoCivil = (
    ['Solteiro(a)', 'Casado(a)', 'Divorciado(a)', 'Viúvo(a)', 'União Estável'] as const
  ).includes(estadoRaw as EstadoCivil)
    ? (estadoRaw as EstadoCivil)
    : '';

  return {
    id,
    userId: String(data.userId ?? ''),
    nome: String(data.nome ?? ''),
    cpf: String(data.cpf ?? ''),
    estadoCivil,
    email: String(data.email ?? ''),
    telefone: String(data.telefone ?? ''),
    origemLead: String(data.origemLead ?? ''),
    statusEsteira: isStatus(data.statusEsteira) ? data.statusEsteira : 'Em Análise',
    dadosBancarios: normalizeDadosBancarios(data.dadosBancarios),
    processo: String(data.processo ?? ''),
    valorFace: Number(data.valorFace ?? 0),
    arquivos: normalizeArquivos(data.arquivos),
    cadastradoEm: formatCadastradoEm(data.cadastradoEm ?? data.createdAt),
  };
}

function toFirestore(input: CedenteInput, statusEsteira: PrecatorioStatus) {
  return {
    nome: input.nome.trim(),
    cpf: input.cpf.trim(),
    estadoCivil: input.estadoCivil || '',
    email: input.email.trim(),
    telefone: input.telefone.trim(),
    origemLead: input.origemLead.trim(),
    statusEsteira,
    dadosBancarios: input.dadosBancarios,
    processo: input.processo.trim(),
    valorFace: Number(input.valorFace) || 0,
    arquivos: input.arquivos.map((a) => ({
      id: a.id,
      nome: a.nome,
      tipo: a.tipo,
      tamanho: a.tamanho,
      dataUpload: a.dataUpload,
    })),
  };
}

export async function listCedentes(): Promise<CedenteRecord[]> {
  const uid = requireUid();
  const q = query(collection(db, 'cedentes'), where('userId', '==', uid));
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => fromDoc(d.id, d.data()))
    .sort((a, b) => b.cadastradoEm.localeCompare(a.cadastradoEm));
}

export async function createCedente(input: CedenteInput): Promise<CedenteRecord> {
  const uid = requireUid();
  const status = isStatus(input.statusEsteira) ? input.statusEsteira : 'Em Análise';
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const cadastradoEm = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

  const ref = await addDoc(collection(db, 'cedentes'), {
    userId: uid,
    ...toFirestore(input, status),
    cadastradoEm: serverTimestamp(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return {
    ...input,
    id: ref.id,
    userId: uid,
    cadastradoEm,
    statusEsteira: status,
  };
}

export async function updateCedente(id: string, input: CedenteInput): Promise<void> {
  requireUid();
  const ref = doc(db, 'cedentes', id);
  const current = await getDoc(ref);
  if (!current.exists()) throw new Error('Cedente não encontrado.');

  const status = isStatus(input.statusEsteira) ? input.statusEsteira : 'Em Análise';
  await updateDoc(ref, {
    ...toFirestore(input, status),
    updatedAt: serverTimestamp(),
  });
}

export async function deleteCedente(id: string): Promise<void> {
  requireUid();
  await deleteDoc(doc(db, 'cedentes', id));
}


export function parseValorFace(raw: string): number {
  const n = parseFloat(raw.replace(/[R$\s.]/g, '').replace(',', '.'));
  return Number.isFinite(n) ? Math.round(n) : 0;
}

/** Dados mínimos de um precatório para espelhar em Cedentes. */
export type PrecatorioSyncInput = {
  id: string;
  status: PrecatorioStatus;
  data: {
    requerente: string;
    documento: string;
    codigoProcesso: string;
    principal: string;
    juros: string;
  };
};

function valorFaceFromPrecatorio(data: PrecatorioSyncInput['data']): number {
  const total = parseMoney(data.principal) + parseMoney(data.juros);
  return total > 0 ? Math.round(total) : 0;
}

/** Cria ou atualiza o cedente vinculado ao precatório (mesmo ID do documento). */
export async function syncCedenteFromPrecatorio(op: PrecatorioSyncInput): Promise<void> {
  const uid = requireUid();
  const ref = doc(db, 'cedentes', op.id);
  const existing = await getDoc(ref);
  const status = isStatus(op.status) ? op.status : 'Aguardando Proposta';
  const nome = sanitizePartyName(op.data.requerente);
  const processo = op.data.codigoProcesso.trim();
  const cpf = op.data.documento.trim();
  const valorFace = valorFaceFromPrecatorio(op.data);

  if (existing.exists()) {
    const prev = fromDoc(op.id, existing.data());
    await updateDoc(ref, {
      ...toFirestore(
        {
          ...prev,
          nome: nome || prev.nome,
          cpf: cpf || prev.cpf,
          processo: processo || prev.processo,
          valorFace: valorFace || prev.valorFace,
          statusEsteira: status,
        },
        status,
      ),
      precatorioId: op.id,
      updatedAt: serverTimestamp(),
    });
    return;
  }

  await setDoc(ref, {
    userId: uid,
    precatorioId: op.id,
    ...toFirestore(
      {
        nome,
        cpf,
        estadoCivil: '',
        email: '',
        telefone: '',
        origemLead: 'Meus Precatórios',
        statusEsteira: status,
        dadosBancarios: { banco: '', agencia: '', conta: '', tipoConta: 'Corrente', pix: '' },
        processo,
        valorFace,
        arquivos: [],
      },
      status,
    ),
    cadastradoEm: serverTimestamp(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}
