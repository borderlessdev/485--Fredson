import { parseMoney } from '@/data/precatorioForm';
import { PRECATORIO_STATUS, type PrecatorioStatus } from '@/data/status';
import { sanitizePartyName } from '@/services/oficioPdf';
import { listPrecatorios, type PrecatorioRecord } from '@/services/precatorios';
import { type EvolutionPoint, type StatusPoint } from '@/types/charts';

export interface PipelineRow {
  name: string;
  status: PrecatorioStatus;
  qty: number;
  width: string;
}

export interface ActivityRow {
  id: string;
  client: string;
  action: string;
  time: string;
  status: PrecatorioStatus;
}

export interface DashboardMetrics {
  totalRegistros: number;
  totalConcluidos: number;
  conversao: string;
  carteiraAtiva: number;
  valorEmCessao: number;
  ticketMedio: number;
  qtdAtivos: number;
  qtdEmCessao: number;
  evolution: EvolutionPoint[];
  status: StatusPoint[];
  pipeline: PipelineRow[];
  atividades: ActivityRow[];
  pendencias: string[];
}

const MESES_CURTOS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

/** Etapas exibidas no pipeline, na ordem do fluxo operacional. */
const PIPELINE_STAGES: Array<{ status: PrecatorioStatus; name: string }> = [
  { status: 'Aguardando Proposta', name: 'Aguardando proposta' },
  { status: 'Proposta Enviada', name: 'Proposta enviada' },
  { status: 'Aguardando Documentos', name: 'Aguardando docs.' },
  { status: 'Em Análise', name: 'Em análise' },
  { status: 'Aprovado', name: 'Aprovado' },
  { status: 'Em Cessão', name: 'Em cessão' },
];

export const emptyMetrics: DashboardMetrics = {
  totalRegistros: 0,
  totalConcluidos: 0,
  conversao: '0%',
  carteiraAtiva: 0,
  valorEmCessao: 0,
  ticketMedio: 0,
  qtdAtivos: 0,
  qtdEmCessao: 0,
  evolution: [],
  status: [],
  pipeline: [],
  atividades: [],
  pendencias: [],
};

export function formatCompactBRL(value: number): string {
  if (value >= 1_000_000) {
    return `R$ ${(value / 1_000_000).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} mi`;
  }
  if (value >= 1_000) {
    return `R$ ${Math.round(value / 1_000).toLocaleString('pt-BR')} mil`;
  }
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(value);
}

function valorTotal(op: PrecatorioRecord): number {
  return parseMoney(op.data.principal) + parseMoney(op.data.juros);
}

/** cadastradoEm chega como "YYYY-MM-DD HH:mm:ss". */
function parseCadastro(raw: string): Date | null {
  if (!raw) return null;
  const iso = raw.trim().replace(' ', 'T');
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

function relativeTime(date: Date | null): string {
  if (!date) return '—';
  const diffMs = Date.now() - date.getTime();
  const minutos = Math.floor(diffMs / 60_000);
  if (minutos < 1) return 'agora';
  if (minutos < 60) return `há ${minutos} min`;
  const horas = Math.floor(minutos / 60);
  if (horas < 24) return `há ${horas}h`;
  const dias = Math.floor(horas / 24);
  if (dias === 1) return 'ontem';
  if (dias < 30) return `há ${dias} dias`;
  const meses = Math.floor(dias / 30);
  return meses === 1 ? 'há 1 mês' : `há ${meses} meses`;
}

function buildEvolution(ops: PrecatorioRecord[]): EvolutionPoint[] {
  const now = new Date();
  const buckets: EvolutionPoint[] = [];
  const indexByKey = new Map<string, number>();

  for (let offset = 5; offset >= 0; offset--) {
    const d = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    indexByKey.set(key, buckets.length);
    buckets.push({ mes: MESES_CURTOS[d.getMonth()], total: 0 });
  }

  for (const op of ops) {
    const d = parseCadastro(op.cadastradoEm);
    if (!d) continue;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const idx = indexByKey.get(key);
    if (idx != null) buckets[idx].total += 1;
  }

  return buckets;
}

function buildStatusDataset(ops: PrecatorioRecord[]): StatusPoint[] {
  const short: Partial<Record<PrecatorioStatus, string>> = {
    'Aguardando Proposta': 'Aguard. Prop.',
    'Proposta Enviada': 'Prop. Env.',
    'Proposta Rejeitada': 'Prop. Rej.',
    'Aguardando Documentos': 'Aguard. Docs',
  };

  return PRECATORIO_STATUS.map((status) => {
    const doStatus = ops.filter((op) => op.status === status);
    return {
      status: short[status] ?? status,
      quantidade: doStatus.length,
      valorTotal: doStatus.reduce((acc, op) => acc + valorTotal(op), 0),
    };
  }).filter((point) => point.quantidade > 0);
}

function buildPipeline(ops: PrecatorioRecord[]): PipelineRow[] {
  const counts = PIPELINE_STAGES.map((stage) => ({
    ...stage,
    qty: ops.filter((op) => op.status === stage.status).length,
  }));

  const max = Math.max(...counts.map((c) => c.qty), 0);
  if (max === 0) return [];

  return counts.map((c) => ({
    name: c.name,
    status: c.status,
    qty: c.qty,
    width: `${Math.round((c.qty / max) * 100)}%`,
  }));
}

function buildAtividades(ops: PrecatorioRecord[]): ActivityRow[] {
  return [...ops]
    .sort((a, b) => b.cadastradoEm.localeCompare(a.cadastradoEm))
    .slice(0, 5)
    .map((op) => ({
      id: op.id,
      client: sanitizePartyName(op.data.requerente) || op.data.requerente || 'Sem credor',
      action: op.data.codigoProcesso ? `Processo ${op.data.codigoProcesso}` : `Cotação ${op.cotacao}`,
      time: relativeTime(parseCadastro(op.cadastradoEm)),
      status: op.status,
    }));
}

function buildPendencias(ops: PrecatorioRecord[]): string[] {
  const pad = (n: number) => String(n).padStart(2, '0');
  const count = (status: PrecatorioStatus) => ops.filter((op) => op.status === status).length;

  const items: string[] = [];
  const docs = count('Aguardando Documentos');
  const propostas = count('Proposta Enviada');
  const aguardando = count('Aguardando Proposta');
  const semOficio = ops.filter((op) => !op.data.oficioAnexo).length;

  if (docs > 0) items.push(`${pad(docs)} ${docs === 1 ? 'processo aguardando documentos' : 'processos aguardando documentos'}`);
  if (propostas > 0) items.push(`${pad(propostas)} ${propostas === 1 ? 'proposta aguardando retorno' : 'propostas aguardando retorno'}`);
  if (aguardando > 0) items.push(`${pad(aguardando)} ${aguardando === 1 ? 'processo aguardando proposta' : 'processos aguardando proposta'}`);
  if (semOficio > 0) items.push(`${pad(semOficio)} ${semOficio === 1 ? 'processo sem ofício anexado' : 'processos sem ofício anexado'}`);

  return items;
}

export function computeMetrics(ops: PrecatorioRecord[]): DashboardMetrics {
  const totalRegistros = ops.length;
  const concluidos = ops.filter((op) => op.status === 'Concluído');
  const emCessao = ops.filter((op) => op.status === 'Em Cessão');
  const ativos = ops.filter((op) => op.status !== 'Proposta Rejeitada');

  const carteiraAtiva = ativos.reduce((acc, op) => acc + valorTotal(op), 0);
  const ticketMedio = ativos.length > 0 ? carteiraAtiva / ativos.length : 0;
  const conversao =
    totalRegistros > 0
      ? `${((concluidos.length / totalRegistros) * 100).toFixed(1).replace('.', ',')}%`
      : '0%';

  return {
    totalRegistros,
    totalConcluidos: concluidos.length,
    conversao,
    carteiraAtiva,
    valorEmCessao: emCessao.reduce((acc, op) => acc + valorTotal(op), 0),
    ticketMedio,
    qtdAtivos: ativos.length,
    qtdEmCessao: emCessao.length,
    evolution: buildEvolution(ops),
    status: buildStatusDataset(ops),
    pipeline: buildPipeline(ops),
    atividades: buildAtividades(ops),
    pendencias: buildPendencias(ops),
  };
}

export async function loadDashboardMetrics(): Promise<DashboardMetrics> {
  const ops = await listPrecatorios();
  return computeMetrics(ops);
}
