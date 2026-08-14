import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Sidebar from '@/components/Sidebar';
import { isAdmin, roleLabel, type UserRole } from '@/data/roles';
import { adminCreateUser, getAuthErrorMessage, listUsers, type AuthUser } from '@/services/auth';

const ROLE_STYLES: Record<UserRole, string> = {
  admin: 'bg-violet-100 text-violet-800 ring-violet-200',
  operator: 'bg-sky-100 text-sky-800 ring-sky-200',
  collaborator: 'bg-slate-100 text-slate-700 ring-slate-200',
};

export default function UsuariosPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'operator' as 'admin' | 'operator',
  });

  useEffect(() => {
    if (!user) return;
    if (!isAdmin(user.role)) {
      navigate('/dashboard', { replace: true });
      return;
    }
    void loadUsers();
  }, [user, navigate]);

  async function loadUsers() {
    setLoading(true);
    setError('');
    try {
      setUsers(await listUsers());
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : 'Erro ao carregar usuários.');
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    signOut();
    navigate('/login', { replace: true });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const created = await adminCreateUser(form);
      setUsers((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')));
      setForm({ name: '', email: '', password: '', role: 'operator' });
      setShowForm(false);
    } catch (err) {
      console.error(err);
      setError(getAuthErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  if (!user || !isAdmin(user.role)) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-gamma-bg">
      <Sidebar onLogout={handleLogout} userName={user.name} userEmail={user.email} />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6">
          <div>
            <h1 className="text-lg font-semibold text-slate-900">Usuários</h1>
            <p className="mt-0.5 text-xs text-slate-500">Cadastre operadores e administradores</p>
          </div>
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 rounded-xl bg-gamma-strong px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-gamma"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Novo usuário
          </button>
        </header>

        <div className="flex-1 overflow-auto px-6 py-5">
          {error && (
            <p className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
          )}

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_140px] border-b border-slate-200 bg-slate-50 px-4">
              {['Nome', 'E-mail', 'Perfil'].map((h) => (
                <div key={h} className="py-3 text-[11px] font-bold uppercase tracking-[0.1em] text-slate-400">
                  {h}
                </div>
              ))}
            </div>

            {loading ? (
              <div className="py-16 text-center text-sm text-slate-400">Carregando usuários…</div>
            ) : users.length === 0 ? (
              <div className="py-16 text-center text-sm text-slate-400">Nenhum usuário cadastrado.</div>
            ) : (
              users.map((u) => (
                <div
                  key={u.id}
                  className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_140px] items-center border-b border-slate-100 px-4 last:border-0"
                >
                  <div className="flex min-w-0 items-center gap-2.5 py-4 pr-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-400 text-[11px] font-bold text-white">
                      {u.name[0]?.toUpperCase() ?? '?'}
                    </span>
                    <p className="truncate text-sm font-semibold text-slate-800">{u.name}</p>
                  </div>
                  <p className="truncate py-4 pr-3 text-sm text-slate-600">{u.email}</p>
                  <div className="py-4">
                    <span className={`inline-flex rounded-lg px-2.5 py-1 text-[11px] font-semibold ring-1 ${ROLE_STYLES[u.role]}`}>
                      {roleLabel(u.role)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button type="button" className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]" onClick={() => setShowForm(false)} aria-label="Fechar" />
          <form
            onSubmit={(e) => void handleSubmit(e)}
            className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
          >
            <h2 className="font-display text-lg font-bold text-slate-900">Novo usuário</h2>
            <p className="mt-1 text-sm text-slate-500">O usuário receberá acesso imediato com o perfil escolhido.</p>

            <div className="mt-5 space-y-4">
              <div>
                <label htmlFor="user-name" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Nome completo
                </label>
                <input
                  id="user-name"
                  required
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-gamma-strong focus:ring-2 focus:shadow-gamma-focus"
                />
              </div>
              <div>
                <label htmlFor="user-email" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  E-mail
                </label>
                <input
                  id="user-email"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-gamma-strong focus:ring-2 focus:shadow-gamma-focus"
                />
              </div>
              <div>
                <label htmlFor="user-password" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Senha inicial
                </label>
                <input
                  id="user-password"
                  type="password"
                  required
                  minLength={6}
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-gamma-strong focus:ring-2 focus:shadow-gamma-focus"
                />
              </div>
              <div>
                <label htmlFor="user-role" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Perfil de acesso
                </label>
                <select
                  id="user-role"
                  value={form.role}
                  onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as 'admin' | 'operator' }))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-gamma-strong focus:ring-2 focus:shadow-gamma-focus"
                >
                  <option value="operator">Operador</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 rounded-xl bg-gamma-strong py-2.5 text-sm font-semibold text-white hover:bg-gamma disabled:opacity-60"
              >
                {saving ? 'Cadastrando…' : 'Cadastrar'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
