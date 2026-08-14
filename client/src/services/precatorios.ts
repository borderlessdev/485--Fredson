import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
  type DocumentData,
} from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { emptyForm, parseMoney, type PrecatorioFormData } from '@/data/precatorioForm';
import type { PrecatorioStatus } from '@/data/status';
import { PRECATORIO_STATUS } from '@/data/status';
import { syncCedenteFromPrecatorio } from '@/services/cedentes';

export interface PrecatorioRecord {
  id: string;
  cotacao: string;
  cadastradoEm: string;
  status: PrecatorioStatus;
  data: PrecatorioFormData;
  comissaoPct: number;
  ofertaPct: number;
  userId: string;
}

export type PrecatorioCreateInput = {
  data: PrecatorioFormData;
  comissaoPct?: number;
  ofertaPct?: number;
  /** Não espelha em Cedentes (ex.: seed demo). */
  skipCedenteSync?: boolean;
};

export type PrecatorioPatch = {
  data?: PrecatorioFormData;
  status?: PrecatorioStatus;
  comissaoPct?: number;
  ofertaPct?: number;
  principal?: number;
};

function requireUid(): string {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Usuário não autenticado.');
  return uid;
}

function isStatus(v: unknown): v is PrecatorioStatus {
  return typeof v === 'string' && (PRECATORIO_STATUS as readonly string[]).includes(v);
}

function formatCadastradoEm(value: unknown): string {
  let d: Date | null = null;
  if (value instanceof Timestamp) d = value.toDate();
  else if (value instanceof Date) d = value;
  else if (typeof value === 'string' && value.trim()) return value;
  if (!d) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function normalizeForm(raw: unknown, fallbackStatus: PrecatorioStatus): PrecatorioFormData {
  const base = emptyForm();
  if (!raw || typeof raw !== 'object') {
    return { ...base, status: fallbackStatus };
  }
  const o = raw as Record<string, unknown>;
  return {
    ...base,
    tipo: (typeof o.tipo === 'string' ? o.tipo : base.tipo) as PrecatorioFormData['tipo'],
    tribunal: String(o.tribunal ?? ''),
    oficioNome: String(o.oficioNome ?? ''),
    oficioAnexo: Boolean(o.oficioAnexo ?? o.oficioUrl),
    eComum: Boolean(o.eComum),
    documento: String(o.documento ?? ''),
    requerente: String(o.requerente ?? ''),
    requerido: String(o.requerido ?? ''),
    natureza: String(o.natureza ?? ''),
    vara: String(o.vara ?? ''),
    status: isStatus(o.status) ? o.status : fallbackStatus,
    estadoUF: String(o.estadoUF ?? ''),
    estadoNome: String(o.estadoNome ?? ''),
    cidade: String(o.cidade ?? ''),
    dataBase: String(o.dataBase ?? ''),
    dataExpedicao: String(o.dataExpedicao ?? ''),
    principal: String(o.principal ?? ''),
    juros: String(o.juros ?? ''),
    numeroPrecatorio: String(o.numeroPrecatorio ?? ''),
    codigoProcesso: String(o.codigoProcesso ?? ''),
    cumprimentoSentenca: String(o.cumprimentoSentenca ?? ''),
    possuiPss: Boolean(o.possuiPss),
    reduzirPercentualCredor: Boolean(o.reduzirPercentualCredor),
    percentualCredor: String(o.percentualCredor ?? '100'),
    parcelaPreferencialPaga: Boolean(o.parcelaPreferencialPaga),
    descontos: Array.isArray(o.descontos) ? (o.descontos as PrecatorioFormData['descontos']) : [],
    confirmado: Boolean(o.confirmado),
  };
}

function fromDoc(id: string, data: DocumentData): PrecatorioRecord {
  const status: PrecatorioStatus = isStatus(data.status) ? data.status : 'Aguardando Proposta';
  return {
    id,
    cotacao: String(data.cotacao ?? ''),
    cadastradoEm: formatCadastradoEm(data.cadastradoEm ?? data.createdAt),
    status,
    comissaoPct: Number(data.comissaoPct ?? 1),
    ofertaPct: Number(data.ofertaPct ?? 70),
    userId: String(data.userId ?? ''),
    data: normalizeForm(data.form, status),
  };
}

function indexedFields(form: PrecatorioFormData, status: PrecatorioStatus) {
  return {
    status,
    tipo: form.tipo || null,
    tribunal: form.tribunal || null,
    documento: form.documento || null,
    requerente: form.requerente || null,
    requerido: form.requerido || null,
    natureza: form.natureza || null,
    codigoProcesso: form.codigoProcesso || null,
    principalNumero: parseMoney(form.principal),
    jurosNumero: parseMoney(form.juros),
    form: { ...form, status },
  };
}

export async function listPrecatorios(): Promise<PrecatorioRecord[]> {
  const uid = requireUid();
  const q = query(collection(db, 'precatorios'), where('userId', '==', uid));
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => fromDoc(d.id, d.data()))
    .sort((a, b) => b.cadastradoEm.localeCompare(a.cadastradoEm));
}

export async function createPrecatorio(input: PrecatorioCreateInput): Promise<PrecatorioRecord> {
  const uid = requireUid();
  const status = (isStatus(input.data.status) ? input.data.status : 'Aguardando Proposta') as PrecatorioStatus;
  const cotacao = `#${String(Date.now()).slice(-6)}`;
  const now = new Date();

  const ref = await addDoc(collection(db, 'precatorios'), {
    userId: uid,
    cotacao,
    comissaoPct: input.comissaoPct ?? 1,
    ofertaPct: input.ofertaPct ?? 70,
    ...indexedFields(input.data, status),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    cadastradoEm: serverTimestamp(),
  });

  const record: PrecatorioRecord = {
    id: ref.id,
    cotacao,
    cadastradoEm: formatCadastradoEm(now),
    status,
    comissaoPct: input.comissaoPct ?? 1,
    ofertaPct: input.ofertaPct ?? 70,
    userId: uid,
    data: { ...input.data, status },
  };

  if (!input.skipCedenteSync) {
    await syncCedenteFromPrecatorio(record);
  }

  return record;
}

export async function updatePrecatorio(id: string, patch: PrecatorioPatch): Promise<void> {
  requireUid();
  const ref = doc(db, 'precatorios', id);
  const current = await getDoc(ref);
  if (!current.exists()) throw new Error('Precatório não encontrado.');

  const prev = fromDoc(current.id, current.data());
  let form = prev.data;
  let status = prev.status;

  if (patch.data) form = { ...patch.data };
  if (patch.status) status = patch.status;
  else if (isStatus(form.status)) status = form.status;

  if (patch.principal != null) {
    form = {
      ...form,
      principal: patch.principal.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    };
  }

  const payload: DocumentData = {
    ...indexedFields(form, status),
    updatedAt: serverTimestamp(),
  };

  if (patch.comissaoPct != null) payload.comissaoPct = patch.comissaoPct;
  if (patch.ofertaPct != null) payload.ofertaPct = patch.ofertaPct;

  await updateDoc(ref, payload);

  const updated: PrecatorioRecord = {
    ...prev,
    status,
    data: form,
    comissaoPct: patch.comissaoPct ?? prev.comissaoPct,
    ofertaPct: patch.ofertaPct ?? prev.ofertaPct,
  };

  try {
    await syncCedenteFromPrecatorio(updated);
  } catch (e) {
    console.error('Falha ao sincronizar cedente:', e);
  }
}

export async function deletePrecatorio(id: string): Promise<void> {
  requireUid();
  await deleteDoc(doc(db, 'precatorios', id));
}

