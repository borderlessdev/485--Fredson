import { getDocument, GlobalWorkerOptions, type PDFDocumentProxy } from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import type { PrecatorioFormData, TipoPrecatorio } from '@/data/precatorioForm';
import { formatMoneyInput } from '@/data/precatorioForm';

GlobalWorkerOptions.workerSrc = pdfWorker;

export type OficioParsed = Partial<PrecatorioFormData> & {
  rawText?: string;
  avisos?: string[];
};

function normalize(text: string): string {
  return text
    .replace(/\u00a0/g, ' ')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n');
}

function moneyToInput(raw: string): string {
  const n = parseFloat(raw.replace(/\./g, '').replace(',', '.'));
  if (!Number.isFinite(n)) return '';
  return formatMoneyInput(n);
}

function brDateToIso(br: string): string {
  const m = br.match(/(\d{2})\/(\d{2})\/(\d{4})/);
  if (!m) return '';
  return `${m[3]}-${m[2]}-${m[1]}`;
}

function firstMatch(text: string, patterns: RegExp[]): string {
  for (const re of patterns) {
    const m = text.match(re);
    if (m?.[1]?.trim()) return m[1].trim();
  }
  return '';
}

/** Corta nomes/partes que vieram com lixo do PDF (linha única sem quebras). */
export function sanitizePartyName(raw: string, maxLen = 120): string {
  if (!raw) return '';
  let s = raw.replace(/\s+/g, ' ').trim();
  const stop =
    /\s+(?:Advogado\s*\/|Requerido\s*\/|INFORMA[ÇC][ÃA]O|Natureza\s+do|Natureza\s+da|Esp[eé]cie:|Incidentes:|DATAS\s+DE|Valor\s+Total|IDENTIFICA[ÇC][ÃA]O|BENEFICI[ÁA]RIO)/i;
  const cut = s.match(stop);
  if (cut?.index != null && cut.index > 0) s = s.slice(0, cut.index).trim();
  s = s.replace(/\s+(?:CPF|OAB)\s*[:.]?\s*\d.*$/i, '').trim();
  if (s.length > maxLen) s = `${s.slice(0, maxLen - 1).trim()}…`;
  return s;
}

function extractRequerente(text: string): string {
  const m =
    text.match(
      /Requerente\s*\/\s*Credor\s*:\s*(.+?)(?=\s+Advogado|\s+Requerido|\s+INFORMA|\s+Natureza|\s+Esp[eé]cie|\s+IDENTIFICA|\n|$)/is,
    ) ?? text.match(/Requerente\s*:\s*(.+?)(?=\s+Advogado|\s+Requerido|\s+INFORMA|\n|$)/is);
  return sanitizePartyName(m?.[1]?.trim() ?? '');
}

function extractRequerido(text: string): string {
  const m =
    text.match(
      /Requerido\s*\/\s*Devedor\s*:\s*(.+?)(?=\s+INFORMA|\s+Natureza|\s+Esp[eé]cie|\s+DATAS|\n|$)/is,
    ) ?? text.match(/Requerido\s*:\s*(.+?)(?=\s+INFORMA|\s+Natureza|\n|$)/is);
  return sanitizePartyName(m?.[1]?.trim() ?? '', 80);
}

function detectTribunal(text: string): { tipo: TipoPrecatorio; tribunal: string } | null {
  const t = text.toUpperCase();
  const trf = t.match(/TRIBUNAL\s+REGIONAL\s+FEDERAL[^\d]{0,12}(\d)/);
  if (trf) return { tipo: 'Federal', tribunal: `TRF${trf[1]}` };
  if (/SUPREMO\s+TRIBUNAL\s+FEDERAL|\bSTF\b/.test(t)) return { tipo: 'Federal', tribunal: 'STF' };
  if (/SUPERIOR\s+TRIBUNAL\s+DE\s+JUSTI[ÇC]A|\bSTJ\b/.test(t)) return { tipo: 'Federal', tribunal: 'STJ' };
  const tj = t.match(/\bTJ([A-Z]{2})\b/);
  if (tj) return { tipo: 'Estadual', tribunal: `TJ${tj[1]}` };
  return null;
}

function detectUfCidade(text: string): { estadoUF: string; estadoNome: string; cidade: string } {
  const secao = text.match(/SE[ÇC][ÃA]O\s+JUDICI[ÁA]RIA\s+D[OE]\s+([A-ZÁÉÍÓÚÂÊÔÃÕÇ\s]+)/i);
  const nomeEstado = (secao?.[1] || '').replace(/\s+/g, ' ').trim();
  const mapa: Record<string, { uf: string; nome: string }> = {
    'DISTRITO FEDERAL': { uf: 'DF', nome: 'Distrito Federal' },
    'SAO PAULO': { uf: 'SP', nome: 'São Paulo' },
    'SÃO PAULO': { uf: 'SP', nome: 'São Paulo' },
    'RIO DE JANEIRO': { uf: 'RJ', nome: 'Rio de Janeiro' },
    'MINAS GERAIS': { uf: 'MG', nome: 'Minas Gerais' },
    'RIO GRANDE DO SUL': { uf: 'RS', nome: 'Rio Grande do Sul' },
    PARANA: { uf: 'PR', nome: 'Paraná' },
    PARANÁ: { uf: 'PR', nome: 'Paraná' },
    BAHIA: { uf: 'BA', nome: 'Bahia' },
    'SANTA CATARINA': { uf: 'SC', nome: 'Santa Catarina' },
    GOIAS: { uf: 'GO', nome: 'Goiás' },
    GOIÁS: { uf: 'GO', nome: 'Goiás' },
    CEARA: { uf: 'CE', nome: 'Ceará' },
    CEARÁ: { uf: 'CE', nome: 'Ceará' },
    PERNAMBUCO: { uf: 'PE', nome: 'Pernambuco' },
  };
  const key = nomeEstado
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toUpperCase();
  const hit =
    mapa[nomeEstado.toUpperCase()] ||
    Object.entries(mapa).find(([k]) => k.normalize('NFD').replace(/\p{M}/gu, '') === key)?.[1];

  const varaLinha = text.match(/\d+[ªA]\s+VARA\s*[-–]\s*([A-ZÁÉÍÓÚÂÊÔÃÕÇ\s]+?)(?:\s*[-–]|$)/i);
  const cidade = (varaLinha?.[1] || '').replace(/\s+/g, ' ').trim();

  return {
    estadoUF: hit?.uf || '',
    estadoNome: hit?.nome || nomeEstado,
    cidade: cidade
      ? cidade
          .toLowerCase()
          .replace(/(^|\s)\S/g, (c) => c.toUpperCase())
      : '',
  };
}

/** Extrai texto de todas as páginas do PDF. */
export async function extractPdfText(file: File | ArrayBuffer): Promise<string> {
  const data = file instanceof File ? await file.arrayBuffer() : file;
  const loadingTask = getDocument({ data, useSystemFonts: true });
  const pdf: PDFDocumentProxy = await loadingTask.promise;
  const parts: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const line = content.items
      .map((item) => ('str' in item ? item.str : ''))
      .join(' ');
    parts.push(line);
  }
  return normalize(parts.join('\n'));
}

/** Interpreta ofício requisitório (TRF / precatório) e devolve campos do formulário. */
export function parseOficioText(raw: string): OficioParsed {
  const text = normalize(raw);
  const avisos: string[] = [];
  const out: OficioParsed = { rawText: text, avisos };

  const tribunal = detectTribunal(text);
  if (tribunal) {
    out.tipo = tribunal.tipo;
    out.tribunal = tribunal.tribunal;
  } else {
    avisos.push('Tribunal não identificado automaticamente.');
  }

  out.requerente = extractRequerente(text);

  // Prefer CPF do beneficiário (página 2), senão do advogado
  const cpfs = [...text.matchAll(/\b(\d{3}\.?\d{3}\.?\d{3}-?\d{2})\b/g)].map((m) => m[1]);
  const beneCpf = text.match(
    /([A-ZÁÉÍÓÚÂÊÔÃÕÇ][A-ZÁÉÍÓÚÂÊÔÃÕÇa-záéíóúâêôãõç\s.'-]{3,80}?)\s+(\d{3}\.?\d{3}\.?\d{3}-?\d{2})\s+TITULAR/i,
  );
  if (beneCpf) {
    out.documento = beneCpf[2];
    if (!out.requerente) out.requerente = sanitizePartyName(beneCpf[1]);
  } else if (cpfs.length) {
    // último CPF costuma ser do beneficiário; se só um, o do advogado
    out.documento = cpfs.length > 1 ? cpfs[cpfs.length - 1] : cpfs[0];
  }

  out.requerido = extractRequerido(text);

  const nat = text.match(/Natureza\s+do\s+Cr[ée]dito\s*:\s*([^\n\r]+)/i)?.[1] || '';
  if (/alimentar/i.test(nat)) out.natureza = 'Alimentar';
  else if (/comum/i.test(nat)) out.natureza = 'Comum';
  else if (nat) out.natureza = 'Outros';

  out.vara = firstMatch(text, [
    /(\d+[ªA]\s+VARA[^\n\r]*?)(?:\n|$)/i,
    /(VARA\s+[^\n\r]+)/i,
  ]).replace(/\s+/g, ' ').trim();

  const loc = detectUfCidade(text);
  out.estadoUF = loc.estadoUF;
  out.estadoNome = loc.estadoNome;
  out.cidade = loc.cidade;

  const dataCadastro = firstMatch(text, [
    /Data\s+de\s+Cadastro\s+da\s+Req\.?\s*:\s*(\d{2}\/\d{2}\/\d{4})/i,
  ]);
  if (dataCadastro) out.dataExpedicao = brDateToIso(dataCadastro);

  const dataBase =
    firstMatch(text, [
      /DATA\s*BASE[^\d]{0,40}(\d{2}\/\d{2}\/\d{4})/i,
      /DATA\s*BASE[^\d]{0,20}(\d{2}\/\d{4})/i,
    ]) || '';
  if (dataBase.includes('/') && dataBase.length === 7) {
    // MM/YYYY → dia 01
    const [mm, yyyy] = dataBase.split('/');
    out.dataBase = `${yyyy}-${mm}-01`;
  } else if (dataBase) {
    out.dataBase = brDateToIso(dataBase);
  }

  // Fallback data-base MM/YYYY perto de "SUPLEMENTAR OU PARCIAL"
  if (!out.dataBase) {
    const mmY = text.match(/SUPLEMENTAR\s+OU\s+PARCIAL:\s*(\d{2})\/(\d{4})/i);
    if (mmY) out.dataBase = `${mmY[2]}-${mmY[1]}-01`;
  }

  out.numeroPrecatorio = firstMatch(text, [
    /^N[ºo°]\s*([0-9.]+)/im,
    /N[ºo°]\s+([0-9]{4}\.[0-9.]+)/i,
  ]);

  const processos = [...text.matchAll(/\b(\d{1,7}-\d{2}\.\d{4}\.\d\.\d{2}\.\d{4})\b/g)].map((m) => m[1]);
  if (processos[0]) out.codigoProcesso = processos[0];
  if (processos[1]) out.cumprimentoSentenca = processos[1];

  // Principal / juros na tabela do beneficiário
  const valoresLinha = text.match(
    /(?:PRINCIPAL[\s\S]{0,160}?)(\d{1,3}(?:\.\d{3})*,\d{2})\s+(\d{1,3}(?:\.\d{3})*,\d{2})\s+(\d{1,3}(?:\.\d{3})*,\d{2})/i,
  );
  if (valoresLinha) {
    out.principal = moneyToInput(valoresLinha[1]);
    out.juros = moneyToInput(valoresLinha[2]);
  }

  const total = firstMatch(text, [
    /Valor\s+Total\s+do\s+Benefici[áa]rio\s*:\s*R\$\s*([\d.]+,\d{2})/i,
    /VALOR\s+TOTAL\s+REQUISITADO\s*\(R\$\)\s*:\s*([\d.]+,\d{2})/i,
  ]);
  if (!out.principal && total) {
    out.principal = moneyToInput(total);
    avisos.push('Principal não separado; usei o valor total do beneficiário.');
  }

  if (/RPV|Requisi[çc][aã]o\s+de\s+Pequeno\s+Valor/i.test(text) && !/Precat[oó]rio/i.test(text)) {
    // keep tipo as sphere (Federal/Estadual); natureza already set
  }

  // Limpeza
  if (out.requerente) out.requerente = sanitizePartyName(out.requerente);
  if (out.requerido) out.requerido = sanitizePartyName(out.requerido, 80);

  const filled = Object.entries(out).filter(([k, v]) => k !== 'rawText' && k !== 'avisos' && v !== '' && v != null).length;
  if (filled < 3) avisos.push('Poucos campos identificados — revise o PDF ou preencha manualmente.');

  return out;
}

export async function parseOficioPdf(file: File): Promise<OficioParsed> {
  const text = await extractPdfText(file);
  const parsed = parseOficioText(text);
  parsed.oficioNome = file.name;
  return parsed;
}
