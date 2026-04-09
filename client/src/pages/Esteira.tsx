import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Sidebar from '@/components/Sidebar';

// ── Types ─────────────────────────────────────────────────────────────────────

type ColStatus = 'Em Análise' | 'Captando Investidor' | 'Vendido';

interface Card {
  id: number;
  processo: string;
  credor: string;
  status: ColStatus;
  valor?: number;
}

// ── Mock data (same IDs as Operacoes) ─────────────────────────────────────────

const INITIAL_CARDS: Card[] = [
  { id: 30, processo: '481983-62.2023.8.04.0001',    credor: '',                            status: 'Em Análise'        },
  { id: 25, processo: '10194248820244013400',         credor: '',                            status: 'Em Análise'        },
  { id: 24, processo: '0039519-60.2004.4.01.3400',   credor: '',                            status: 'Em Análise'        },
  { id: 23, processo: '0039519-60.2004.4.01.3400',   credor: '',                            status: 'Em Análise'        },
  { id: 22, processo: '1016656-92.2024.4.01.3400',  credor: '',                            status: 'Em Análise'        },
  { id: 21, processo: '1016656-92.2024.4.01.3400',  credor: '',                            status: 'Em Análise'        },
  { id: 18, processo: '1030945-30.2024.4.01.3400',   credor: '',                            status: 'Em Análise'        },
  { id: 17, processo: '0045554-45.2013.8.13.0363',   credor: '',                            status: 'Em Análise'        },
  { id: 28, processo: '1007017-64.2021.4.01.3300',   credor: 'MARIO LUIZ SOUZA BRANDAO',    status: 'Vendido'           },
  { id: 26, processo: '3000365-32.2023.8.06.0041',   credor: 'FRANCISCO HENRIQUE DE MACEDO',status: 'Vendido'           },
  { id: 19, processo: '3000365-32.2023.8.06.0041',   credor: 'ALUISIO TAVEIRA DOS SANTOS',  status: 'Vendido'           },
  { id: 15, processo: '1001244-06.2022.4.06.3804',   credor: 'CLESIO RODRIGUES ALVES JUNIOR',status: 'Vendido'          },
  { id: 14, processo: '3000268-32.2023.8.06.0041',   credor: 'FRANCISCO HENRIQUE DE MACEDO',status: 'Vendido'           },
  { id: 13, processo: '3000268-32.2023.8.06.0041',   credor: 'IRAILDE PEREIRA DE LIMA',     status: 'Vendido'           },
  { id: 6,  processo: '5023469-75.2023.4.04.7003',   credor: 'RICARDO AMARAL GOMES FERNANDES', status: 'Vendido'        },
];

const COLUMNS: ColStatus[] = ['Em Análise', 'Captando Investidor', 'Vendido'];

const COL_COLORS: Record<ColStatus, string> = {
  'Em Análise':         'bg-amber-400',
  'Captando Investidor':'bg-blue-400',
  'Vendido':            'bg-emerald-400',
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function EsteiraPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [cards, setCards] = useState<Card[]>(INITIAL_CARDS);
  const [activeCard, setActiveCard] = useState<number | null>(null);
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [overCol, setOverCol] = useState<ColStatus | null>(null);

  function handleLogout() {
    signOut();
    navigate('/login', { replace: true });
  }

  function onDragStart(id: number) {
    setDraggingId(id);
  }

  function onDragOver(e: React.DragEvent, col: ColStatus) {
    e.preventDefault();
    setOverCol(col);
  }

  function onDrop(col: ColStatus) {
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

        {/* Header */}
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

        {/* Kanban board */}
        <div className="flex-1 overflow-x-auto overflow-y-hidden px-6 py-5">
          <div className="flex gap-5 h-full min-w-[700px]">
            {COLUMNS.map((col) => {
              const colCards = cards.filter((c) => c.status === col);
              const isOver = overCol === col;
              return (
                <div
                  key={col}
                  className="flex flex-col flex-1 min-w-[240px]"
                  onDragOver={(e) => onDragOver(e, col)}
                  onDrop={() => onDrop(col)}
                >
                  {/* Column header */}
                  <div className={`flex items-center justify-between px-4 py-3 mb-3 rounded-xl bg-white border
                    ${isOver ? 'border-blue-300 shadow-sm' : 'border-slate-200'} transition-all`}>
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${COL_COLORS[col]}`} />
                      <span className="text-sm font-semibold text-slate-800">{col}</span>
                    </div>
                    <span className="flex items-center justify-center min-w-[22px] h-5 px-1.5 rounded-full
                                     bg-slate-100 text-slate-600 text-[11px] font-bold">
                      {colCards.length}
                    </span>
                  </div>

                  {/* Cards */}
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
                          onClick={() => setActiveCard(isActive ? null : card.id)}
                          className={[
                            'bg-white rounded-xl border px-4 py-3.5 cursor-grab active:cursor-grabbing',
                            'transition-all duration-150 select-none',
                            isDragging ? 'opacity-40 scale-95' : 'opacity-100',
                            isActive
                              ? 'border-l-4 border-l-blue-500 border-t-slate-200 border-r-slate-200 border-b-slate-200 shadow-sm'
                              : 'border-slate-200 hover:border-slate-300 hover:shadow-sm',
                          ].join(' ')}
                        >
                          <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 text-[10px] font-bold mb-2">
                            #{card.id}
                          </span>
                          <p className="text-[12px] font-semibold text-slate-800 font-mono leading-snug">
                            {card.processo}
                          </p>
                          {card.credor && (
                            <p className="text-[11px] text-slate-400 mt-1.5 uppercase tracking-wide truncate">
                              {card.credor}
                            </p>
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
