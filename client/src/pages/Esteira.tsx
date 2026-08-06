import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Sidebar from '@/components/Sidebar';
import { PRECATORIO_STATUS, STATUS_DOTS, type PrecatorioStatus } from '@/data/status';

// ── Types ─────────────────────────────────────────────────────────────────────

interface Card {
  id: number;
  processo: string;
  credor: string;
  status: PrecatorioStatus;
  valor?: number;
}

// ── Mock data ─────────────────────────────────────────────────────────────────

const INITIAL_CARDS: Card[] = [
  { id: 30, processo: '481983-62.2023.8.04.0001',     credor: '',                               status: 'Em Análise' },
  { id: 25, processo: '10194248820244013400',         credor: '',                               status: 'Em Análise' },
  { id: 24, processo: '0039519-60.2004.4.01.3400',    credor: '',                               status: 'Aguardando Documentos' },
  { id: 23, processo: '0039519-60.2004.4.01.3400',    credor: '',                               status: 'Aguardando Proposta' },
  { id: 22, processo: '1016656-92.2024.4.01.3400',    credor: '',                               status: 'Proposta Enviada' },
  { id: 21, processo: '1016656-92.2024.4.01.3400',    credor: '',                               status: 'Aprovado' },
  { id: 18, processo: '1030945-30.2024.4.01.3400',    credor: '',                               status: 'Em Análise' },
  { id: 17, processo: '0045554-45.2013.8.13.0363',    credor: '',                               status: 'Proposta Rejeitada' },
  { id: 28, processo: '1007017-64.2021.4.01.3300',    credor: 'MARIO LUIZ SOUZA BRANDAO',        status: 'Concluído' },
  { id: 26, processo: '3000365-32.2023.8.06.0041',    credor: 'FRANCISCO HENRIQUE DE MACEDO',    status: 'Em Cessão' },
  { id: 19, processo: '3000365-32.2023.8.06.0041',    credor: 'ALUISIO TAVEIRA DOS SANTOS',      status: 'Concluído' },
  { id: 15, processo: '1001244-06.2022.4.06.3804',    credor: 'CLESIO RODRIGUES ALVES JUNIOR',   status: 'Concluído' },
  { id: 14, processo: '3000268-32.2023.8.06.0041',    credor: 'FRANCISCO HENRIQUE DE MACEDO',    status: 'Em Cessão' },
  { id: 13, processo: '3000268-32.2023.8.06.0041',    credor: 'IRAILDE PEREIRA DE LIMA',         status: 'Aprovado' },
  { id: 6,  processo: '5023469-75.2023.4.04.7003',    credor: 'RICARDO AMARAL GOMES FERNANDES',  status: 'Concluído' },
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function EsteiraPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [cards, setCards] = useState<Card[]>(INITIAL_CARDS);
  const [activeCard, setActiveCard] = useState<number | null>(null);
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [overCol, setOverCol] = useState<PrecatorioStatus | null>(null);

  function handleLogout() {
    signOut();
    navigate('/login', { replace: true });
  }

  function onDragStart(id: number) {
    setDraggingId(id);
  }

  function onDragOver(e: React.DragEvent, col: PrecatorioStatus) {
    e.preventDefault();
    setOverCol(col);
  }

  function onDrop(col: PrecatorioStatus) {
    if (draggingId === null) return;
    setCards((prev) =>
      prev.map((c) => (c.id === draggingId ? { ...c, status: col } : c))
    );
    setDraggingId(null);
    setOverCol(null);
  }

  function onDragEnd() {
    setDraggingId(null);
    setOverCol(null);
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar onLogout={handleLogout} userName={user?.name ?? ''} userEmail={user?.email ?? ''} />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
          <div>
            <h1 className="text-lg font-semibold text-slate-900 leading-none">Esteira Kanban</h1>
            <p className="text-xs text-slate-500 mt-1">Acompanhe o status das operações</p>
          </div>
          <button
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700
                       text-white text-sm font-semibold transition-colors shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Nova Operação
          </button>
        </header>

        <div className="flex-1 overflow-x-auto overflow-y-hidden px-6 py-5">
          <div className="flex gap-4 h-full min-w-max">
            {PRECATORIO_STATUS.map((col) => {
              const colCards = cards.filter((c) => c.status === col);
              const isOver = overCol === col;
              return (
                <div
                  key={col}
                  className="flex flex-col w-[220px] shrink-0"
                  onDragOver={(e) => onDragOver(e, col)}
                  onDrop={() => onDrop(col)}
                >
                  <div className={`flex items-center justify-between px-3 py-3 mb-3 rounded-xl bg-white border
                    ${isOver ? 'border-blue-300 shadow-sm' : 'border-slate-200'} transition-all`}>
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${STATUS_DOTS[col]}`} />
                      <span className="text-xs font-semibold text-slate-800 truncate" title={col}>{col}</span>
                    </div>
                    <span className="flex items-center justify-center min-w-[22px] h-5 px-1.5 rounded-full
                                     bg-slate-100 text-slate-600 text-[11px] font-bold shrink-0">
                      {colCards.length}
                    </span>
                  </div>

                  <div className={`flex-1 overflow-y-auto space-y-2.5 rounded-xl p-2 transition-all
                    ${isOver ? 'bg-blue-50/60' : 'bg-transparent'}`}>
                    {colCards.length === 0 && (
                      <div className={`flex items-center justify-center h-20 rounded-xl border-2 border-dashed
                        ${isOver ? 'border-blue-300 text-blue-400' : 'border-slate-200 text-slate-300'}
                        text-xs transition-all`}>
                        Arraste um card aqui
                      </div>
                    )}

                    {colCards.map((card) => {
                      const isActive = activeCard === card.id;
                      const isDragging = draggingId === card.id;
                      return (
                        <div
                          key={card.id}
                          draggable
                          onDragStart={() => onDragStart(card.id)}
                          onDragEnd={onDragEnd}
                          onClick={() => setActiveCard(card.id)}
                          className={`bg-white rounded-xl border p-3 cursor-grab active:cursor-grabbing transition-all
                            ${isDragging ? 'opacity-40 scale-95' : ''}
                            ${isActive ? 'border-blue-300 shadow-md ring-2 ring-blue-100' : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'}`}
                        >
                          <p className="text-[10px] font-bold text-slate-400 mb-1">#{card.id}</p>
                          <p className="text-xs font-semibold text-slate-800 break-all leading-snug">{card.processo}</p>
                          {card.credor && (
                            <p className="text-[11px] text-slate-500 mt-1.5 truncate">{card.credor}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
