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
        'shrink-0 flex flex-col h-screen bg-white border-r border-slate-200 select-none',
        'transition-[width] duration-200 ease-in-out overflow-hidden',
        isExpanded ? 'w-[220px]' : 'w-[58px]',
      ].join(' ')}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >

      {/* ── Brand ──────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2.5 px-[14px] h-[62px] shrink-0">
        {/* Logo mark: gradient ring + bolt */}
        <div className="relative shrink-0">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-sky-500 flex items-center justify-center text-white shadow-sm">
            <IcoBolt />
          </div>
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-cyan-400 rounded-full border-2 border-white" />
        </div>

        <div className={`leading-none overflow-hidden whitespace-nowrap transition-all duration-200 ${
          isExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0'
        }`}>
          <p className="text-[14px] font-black tracking-tight text-slate-900">485</p>
          <p className="text-[9px] font-semibold tracking-[0.2em] text-sky-600 uppercase mt-0.5">Gestão</p>
        </div>
      </div>

      {/* ── thin separator ─────────────────────────────────────────────────── */}
      <div className="mx-4 h-px bg-slate-200 shrink-0" />

      {/* ── Navigation ─────────────────────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto px-[11px] py-4 space-y-4 scrollbar-none">
        {NAV_SECTIONS.map((section) => (
          <div key={section.title}>

            {/* Section header: only visible when expanded */}
            <div
              className={`flex items-center gap-2 px-2 overflow-hidden transition-all duration-200 ${
                isExpanded ? 'opacity-100 max-h-8 mb-2.5' : 'opacity-0 max-h-0 mb-0'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${SECTION_COLORS[section.title] ?? 'bg-slate-500'} shrink-0`} />
              <p className="text-[10px] font-bold tracking-[0.16em] text-slate-400 uppercase whitespace-nowrap">
                {section.title}
              </p>
            </div>

            {/* Items */}
            <ul className="space-y-0.5">
              {section.items.map(({ label, icon: Icon, href }) => {
                const active = pathname === href;
                return (
                  <li key={href}>
                    <button
                      onClick={() => navigate(href)}
                      className={[
                        'w-full flex items-center gap-2.5 px-2 py-[9px] rounded-xl text-[13px] font-medium',
                        'transition-all duration-150 group',
                        !isExpanded ? 'justify-center' : '',
                        active && isExpanded
                          ? 'bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 ring-1 ring-blue-100'
                          : active
                          ? 'text-blue-700'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50',
                      ].join(' ')}
                    >
                      {/* Icon container */}
                      <span className={[
                        'flex items-center justify-center w-[30px] h-[30px] rounded-lg shrink-0 transition-all duration-150',
                        active
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200 group-hover:text-slate-700',
                      ].join(' ')}>
                        <Icon />
                      </span>

                      {/* Label — hidden when collapsed */}
                      <span className={`flex-1 text-left whitespace-nowrap overflow-hidden transition-all duration-150 ${
                        isExpanded ? 'opacity-100' : 'opacity-0 w-0'
                      }`}>{label}</span>

                      {/* Active pill indicator */}
                      {active && isExpanded && (
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <div className="px-[11px] pb-4 pt-3 shrink-0">
        <div className="h-px bg-slate-200 mb-3" />

        {/* User card */}
        <div className={`flex items-center gap-2.5 px-2 py-2.5 rounded-xl mb-1 transition-all duration-200 ${
          isExpanded
            ? 'bg-slate-50 border border-slate-200'
            : 'justify-center bg-transparent border border-transparent'
        }`}>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-sky-500 flex items-center justify-center text-white font-bold text-[11px] shrink-0">
            {initials}
          </div>
          <div className={`min-w-0 flex-1 overflow-hidden transition-all duration-200 ${
            isExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0'
          }`}>
            <p className="text-[12px] font-semibold text-slate-800 truncate leading-none whitespace-nowrap">{userName}</p>
            <p className="text-[10px] text-slate-500 truncate mt-1 whitespace-nowrap">{userEmail}</p>
          </div>
          {/* online dot */}
          {isExpanded && <span className="w-2 h-2 bg-emerald-400 rounded-full shrink-0 shadow-[0_0_6px_rgba(52,211,153,0.6)]" />}
        </div>

        {/* Logout */}
        <button
          onClick={onLogout}
          className={`w-full flex items-center gap-2.5 px-2 py-[9px] rounded-xl text-[13px] font-medium
                     text-slate-600 hover:text-red-600 hover:bg-red-50
                     transition-all duration-150 group ${
            !isExpanded ? 'justify-center' : ''
          }`}
        >
          <span className="flex items-center justify-center w-[30px] h-[30px] rounded-lg bg-slate-100 group-hover:bg-red-100 transition-all duration-150 shrink-0">
            <IcoLogout />
          </span>
          <span className={`whitespace-nowrap overflow-hidden transition-all duration-150 ${
            isExpanded ? 'opacity-100' : 'opacity-0 w-0'
          }`}>Sair da conta</span>
        </button>
      </div>
    </aside>
  );
}
