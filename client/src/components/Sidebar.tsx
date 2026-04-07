import { useNavigate, useLocation } from 'react-router-dom';
import { type ComponentType } from 'react';

// ── Icons ────────────────────────────────────────────────────────────────────

function IcoBolt() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
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
      { label: 'Operacoes',   icon: IcoOperacoes,    href: '/operacoes'    },
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

// ── Component ─────────────────────────────────────────────────────────────────

export default function Sidebar({ onLogout, userName, userEmail }: SidebarProps) {
  const navigate  = useNavigate();
  const { pathname } = useLocation();

  const initials = userName
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? '')
    .join('');

  return (
    <aside className="w-64 shrink-0 flex flex-col h-screen bg-gradient-to-b from-slate-900 to-slate-800 border-r border-slate-700/50">

      {/* ── Brand ──────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-5 h-16 border-b border-slate-700/50 shrink-0">
        <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center text-white shadow-md shadow-indigo-500/30 shrink-0">
          <IcoBolt />
        </div>
        <div className="leading-none">
          <span className="text-white font-extrabold text-[15px] tracking-tight">GESTOR </span>
          <span className="text-indigo-400 font-extrabold text-[15px] tracking-tight">PRO</span>
        </div>
      </div>

      {/* ── Navigation ─────────────────────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {NAV_SECTIONS.map((section) => (
          <div key={section.title}>

            {/* Section label */}
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 px-3 mb-2 select-none">
              {section.title}
            </p>

            {/* Items */}
            <ul className="space-y-0.5">
              {section.items.map(({ label, icon: Icon, href }) => {
                const active = pathname === href;
                return (
                  <li key={href}>
                    <button
                      onClick={() => navigate(href)}
                      className={[
                        'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium',
                        'transition-all duration-150',
                        'border-l-[3px]',
                        active
                          ? 'bg-slate-700/60 text-white border-indigo-500'
                          : 'text-slate-400 hover:bg-slate-700/30 hover:text-slate-200 border-transparent',
                      ].join(' ')}
                    >
                      <span className={active ? 'text-indigo-400' : 'text-slate-500'}>
                        <Icon />
                      </span>
                      {label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <div className="px-3 py-3 border-t border-slate-700/50 space-y-1 shrink-0">

        {/* User chip */}
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg">
          <div className="w-7 h-7 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 font-bold text-[11px] shrink-0 select-none">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-300 truncate leading-none">{userName}</p>
            <p className="text-[11px] text-slate-500 truncate mt-0.5">{userEmail}</p>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 border-l-[3px] border-transparent transition-all duration-150"
        >
          <span className="text-red-500/70">
            <IcoLogout />
          </span>
          Sair
        </button>
      </div>
    </aside>
  );
}
