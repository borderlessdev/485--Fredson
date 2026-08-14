import {
  Bytes,
  deleteDoc,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

/** Firestore tem limite de ~1 MB por documento. */
const MAX_BYTES = 900_000;

export interface OficioAnexo {
  nome: string;
  mimeType: string;
  size: number;
  blob: Blob;
}

function requireUid(): string {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Usuário não autenticado.');
  return uid;
}

export async function saveOficioAnexo(precatorioId: string, file: File): Promise<void> {
  const uid = requireUid();
  if (file.size > MAX_BYTES) {
    throw new Error(
      `PDF muito grande (${Math.round(file.size / 1024)} KB). Limite: ${Math.round(MAX_BYTES / 1024)} KB.`,
    );
  }
  const buffer = await file.arrayBuffer();
  await setDoc(doc(db, 'precatorio_anexos', precatorioId), {
    userId: uid,
    nome: file.name,
    mimeType: file.type || 'application/pdf',
    size: file.size,
    data: Bytes.fromUint8Array(new Uint8Array(buffer)),
    updatedAt: serverTimestamp(),
  });
}

export async function loadOficioAnexo(precatorioId: string): Promise<OficioAnexo | null> {
  requireUid();
  const snap = await getDoc(doc(db, 'precatorio_anexos', precatorioId));
  if (!snap.exists()) return null;

  const raw = snap.data();
  const bytes = raw.data as Bytes | undefined;
  if (!bytes) return null;

  const mimeType = String(raw.mimeType ?? 'application/pdf');
  const arr = bytes.toUint8Array();
  const blob = new Blob([new Uint8Array(arr)], { type: mimeType });
  return {
    nome: String(raw.nome ?? 'oficio.pdf'),
    mimeType,
    size: Number(raw.size ?? blob.size),
    blob,
  };
}

export async function deleteOficioAnexo(precatorioId: string): Promise<void> {
  requireUid();
  await deleteDoc(doc(db, 'precatorio_anexos', precatorioId));
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename || 'oficio.pdf';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export function openBlobPreview(blob: Blob): void {
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank', 'noopener,noreferrer');
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
