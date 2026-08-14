import { useEffect, useMemo, useState, type ComponentType } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { canAccessRoute, isAdmin, roleLabel, type UserRole } from '@/data/roles';
import GammaLogo from '@/components/GammaLogo';

function IcoDashboard() {
  return (
    <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 3H5a2 2 0 00-2 2v5h8V3zM21 3h-6v8h8V5a2 2 0 00-2-2zM3 13v6a2 2 0 002 2h6v-8H3zM16 13v8h3a2 2 0 002-2v-6h-5z" />
    </svg>
  );
}
function IcoCedentes() {
  return (
    <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h10M4 18h6" />
    </svg>
  );
}
function IcoEsteira() {
  return (
    <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
    </svg>
  );
}
function IcoGerador() {
  return (
    <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}
function IcoImport() {
  return (
    <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
  );
}
function IcoPrecatorios() {
  return (
    <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
    </svg>
  );
}
function IcoUsers() {
  return (
    <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  );
}
function IcoLogout() {
  return (
    <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  );
}
function IcoMenu() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}
function IcoClose() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

interface NavItem {
  label: string;
  icon: ComponentType;
  href: string;
  adminOnly?: boolean;
}
interface NavSection {
  title: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: 'Visão geral',
    items: [
      { label: 'Dashboard', icon: IcoDashboard, href: '/dashboard' },
      { label: 'Cedentes', icon: IcoCedentes, href: '/cedentes' },
      { label: 'Esteira', icon: IcoEsteira, href: '/esteira' },
    ],
  },
  {
    title: 'Operação',
    items: [
      { label: 'Meus Precatórios', icon: IcoPrecatorios, href: '/precatorios' },
      { label: 'Importar', icon: IcoImport, href: '/importar' },
      { label: 'Documentos', icon: IcoGerador, href: '/gerador-docs' },
    ],
  },
  {
    title: 'Cadastros',
    items: [
      { label: 'Usuários', icon: IcoUsers, href: '/usuarios', adminOnly: true },
    ],
  },
];

interface SidebarProps {
  onLogout: () => void;
  userName: string;
  userEmail: string;
}

function NavContent({
  sections,
  pathname,
  onNavigate,
  onLogout,
  userName,
  userEmail,
  role,
}: {
  sections: NavSection[];
  pathname: string;
  onNavigate: (href: string) => void;
  onLogout: () => void;
  userName: string;
  userEmail: string;
  role: UserRole;
}) {
  const initials = userName
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? '')
    .join('');

  return (
    <>
      <a
        href="/dashboard"
        onClick={(e) => {
          e.preventDefault();
          onNavigate('/dashboard');
        }}
        className="mb-3 flex items-center justify-center rounded-gamma-card border border-[rgba(0,191,168,.35)] bg-white p-4 shadow-gamma"
      >
        <GammaLogo size="lg" className="!h-[5.5rem] !max-w-[240px]" />
      </a>

      <nav className="scrollbar-gamma flex-1 overflow-y-auto overflow-x-hidden py-1">
        <div className="flex flex-col gap-5">
          {sections.map((section) => (
            <div key={section.title}>
              <p className="mb-2 px-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-gamma-muted">
                {section.title}
              </p>
              <ul className="flex flex-col gap-1">
                {section.items.map(({ label, icon: Icon, href }) => {
                  const active = pathname === href;
                  return (
                    <li key={`${section.title}-${href}`}>
                      <button
                        type="button"
                        onClick={() => onNavigate(href)}
                        aria-current={active ? 'page' : undefined}
                        className={[
                          'relative flex w-full items-center gap-2.5 rounded-gamma px-2.5 py-2.5 text-[13px] font-semibold transition-all',
                          active
                            ? 'bg-gamma-strong/15 text-gamma-text shadow-[inset_0_0_0_1px_rgba(0,191,168,.28)]'
                            : 'text-gamma-secondary hover:bg-gamma-soft/70 hover:text-gamma-text',
                        ].join(' ')}
                      >
                        {active && (
                          <span className="absolute bottom-2 left-0 top-2 w-[3px] rounded-r bg-gamma-strong" />
                        )}
                        <span
                          className={[
                            'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border',
                            active
                              ? 'border-transparent bg-gamma-strong text-[#083D37]'
                              : 'border-gamma-border-strong bg-white text-gamma-muted',
                          ].join(' ')}
                        >
                          <Icon />
                        </span>
                        <span className="truncate text-left">{label}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </nav>

      <div className="mt-auto border-t border-gamma-border pt-3">
        <div className="mb-2 flex items-center gap-2.5 rounded-[10px] border border-gamma-border bg-gamma-pale px-2.5 py-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gamma-strong text-[11px] font-extrabold text-[#083D37]">
            {initials || 'G'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-bold text-gamma-text">{userName}</p>
            <p className="truncate text-[10px] text-gamma-muted">{userEmail}</p>
            <span className="mt-1 inline-flex rounded-md bg-white px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[#177566] ring-1 ring-[rgba(0,191,168,.25)]">
              {roleLabel(role)}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center gap-2.5 rounded-gamma px-2.5 py-2 text-[13px] font-semibold text-gamma-secondary transition-colors hover:bg-[#FFF3F4] hover:text-gamma-danger"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-gamma-border-strong bg-white">
            <IcoLogout />
          </span>
          Sair
        </button>
      </div>
    </>
  );
}

export default function Sidebar({ onLogout, userName, userEmail }: SidebarProps) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user } = useAuth();
  const role: UserRole = user?.role ?? 'admin';
  const [mobileOpen, setMobileOpen] = useState(false);

  const sections = useMemo(
    () =>
      NAV_SECTIONS.map((section) => ({
        ...section,
        items: section.items.filter(
          (item) => (!item.adminOnly || isAdmin(role)) && canAccessRoute(role, item.href),
        ),
      })).filter((s) => s.items.length > 0),
    [role],
  );

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  function go(href: string) {
    navigate(href);
    setMobileOpen(false);
  }

  return (
    <>
      {/* Mobile top strip trigger — pages should leave room; floating button */}
      <button
        type="button"
        aria-label="Abrir menu"
        onClick={() => setMobileOpen(true)}
        className="fixed left-3 top-3 z-40 flex h-10 w-10 items-center justify-center rounded-gamma border border-gamma-border bg-white text-gamma-text shadow-gamma lg:hidden"
      >
        <IcoMenu />
      </button>

      {/* Desktop sidebar */}
      <aside className="relative z-20 hidden h-screen w-[268px] shrink-0 flex-col border-r border-gamma-border bg-white px-3.5 pb-[18px] pt-4 lg:flex">
        <NavContent
          sections={sections}
          pathname={pathname}
          onNavigate={go}
          onLogout={onLogout}
          userName={userName}
          userEmail={userEmail}
          role={role}
        />
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-gamma-text/30 backdrop-blur-[2px]"
            aria-label="Fechar menu"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative flex h-full w-[min(100%,280px)] flex-col bg-white px-4 pb-[18px] pt-[18px] shadow-gamma-md animate-[slideIn_200ms_ease]">
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-gamma text-gamma-muted hover:bg-gamma-bg"
              aria-label="Fechar"
            >
              <IcoClose />
            </button>
            <NavContent
              sections={sections}
              pathname={pathname}
              onNavigate={go}
              onLogout={onLogout}
              userName={userName}
              userEmail={userEmail}
              role={role}
            />
          </aside>
        </div>
      )}

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(-16px); opacity: 0.7; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </>
  );
}
