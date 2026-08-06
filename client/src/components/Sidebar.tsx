import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { type ComponentType } from 'react';

// ── Icons ────────────────────────────────────────────────────────────────────

function IcoBolt() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.4}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  );
}
function IcoDashboard() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 3H5a2 2 0 00-2 2v5h8V3zM21 3h-6v8h8V5a2 2 0 00-2-2zM3 13v6a2 2 0 002 2h6v-8H3zM16 13v8h3a2 2 0 002-2v-6h-5z" />
    </svg>
  );
}
function IcoOperacoes() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h10M4 18h6" />
    </svg>
  );
}
function IcoEsteira() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
    </svg>
  );
}
function IcoCalc() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  );
}
function IcoGerador() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}
function IcoImport() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
  );
}
function IcoPrecatorios() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
    </svg>
  );
}
function IcoCedentes() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}
function IcoInvestidores() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
function IcoLogout() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  );
}

// ── Nav data ──────────────────────────────────────────────────────────────────

interface NavItem {
  label: string;
  icon: ComponentType;
  href: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: 'Principal',
    items: [
      { label: 'Dashboard',   icon: IcoDashboard,    href: '/dashboard'    },
      { label: 'Cedentes',     icon: IcoOperacoes,    href: '/cedentes'     },
      { label: 'Esteira',     icon: IcoEsteira,      href: '/esteira'      },
    ],
  },
  {
    title: 'Ferramentas',
    items: [
      { label: 'Calculadora',  icon: IcoCalc,    href: '/calculadora'  },
      { label: 'Gerador Docs', icon: IcoGerador, href: '/gerador-docs' },
      { label: 'Importar',     icon: IcoImport,  href: '/importar'     },
    ],
  },
  {
    title: 'Cadastros',
    items: [
      { label: 'Precatorios',  icon: IcoPrecatorios,  href: '/precatorios'  },
      { label: 'Cedentes',     icon: IcoCedentes,     href: '/cedentes'     },
      { label: 'Investidores', icon: IcoInvestidores, href: '/investidores' },
    ],
  },
];

// ── Props ─────────────────────────────────────────────────────────────────────

interface SidebarProps {
  onLogout: () => void;
  userName: string;
  userEmail: string;
}

// ── Accent dot per section ────────────────────────────────────────────────────
const SECTION_COLORS: Record<string, string> = {
  Principal:    'bg-blue-600',
  Ferramentas:  'bg-sky-500',
  Cadastros:    'bg-cyan-500',
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function Sidebar({ onLogout, userName, userEmail }: SidebarProps) {
  const navigate    = useNavigate();
  const { pathname } = useLocation();
  const [isExpanded, setIsExpanded] = useState(false);

  const initials = userName
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? '')
    .join('');

  return (
    <aside
      className={[
        'group/sidebar relative z-20 shrink-0 flex flex-col h-screen bg-white border-r border-slate-200 select-none',
        'transition-[width] duration-200 ease-in-out overflow-hidden',
        isExpanded ? 'w-[232px]' : 'w-[72px]',
      ].join(' ')}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >

      {/* ── Brand ──────────────────────────────────────────────────────────── */}
      <div className={[
        'flex items-center h-16 shrink-0',
        isExpanded ? 'gap-3 px-5' : 'justify-center px-3',
      ].join(' ')}>
        <div className="relative shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-700 to-cyan-500 flex items-center justify-center text-white shadow-sm">
            <IcoBolt />
          </div>
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-cyan-400 rounded-full border-2 border-white" />
        </div>

        <div className={`leading-none overflow-hidden whitespace-nowrap transition-[opacity,width] duration-200 ${
          isExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0'
        }`}>
          <p className="text-[15px] font-black tracking-tight text-slate-900">485</p>
          <p className="text-[9px] font-semibold tracking-[0.2em] text-sky-600 uppercase mt-1">Gestão</p>
        </div>
      </div>

      <div className="mx-4 h-px bg-slate-100 shrink-0" />

      {/* ── Navigation ─────────────────────────────────────────────────────── */}
      <nav
        className={[
          'flex-1 min-h-0 overflow-y-auto overflow-x-hidden py-4',
          '[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden',
          isExpanded ? 'px-3' : 'px-3',
        ].join(' ')}
      >
        <div className="flex flex-col gap-5">
          {NAV_SECTIONS.map((section) => (
            <div key={section.title}>
              <div
                className={`flex items-center gap-2 px-2.5 overflow-hidden transition-[opacity,max-height,margin] duration-200 ${
                  isExpanded ? 'opacity-100 max-h-8 mb-2' : 'opacity-0 max-h-0 mb-0'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${SECTION_COLORS[section.title] ?? 'bg-slate-500'} shrink-0`} />
                <p className="text-[10px] font-bold tracking-[0.16em] text-slate-400 uppercase whitespace-nowrap">
                  {section.title}
                </p>
              </div>

              <ul className="flex flex-col gap-1.5">
                {section.items.map(({ label, icon: Icon, href }) => {
                  const active = pathname === href;
                  return (
                    <li key={`${section.title}-${href}-${label}`}>
                      <button
                        type="button"
                        title={!isExpanded ? label : undefined}
                        aria-label={label}
                        aria-current={active ? 'page' : undefined}
                        onClick={() => navigate(href)}
                        className={[
                          'w-full flex items-center rounded-xl text-[13px] font-medium',
                          'transition-[background-color,color,box-shadow] duration-150 group',
                          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300',
                          isExpanded ? 'gap-3 px-2.5 py-2' : 'justify-center px-0 py-2',
                          active && isExpanded
                            ? 'bg-sky-50 text-sky-800 ring-1 ring-sky-100'
                            : active
                              ? 'text-sky-700'
                              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50',
                        ].join(' ')}
                      >
                        <span className={[
                          'flex items-center justify-center w-9 h-9 rounded-xl shrink-0 transition-[background-color,color] duration-150',
                          active
                            ? 'bg-sky-100 text-sky-700'
                            : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200 group-hover:text-slate-700',
                        ].join(' ')}>
                          <Icon />
                        </span>

                        <span className={`flex-1 text-left whitespace-nowrap overflow-hidden transition-[opacity,width] duration-150 ${
                          isExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0'
                        }`}>{label}</span>

                        {active && isExpanded && (
                          <span className="w-1.5 h-1.5 rounded-full bg-sky-600 shrink-0" />
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </nav>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <div className={[
        'shrink-0 border-t border-slate-100 pb-4 pt-3',
        isExpanded ? 'px-3' : 'px-3',
      ].join(' ')}>
        <div className={[
          'flex items-center rounded-xl mb-2 transition-[background-color,padding] duration-200',
          isExpanded
            ? 'gap-2.5 px-2.5 py-2.5 bg-slate-50 border border-slate-100'
            : 'justify-center px-0 py-1.5 bg-transparent border border-transparent',
        ].join(' ')}>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sky-700 to-cyan-500 flex items-center justify-center text-white font-bold text-[11px] shrink-0">
            {initials}
          </div>
          <div className={`min-w-0 flex-1 overflow-hidden transition-[opacity,width] duration-200 ${
            isExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0'
          }`}>
            <p className="text-[12px] font-semibold text-slate-800 truncate leading-none whitespace-nowrap">{userName}</p>
            <p className="text-[10px] text-slate-500 truncate mt-1 whitespace-nowrap">{userEmail}</p>
          </div>
          {isExpanded && <span className="w-2 h-2 bg-emerald-400 rounded-full shrink-0" />}
        </div>

        <button
          type="button"
          aria-label="Sair da conta"
          onClick={onLogout}
          className={[
            'w-full flex items-center rounded-xl text-[13px] font-medium',
            'text-slate-600 hover:text-red-600 hover:bg-red-50',
            'transition-[background-color,color] duration-150 group',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-200',
            isExpanded ? 'gap-3 px-2.5 py-2' : 'justify-center px-0 py-2',
          ].join(' ')}
        >
          <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-slate-100 group-hover:bg-red-100 transition-[background-color] duration-150 shrink-0">
            <IcoLogout />
          </span>
          <span className={`whitespace-nowrap overflow-hidden transition-[opacity,width] duration-150 ${
            isExpanded ? 'opacity-100' : 'opacity-0 w-0'
          }`}>Sair da conta</span>
        </button>
      </div>
    </aside>
  );
}
